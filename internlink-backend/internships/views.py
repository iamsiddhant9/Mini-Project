from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


class InternshipListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search   = request.GET.get("search",   "").strip()
        category = request.GET.get("category", "").strip()
        mode     = request.GET.get("mode",     "").strip()
        order_by = request.GET.get("order_by", "newest")
        limit    = int(request.GET.get("limit",  20))
        offset   = int(request.GET.get("offset",  0))

        # No deadline filter — show all active internships including Adzuna
        filters = ["i.is_active = TRUE"]
        params  = []

        if search:
            filters.append("(i.search_vector @@ plainto_tsquery('english', %s) OR i.title ILIKE %s OR c.name ILIKE %s)")
            params.extend([search, f"%{search}%", f"%{search}%"])
        if category:
            filters.append("i.category = %s")
            params.append(category)
        if mode:
            filters.append("i.mode = %s")
            params.append(mode)

        order_map = {
            "newest":   "i.created_at DESC",
            "deadline": "i.deadline ASC NULLS LAST",
            "stipend":  "i.stipend_num DESC NULLS LAST",
        }
        order_sql = order_map.get(order_by, "i.created_at DESC")
        where     = " AND ".join(filters)

        # Total count
        with connection.cursor() as cur:
            cur.execute(f"""
                SELECT COUNT(DISTINCT i.id)
                FROM internships i
                LEFT JOIN companies c ON c.id = i.company_id
                WHERE {where}
            """, list(params))
            total = cur.fetchone()[0]

        params += [limit, offset]
        with connection.cursor() as cur:
            cur.execute(f"""
                SELECT i.id, i.title, i.location, i.mode, i.category,
                       i.stipend, i.deadline, i.source_url, i.apply_url,
                       c.name AS company, c.logo_url,
                       ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM internships i
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN internship_tags it ON it.internship_id = i.id
                LEFT JOIN tags t ON t.id = it.tag_id
                WHERE {where}
                GROUP BY i.id, c.name, c.logo_url, i.created_at, i.deadline, i.stipend_num
                ORDER BY {order_sql}
                LIMIT %s OFFSET %s
            """, params)
            internships = rows_to_dicts(cur)

        return Response({
            "internships": internships,
            "results":     internships,
            "total":       total,
            "limit":       limit,
            "offset":      offset,
        })


class InternshipDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, internship_id):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("""
                SELECT i.id, i.title, i.description, i.location, i.mode, i.category,
                       i.stipend, i.deadline, i.source_url, i.apply_url, i.is_verified,
                       c.name AS company, c.logo_url, c.website, c.industry,
                       ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM internships i
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN internship_tags it ON it.internship_id = i.id
                LEFT JOIN tags t ON t.id = it.tag_id
                WHERE i.id = %s AND i.is_active = TRUE
                GROUP BY i.id, c.name, c.logo_url, c.website, c.industry
            """, [internship_id])
            row = cur.fetchone()
            if not row:
                return Response({"error": "Not found"}, status=404)
            cols = [d[0] for d in cur.description]
            internship = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(cols, row)}

            cur.execute("SELECT score, verdict, reasons, missing_skills FROM match_scores WHERE user_id=%s AND internship_id=%s", [user_id, internship_id])
            m = cur.fetchone()
            internship["match_score"]    = m[0] if m else None
            internship["match_verdict"]  = m[1] if m else None
            internship["missing_skills"] = m[3] if m else []

            cur.execute("SELECT id FROM saved_internships WHERE user_id=%s AND internship_id=%s", [user_id, internship_id])
            internship["is_saved"] = cur.fetchone() is not None

            cur.execute("SELECT status FROM applications WHERE user_id=%s AND internship_id=%s", [user_id, internship_id])
            app = cur.fetchone()
            internship["application_status"] = app[0] if app else None

        return Response(internship)


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        limit   = int(request.GET.get("limit", 20))

        with connection.cursor() as cur:
            cur.execute("""
                SELECT i.id, i.title, i.location, i.mode, i.category,
                       i.stipend, i.deadline, i.apply_url,
                       c.name AS company, c.logo_url,
                       ms.score AS match_score, ms.verdict, ms.missing_skills,
                       ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM match_scores ms
                JOIN internships i ON i.id = ms.internship_id
                LEFT JOIN companies c ON c.id = i.company_id
                LEFT JOIN internship_tags it ON it.internship_id = i.id
                LEFT JOIN tags t ON t.id = it.tag_id
                WHERE ms.user_id = %s AND i.is_active = TRUE AND ms.score > 0
                GROUP BY i.id, c.name, c.logo_url, ms.score, ms.verdict, ms.missing_skills
                ORDER BY ms.score DESC
                LIMIT %s
            """, [user_id, limit])
            recs = rows_to_dicts(cur)

        # Fallback — pad with newest internships if we don't have enough matches
        if len(recs) < limit:
            exclude_ids = [r['id'] for r in recs]
            exclude_clause = "AND i.id != ALL(%s)" if exclude_ids else ""
            params = [limit - len(recs)] if not exclude_ids else [exclude_ids, limit - len(recs)]
            
            with connection.cursor() as cur:
                cur.execute(f"""
                    SELECT i.id, i.title, i.location, i.mode, i.category,
                           i.stipend, i.deadline, i.apply_url,
                           c.name AS company, c.logo_url,
                           NULL AS match_score,
                           ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                    FROM internships i
                    LEFT JOIN companies c ON c.id = i.company_id
                    LEFT JOIN internship_tags it ON it.internship_id = i.id
                    LEFT JOIN tags t ON t.id = it.tag_id
                    WHERE i.is_active = TRUE {exclude_clause}
                    GROUP BY i.id, c.name, c.logo_url, i.created_at
                    ORDER BY i.created_at DESC
                    LIMIT %s
                """, params)
                recs.extend(rows_to_dicts(cur))

        # Fallback — no match scores yet, return newest
        if not recs:
            with connection.cursor() as cur:
                cur.execute("""
                    SELECT i.id, i.title, i.location, i.mode, i.category,
                           i.stipend, i.deadline, i.apply_url,
                           c.name AS company, c.logo_url,
                           NULL AS match_score,
                           ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                    FROM internships i
                    LEFT JOIN companies c ON c.id = i.company_id
                    LEFT JOIN internship_tags it ON it.internship_id = i.id
                    LEFT JOIN tags t ON t.id = it.tag_id
                    WHERE i.is_active = TRUE
                    GROUP BY i.id, c.name, c.logo_url
                    ORDER BY i.created_at DESC
                    LIMIT %s
                """, [limit])
                recs = rows_to_dicts(cur)

        return Response(recs)


class InternshipFiltersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "categories": ["AI/ML","Backend","Frontend","Cloud","Mobile","Data","Security","DevOps","Design","Other"],
            "modes":      ["Remote","Hybrid","On-site"],
        })


class SeedInternshipsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        companies = [
            ("Google",    "google.com",    "Technology"),
            ("Microsoft", "microsoft.com", "Technology"),
            ("Zerodha",   "zerodha.com",   "FinTech"),
            ("Swiggy",    "swiggy.com",    "FoodTech"),
            ("Razorpay",  "razorpay.com",  "FinTech"),
        ]
        internships_data = [
            ("Software Engineering Intern", "Backend systems with Python/Django", "Bangalore", "Hybrid",  "Backend",  "85,000/mo", 85000, "2026-08-31", "https://careers.google.com"),
            ("ML Research Intern",          "LLMs and fine-tuning research",       "Remote",    "Remote",  "AI/ML",    "70,000/mo", 70000, "2026-07-31", "https://careers.microsoft.com"),
            ("Frontend Engineer Intern",    "React and TypeScript components",     "Mumbai",    "On-site", "Frontend", "60,000/mo", 60000, "2026-09-15", "https://zerodha.com/careers"),
            ("Data Science Intern",         "User behaviour analytics",            "Hyderabad", "Hybrid",  "Data",     "55,000/mo", 55000, "2026-08-01", "https://careers.swiggy.com"),
            ("DevOps Intern",               "CI/CD and AWS infrastructure",        "Remote",    "Remote",  "DevOps",   "65,000/mo", 65000, "2026-10-01", "https://razorpay.com/jobs"),
        ]
        tag_map = {
            0: ["Python","Django","PostgreSQL"],
            1: ["Python","PyTorch","Machine Learning"],
            2: ["React","TypeScript","JavaScript"],
            3: ["Python","SQL","Machine Learning"],
            4: ["AWS","Docker","Kubernetes"],
        }
        with connection.cursor() as cur:
            cids = []
            for name, website, industry in companies:
                cur.execute("INSERT INTO companies (name,website,industry) VALUES (%s,%s,%s) ON CONFLICT DO NOTHING RETURNING id", [name, website, industry])
                row = cur.fetchone()
                if not row:
                    cur.execute("SELECT id FROM companies WHERE LOWER(name)=LOWER(%s)", [name])
                    row = cur.fetchone()
                cids.append(row[0])

            for i, (title, desc, loc, mode, cat, stipend, snum, deadline, apply_url) in enumerate(internships_data):
                cur.execute("""
                    INSERT INTO internships (company_id,title,description,location,mode,category,stipend,stipend_num,deadline,source,apply_url)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'other',%s) RETURNING id
                """, [cids[i % len(cids)], title, desc, loc, mode, cat, stipend, snum, deadline, apply_url])
                iid = cur.fetchone()[0]
                for tag in tag_map[i]:
                    cur.execute("SELECT id FROM tags WHERE LOWER(name)=LOWER(%s)", [tag])
                    t = cur.fetchone()
                    if t:
                        cur.execute("INSERT INTO internship_tags VALUES (%s,%s) ON CONFLICT DO NOTHING", [iid, t[0]])

        return Response({"message": "5 internships seeded"})