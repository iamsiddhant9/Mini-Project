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
                    "SELECT t.name FROM user_skills us JOIN tags t ON us.tag_id = t.id WHERE us.user_id = %s",
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
You are an expert career advisor for software engineering students. 
A student has exactly these existing skills:
[{', '.join(user_skills) if user_skills else 'No skills listed yet'}]

The top internships in the market require these technologies/skills:
[{', '.join(tag_list) if tag_list else 'Python, React, Docker, AWS, SQL'}]

Identify exactly 5 high-impact skills this student is MISSING that would dramatically increase their internship match rate.
CRITICAL RULE: YOU MUST NOT RECOMMEND ANY SKILL THAT IS ALREADY IN THE STUDENT'S EXISTING SKILL LIST ABOVE.
If the student already has 'React', do not recommend 'React' or 'React.js', etc.
For each missing skill, give a brief reason and a specific free learning resource.

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

        # Fetch full user profile
        try:
            with connection.cursor() as cur:
                cur.execute(
                    """SELECT name, branch, year, university, bio,
                              github_url, linkedin_url, portfolio_url
                       FROM users WHERE id = %s""",
                    [user_id]
                )
                row = cur.fetchone()
                if row:
                    name, branch, year, university, bio, github_url, linkedin_url, portfolio_url = row
                else:
                    name = branch = year = university = bio = github_url = linkedin_url = portfolio_url = ""
        except Exception:
            name = branch = year = university = bio = github_url = linkedin_url = portfolio_url = ""

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

        # Only generate experience section if the user provided one
        is_fresher = not highlight_experience.strip()

        experience_instruction = (
            """  "experience": [],"""
            if is_fresher else
            f"""  "experience": [
    {{
      "title": "<job title / intern role>",
      "sub": "<company · city>",
      "date": "<Month Year – Month Year>",
      "desc": "<line 1 achievement with metric>\\n<line 2 achievement>\\n<line 3 achievement>"
    }}
  ],"""
        )

        prompt = f"""You are an expert resume writer for computer science students applying for internships in India.

Student Profile:
- Name: {name or 'Student'}
- Branch: {branch or 'Computer Science'}
- Year: {year or '3rd'}
- University: {university or 'Not provided'}
- Bio: {bio or 'Not provided'}
- Skills: {', '.join(skills) if skills else 'Not specified'}
- GitHub: {github_url or 'Not provided'}
- LinkedIn: {linkedin_url or 'Not provided'}
- Target Role: {target_role}
- Key Project: {highlight_project or 'Not provided'}
- Prior Experience: {highlight_experience if not is_fresher else 'None (fresher — skip experience section)'}

Rules for generating the resume:
1. summary: Write exactly 2 punchy sentences tailored to {target_role}. Mention branch + key skill.
2. education: Fill from profile data. desc = "CGPA: X.X/10  |  Relevant: <2-3 relevant subjects from branch>".
3. projects: Generate at least 2 concrete projects. The first must use "{highlight_project or 'a web or AI project'}". The second should be a supporting project that uses different skills from the student's skill list. Each desc must have exactly 3 bullet lines separated by \\n (no bullet characters — those are added automatically). Each line must start with a strong action verb and include a metric or outcome.
4. experience: {'EMPTY ARRAY — this is a fresher.' if is_fresher else f'Use: {highlight_experience}. 2-3 bullet lines in desc separated by \\n.'}
5. All dates must be realistic for a year-{year or '3'} student.
6. desc fields use \\n to separate lines. NO bullet characters (•, -, *). Just plain text per line.

Respond ONLY with this exact valid JSON structure, no extra text:
{{
  "summary": "<2 sentences>",
  "education": [
    {{
      "title": "<B.Tech/B.E. + branch>",
      "sub": "<university> · <city>",
      "date": "<admission year> – <graduation year>",
      "desc": "<CGPA or percentage>  |  Relevant: <subjects>"
    }}
  ],
{experience_instruction}
  "projects": [
    {{
      "title": "<Project Name>",
      "sub": "<Tech Stack e.g. React, Django, PostgreSQL>",
      "date": "<Month Year>",
      "desc": "<action verb + what you built + metric>\\n<action verb + technical detail>\\n<action verb + outcome or impact>"
    }},
    {{
      "title": "<Second Project Name>",
      "sub": "<Different Tech Stack>",
      "date": "<Month Year>",
      "desc": "<line 1>\\n<line 2>\\n<line 3>"
    }}
  ]
}}
""".strip()

        try:
            raw    = call_groq(prompt, max_tokens=1200, temperature=0.4)
            parsed = extract_json(raw)

            # Ensure experience key always exists
            if "experience" not in parsed:
                parsed["experience"] = []

            return Response(parsed)
        except (ValueError, json.JSONDecodeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
