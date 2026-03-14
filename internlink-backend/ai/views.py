# ai/views.py
# Uses Groq API (OpenAI-compatible) with llama-3.3-70b-versatile
# Free tier: 14,400 requests/day — no billing required

import os
import json
import requests as http_requests

from django.conf import settings
from django.db import connection
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"


def call_groq(prompt: str, max_tokens: int = 400, temperature: float = 0.7) -> str:
    """Call Groq API and return generated text."""
    api_key = os.environ.get("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", "")
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured in server environment.")

    resp = http_requests.post(
        GROQ_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
        timeout=20,
    )

    if not resp.ok:
        msg = resp.json().get("error", {}).get("message", f"HTTP {resp.status_code}")
        raise ValueError(f"Groq error: {msg}")

    return resp.json()["choices"][0]["message"]["content"].strip()


def extract_json(text: str) -> dict:
    """Extract first JSON object from a Groq response that may have extra text."""
    start = text.find("{")
    end   = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON found in response")
    return json.loads(text[start:end])


# ── Feature 1: Match Explanation + AI Score ────────────────────────────────────

class MatchExplanationView(APIView):
    """POST /api/ai/match-explanation/
    Body: { internship: {...}, user: {...} }
    Returns: { score: 0-100, explanation: "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data        = request.data
        intern_data = data.get("internship", {})
        user_data   = data.get("user", {})

        skills = user_data.get("skills", [])
        skill_names = [s.get("name", s) if isinstance(s, dict) else s for s in skills] if isinstance(skills, list) else []

        prompt = f"""
You are a career advisor AI. Analyze this student-internship match.

Student:
- Branch: {user_data.get('branch') or 'Not specified'}
- Skills: {', '.join(skill_names) if skill_names else 'Not specified'}
- Bio: {user_data.get('bio') or 'Not provided'}

Internship:
- Role: {intern_data.get('title', '')}
- Company: {intern_data.get('company', '')}
- Mode: {intern_data.get('mode', '')}
- Category: {intern_data.get('category', '')}
- Tech/Tags: {', '.join(intern_data.get('tags') or []) or 'Not specified'}
- Stipend: {intern_data.get('stipend') or '—'}
- Deadline: {intern_data.get('deadline') or '—'}

Respond ONLY with a valid JSON object, nothing else:
{{
  "score": <integer 0-100 reflecting skill overlap and role fit>,
  "explanation": "<exactly 2 punchy sentences: specific skill match + one practical perk. No generic advice.>"
}}
""".strip()

        try:
            raw = call_groq(prompt, max_tokens=250, temperature=0.4)
            parsed = extract_json(raw)
            score = max(0, min(100, int(parsed.get("score", 70))))
            explanation = str(parsed.get("explanation", "")).strip()
            return Response({"score": score, "explanation": explanation})
        except (ValueError, KeyError, json.JSONDecodeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Feature 2: Skill Gap Detector ─────────────────────────────────────────────

class SkillGapView(APIView):
    """POST /api/ai/skill-gap/
    Body: {} (user identity from JWT)
    Returns: { gaps: [{ skill, priority, reason, resource }] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id

        # Get user's current skills from DB (raw SQL)
        try:
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT name FROM user_skills WHERE user_id = %s",
                    [user_id]
                )
                user_skills = [row[0] for row in cur.fetchall()]
        except Exception:
            user_skills = []

        # Get top tags from active internships
        try:
            with connection.cursor() as cur:
                cur.execute(
                    """SELECT DISTINCT t.name
                       FROM tags t
                       JOIN internship_tags it ON it.tag_id = t.id
                       JOIN internships i ON i.id = it.internship_id
                       WHERE i.is_active = TRUE
                       ORDER BY t.name
                       LIMIT 80"""
                )
                tag_list = [row[0] for row in cur.fetchall()]
        except Exception:
            tag_list = ["Python", "React", "Node.js", "Docker", "SQL", "AWS", "TypeScript"]

        prompt = f"""
You are a career advisor. A student has these skills:
{', '.join(user_skills) if user_skills else 'No skills listed yet'}

The top internships require these technologies/skills:
{', '.join(tag_list) if tag_list else 'Python, React, Docker, AWS, SQL'}

Identify the 5 most important skills this student is MISSING that would most increase their internship match rate.
For each, give a brief reason and a specific free learning resource.

Respond ONLY with valid JSON — a list of exactly 5 objects:
[
  {{
    "skill": "<skill name>",
    "priority": "<high | medium | low>",
    "reason": "<one sentence: why this skill matters>",
    "resource": "<specific free resource URL or platform name>"
  }}
]
""".strip()

        try:
            raw   = call_groq(prompt, max_tokens=600, temperature=0.3)
            start = raw.find("[")
            end   = raw.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array in response")
            gaps = json.loads(raw[start:end])
            return Response({"gaps": gaps})
        except (ValueError, json.JSONDecodeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Feature 3: AI Resume Generator ────────────────────────────────────────────

class ResumeGeneratorView(APIView):
    """POST /api/ai/generate-resume/
    Body: { target_role, highlight_project, highlight_experience }
    Returns: { summary, experience: [...], projects: [...], education: [...] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        data    = request.data

        # Fetch user profile via raw SQL
        try:
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT name, branch, year, university, bio FROM users WHERE id = %s",
                    [user_id]
                )
                row = cur.fetchone()
                if row:
                    name, branch, year, university, bio = row
                else:
                    name = branch = year = university = bio = ""
        except Exception:
            name = branch = year = university = bio = ""

        # Fetch skills
        try:
            with connection.cursor() as cur:
                cur.execute("SELECT name FROM user_skills WHERE user_id = %s", [user_id])
                skills = [r[0] for r in cur.fetchall()]
        except Exception:
            skills = []

        target_role          = data.get("target_role", "Software Engineer Intern")
        highlight_project    = data.get("highlight_project", "")
        highlight_experience = data.get("highlight_experience", "")

        prompt = f"""
You are a professional resume writer. Generate a structured resume for this student.

Student:
- Name: {name or 'Student'}
- Branch: {branch}
- Year: {year}
- University: {university}
- Bio: {bio}
- Skills: {', '.join(skills) if skills else 'Not specified'}
- Target Role: {target_role}
- Key Project: {highlight_project or 'Not provided'}
- Key Experience: {highlight_experience or 'Not provided'}

Generate a complete resume. Respond ONLY with valid JSON:
{{
  "summary": "<3-sentence professional summary tailored to {target_role}>",
  "experience": [
    {{
      "title": "<role title>",
      "sub": "<company or organization>",
      "date": "<duration or year>",
      "desc": "<2-3 impactful bullet points as one string, separated by \\n>"
    }}
  ],
  "projects": [
    {{
      "title": "<project name>",
      "sub": "<tech stack used>",
      "date": "<year>",
      "desc": "<2-3 bullet points as one string>"
    }}
  ],
  "education": [
    {{
      "title": "<degree name>",
      "sub": "<university/college>",
      "date": "<year range>",
      "desc": "<relevant coursework or achievements>"
    }}
  ]
}}

Make it concrete, achievement-oriented, and ATS-friendly. Use action verbs. No placeholder text.
""".strip()

        try:
            raw    = call_groq(prompt, max_tokens=900, temperature=0.5)
            parsed = extract_json(raw)
            return Response(parsed)
        except (ValueError, json.JSONDecodeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
