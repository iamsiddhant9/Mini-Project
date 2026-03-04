from django.shortcuts import render

# Create your views here.
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


class SavedListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("""
                SELECT s.id, s.saved_at,
                    i.id AS internship_id, i.title, i.mode, i.stipend, i.deadline, i.source_url,
                    c.name AS company, c.logo_url,
                    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM saved_internships s
                JOIN internships i ON i.id = s.internship_id
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN internship_tags it ON it.internship_id = i.id
                LEFT JOIN tags t ON t.id = it.tag_id
                WHERE s.user_id = %s
                GROUP BY s.id, s.saved_at, i.id, i.title, i.mode, i.stipend, i.deadline, i.source_url, c.name, c.logo_url
                ORDER BY s.saved_at DESC
            """, [user_id])
            saved = rows_to_dicts(cur)
        return Response({"results": saved, "total": len(saved)})

    def post(self, request):
        user_id       = request.user.id
        internship_id = request.data.get("internship_id")
        if not internship_id:
            return Response({"error": "internship_id is required"}, status=400)
        with connection.cursor() as cur:
            cur.execute("SELECT id FROM internships WHERE id = %s", [internship_id])
            if not cur.fetchone():
                return Response({"error": "Internship not found"}, status=404)
            cur.execute("""
                INSERT INTO saved_internships (user_id, internship_id)
                VALUES (%s, %s)
                ON CONFLICT (user_id, internship_id) DO NOTHING
                RETURNING id, saved_at
            """, [user_id, internship_id])
            row = cur.fetchone()
        if not row:
            return Response({"error": "Already saved"}, status=409)
        return Response({"id": row[0], "saved_at": str(row[1]), "message": "Saved"}, status=201)


class SavedDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, internship_id):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute(
                "DELETE FROM saved_internships WHERE user_id = %s AND internship_id = %s",
                [user_id, internship_id]
            )
            if cur.rowcount == 0:
                return Response({"error": "Not found"}, status=404)
        return Response({"message": "Removed from saved"})