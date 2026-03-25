import hashlib
import os
import requests as http_requests
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cur:
                cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
                tables = [r[0] for r in cur.fetchall()]
            return Response({"status": "ok", "db": "connected", "tables": tables})
        except Exception as e:
            return Response({"status": "error", "db": str(e)}, status=500)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def rows_to_dicts(cursor) -> list:
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def get_tokens(user_id: int) -> dict:
    class FakeUser:
        def __init__(self, uid):
            self.id = uid
            self.pk = uid
            self.is_active = True
        def __str__(self):
            return str(self.id)
    token = RefreshToken.for_user(FakeUser(user_id))
    return {"access": str(token.access_token), "refresh": str(token)}


def user_to_dict(user: dict) -> dict:
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    for k, v in safe.items():
        if hasattr(v, "isoformat"):
            safe[k] = v.isoformat()
    return safe


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data       = request.data
        email      = data.get("email", "").strip().lower()
        password   = data.get("password", "")
        name       = data.get("name", "").strip()
        branch     = data.get("branch", "").strip()
        year       = data.get("year")
        university = data.get("university", "").strip()
        role       = data.get("role", "student").strip()

        if role not in ("student", "recruiter", "admin"):
            role = "student"
        if not email or not password or not name:
            return Response({"error": "email, password and name are required"}, status=400)
        if len(password) < 6:
            return Response({"error": "Password must be at least 6 characters"}, status=400)

        is_approved = role == "student"

        try:
            with connection.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE email = %s", [email])
                if cur.fetchone():
                    return Response({"error": "An account with this email already exists"}, status=409)

                cur.execute("""
                    INSERT INTO users (email, password_hash, name, branch, year, university, role, is_approved)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, email, name, branch, year, university, profile_strength, created_at, role, is_approved
                """, [email, hash_password(password), name, branch, year, university, role, is_approved])

                row  = cur.fetchone()
                cols = [d[0] for d in cur.description]
                user = dict(zip(cols, row))

            tokens = get_tokens(user["id"])
            return Response({"message": "Account created successfully", "user": user_to_dict(user), "tokens": tokens}, status=201)
        except Exception as e:
            if "violates check constraint" in str(e).lower():
                if "year" in str(e).lower():
                    return Response({"error": "Study year must be between 1 and 5"}, status=400)
                return Response({"error": f"Invalid data: {str(e)}"}, status=400)
            return Response({"error": f"Register error: {str(e)}"}, status=500)



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        try:
            with connection.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE email = %s AND is_active = TRUE", [email])
                row = cur.fetchone()
                if not row:
                    return Response({"error": "Invalid email or password"}, status=401)
                cols = [d[0] for d in cur.description]
                user = dict(zip(cols, row))

            if user["password_hash"] != hash_password(password):
                return Response({"error": "Invalid email or password"}, status=401)

            if user.get("role") == "recruiter" and not user.get("is_approved"):
                return Response({"error": "Your recruiter account is pending admin approval"}, status=403)

            tokens = get_tokens(user["id"])
            return Response({"message": "Login successful", "user": user_to_dict(user), "tokens": tokens})
        except Exception as e:
            import traceback; traceback.print_exc()
            return Response({"error": f"Login error: {str(e)}"}, status=500)



