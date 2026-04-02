# ai/views.py
# Uses Groq API (OpenAI-compatible) with llama-3.3-70b-versatile
# Free tier: 14,400 requests/day — no billing required
# Includes: MatchExplanation, SkillGap, ResumeGenerator, CareerCoach

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
    """Call Groq API and return generated text (single-turn)."""
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


def call_groq_chat(messages: list, max_tokens: int = 800, temperature: float = 0.8) -> str:
    """Call Groq API with a full multi-turn messages list."""
    api_key = os.environ.get("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", "")
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured in server environment.")

    resp = http_requests.post(
        GROQ_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": GROQ_MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
        timeout=30,
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

# ── Feature 4: AI Career Coach (multi-turn chat) ────────────────────────────────

COACH_SYSTEM_PROMPT = """You are Jarvis, a brilliant, high-tech, and laser-efficient AI career counselor on InternLink.

Your personality:
- Sophisticated, professional, and highly insightful
- Fast and to-the-point: avoid flowery language. Get straight to the value.
- You speak in structured logic, not long paragraphs.

CRITICAL VISUAL FORMATTING RULES:
1. NEVER WRITE PARAGRAPHS. Every single thought MUST be a bullet point or a header.
2. USE EMOJIS: Lead every single bullet point with a relevant emoji (e.g., 🚀, 💡, 🎯, 🛠️, 📊).
3. HEAVY BOLDING: Use **bold text** for all keywords, skills, roles, and major actions to make them pop.
4. SPACING: Use white space effectively to separate different concepts.
5. Provide actionable advice and a clear career direction as FAST as possible. 
6. If they have a profile, immediately say: "🎯 **Based on your background, Jarvis recommends this elite path:**" and offer a structured overview.
7. Always provide 2 to 4 clickable options for the user so they can quickly reply without typing. Format them EXACTLY as `[Option: <option text>]`. Example: `[Option: 🔭 Tell me more about AI]`. Do not add bullets before `[Option: ...]`.
8. Whenever you give a full roadmap or heavy advice, you MUST include the exact text `[VISUAL_ROADMAP]` on its own line at the very end of your message.

When giving a final roadmap, use this structure:
   ## 🎯 Your Career Path: [Career Name]
   - **Why this suits you:** ...
   - **Skills to master:** ...
   - **Elite projects to build:** ...
   - **High-impact internships:** ...
   - **Future trajectory:** ...
   - **💪 You have the potential of a world-class engineer.** [motivating message]
   
   [VISUAL_ROADMAP]

Do NOT give generic advice. Be specific to what the student shared and focus on building an elite career path."""


class CareerCoachView(APIView):
    """POST /api/ai/career-coach/
    Body: { messages: [{role: 'user'|'assistant', content: '...'}] }
    Returns: { reply: '...' }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user    = request.user
        history = request.data.get("messages", [])

        # Fetch user profile for personalised context
        try:
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT name, branch, year, bio FROM users WHERE id = %s",
                    [user.id]
                )
                row    = cur.fetchone()
                name   = row[0] if row else (user.get_full_name() or user.username)
                branch = row[1] if row else ""
                year   = row[2] if row else ""
                bio    = row[3] if row else ""
        except Exception:
            name   = user.get_full_name() or user.username
            branch = year = bio = ""

        try:
            with connection.cursor() as cur:
                cur.execute(
                    "SELECT t.name FROM user_skills us JOIN tags t ON us.tag_id = t.id WHERE us.user_id = %s",
                    [user.id]
                )
                skills = [r[0] for r in cur.fetchall()]
        except Exception:
            skills = []

        profile_block = (
            "Student profile you are counseling:\n"
            "- Name: " + str(name) + "\n"
            "- Branch: " + (branch or "Not specified") + "\n"
            "- Year: " + (str(year) if year else "Not specified") + "\n"
            "- Existing Skills: " + (", ".join(skills) if skills else "None listed yet") + "\n"
            "- Bio: " + (bio or "Not provided") + "\n"
            "Use this context to personalize your advice. Focus on building an elite career path."
        )

        messages = [
            {"role": "system", "content": COACH_SYSTEM_PROMPT},
            {"role": "system", "content": profile_block},
            *history,
        ]

        try:
            reply = call_groq_chat(messages, max_tokens=1000, temperature=0.75)
            return Response({"reply": reply})
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Feature 5: Dynamic Roadmap Generator ─────────────────────────────────────

ROADMAP_JSON_PROMPT = """Based on the following conversation with the user, generate a highly detailed and personalized learning roadmap for the career path they discussed.

You MUST return STRICT JSON that exactly matches this structure:
{
  "id": "custom-roadmap",
  "label": "Name of Career (e.g. AI Engineer)",
  "description": "Short 1-sentence engaging description",
  "icon": "bot",
  "gradient": "linear-gradient(135deg, #10b981, #059669)",
  "color": "#10b981",
  "phases": [
    {
      "id": "phase-1",
      "label": "Name of Phase (e.g. Fundamentals)",
      "color": "#10b981",
      "topics": [
        {
          "id": "topic-1",
          "label": "Short Topic Name",
          "description": "Short crisp description (max 10 words)",
          "type": "core" | "optional" | "tool"
        }
      ]
    }
  ]
}

RULES:
1. The 'icon' MUST be exactly one of: globe, server, bot, bar-chart, rocket, shield, link
2. Generate EXACTLY 4 phases.
3. Each phase should be color coded correctly (matching the parent color or a sensible progression).
4. Each phase MUST have 4 to 6 topics.
5. Topics must be highly specific to their exact goals and existing skills.
6. ONLY output valid JSON. Do not output markdown code blocks. Start output with '{' and end with '}'.
"""

class GenerateRoadmapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        history = request.data.get("messages", [])
        
        messages = [
            {"role": "system", "content": ROADMAP_JSON_PROMPT},
            {"role": "user", "content": "Here is our conversation history:\n" + str(history) + "\n\nGenerate the JSON roadmap now."}
        ]

        try:
            # We use a lower temperature for structural tasks to ensure strict JSON
            reply = call_groq_chat(messages, max_tokens=2000, temperature=0.3)
            
            # Clean up potential markdown formatting if the model disobeys
            if reply.startswith("```json"):
                reply = reply[7:]
            if reply.startswith("```"):
                reply = reply[3:]
            if reply.endswith("```"):
                reply = reply[:-3]
                
            reply = reply.strip()
            
            import json
            data = json.loads(reply)
            return Response(data)
        except json.JSONDecodeError:
            return Response({"error": "Failed to generate valid roadmap structure from AI. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
