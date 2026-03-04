from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny


def rows_to_dicts(cursor):
    columns = [col[0] for col in cursor.description]
    return [{k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(columns, row)} for row in cursor.fetchall()]


class HackathonListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        theme    = request.GET.get("theme", "").strip()
        mode     = request.GET.get("mode", "").strip()
        status   = request.GET.get("status", "").strip()
        search   = request.GET.get("search", "").strip()
        order_by = request.GET.get("order_by", "deadline")
        limit    = int(request.GET.get("limit", 20))
        offset   = int(request.GET.get("offset", 0))

        filters = ["h.is_active = TRUE"]
        params  = []

        if theme:
            filters.append("h.theme = %s")
            params.append(theme)
        if mode:
            filters.append("h.mode = %s")
            params.append(mode)
        if status:
            filters.append("h.status = %s")
            params.append(status)
        if search:
            filters.append("h.search_vector @@ plainto_tsquery('english', %s)")
            params.append(search)

        order_map = {
            "deadline": "h.registration_deadline ASC",
            "prize":    "h.prize_num DESC",
            "newest":   "h.created_at DESC",
        }
        order_sql = order_map.get(order_by, "h.registration_deadline ASC")
        where = " AND ".join(filters)
        params += [limit, offset]

        with connection.cursor() as cur:
            cur.execute("""
                SELECT h.id, h.title, h.organizer, h.theme, h.mode, h.location,
                    h.prize_pool, h.team_size_min, h.team_size_max,
                    h.registration_deadline, h.start_date, h.end_date,
                    h.duration, h.registration_url, h.status, h.participants,
                    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM hackathons h
                LEFT JOIN hackathon_tags ht ON ht.hackathon_id = h.id
                LEFT JOIN tags t ON t.id = ht.tag_id
                WHERE """ + where + """
                GROUP BY h.id
                ORDER BY """ + order_sql + """
                LIMIT %s OFFSET %s
            """, params)
            hackathons = rows_to_dicts(cur)

        return Response({"results": hackathons, "total": len(hackathons), "limit": limit, "offset": offset})


class HackathonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, hackathon_id):
        user_id = request.user.id
        with connection.cursor() as cur:
            cur.execute("""
                SELECT h.id, h.title, h.organizer, h.description, h.theme, h.mode, h.location,
                    h.prize_pool, h.prize_num, h.team_size_min, h.team_size_max,
                    h.registration_deadline, h.start_date, h.end_date,
                    h.duration, h.registration_url, h.status, h.participants,
                    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM hackathons h
                LEFT JOIN hackathon_tags ht ON ht.hackathon_id = h.id
                LEFT JOIN tags t ON t.id = ht.tag_id
                WHERE h.id = %s AND h.is_active = TRUE
                GROUP BY h.id
            """, [hackathon_id])
            row = cur.fetchone()
            if not row:
                return Response({"error": "Hackathon not found"}, status=404)
            cols = [d[0] for d in cur.description]
            hackathon = {k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in zip(cols, row)}

            cur.execute("""
                SELECT score, fit_reason, suggested_role, prep_tips
                FROM hackathon_match_scores
                WHERE user_id = %s AND hackathon_id = %s
            """, [user_id, hackathon_id])
            m = cur.fetchone()
            hackathon["match_score"]    = m[0] if m else None
            hackathon["fit_reason"]     = m[1] if m else None
            hackathon["suggested_role"] = m[2] if m else None
            hackathon["prep_tips"]      = m[3] if m else []

        return Response(hackathon)


class HackathonRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        limit   = int(request.GET.get("limit", 10))
        with connection.cursor() as cur:
            cur.execute("""
                SELECT h.id, h.title, h.organizer, h.theme, h.mode, h.prize_pool,
                    h.registration_deadline, h.status,
                    hm.score, hm.fit_reason, hm.suggested_role,
                    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                FROM hackathon_match_scores hm
                JOIN hackathons h ON h.id = hm.hackathon_id
                LEFT JOIN hackathon_tags ht ON ht.hackathon_id = h.id
                LEFT JOIN tags t ON t.id = ht.tag_id
                WHERE hm.user_id = %s AND h.status IN ('upcoming','ongoing') AND h.is_active = TRUE
                GROUP BY h.id, hm.score, hm.fit_reason, hm.suggested_role
                ORDER BY hm.score DESC LIMIT %s
            """, [user_id, limit])
            recs = rows_to_dicts(cur)

        if not recs:
            with connection.cursor() as cur:
                cur.execute("""
                    SELECT h.id, h.title, h.organizer, h.theme, h.mode, h.prize_pool,
                        h.registration_deadline, h.status, NULL AS score,
                        ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
                    FROM hackathons h
                    LEFT JOIN hackathon_tags ht ON ht.hackathon_id = h.id
                    LEFT JOIN tags t ON t.id = ht.tag_id
                    WHERE h.status IN ('upcoming','ongoing') AND h.is_active = TRUE
                    GROUP BY h.id
                    ORDER BY h.registration_deadline ASC LIMIT %s
                """, [limit])
                recs = rows_to_dicts(cur)

        return Response(recs)


class SeedHackathonsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        hackathons = [
            ("Smart India Hackathon 2025", "Ministry of Education", "Build solutions for govt problems.", "GovTech", "Offline", "Pan India", "10,00,000", 1000000, 2, 4, "2026-05-01", "2026-06-01", "2026-06-02", "36 hrs", "https://sih.gov.in", "upcoming", 50000),
            ("ETHIndia 2025", "Devfolio", "Build on Ethereum and Web3.", "Web3", "Offline", "Bangalore", "500,000", 500000, 1, 5, "2026-04-15", "2026-05-10", "2026-05-12", "48 hrs", "https://ethindia.co", "upcoming", 3000),
            ("Google Solution Challenge", "Google", "Solve UN SDGs with Google tech.", "Social Impact", "Online", "Remote", "15,000 USD", 1250000, 1, 4, "2026-04-01", "2026-04-15", "2026-05-30", "3 months", "https://developers.google.com", "upcoming", 10000),
            ("HackWithInfy 2025", "Infosys", "Enterprise AI and automation.", "Enterprise AI", "Online", "Remote", "3,00,000", 300000, 2, 3, "2026-05-15", "2026-06-10", "2026-06-11", "24 hrs", "https://infosys.com", "upcoming", 8000),
            ("Flipkart Grid 6.0", "Flipkart", "E-commerce and supply chain tech.", "E-Commerce", "Hybrid", "Bangalore", "5,00,000", 500000, 2, 4, "2026-05-30", "2026-07-01", "2026-07-15", "6 weeks", "https://flipkartgrid.com", "upcoming", 15000),
        ]
        tag_map = {
            0: ["Python", "Machine Learning", "Django"],
            1: ["Solidity", "Ethereum", "JavaScript"],
            2: ["React", "Node.js", "GCP"],
            3: ["Python", "Machine Learning", "AWS"],
            4: ["Python", "React", "PostgreSQL"],
        }

        with connection.cursor() as cur:
            for i, (title, organizer, desc, theme, mode, location, prize, prize_num,
                    ts_min, ts_max, reg_deadline, start, end, duration, url, status, participants) in enumerate(hackathons):
                cur.execute("""
                    INSERT INTO hackathons (title, organizer, description, theme, mode, location,
                        prize_pool, prize_num, team_size_min, team_size_max,
                        registration_deadline, start_date, end_date, duration,
                        registration_url, status, participants, source)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'manual')
                    ON CONFLICT DO NOTHING RETURNING id
                """, [title, organizer, desc, theme, mode, location, prize, prize_num,
                      ts_min, ts_max, reg_deadline, start, end, duration, url, status, participants])
                row = cur.fetchone()
                if row:
                    hid = row[0]
                    for tag in tag_map[i]:
                        cur.execute("SELECT id FROM tags WHERE LOWER(name)=LOWER(%s)", [tag])
                        t = cur.fetchone()
                        if t:
                            cur.execute("INSERT INTO hackathon_tags VALUES (%s,%s) ON CONFLICT DO NOTHING", [hid, t[0]])

        return Response({"message": "5 hackathons seeded"})