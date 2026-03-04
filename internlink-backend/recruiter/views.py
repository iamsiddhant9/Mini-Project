from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


def is_recruiter(request):
    user_id = request.user.id
    with connection.cursor() as cur:
        cur.execute("SELECT role, is_approved FROM users WHERE id = %s", [user_id])
        row = cur.fetchone()
        return row and row[0] == "recruiter" and row[1]


def is_admin(request):
    user_id = request.user.id
    with connection.cursor() as cur:
        cur.execute("SELECT role FROM users WHERE id = %s", [user_id])
        row = cur.fetchone()
        return row and row[0] == "admin"


class RecruiterInternshipListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("""
                SELECT i.id, i.title, i.location, i.mode, i.category,
                    i.stipend, i.deadline, i.is_active, i.created_at,
                    c.name AS company,
                    COUNT(DISTINCT a.id) AS applicant_count
                FROM internships i
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN applications a ON a.internship_id = i.id
                WHERE i.posted_by = %s
                GROUP BY i.id, c.name
                ORDER BY i.created_at DESC
            """, [user_id])
            listings = rows_to_dicts(cur)
        return Response(listings)

    def post(self, request):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        data = request.data

        title       = data.get("title", "").strip()
        description = data.get("description", "").strip()
        location    = data.get("location", "").strip()
        mode        = data.get("mode", "Remote")
        category    = data.get("category", "Other")
        stipend     = data.get("stipend", "")
        stipend_num = data.get("stipend_num", 0)
        deadline    = data.get("deadline")
        company_name = data.get("company", "").strip()
        tags        = data.get("tags", [])

        if not title or not description or not deadline:
            return Response({"error": "title, description and deadline are required"}, status=400)

        with connection.cursor() as cur:
            # Get or create company
            cur.execute("SELECT id FROM companies WHERE LOWER(name) = LOWER(%s)", [company_name])
            company = cur.fetchone()
            if not company:
                cur.execute("INSERT INTO companies (name) VALUES (%s) RETURNING id", [company_name])
                company = cur.fetchone()
            company_id = company[0]

            # Create internship
            cur.execute("""
                INSERT INTO internships (company_id, title, description, location, mode, category,
                    stipend, stipend_num, deadline, source, posted_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'company',%s)
                RETURNING id
            """, [company_id, title, description, location, mode, category,
                  stipend, stipend_num, deadline, user_id])
            internship_id = cur.fetchone()[0]

            # Add tags
            for tag_name in tags:
                cur.execute("SELECT id FROM tags WHERE LOWER(name) = LOWER(%s)", [tag_name])
                tag = cur.fetchone()
                if not tag:
                    cur.execute("INSERT INTO tags (name, category) VALUES (%s, 'Other') RETURNING id", [tag_name])
                    tag = cur.fetchone()
                cur.execute("INSERT INTO internship_tags VALUES (%s,%s) ON CONFLICT DO NOTHING", [internship_id, tag[0]])

        return Response({"message": "Internship posted successfully", "id": internship_id}, status=201)


class RecruiterInternshipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, internship_id):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        allowed = {"title", "description", "location", "mode", "category", "stipend", "stipend_num", "deadline", "is_active"}
        updates = {k: v for k, v in request.data.items() if k in allowed}
        if not updates:
            return Response({"error": "No valid fields"}, status=400)
        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [internship_id, user_id]
        with connection.cursor() as cur:
            cur.execute(f"UPDATE internships SET {set_clause} WHERE id = %s AND posted_by = %s RETURNING id", values)
            if not cur.fetchone():
                return Response({"error": "Not found or not authorized"}, status=404)
        return Response({"message": "Updated successfully"})

    def delete(self, request, internship_id):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("UPDATE internships SET is_active = FALSE WHERE id = %s AND posted_by = %s", [internship_id, user_id])
            if cur.rowcount == 0:
                return Response({"error": "Not found"}, status=404)
        return Response({"message": "Internship removed"})


class RecruiterApplicantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, internship_id):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        with connection.cursor() as cur:
            # Verify this internship belongs to this recruiter
            cur.execute("SELECT id FROM internships WHERE id = %s AND posted_by = %s", [internship_id, user_id])
            if not cur.fetchone() and not is_admin(request):
                return Response({"error": "Not authorized"}, status=403)

            cur.execute("""
                SELECT a.id, a.status, a.stage, a.notes, a.applied_date,
                    u.id AS student_id, u.name, u.email, u.branch, u.year, u.university,
                    u.github_url, u.linkedin_url, u.portfolio_url, u.profile_strength,
                    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS skills
                FROM applications a
                JOIN users u ON u.id = a.user_id
                LEFT JOIN user_skills us ON us.user_id = u.id
                LEFT JOIN tags t ON t.id = us.tag_id
                WHERE a.internship_id = %s
                GROUP BY a.id, u.id
                ORDER BY a.applied_date DESC
            """, [internship_id])
            applicants = rows_to_dicts(cur)
        return Response({"applicants": applicants, "total": len(applicants)})


class RecruiterUpdateApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, application_id):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        new_status = request.data.get("status")
        stage      = request.data.get("stage", "")

        valid = {"Applied", "Interview", "Offer", "Rejected", "Withdrawn"}
        if new_status not in valid:
            return Response({"error": f"Invalid status"}, status=400)

        with connection.cursor() as cur:
            cur.execute("""
                UPDATE applications a
                SET status = %s, stage = %s
                FROM internships i
                WHERE a.id = %s AND a.internship_id = i.id AND i.posted_by = %s
                RETURNING a.id
            """, [new_status, stage, application_id, user_id])
            if not cur.fetchone():
                return Response({"error": "Not found or not authorized"}, status=404)

        return Response({"message": f"Application moved to {new_status}"})


class RecruiterStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_recruiter(request) and not is_admin(request):
            return Response({"error": "Recruiter access required"}, status=403)
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM internships WHERE posted_by = %s AND is_active = TRUE", [user_id])
            active_listings = cur.fetchone()[0]

            cur.execute("""
                SELECT COUNT(*) FROM applications a
                JOIN internships i ON i.id = a.internship_id
                WHERE i.posted_by = %s
            """, [user_id])
            total_applicants = cur.fetchone()[0]

            cur.execute("""
                SELECT COUNT(*) FROM applications a
                JOIN internships i ON i.id = a.internship_id
                WHERE i.posted_by = %s AND a.status = 'Interview'
            """, [user_id])
            interviews = cur.fetchone()[0]

            cur.execute("""
                SELECT COUNT(*) FROM applications a
                JOIN internships i ON i.id = a.internship_id
                WHERE i.posted_by = %s AND a.status = 'Offer'
            """, [user_id])
            offers = cur.fetchone()[0]

        return Response({
            "active_listings":  active_listings,
            "total_applicants": total_applicants,
            "interviews":       interviews,
            "offers":           offers,
        })