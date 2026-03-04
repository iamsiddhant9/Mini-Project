import { useState, useEffect, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import { useAuth } from "../context/AuthContext";
import { Target, Send, MessageSquare, Sparkles, Search, Bell, Calendar, Brain, Cloud, Smartphone, Bot, Shield, FileText, Star, Heart, CreditCard, ShoppingCart, Palette, Dna, Lock } from "lucide-react";

interface Internship {
  id: number;
  icon: ReactElement;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  stipend: string;
  match: number;
  logoBg: string;
}

const internships: Internship[] = [
  { id: 1, icon: <Brain size={20} />,      title: "ML Engineer Intern",      company: "Google DeepMind",    location: "London",    mode: "Remote",   stipend: "₹85k/mo", match: 96, logoBg: "rgba(0,100,255,0.08)" },
  { id: 2, icon: <Cloud size={20} />,      title: "Cloud Solutions Intern",  company: "Amazon AWS",         location: "Bengaluru", mode: "Hybrid",   stipend: "₹60k/mo", match: 91, logoBg: "rgba(255,165,0,0.08)" },
  { id: 3, icon: <Smartphone size={20} />, title: "iOS Dev Intern",           company: "Swiggy",             location: "Bengaluru", mode: "On-site",  stipend: "₹45k/mo", match: 88, logoBg: "rgba(0,200,150,0.08)" },
  { id: 4, icon: <Bot size={20} />,        title: "AI Research Intern",       company: "Microsoft Research", location: "Hyderabad", mode: "Remote",   stipend: "₹75k/mo", match: 85, logoBg: "rgba(100,0,255,0.08)" },
  { id: 5, icon: <Shield size={20} />,     title: "Security Intern",          company: "Zerodha",            location: "Bengaluru", mode: "Hybrid",   stipend: "₹50k/mo", match: 82, logoBg: "rgba(255,20,100,0.08)" },
];

interface ActivityItem {
  dot: string;
  icon: ReactElement;
  text: ReactElement;
  time: string;
  chip: ReactElement | null;
}

const activityItems: ActivityItem[] = [
  { dot: "blue",   icon: <Target size={13} />,      text: <><strong>Applied to Google DeepMind</strong> ML Intern role</>,          time: "2 hours ago",  chip: <span className="chip" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }}>Applied</span> },
  { dot: "green",  icon: <FileText size={13} />,    text: <><strong>Resume updated</strong> — added ML projects</>,                 time: "Yesterday",    chip: null },
  { dot: "gold",   icon: <MessageSquare size={13} />, text: <><strong>Interview scheduled</strong> with Amazon AWS</>,              time: "Yesterday",    chip: <span className="chip" style={{ background: "rgba(251,191,36,0.1)", color: "var(--gold)", borderColor: "rgba(251,191,36,0.2)" }}><Calendar size={11} /></span> },
  { dot: "purple", icon: <Star size={13} />,        text: <><strong>Saved</strong> Microsoft Research internship</>,                time: "2 days ago",   chip: null },
  { dot: "blue",   icon: <Bell size={13} />,        text: <><strong>New match:</strong> Stripe Backend Intern</>,                   time: "3 days ago",   chip: <span className="chip">93%</span> },
];

interface SavedItem {
  icon: ReactElement;
  role: string;
  company: string;
  bg: string;
}

const savedItems: SavedItem[] = [
  { icon: <Bot size={18} />,          role: "AI Research Intern",     company: "Microsoft Research",    bg: "rgba(100,0,255,0.08)" },
  { icon: <CreditCard size={18} />,   role: "Backend Intern",         company: "Stripe Inc.",           bg: "rgba(0,150,255,0.08)" },
  { icon: <ShoppingCart size={18} />, role: "Data Science Intern",    company: "Flipkart",              bg: "rgba(20,200,100,0.08)" },
  { icon: <Palette size={18} />,      role: "Design Intern",          company: "Figma",                 bg: "rgba(255,100,0,0.08)" },
  { icon: <Dna size={18} />,          role: "DevOps Intern",          company: "Razorpay",              bg: "rgba(255,0,100,0.08)" },
  { icon: <Lock size={18} />,         role: "Cybersecurity Intern",   company: "Palo Alto Networks",    bg: "rgba(0,200,200,0.08)" },
];

function generateGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? `Good morning, ${name}.` : hour < 18 ? `Good afternoon, ${name}.` : `Good evening, ${name}.`;
  return `${timeGreeting} Don't settle for average. You're built to excel.`;
}