class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential", "").strip()
        if not credential:
            return Response({"error": "Google credential is required"}, status=400)

        try:
            resp = http_requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
                timeout=10,
            )
            if resp.status_code != 200:
                return Response({"error": "Invalid Google token"}, status=401)
            google_data = resp.json()
        except Exception:
            return Response({"error": "Failed to verify Google token"}, status=500)

        client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        if client_id and google_data.get("aud") != client_id:
            return Response({"error": "Token audience mismatch"}, status=401)

        email      = google_data.get("email", "").strip().lower()
        name       = google_data.get("name", "").strip() or email.split("@")[0]
        google_sub = google_data.get("sub", "")
        avatar_url = google_data.get("picture", "")

        if not email:
            return Response({"error": "Could not get email from Google"}, status=400)

        try:
            with connection.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE email = %s AND is_active = TRUE", [email])
                row = cur.fetchone()

                if row:
                    cols = [d[0] for d in cur.description]
                    user = dict(zip(cols, row))
                    cur.execute("""
                        UPDATE users
                        SET google_sub         = COALESCE(NULLIF(google_sub, ''), %s),
                            profile_photo_url  = COALESCE(NULLIF(profile_photo_url, ''), %s)
                        WHERE id = %s
                    """, [google_sub, avatar_url, user["id"]])

                    if user.get("role") == "recruiter" and not user.get("is_approved"):
                        return Response({"error": "Your recruiter account is pending admin approval"}, status=403)
                else:
                    cur.execute("""
                        INSERT INTO users
                            (email, password_hash, name, role, is_approved, google_sub, profile_photo_url)
                        VALUES (%s, %s, %s, 'student', TRUE, %s, %s)
                        RETURNING *
                    """, [email, "", name, google_sub, avatar_url])
                    row  = cur.fetchone()
                    cols = [d[0] for d in cur.description]
                    user = dict(zip(cols, row))

            tokens = get_tokens(user["id"])
            return Response({
                "message": "Google login successful",
                "user":    user_to_dict(user),
                "tokens":  tokens,
            })
        except Exception as e:
            if "violates check constraint" in str(e).lower():
                return Response({"error": f"Invalid data: {str(e)}"}, status=400)
            return Response({"error": f"Google auth error: {str(e)}"}, status=500)



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", [user_id])
            row = cur.fetchone()
            if not row:
                return Response({"error": "User not found"}, status=404)
            cols = [d[0] for d in cur.description]
            user = dict(zip(cols, row))
            cur.execute("""
                SELECT us.id, t.name, t.category, t.color, us.level, us.verified
                FROM user_skills us JOIN tags t ON t.id = us.tag_id
                WHERE us.user_id = %s ORDER BY us.level DESC
            """, [user_id])
            skills = rows_to_dicts(cur)
        profile = user_to_dict(user)
        profile["skills"] = skills
        return Response(profile)

    def patch(self, request):
        user_id = request.user.id
        allowed = {
            "name", "branch", "year", "university", "bio",
            "github_url", "linkedin_url", "portfolio_url",
            "profile_photo_url", "preferred_mode",
            # Settings fields
            "settings_notifications", "settings_privacy", "settings_preferences",
        }
        updates = {k: v for k, v in request.data.items() if k in allowed}
        if not updates:
            return Response({"error": "No valid fields to update"}, status=400)
        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [user_id]
        try:
            with connection.cursor() as cur:
                cur.execute(f"UPDATE users SET {set_clause} WHERE id = %s RETURNING *", values)
                row  = cur.fetchone()
                cols = [d[0] for d in cur.description]
                user = dict(zip(cols, row))
            return Response(user_to_dict(user))
        except Exception as e:
            if "violates check constraint" in str(e).lower():
                if "year" in str(e).lower():
                    return Response({"error": "Study year must be between 1 and 5"}, status=400)
                return Response({"error": f"Invalid data: {str(e)}"}, status=400)
            return Response({"error": "An internal server error occurred while updating profile"}, status=500)


    def delete(self, request):
        """DELETE /api/users/me/ — permanently delete the authenticated user's account."""
        user_id = request.user.id
        with connection.cursor() as cur:
            # Cascade-delete dependent rows first (in case FK constraints aren't set to CASCADE)
            cur.execute("DELETE FROM applications  WHERE user_id = %s", [user_id])
            cur.execute("DELETE FROM saved_internships WHERE user_id = %s", [user_id])
            cur.execute("DELETE FROM user_skills   WHERE user_id = %s", [user_id])
            cur.execute("DELETE FROM match_scores  WHERE user_id = %s", [user_id])
            cur.execute("DELETE FROM users         WHERE id = %s", [user_id])
        return Response(status=204)


