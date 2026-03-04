import requests
from django.db import connection
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.auth import CustomJWTAuthentication


def is_admin(request):
    with connection.cursor() as cur:
        cur.execute("SELECT role FROM users WHERE id = %s", [request.user.id])
        row = cur.fetchone()
        return row and row[0] == "admin"


class FetchAdzunaJobsView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)

        app_id  = settings.ADZUNA_APP_ID
        app_key = settings.ADZUNA_APP_KEY

        keywords = request.data.get("keywords", "software intern")
        country  = request.data.get("country", "in")
        pages    = request.data.get("pages", 3)

        fetched = 0
        saved   = 0

        for page in range(1, pages + 1):
            url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
            params = {
                "app_id":         app_id,
                "app_key":        app_key,
                "what":           keywords,
                "results_per_page": 50,
                "content-type":   "application/json",
            }
            res = requests.get(url, params=params, timeout=10)
            if res.status_code != 200:
                continue

            jobs = res.json().get("results", [])
            fetched += len(jobs)

            for job in jobs:
                title       = job.get("title", "")[:200]
                description = job.get("description", "")[:2000]
                location    = job.get("location", {}).get("display_name", "India")[:200]
                company     = job.get("company", {}).get("display_name", "Unknown")[:200]
                source_id   = job.get("id", "")
                url_link    = job.get("redirect_url", "")
                salary_min  = job.get("salary_min")
                salary_max  = job.get("salary_max")

                # Determine mode
                title_lower = title.lower()
                desc_lower  = description.lower()
                if "remote" in title_lower or "remote" in desc_lower:
                    mode = "Remote"
                elif "hybrid" in title_lower or "hybrid" in desc_lower:
                    mode = "Hybrid"
                else:
                    mode = "On-site"

                # Determine category
                if any(w in title_lower for w in ["ml", "machine learning", "ai", "data science"]):
                    category = "AI/ML"
                elif any(w in title_lower for w in ["frontend", "react", "vue", "angular"]):
                    category = "Frontend"
                elif any(w in title_lower for w in ["backend", "django", "node", "api"]):
                    category = "Backend"
                elif any(w in title_lower for w in ["cloud", "aws", "azure", "devops"]):
                    category = "Cloud"
                elif any(w in title_lower for w in ["mobile", "android", "ios", "flutter"]):
                    category = "Mobile"
                elif any(w in title_lower for w in ["security", "cyber"]):
                    category = "Security"
                elif any(w in title_lower for w in ["data", "analyst", "analytics"]):
                    category = "Data"
                else:
                    category = "Other"

                # Stipend
                if salary_min and salary_max:
                    stipend     = f"₹{int(salary_min):,} - ₹{int(salary_max):,}/mo"
                    stipend_num = int(salary_min)
                elif salary_min:
                    stipend     = f"₹{int(salary_min):,}/mo"
                    stipend_num = int(salary_min)
                else:
                    stipend     = "Competitive"
                    stipend_num = 0

                with connection.cursor() as cur:
                    # Get or create company
                    cur.execute("SELECT id FROM companies WHERE LOWER(name) = LOWER(%s)", [company])
                    comp = cur.fetchone()
                    if not comp:
                        cur.execute("INSERT INTO companies (name) VALUES (%s) RETURNING id", [company])
                        comp = cur.fetchone()
                    company_id = comp[0]

                    # Insert internship (skip duplicates)
                    cur.execute("""
                        INSERT INTO internships (
                            company_id, title, description, location, mode,
                            category, stipend, stipend_num, source, source_id, apply_url
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'adzuna',%s,%s)
                        ON CONFLICT (source, source_id) DO NOTHING
                    """, [
                        company_id, title, description, location, mode,
                        category, stipend, stipend_num, source_id, url_link
                    ])
                    if cur.rowcount > 0:
                        saved += 1

        return Response({
            "message": f"Fetched {fetched} jobs, saved {saved} new internships",
            "fetched": fetched,
            "saved":   saved,
        })


class AdzunaKeywordsView(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request):
            return Response({"error": "Admin access required"}, status=403)

        keywords_list = [
            "software engineering intern",
            "frontend developer intern",
            "backend developer intern",
            "data science intern",
            "machine learning intern",
            "cloud intern",
            "mobile developer intern",
            "cybersecurity intern",
        ]

        total_saved = 0
        app_id  = settings.ADZUNA_APP_ID
        app_key = settings.ADZUNA_APP_KEY

        for keywords in keywords_list:
            url = f"https://api.adzuna.com/v1/api/jobs/in/search/1"
            params = {
                "app_id":           app_id,
                "app_key":          app_key,
                "what":             keywords,
                "results_per_page": 50,
                "content-type":     "application/json",
            }
            res = requests.get(url, params=params, timeout=10)
            if res.status_code != 200:
                continue

            jobs = res.json().get("results", [])
            for job in jobs:
                title       = job.get("title", "")[:200]
                description = job.get("description", "")[:2000]
                location    = job.get("location", {}).get("display_name", "India")[:200]
                company     = job.get("company", {}).get("display_name", "Unknown")[:200]
                source_id   = job.get("id", "")
                url_link    = job.get("redirect_url", "")
                salary_min  = job.get("salary_min")
                salary_max  = job.get("salary_max")

                title_lower = title.lower()
                desc_lower  = description.lower()

                if "remote" in title_lower or "remote" in desc_lower:
                    mode = "Remote"
                elif "hybrid" in title_lower or "hybrid" in desc_lower:
                    mode = "Hybrid"
                else:
                    mode = "On-site"

                if any(w in title_lower for w in ["ml","machine learning","ai","data science"]):
                    category = "AI/ML"
                elif any(w in title_lower for w in ["frontend","react","vue","angular"]):
                    category = "Frontend"
                elif any(w in title_lower for w in ["backend","django","node","api"]):
                    category = "Backend"
                elif any(w in title_lower for w in ["cloud","aws","azure","devops"]):
                    category = "Cloud"
                elif any(w in title_lower for w in ["mobile","android","ios","flutter"]):
                    category = "Mobile"
                elif any(w in title_lower for w in ["security","cyber"]):
                    category = "Security"
                elif any(w in title_lower for w in ["data","analyst","analytics"]):
                    category = "Data"
                else:
                    category = "Other"

                if salary_min and salary_max:
                    stipend     = f"₹{int(salary_min):,} - ₹{int(salary_max):,}/mo"
                    stipend_num = int(salary_min)
                elif salary_min:
                    stipend     = f"₹{int(salary_min):,}/mo"
                    stipend_num = int(salary_min)
                else:
                    stipend     = "Competitive"
                    stipend_num = 0

                with connection.cursor() as cur:
                    cur.execute("SELECT id FROM companies WHERE LOWER(name) = LOWER(%s)", [company])
                    comp = cur.fetchone()
                    if not comp:
                        cur.execute("INSERT INTO companies (name) VALUES (%s) RETURNING id", [company])
                        comp = cur.fetchone()
                    company_id = comp[0]

                    cur.execute("""
                        INSERT INTO internships (
                            company_id, title, description, location, mode,
                            category, stipend, stipend_num, source, source_id, apply_url
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'adzuna',%s,%s)
                        ON CONFLICT (source, source_id) DO NOTHING
                    """, [
                        company_id, title, description, location, mode,
                        category, stipend, stipend_num, source_id, url_link
                    ])
                    if cur.rowcount > 0:
                        total_saved += 1

        return Response({
            "message": f"Bulk fetch complete — {total_saved} new internships saved",
            "saved":   total_saved,
        })