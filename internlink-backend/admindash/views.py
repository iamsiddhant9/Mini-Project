from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


def is_admin(request):
    with connection.cursor() as cur:
        cur.execute("SELECT role FROM users WHERE id = %s", [request.user.id])
        row = cur.fetchone()
        return row and row[0] == "admin"


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        with connection.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
            students = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'recruiter' AND is_approved = TRUE")
            recruiters = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'recruiter' AND is_approved = FALSE")
            pending_recruiters = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM internships WHERE is_active = TRUE")
            active_internships = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM applications")
            total_applications = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM hackathons WHERE is_active = TRUE")
            active_hackathons = cur.fetchone()[0]
        return Response({
            "students":           students,
            "recruiters":         recruiters,
            "pending_recruiters": pending_recruiters,
            "active_internships": active_internships,
            "total_applications": total_applications,
            "active_hackathons":  active_hackathons,
        })


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        role   = request.GET.get("role", "")
        search = request.GET.get("search", "").strip()
        filters = ["1=1"]
        params  = []
        if role:
            filters.append("role = %s")
            params.append(role)
        if search:
            filters.append("(LOWER(name) LIKE %s OR LOWER(email) LIKE %s)")
            params += [f"%{search.lower()}%", f"%{search.lower()}%"]
        where = " AND ".join(filters)
        with connection.cursor() as cur:
            cur.execute(f"""
                SELECT id, name, email, role, branch, university, year,
                    is_approved, is_active, is_verified, created_at
                FROM users WHERE {where}
                ORDER BY created_at DESC
            """, params)
            users = rows_to_dicts(cur)
        return Response(users)


class AdminApproveRecruiterView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        action = request.data.get("action")
        if action not in ("approve", "reject"):
            return Response({"error": "action must be approve or reject"}, status=400)
        is_approved = action == "approve"
        with connection.cursor() as cur:
            cur.execute("""
                UPDATE users SET is_approved = %s
                WHERE id = %s AND role = 'recruiter'
                RETURNING id, name, email, is_approved
            """, [is_approved, user_id])
            row = cur.fetchone()
            if not row:
                return Response({"error": "Recruiter not found"}, status=404)
        return Response({
            "message": f"Recruiter {'approved' if is_approved else 'rejected'}",
            "user_id": row[0],
            "name":    row[1],
            "email":   row[2],
        })


class AdminToggleUserView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        with connection.cursor() as cur:
            cur.execute("""
                UPDATE users SET is_active = NOT is_active
                WHERE id = %s RETURNING id, name, is_active
            """, [user_id])
            row = cur.fetchone()
            if not row:
                return Response({"error": "User not found"}, status=404)
        return Response({
            "message": f"User {'activated' if row[2] else 'deactivated'}",
            "user_id": row[0],
            "name":    row[1],
        })


class AdminInternshipsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        with connection.cursor() as cur:
            cur.execute("""
                SELECT i.id, i.title, i.location, i.mode, i.category,
                    i.stipend, i.deadline, i.is_active, i.source, i.created_at,
                    c.name AS company,
                    u.name AS posted_by_name,
                    COUNT(DISTINCT a.id) AS applicant_count
                FROM internships i
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN users u ON u.id = i.posted_by
                LEFT JOIN applications a ON a.internship_id = i.id
                GROUP BY i.id, c.name, u.name
                ORDER BY i.created_at DESC
            """)
            internships = rows_to_dicts(cur)
        return Response(internships)

    def delete(self, request, internship_id=None):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        if not internship_id:
            return Response({"error": "internship_id required"}, status=400)
        with connection.cursor() as cur:
            cur.execute("UPDATE internships SET is_active = FALSE WHERE id = %s", [internship_id])
        return Response({"message": "Internship deactivated"})


class AdminPendingRecruitersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)
        with connection.cursor() as cur:
            cur.execute("""
                SELECT id, name, email, created_at
                FROM users
                WHERE role = 'recruiter' AND is_approved = FALSE AND is_active = TRUE
                ORDER BY created_at DESC
            """)
            pending = rows_to_dicts(cur)
        return Response(pending)