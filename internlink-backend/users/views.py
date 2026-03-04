import hashlib
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


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


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

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
        allowed = {"name","branch","year","university","bio","github_url","linkedin_url","portfolio_url","profile_photo_url","preferred_mode"}
        updates = {k: v for k, v in request.data.items() if k in allowed}
        if not updates:
            return Response({"error": "No valid fields to update"}, status=400)
        set_clause = ", ".join(f"{k} = %s" for k in updates)
        values = list(updates.values()) + [user_id]
        with connection.cursor() as cur:
            cur.execute(f"UPDATE users SET {set_clause} WHERE id = %s RETURNING *", values)
            row  = cur.fetchone()
            cols = [d[0] for d in cur.description]
            user = dict(zip(cols, row))
        return Response(user_to_dict(user))


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