class MeDeleteView(APIView):
    """Alias: DELETE /api/users/me/ routed separately if needed."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        return ProfileView().delete(request)


class SkillsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with connection.cursor() as cur:
            cur.execute("""
                SELECT us.id, t.name, t.category, t.color, us.level, us.verified
                FROM user_skills us JOIN tags t ON t.id = us.tag_id
                WHERE us.user_id = %s ORDER BY us.level DESC
            """, [request.user.id])
            return Response(rows_to_dicts(cur))

    def post(self, request):
        tag_name = request.data.get("skill", "").strip()
        level    = request.data.get("level", 50)
        if not tag_name:
            return Response({"error": "skill name is required"}, status=400)
        with connection.cursor() as cur:
            cur.execute("SELECT id FROM tags WHERE LOWER(name) = LOWER(%s)", [tag_name])
            tag = cur.fetchone()
            if not tag:
                cur.execute("INSERT INTO tags (name, category) VALUES (%s, 'Other') RETURNING id", [tag_name])
                tag = cur.fetchone()
            cur.execute("""
                INSERT INTO user_skills (user_id, tag_id, level)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, tag_id) DO UPDATE SET level = EXCLUDED.level
                RETURNING id, level
            """, [request.user.id, tag[0], level])
            result = cur.fetchone()
        return Response({"id": result[0], "skill": tag_name, "level": result[1]}, status=201)


class SkillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, skill_id):
        with connection.cursor() as cur:
            cur.execute("DELETE FROM user_skills WHERE id = %s AND user_id = %s", [skill_id, request.user.id])
            if cur.rowcount == 0:
                return Response({"error": "Skill not found"}, status=404)
        return Response({"message": "Skill removed"})


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("SELECT status, COUNT(*) FROM applications WHERE user_id = %s GROUP BY status", [user_id])
            by_status = {row[0]: row[1] for row in cur.fetchall()}
            cur.execute("SELECT MAX(score) FROM match_scores WHERE user_id = %s", [user_id])
            top_match = cur.fetchone()[0] or 0
        return Response({
            "top_match_score": top_match,
            "applications": {
                "total":     sum(by_status.values()),
                "applied":   by_status.get("Applied",   0),
                "interview": by_status.get("Interview", 0),
                "offer":     by_status.get("Offer",     0),
                "rejected":  by_status.get("Rejected",  0),
            },
        })


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from users.models import Notification
        user_id = request.user.id
        notifications_list = list(Notification.objects.filter(user_id=user_id).order_by('-created_at')[:50])
        data = [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": str(n.created_at)
        } for n in notifications_list]
        unread_count = sum(1 for n in notifications_list if not n.is_read)
        return Response({"notifications": data, "unread_count": unread_count})

    def patch(self, request):
        # Mark as read
        from users.models import Notification
        user_id = request.user.id
        notification_id = request.data.get("id")
        if notification_id:
            Notification.objects.filter(id=notification_id, user_id=user_id).update(is_read=True)
        else:
            # Mark all as read
            Notification.objects.filter(user_id=user_id, is_read=False).update(is_read=True)
        return Response({"status": "ok"})


class ComputeMatchScoresView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        import json as _json
        with connection.cursor() as cur:
            cur.execute("SELECT tag_id FROM user_skills WHERE user_id = %s", [user_id])
            user_tag_ids = {row[0] for row in cur.fetchall()}

            cur.execute("""
                SELECT i.id, COALESCE(array_agg(it.tag_id) FILTER (WHERE it.tag_id IS NOT NULL), '{}') AS tag_ids
                FROM internships i
                LEFT JOIN internship_tags it ON it.internship_id = i.id
                WHERE i.is_active = TRUE AND i.deadline >= CURRENT_DATE
                GROUP BY i.id
            """)
            internships = cur.fetchall()

            computed = 0
            for intern_id, intern_tag_ids in internships:
                intern_tags = set(intern_tag_ids or [])

                if not intern_tags:
                    score   = 50
                    missing = []
                    verdict = "moderate"
                else:
                    overlap = len(user_tag_ids & intern_tags)
                    union   = len(user_tag_ids | intern_tags)
                    score   = round((overlap / union) * 100) if union > 0 else 30
                    missing = list(intern_tags - user_tag_ids)[:5]
                    verdict = "strong" if score >= 70 else "moderate" if score >= 40 else "weak"

                cur.execute("""
                    INSERT INTO match_scores (user_id, internship_id, score, verdict, missing_skills, computed_at)
                    VALUES (%s, %s, %s, %s, %s::jsonb, NOW())
                    ON CONFLICT (user_id, internship_id)
                    DO UPDATE SET score=EXCLUDED.score, verdict=EXCLUDED.verdict,
                                  missing_skills=EXCLUDED.missing_skills, computed_at=NOW()
                """, [user_id, intern_id, score, verdict, _json.dumps(missing)])
                computed += 1

            cur.execute("SELECT * FROM users WHERE id = %s", [user_id])
            row  = cur.fetchone()
            cols = [d[0] for d in cur.description]
            user = dict(zip(cols, row))

            checks = [
                user.get("name"), user.get("branch"), user.get("year"), user.get("bio"),
                user.get("github_url"), user.get("linkedin_url"), user.get("portfolio_url"),
                len(user_tag_ids) >= 3, len(user_tag_ids) >= 7, len(user_tag_ids) >= 1,
            ]
            strength = round((sum(1 for c in checks if c) / len(checks)) * 100)
            cur.execute("UPDATE users SET profile_strength = %s WHERE id = %s", [strength, user_id])

            cur.execute("SELECT MAX(score) FROM match_scores WHERE user_id = %s", [user_id])
            top_match = cur.fetchone()[0] or 0

        return Response({
            "profile_strength": strength,
            "top_match_score":  top_match,
            "computed":         computed,
        })


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id    = request.user.id
        event_type = request.data.get("event_type", "").strip()
        path       = request.data.get("path", "").strip()[:500]
        duration   = int(request.data.get("duration") or 0)

        if not event_type:
            return Response({"error": "event_type is required"}, status=400)

        with connection.cursor() as cur:
            cur.execute("""
                INSERT INTO user_activity (user_id, event_type, path, duration_seconds)
                VALUES (%s, %s, %s, %s)
            """, [user_id, event_type, path, duration])

        return Response({"status": "ok"}, status=201)