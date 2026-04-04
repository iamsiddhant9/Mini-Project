# 🔗 InternLink

> **An AI-powered internship discovery & career development platform for students.**

InternLink is a full-stack web application that helps students find internships, track applications, analyze skill gaps, and accelerate their careers — all in one place. It features a Django REST API backend powered by AI (Groq / LLaMA 3.3), and a modern React + TypeScript frontend.

---

## ✨ Features

### 👩‍🎓 For Students
| Feature | Description |
|---|---|
| 🔍 **Explore & Discover** | Browse internships from live job feeds and saved listings |
| 🤖 **AI Match Score** | LLaMA-3.3-powered compatibility score for each internship |
| 📋 **Application Tracker** | Track applied, saved, and in-progress applications |
| 📊 **Analytics Dashboard** | Visual insights into your application activity |
| 🧠 **Skill Gap Detector** | AI identifies missing skills vs. current market demand |
| 🗺️ **Career Roadmap** | Dynamic AI-generated learning roadmaps based on career goals |
| 💬 **AI Career Coach (Jarvis)** | Multi-turn AI chat counselor with personalized career advice |
| 📄 **AI Resume Builder** | Generate a professional resume from your profile with one click |
| 💾 **Saved Listings** | Bookmark internships for later |
| 📚 **Resources** | Curated preparation content |
| ⚙️ **Profile & Settings** | Manage skills, bio, social links, and preferences |

### 🏢 For Recruiters
- Post and manage internship listings
- View applicant pools

### 🛡️ For Admins
- Full platform admin dashboard
- User and listing management

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (Vite) |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 + Vanilla CSS |
| UI Components | Radix UI, Shadcn/ui, Lucide React |
| 3D / Animation | Three.js, Lenis (smooth scroll) |
| PDF Export | jsPDF + html2canvas |
| AI Integration | Google Generative AI SDK |
| Build Tool | Vite 7 |

### Backend
| Layer | Technology |
|---|---|
| Framework | Django 6 + Django REST Framework |
| Authentication | JWT (SimpleJWT) + Google OAuth2 |
| AI Engine | Groq API (`llama-3.3-70b-versatile`) |
| Database | PostgreSQL (via psycopg2) |
| Static Files | WhiteNoise |
| Server | Gunicorn |
| Job Feed | Adzuna API |

### Deployment
| Service | Role |
|---|---|
| [Railway](https://railway.app) | Backend hosting |
| [Vercel](https://vercel.com) | Frontend hosting |
| [GitHub Pages](https://pages.github.com) | Alternative frontend deploy |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **PostgreSQL** running locally
- A free **Groq API Key** → [console.groq.com](https://console.groq.com)
- (Optional) Adzuna API credentials for live job listings → [developer.adzuna.com](https://developer.adzuna.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/iamsiddhant9/Mini-Project.git
cd Mini-Project
```

---

### 2. Backend Setup

```bash
cd internlink-backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in `internlink-backend/`:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True

# PostgreSQL
DB_NAME=internlinkdb
DB_USER=your_pg_username
DB_PASSWORD=your_pg_password
DB_HOST=localhost
DB_PORT=5432

# AI — Get a free key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key

# Optional: Live job listings
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/
```

#### Initialize the Database

```bash
# Create the database first
createdb internlinkdb

# Apply migrations
python manage.py migrate

# (Optional) Create a superuser for admin access
python manage.py createsuperuser
```

#### Run the Backend

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

---

### 3. Frontend Setup

```bash
cd ../internlink-frontend

# Install dependencies
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in `internlink-frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

#### Run the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🤖 AI Features — How They Work

All AI features are powered by **Groq's free tier API** running `llama-3.3-70b-versatile` — no billing required (14,400 requests/day).

| Feature | Endpoint | Description |
|---|---|---|
| Match Explanation | `POST /api/ai/match-explanation/` | Returns a 0–100 compatibility score + 2-sentence explanation for a student-internship pair |
| Skill Gap Detector | `POST /api/ai/skill-gap/` | Identifies 5 high-impact missing skills vs. live market demand |
| Resume Generator | `POST /api/ai/generate-resume/` | Generates a full resume (summary, education, projects, experience) from your profile |
| Career Coach | `POST /api/ai/career-coach/` | Multi-turn chat with "Jarvis" — a personalized AI career counselor |
| Roadmap Generator | `POST /api/ai/generate-roadmap/` | Produces a structured 4-phase JSON learning roadmap from a coaching session |

---

## 📁 Project Structure

```
Mini-Project/
├── internlink-backend/       # Django REST API
│   ├── ai/                   # AI feature views (Groq + LLaMA)
│   ├── users/                # Auth, user profiles
│   ├── internships/          # Internship listings & tags
│   ├── applications/         # Application tracking
│   ├── recruiter/            # Recruiter-facing endpoints
│   ├── admindash/            # Admin dashboard API
│   ├── saved/                # Saved listings
│   ├── jobs/                 # External job feed (Adzuna)
│   ├── config/               # Django settings & URLs
│   ├── keep_alive.py         # Script to prevent Render free-tier sleep
│   └── requirements.txt
│
└── internlink-frontend/      # React + TypeScript (Vite)
    └── src/
        ├── pages/            # Route-level page components
        │   ├── Dashboard.tsx
        │   ├── Explore.tsx
        │   ├── Applications.tsx
        │   ├── ResumeBuilder.tsx
        │   ├── CareerCoach.tsx
        │   ├── Roadmap.tsx
        │   ├── SkillAnalysis.tsx
        │   ├── Analytics.tsx
        │   ├── RecruiterDashboard.tsx
        │   ├── AdminDashboard.tsx
        │   └── ...
        ├── components/       # Shared UI components
        ├── context/          # React context (Toast, Auth, etc.)
        ├── services/         # API service layer
        └── types/            # TypeScript types
```

---

## 🌍 Deployment

### Backend (Railway)
The backend is configured for one-click Railway deployment via `railway.json`:
- Runs `collectstatic`, `migrate`, then starts Gunicorn automatically.
- Set all environment variables in the Railway project dashboard.

### Frontend (Vercel)
Deploy by connecting the `internlink-frontend` directory to Vercel. Set:
```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### Alternative: GitHub Pages
```bash
cd internlink-frontend
npm run deploy
```

---

## 😴 Keeping the Backend Alive (Free Tier)

If you're on Render's free tier, the backend sleeps after 15 minutes of inactivity. Use either:

**Option A — Local script:**
```bash
python internlink-backend/keep_alive.py
```

**Option B — Free cron service (recommended):**
1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Add a cron job pointing to `https://your-backend-url/api/health/`
3. Set the schedule to every 10 minutes

---

## 🔐 User Roles

| Role | Access |
|---|---|
| `student` | Full student dashboard — explore, apply, AI features |
| `recruiter` | Recruiter dashboard — post and manage listings |
| `admin` | Admin dashboard — platform-wide management |

Authentication is JWT-based. Tokens are refreshed automatically. Google OAuth is supported.

---

## 📦 Environment Variables Summary

### Backend (`.env`)
| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key |
| `DEBUG` | ✅ | `True` for dev, `False` for prod |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | ✅ | PostgreSQL credentials |
| `GROQ_API_KEY` | ✅ | Groq API key for AI features |
| `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | ⬜ | Live job listings |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | ⬜ | Google OAuth |

### Frontend (`.env.local`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend base URL |

---

## 📄 License

This project was built as a college Mini Project. Feel free to use it as a reference or extend it for your own purposes.