function AnimatedValue({ target, suffix = "" }: { target: number; suffix?: string }): ReactElement {
  const [val, setVal] = useState<number>(0);
  useEffect(() => {
    const dur = 1200;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setVal(Math.round(eased * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}{suffix}</>;
}

function ApplyButton(): ReactElement {
  const [sent, setSent] = useState<boolean>(false);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };
  return (
    <button className={`apply-btn${sent ? " sent" : ""}`} onClick={handleClick}>
      {sent ? "✓ Sent" : "Apply"}
    </button>
  );
}

export default function Dashboard(): ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>{generateGreeting(user?.name?.split(" ")[0] ?? "there")}</h1>
          <p>You have <strong style={{ color: "var(--accent)" }}>12 new matches</strong> and 3 pending applications</p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={14} color="var(--muted)" />
            <input type="text" placeholder="Search internships..." />
          </div>
          <div className="icon-btn"><Bell size={16} /><span className="notif-dot" /></div>
          <div className="icon-btn"><Calendar size={16} /></div>
          <div className="avatar" style={{ width: 40, height: 40, cursor: "pointer", fontSize: 14 }} onClick={() => navigate("/profile")}>SS</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { cls: "blue",   icon: <Target size={20} />,      val: 247, suffix: "",  label: "Total Matches",      change: "↑ 18%",        changeClass: "up", path: "/recommendations" },
          { cls: "cyan",   icon: <Send size={20} />,         val: 14,  suffix: "",  label: "Applications Sent",  change: "↑ 5 this week", changeClass: "up", path: "/applications" },
          { cls: "purple", icon: <MessageSquare size={20} />, val: 6,  suffix: "",  label: "Interview Calls",    change: "↑ 2 new",      changeClass: "up", path: "/applications" },
          { cls: "gold",   icon: <Sparkles size={20} />,     val: 87,  suffix: "%", label: "Profile Strength",   change: "↑ 3%",         changeClass: "up", path: "/profile" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.cls}`} onClick={() => navigate(s.path)} style={{ cursor: "pointer" }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{
              color: s.cls === "purple" ? "var(--accent3)" : s.cls === "gold" ? "var(--gold)" : undefined,
              ...(s.cls === "blue" || s.cls === "cyan" ? { background: "linear-gradient(135deg, var(--accent), var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}),
            }}>
              <AnimatedValue target={s.val} suffix={s.suffix} />
            </div>
            <div className="stat-label">{s.label}</div>
            <span className={`stat-change ${s.changeClass}`}>{s.change}</span>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Internship Recommendations <span className="ai-badge"><Sparkles size={11} style={{ marginRight: 3}} /> AI Powered</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Curated based on your skills & preferences</div>
            </div>
            <span className="card-action" onClick={() => navigate("/recommendations")}>View all →</span>
          </div>
          {internships.map((item) => (
            <div className="internship-item" key={item.id}>
              <div className="company-logo" style={{ background: item.logoBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>{item.icon}</div>
              <div className="intern-info">
                <div className="intern-role">{item.title}</div>
                <div className="intern-company">{item.company} · {item.location}</div>
                <div className="intern-tags">
                  <span className={`tag ${item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite"}`}>{item.mode}</span>
                  <span className="tag paid">{item.stipend}</span>
                </div>
              </div>
              <div className="match-score">
                <div className="match-percent">{item.match}%</div>
                <div className="match-label">match</div>
              </div>
              <ApplyButton />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Profile Match Score</div>
              <span className="ai-badge">Live</span>
            </div>
            <div className="gauge-wrap">
              <svg className="gauge-svg" viewBox="0 0 140 80">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%">
                    <stop offset="0%" style={{ stopColor: "#3b82f6" }} />
                    <stop offset="100%" style={{ stopColor: "#06b6d4" }} />
                  </linearGradient>
                </defs>
                <path d="M 15 75 A 55 55 0 0 1 125 75" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
                <path d="M 15 75 A 55 55 0 0 1 125 75" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="173" strokeDashoffset="22" style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.5))" }} />
                <text x="70" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">Weak ←→ Strong</text>
              </svg>
              <div className="gauge-value">87%</div>
              <div className="gauge-label">Overall profile strength</div>
            </div>
            <div className="progress-mini">
              {[
                { label: "Skills Match", pct: 92, color: "var(--green)" },
                { label: "Experience",   pct: 75, color: "var(--accent)" },
                { label: "Portfolio",    pct: 68, color: "var(--accent3)" },
                { label: "Resume",       pct: 83, color: "var(--gold)" },
              ].map((p) => (
                <div className="prog-row" key={p.label}>
                  <span className="prog-label">{p.label}</span>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${p.pct}%`, background: p.color }} /></div>
                  <span className="prog-val" style={{ color: p.color }}>{p.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Skill Proficiency</div>
              <span className="card-action" onClick={() => navigate("/skillAnalysis")}>Edit skills →</span>
            </div>
            <div className="ring-container">
              {[
                { name: "Python",         pct: 92, bar: "linear-gradient(to right,#3b82f6,#06b6d4)", pctColor: "var(--accent2)" },
                { name: "React/TS",       pct: 78, bar: "linear-gradient(to right,#a78bfa,#3b82f6)", pctColor: "var(--accent3)" },
                { name: "Machine Learning", pct: 85, bar: "linear-gradient(to right,#10b981,#3b82f6)", pctColor: "var(--green)" },
                { name: "SQL / DB",       pct: 65, bar: "linear-gradient(to right,#fbbf24,#f59e0b)", pctColor: "var(--gold)" },
                { name: "System Design",  pct: 55, bar: "linear-gradient(to right,#f43f5e,#fb923c)", pctColor: "var(--red)" },
              ].map((s) => (
                <div className="skill-item" key={s.name}>
                  <span className="skill-name">{s.name}</span>
                  <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${s.pct}%`, background: s.bar }} /></div>
                  <span className="skill-pct" style={{ color: s.pctColor }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <span className="card-action" onClick={() => navigate("/applications")}>All activity →</span>
          </div>
          <div>
            {activityItems.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${a.dot}`}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
                {a.chip}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Applications This Month</div>
            <div className="chart-bars">
              {[35, 55, 42, 70, 28].map((h, i) => (
                <div className="bar-col" key={i}>
                  <div className={`bar${i === 4 ? " dim" : ""}`} style={{ height: h }} />
                  <span className="bar-label">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Deadlines</div>
            <span className="card-action" onClick={() => navigate("/applications")}>Calendar →</span>
          </div>
          {[
            { date: "23", month: "Feb", role: "ML Engineer Intern",      company: "Google DeepMind",    urgency: "hot",  label: "2 days",  dayColor: "var(--red)",  borderColor: "rgba(244,63,94,0.3)" },
            { date: "27", month: "Feb", role: "Backend Intern",           company: "Stripe Inc.",        urgency: "warm", label: "6 days",  dayColor: "var(--gold)", borderColor: "rgba(251,191,36,0.3)" },
            { date: "05", month: "Mar", role: "Cloud Solutions Intern",   company: "Amazon AWS",         urgency: "cool", label: "12 days", dayColor: undefined,     borderColor: undefined },
            { date: "10", month: "Mar", role: "AI Research Intern",       company: "Microsoft Research", urgency: "cool", label: "17 days", dayColor: undefined,     borderColor: undefined },
            { date: "18", month: "Mar", role: "Data Science Intern",      company: "Flipkart",           urgency: "cool", label: "25 days", dayColor: undefined,     borderColor: undefined },
          ].map((d) => (
            <div className="deadline-item" key={d.date + d.month}>
              <div className="deadline-date" style={d.borderColor ? { borderColor: d.borderColor } : {}}>
                <span className="deadline-day" style={d.dayColor ? { color: d.dayColor } : {}}>{d.date}</span>
                <span className="deadline-mon">{d.month}</span>
              </div>
              <div className="deadline-info">
                <div className="deadline-role">{d.role}</div>
                <div className="deadline-company">{d.company}</div>
              </div>
              <span className={`urgency ${d.urgency}`}>{d.label}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Saved Internships</div>
            <span className="card-action" onClick={() => navigate("/saved")}>View all →</span>
          </div>
          {savedItems.map((s) => (
            <div className="saved-item" key={s.role}>
              <div className="saved-logo" style={{ background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>{s.icon}</div>
              <div className="saved-info">
                <div className="saved-role">{s.role}</div>
                <div className="saved-company">{s.company}</div>
              </div>
              <div className="heart-btn"><Heart size={14} /></div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={11} /> AI Tip
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>Add 2 more projects to your portfolio to boost match scores by ~15%</div>
          </div>
        </div>
      </div>
    </>
  );
}