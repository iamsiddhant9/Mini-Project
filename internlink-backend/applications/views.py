from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


class ApplicationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("""
                SELECT a.id, a.status, a.stage, a.notes, a.applied_date, a.updated_at,
                    i.id AS internship_id, i.title, i.mode, i.deadline, i.stipend,
                    c.name AS company, c.logo_url
                FROM applications a
                JOIN internships i ON i.id = a.internship_id
                LEFT JOIN companies c ON c.id = i.company_id
                WHERE a.user_id = %s
                ORDER BY a.updated_at DESC
            """, [user_id])
            applications = rows_to_dicts(cur)

        # Group by status for kanban
        grouped = {"Applied": [], "Interview": [], "Offer": [], "Rejected": [], "Withdrawn": []}
        for app in applications:
            status = app.get("status", "Applied")
            if status in grouped:
                grouped[status].append(app)

        return Response({"grouped": grouped, "all": applications, "total": len(applications)})

    def post(self, request):
        user_id       = request.user.id
        internship_id = request.data.get("internship_id")
        notes         = request.data.get("notes", "")

        if not internship_id:
            return Response({"error": "internship_id is required"}, status=400)

        with connection.cursor() as cur:
            # Check internship exists
            cur.execute("SELECT id, title FROM internships WHERE id = %s AND is_active = TRUE", [internship_id])
            internship = cur.fetchone()
            if not internship:
                return Response({"error": "Internship not found"}, status=404)

            cur.execute("""
                INSERT INTO applications (user_id, internship_id, status, notes, applied_date)
                VALUES (%s, %s, 'Applied', %s, CURRENT_DATE)
                ON CONFLICT (user_id, internship_id) DO NOTHING
                RETURNING id, status, applied_date
            """, [user_id, internship_id, notes])
            row = cur.fetchone()

        if not row:
            return Response({"error": "You have already applied to this internship"}, status=409)

        return Response({
            "id":           row[0],
            "status":       row[1],
            "applied_date": str(row[2]),
            "internship":   internship[1],
            "message":      "Application submitted successfully"
        }, status=201)


class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, application_id):
        user_id = request.user.id
        allowed = {"status", "stage", "notes"}
        updates = {k: v for k, v in request.data.items() if k in allowed}

        valid_statuses = {"Applied", "Interview", "Offer", "Rejected", "Withdrawn"}
        if "status" in updates and updates["status"] not in valid_statuses:
            return Response({"error": f"Invalid status. Must be one of {valid_statuses}"}, status=400)

        if not updates:
            return Response({"error": "No valid fields to update"}, status=400)

        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [application_id, user_id]

        with connection.cursor() as cur:
            cur.execute(
                f"UPDATE applications SET {set_clause} WHERE id = %s AND user_id = %s RETURNING id, status, stage, notes, updated_at, internship_id",
                values
            )
            row = cur.fetchone()
            if not row:
                return Response({"error": "Application not found"}, status=404)
            cols = [d[0] for d in cur.description]
            result = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(cols, row)}

            # --- Simple Notification Engine Trigger ---
            if "status" in updates and updates["status"] in ["Interview", "Offer"]:
                cur.execute("SELECT i.title, c.name FROM internships i LEFT JOIN companies c ON c.id = i.company_id WHERE i.id = %s", [result["internship_id"]])
                intern_info = cur.fetchone()
                if intern_info:
                    title, company = intern_info
                    message = f"Congratulations! Your application for {title} at {company} has been updated to '{updates['status']}'."
                    
                    from users.models import Notification
                    Notification.objects.create(
                        user_id=user_id,
                        title=f"Application Update: {updates['status']}",
                        message=message,
                        type="update"
                    )

                    # Simulate Email Backend
                    print(f"\n[{'='*40}]\n SIMULATED EMAIL NOTIFICATION\n[{'='*40}]")
                    print(f"To: User ID {user_id}")
                    print(f"Subject: Status Update! ({title})")
                    print(f"Body:\n{message}")
                    print(f"[{'='*40}]\n")

        return Response(result)

    def delete(self, request, application_id):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute(
                "DELETE FROM applications WHERE id = %s AND user_id = %s",
                [application_id, user_id]
            )
            if cur.rowcount == 0:
                return Response({"error": "Application not found"}, status=404)
        return Response({"message": "Application withdrawn"})


class ApplicationStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        with connection.cursor() as cur:
            # Status counts
            cur.execute("""
                SELECT status, COUNT(*) FROM applications
                WHERE user_id = %s GROUP BY status
            """, [user_id])
            by_status = {row[0]: row[1] for row in cur.fetchall()}

            # Daily counts for last 30 days
            cur.execute("""
                SELECT
                    generate_series(
                        CURRENT_DATE - INTERVAL '29 days',
                        CURRENT_DATE,
                        INTERVAL '1 day'
                    )::date AS day
            """)
            all_days = [row[0] for row in cur.fetchall()]

            cur.execute("""
                SELECT applied_date, COUNT(*) AS cnt
                FROM applications
                WHERE user_id = %s
                  AND applied_date >= CURRENT_DATE - INTERVAL '29 days'
                GROUP BY applied_date
            """, [user_id])
            daily_map = {row[0]: row[1] for row in cur.fetchall()}

            daily = [
                {"date": d.strftime("%b %d"), "count": daily_map.get(d, 0)}
                for d in all_days
            ]

            # Top match score
            cur.execute("SELECT COUNT(*) FROM match_scores WHERE user_id=%s", [user_id])
            total_matches = cur.fetchone()[0]

        return Response({
            "by_status":    by_status,
            "daily":        daily,
            "total":        sum(by_status.values()),
            "total_matches": total_matches,
            "pending":      by_status.get("Applied", 0),
            "interview":    by_status.get("Interview", 0),
            "offer":        by_status.get("Offer", 0),
            "rejected":     by_status.get("Rejected", 0),
        })