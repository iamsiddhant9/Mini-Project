import { useState, useEffect, useRef, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import { useAuth } from "../context/AuthContext";
import { Target, Send, MessageSquare, Sparkles, Search, Bell, Calendar, Brain, Cloud, Smartphone, Bot, Shield, FileText, Star, Heart, Briefcase, ChevronLeft, ChevronRight, X, Check, Mic, Mail, Clock, CheckCircle2 } from "lucide-react";

import * as apiSvc from "../services/api";


const categoryIcon: Record<string, ReactElement> = {
  "AI/ML": <Brain size={20} />, "Cloud": <Cloud size={20} />, "Mobile": <Smartphone size={20} />,
  "Backend": <Bot size={20} />, "Security": <Shield size={20} />, "Frontend": <Briefcase size={20} />,
  "Data": <Target size={20} />, "Other": <Briefcase size={20} />,
};
const categoryBg: Record<string, string> = {
  "AI/ML": "rgba(0,100,255,0.08)", "Cloud": "rgba(255,165,0,0.08)", "Mobile": "rgba(0,200,150,0.08)",
  "Backend": "rgba(100,0,255,0.08)", "Security": "rgba(255,20,100,0.08)", "Frontend": "rgba(6,182,212,0.08)",
  "Data": "rgba(251,191,36,0.08)", "Other": "rgba(99,179,237,0.08)",
};
const statusDot: Record<string, string> = { Applied: "blue", Interview: "gold", Offer: "green", Rejected: "red" };
const statusIcon: Record<string, ReactElement> = {
  Applied: <Send size={13} />, Interview: <MessageSquare size={13} />,
  Offer: <Star size={13} />, Rejected: <FileText size={13} />,
};

function generateGreeting(name: string): string {
  const hour = new Date().getHours();
  return hour < 12 ? `Good morning, ${name}.` : hour < 18 ? `Good afternoon, ${name}.` : `Good evening, ${name}.`;
}

function AnimatedValue({ target, suffix = "" }: { target: number; suffix?: string }): ReactElement {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1200; let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - prog, 3)) * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}{suffix}</>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ── Calendar Modal ────────────────────────────────────────────────────────────
function CalendarModal({ deadlines, interviews, onClose }: {
  deadlines: any[]; interviews: any[]; onClose: () => void;
}): ReactElement {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());

  const prevMonth = () => { const d = new Date(viewYear, viewMonth - 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); };
  const nextMonth = () => { const d = new Date(viewYear, viewMonth + 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName   = new Date(viewYear, viewMonth).toLocaleString("en", { month: "long", year: "numeric" });

  // Build event map: day → events
  const eventMap: Record<number, { color: string; label: string }[]> = {};
  const addEvent = (dateStr: string, color: string, label: string) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!eventMap[day]) eventMap[day] = [];
      eventMap[day].push({ color, label });
    }
  };
  deadlines.forEach(d => addEvent(d.deadline, "#f43f5e", `${d.title} @ ${d.company}`));
  interviews.forEach(a => addEvent(a.interview_date, "#fbbf24", `Interview – ${a.company}`));

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  // Upcoming events list for this month
  const monthEvents = [
    ...deadlines.filter(d => { if (!d.deadline) return false; const dd = new Date(d.deadline); return dd.getFullYear() === viewYear && dd.getMonth() === viewMonth; })
      .map(d => ({ date: d.deadline, label: `Deadline: ${d.title} – ${d.company}`, color: "#f43f5e" })),
    ...interviews.filter(a => { if (!a.interview_date) return false; const dd = new Date(a.interview_date); return dd.getFullYear() === viewYear && dd.getMonth() === viewMonth; })
      .map(a => ({ date: a.interview_date, label: `Interview – ${a.company}`, color: "#fbbf24" })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Calendar</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}><X size={16} /></button>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronLeft size={14} /></button>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{monthName}</div>
          <button onClick={nextMonth} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronRight size={14} /></button>
        </div>

        {/* Day names */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--muted)", paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const events  = eventMap[day] || [];
            return (
              <div key={idx} style={{ textAlign: "center", padding: "5px 2px 4px", borderRadius: 8, background: isToday ? "rgba(59,130,246,0.15)" : events.length ? "rgba(255,255,255,0.03)" : "transparent", border: `1px solid ${isToday ? "rgba(59,130,246,0.4)" : "transparent"}`, cursor: events.length ? "default" : "default", position: "relative" }} title={events.map(e => e.label).join("\n")}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>{day}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                  {events.slice(0, 3).map((ev, ei) => (
                    <div key={ei} style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, margin: "14px 0 4px", padding: "8px 12px", borderRadius: 10, background: "var(--surface2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f43f5e" }} /> Deadline
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} /> Interview
          </div>
        </div>

        {/* Events list */}
        {monthEvents.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>This Month</div>
            {monthEvents.map((ev, i) => {
              const d = new Date(ev.date);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <div style={{ width: 3, height: 30, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, color: "var(--text)", lineHeight: 1.4 }}>{ev.label}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11, flexShrink: 0 }}>
                    {String(d.getDate()).padStart(2, "0")} {d.toLocaleString("en", { month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {monthEvents.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0", color: "var(--muted)", fontSize: 13 }}>No events this month.</div>
        )}
      </div>
    </div>
  );
}

// ── Notification Dropdown ─────────────────────────────────────────────────────
function NotifDropdown({ dbNotifs, onClose, onMarkRead, onNotificationClick }: {
  dbNotifs: any[]; onClose: () => void; onMarkRead: () => void; onNotificationClick: (n: any) => void;
}): ReactElement {



  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500 }} onClick={onClose}>
      <div
        style={{ position: "absolute", top: 58, right: 16, width: 340, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header */}
        <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
            <Bell size={14} color="var(--accent)" /> Notifications
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 10, cursor: "pointer", color: "var(--muted)" }} onClick={onMarkRead}>Mark all read</span>
            {dbNotifs.filter(n => !n.is_read).length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(248,113,113,0.15)", color: "#f87171" }}>{dbNotifs.filter(n => !n.is_read).length} new</span>
            )}
          </div>
        </div>

        {/* Items */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {dbNotifs.length === 0 ? (
            <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              <CheckCircle2 size={28} style={{ opacity: 0.4, marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
              All caught up! No messages.
            </div>
          ) : dbNotifs.map((n) => (
            <div key={n.id} onClick={() => onNotificationClick(n)} style={{ padding: "11px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start", opacity: n.is_read ? 0.6 : 1, cursor: "pointer", transition: "background 0.2s" }} className="hover-bg-surface2">
              <div style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{n.type === 'match' ? <Sparkles size={14} color="var(--accent)" /> : <Bell size={14} color="#fbbf24" />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: n.is_read ? 500 : 700, color: "var(--text)" }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: "var(--border)", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
              </div>
              {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", flexShrink: 0, marginTop: 5 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard(): ReactElement {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [internships,   setInternships]   = useState<any[]>([]);
  const [appStats,      setAppStats]      = useState<any>(null);
  const [applications,  setApplications]  = useState<any[]>([]);
  const [saved,         setSaved]         = useState<any[]>([]);
  const [userSkills,    setUserSkills]    = useState<any[]>([]);
  const [deadlines,     setDeadlines]     = useState<any[]>([]);
  const [applying,      setApplying]      = useState<number | null>(null);
  const [applied,       setApplied]       = useState<Set<number>>(new Set());
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [showNotif,     setShowNotif]     = useState(false);
  
  const [dbNotifs,      setDbNotifs]      = useState<any[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => {
    const loadRecs = () =>
      apiSvc.internships.recommendations(5).then(res => {
        const list = Array.isArray(res) ? res : (res?.results ?? res?.recommendations ?? []);
        setInternships([...list.slice(0, 5)]);
      });
    
    apiSvc.user.computeMatches().then(() => {
      loadRecs();
      apiSvc.applications.stats().then(res => { if (res && !res.error) setAppStats(res); });
    }).catch(() => {
      loadRecs();
      apiSvc.applications.stats().then(res => { if (res && !res.error) setAppStats(res); });
    });

    apiSvc.applications.list().then(res => {
      const list = Array.isArray(res) ? res : (res?.results ?? res?.applications ?? []);
      setApplications(list.slice(0, 5));
      setApplied(new Set(list.map((a: any) => a.internship?.id ?? a.internship_id)));
    });

    apiSvc.saved.list().then(res => {
      const list = Array.isArray(res) ? res : (res?.results ?? res?.saved ?? []);
      setSaved(list.slice(0, 6));
    });

    apiSvc.user.getSkills().then(res => {
      if (Array.isArray(res)) setUserSkills(res.slice(0, 5));
    });

    apiSvc.internships.list({ order_by: "deadline", limit: 50 }).then(res => {
      const items: any[] = res.internships || res.results || [];
      const upcoming = items
        .filter(i => i.deadline && daysUntil(i.deadline) >= 0 && daysUntil(i.deadline) <= 90)
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 5);
      setDeadlines(upcoming);
    }).catch(() => {});

    apiSvc.user.getNotifications().then(res => {
      if (res && res.notifications) {
        setDbNotifs(res.notifications);
        setUnreadCount(res.unread_count || 0);
      }
    }).catch(() => {});

  }, []);


  const handleApply = async (internshipId: number) => {
    if (applied.has(internshipId)) return;
    setApplying(internshipId);
    try {
      const res = await apiSvc.applications.apply(internshipId);
      if (res.error) {

        alert(res.error);
        if (res.error.toLowerCase().includes("already applied")) {
          setApplied(prev => new Set(prev).add(internshipId));
        }
      } else if (res.id || res.message) {
        setApplied(prev => new Set(prev).add(internshipId));
      }
    } catch (err) {
      console.error(err);
      alert("Network error: could not apply to internship.");
    }
    setApplying(null);
  };

  const unsave = async (savedId: number) => {
    setSaved(prev => prev.filter(s => s.id !== savedId));
  };

  const profileStrength = user?.profile_strength ?? 0;
  const gaugeOffset     = 173 - (173 * profileStrength / 100);

  const urgentCount = unreadCount;

  const markNotificationsRead = () => {
    apiSvc.user.markNotificationRead().catch(() => {});
    setDbNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) {
      apiSvc.user.markNotificationRead(n.id).catch(() => {});
      setDbNotifs(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowNotif(false);
    if (n.type === 'match') {
      navigate('/recommendations');
    } else {
      navigate('/applications');
    }
  };

  return (
    <>
      {/* Modals */}
      {showCalendar && (
        <CalendarModal
          deadlines={deadlines}
          interviews={applications.filter(a => a.interview_date)}
          onClose={() => setShowCalendar(false)}
        />
      )}
      {showNotif && (
        <NotifDropdown
          dbNotifs={dbNotifs}
          onMarkRead={markNotificationsRead}
          onNotificationClick={handleNotificationClick}
          onClose={() => setShowNotif(false)}
        />
      )}

      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>{generateGreeting(user?.name?.split(" ")[0] ?? "there")}</h1>
          {(appStats?.total_matches ?? 0) > 0 || (appStats?.pending ?? 0) > 0 ? (
            <p>
              <strong style={{ color: "var(--accent)" }}>{appStats?.total_matches ?? 0} matches</strong> found
              {(appStats?.pending ?? 0) > 0 && <> · <strong style={{ color: "var(--gold)" }}>{appStats.pending} pending</strong></>}
            </p>
          ) : null}
        </div>

        <div className="header-right">
          <div className="search-box">
            <Search size={14} color="var(--muted)" />
            <input type="text" placeholder="Search internships..." onKeyDown={e => { if (e.key === "Enter") navigate("/explore"); }} />
          </div>

          {/* Bell — functional */}
          <div
            className="icon-btn"
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => { setShowNotif(p => !p); setShowCalendar(false); }}
          >
            <Bell size={16} />
            {urgentCount > 0 && (
              <span style={{
                position: "absolute", top: 3, right: 3,
                width: 8, height: 8, borderRadius: "50%",
                background: "#f43f5e", border: "2px solid var(--surface)",
                display: "block",
              }} />
            )}
          </div>

          {/* Calendar — functional */}
          <div
            className="icon-btn"
            style={{ cursor: "pointer" }}
            onClick={() => { setShowCalendar(p => !p); setShowNotif(false); }}
          >
            <Calendar size={16} />
          </div>

          <div className="avatar" style={{ width: 40, height: 40, cursor: "pointer", fontSize: 14 }} onClick={() => navigate("/profile")}>
            {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "SS"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { cls: "blue",   icon: <Target size={20} />,      val: appStats?.total_matches ?? 0, suffix: "", label: "Total Matches",      change: "↑ Live",       changeClass: "up", path: "/recommendations" },
          { cls: "cyan",   icon: <Send size={20} />,         val: appStats?.total ?? 0,         suffix: "", label: "Applications Sent",  change: "↑ This month", changeClass: "up", path: "/applications" },
          { cls: "purple", icon: <MessageSquare size={20} />,val: appStats?.interviews ?? 0,    suffix: "", label: "Interview Calls",    change: "↑ Live",       changeClass: "up", path: "/applications" },
          { cls: "gold",   icon: <Sparkles size={20} />,     val: profileStrength,              suffix: "%",label: "Profile Strength",  change: "↑ Live",       changeClass: "up", path: "/profile" },
        ].map((s) => (
          <div key={s.label} className={`stat-card ${s.cls}`} onClick={() => navigate(s.path)} style={{ cursor: "pointer" }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{
              color: s.cls === "purple" ? "var(--accent3)" : s.cls === "gold" ? "var(--gold)" : undefined,
              ...(s.cls === "blue" || s.cls === "cyan" ? { background: "linear-gradient(135deg,var(--accent),var(--accent2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}),
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
        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Internship Recommendations <span className="ai-badge"><Sparkles size={11} style={{ marginRight: 3 }} /> AI Powered</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Curated based on your skills & preferences</div>
            </div>
            <span className="card-action" onClick={() => navigate("/recommendations")}>View all →</span>
          </div>
          {internships.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Loading recommendations...</div>
          )}
          {internships.map((item) => {
            const isApplied  = applied.has(item.id);
            const isApplying = applying === item.id;
            return (
              <div className="internship-item" key={item.id}>
                <div className="company-logo" style={{ background: categoryBg[item.category] ?? categoryBg["Other"], display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                  {categoryIcon[item.category] ?? <Briefcase size={20} />}
                </div>
                <div className="intern-info">
                  <div className="intern-role">{item.title}</div>
                  <div className="intern-company">{item.company} · {item.location}</div>
                  <div className="intern-tags">
                    <span className={`tag ${item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite"}`}>{item.mode}</span>
                    <span className="tag paid">{item.stipend || "Competitive"}</span>
                  </div>
                </div>
                {item.match_score != null && (
                  <div className="match-score">
                    <div className="match-percent">{Math.round(item.match_score)}%</div>
                    <div className="match-label">match</div>
                  </div>
                )}
                <button
                  className={`apply-btn${isApplied ? " sent" : ""}`}
                  onClick={(e) => { e.stopPropagation(); handleApply(item.id); }}
                  disabled={isApplied || isApplying}
                >
                  {isApplying ? "..." : isApplied ? <><Check size={12} style={{ display: "inline", marginRight: 3 }} />Sent</> : "Apply"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile Gauge */}
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
                  strokeDasharray="173" strokeDashoffset={gaugeOffset}
                  style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.5))" }} />
                <text x="70" y="68" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="DM Sans">Weak ←→ Strong</text>
              </svg>
              <div className="gauge-value">{profileStrength}%</div>
              <div className="gauge-label">Overall profile strength</div>
            </div>
            <div className="progress-mini">
              {[
                { label: "Skills Match",  pct: Math.min(100, (userSkills.length / 5) * 100), color: "var(--green)" },
                { label: "Applications", pct: Math.min(100, (appStats?.total ?? 0) * 10),    color: "var(--accent)" },
                { label: "Interviews",   pct: Math.min(100, (appStats?.interviews ?? 0) * 20), color: "var(--accent3)" },
                { label: "Profile",      pct: profileStrength,                                color: "var(--gold)" },
              ].map((p) => (
                <div className="prog-row" key={p.label}>
                  <span className="prog-label">{p.label}</span>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${p.pct}%`, background: p.color }} /></div>
                  <span className="prog-val" style={{ color: p.color }}>{Math.round(p.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Skill Proficiency</div>
              <span className="card-action" onClick={() => navigate("/skillAnalysis")}>Edit skills →</span>
            </div>
            <div className="ring-container">
              {userSkills.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
                  No skills added yet.{" "}
                  <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/skillAnalysis")}>Add skills →</span>
                </div>
              )}
              {userSkills.map((s, i) => {
                const colors = [
                  { bar: "linear-gradient(to right,#3b82f6,#06b6d4)", pctColor: "var(--accent2)" },
                  { bar: "linear-gradient(to right,#a78bfa,#3b82f6)", pctColor: "var(--accent3)" },
                  { bar: "linear-gradient(to right,#10b981,#3b82f6)", pctColor: "var(--green)" },
                  { bar: "linear-gradient(to right,#fbbf24,#f59e0b)", pctColor: "var(--gold)" },
                  { bar: "linear-gradient(to right,#f43f5e,#fb923c)", pctColor: "var(--red)" },
                ][i % 5];
                return (
                  <div className="skill-item" key={s.id}>
                    <span className="skill-name">{s.skill_name}</span>
                    <div className="skill-bar-track"><div className="skill-bar-fill" style={{ width: `${s.proficiency ?? 70}%`, background: colors.bar }} /></div>
                    <span className="skill-pct" style={{ color: colors.pctColor }}>{s.proficiency ?? 70}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <span className="card-action" onClick={() => navigate("/applications")}>All activity →</span>
          </div>
          <div>
            {applications.length === 0 && (
              <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>No applications yet. Start applying!</div>
            )}
            {applications.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className={`activity-dot ${statusDot[a.status] ?? "blue"}`}>
                  {statusIcon[a.status] ?? <Send size={13} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="activity-text">
                    <strong>{a.status === "Applied" ? "Applied to" : a.status === "Interview" ? "Interview at" : a.status === "Offer" ? "Offer from" : "Update from"} {a.company}</strong> — {a.title}
                  </div>
                  <div className="activity-time">{timeAgo(a.applied_at)}</div>
                </div>
                <span className="chip" style={{
                  background: a.status === "Applied" ? "rgba(59,130,246,0.1)" : a.status === "Interview" ? "rgba(251,191,36,0.1)" : a.status === "Offer" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: a.status === "Applied" ? "#60a5fa" : a.status === "Interview" ? "var(--gold)" : a.status === "Offer" ? "var(--green)" : "#ef4444",
                  borderColor: "transparent",
                }}>{a.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Applications This Month</div>
            <div className="chart-bars">
              {[appStats?.week1 ?? 0, appStats?.week2 ?? 0, appStats?.week3 ?? 0, appStats?.week4 ?? 0, appStats?.total ?? 0].map((h, i) => (
                <div className="bar-col" key={i}>
                  <div className={`bar${i === 4 ? " dim" : ""}`} style={{ height: Math.max(4, Math.min(70, h * 5)) }} />
                  <span className="bar-label">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Upcoming Deadlines — REAL data from /internships/ ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Deadlines</div>
            <span className="card-action" style={{ cursor: "pointer" }} onClick={() => setShowCalendar(true)}>
              Calendar →
            </span>
          </div>

          {deadlines.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
              No upcoming deadlines found.
            </div>
          )}

          {deadlines.map((item) => {
            const days = daysUntil(item.deadline);
            const d    = new Date(item.deadline);
            const urgency    = days <= 2 ? "hot"  : days <= 7 ? "warm" : "cool";
            const dayColor   = days <= 2 ? "var(--red)" : days <= 7 ? "var(--gold)" : undefined;
            const borderColor= days <= 2 ? "rgba(244,63,94,0.3)" : days <= 7 ? "rgba(251,191,36,0.3)" : undefined;
            const label      = days === 0 ? "Today!" : days === 1 ? "1d" : `${days}d`;
            return (
              <div className="deadline-item" key={item.id}>
                <div className="deadline-date" style={borderColor ? { borderColor } : {}}>
                  <span className="deadline-day" style={dayColor ? { color: dayColor } : {}}>{String(d.getDate()).padStart(2, "0")}</span>
                  <span className="deadline-mon">{d.toLocaleString("default", { month: "short" })}</span>
                </div>
                <div className="deadline-info">
                  <div className="deadline-role">{item.title}</div>
                  <div className="deadline-company">{item.company}</div>
                </div>
                <span className={`urgency ${urgency}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Saved Internships */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Saved Internships</div>
            <span className="card-action" onClick={() => navigate("/saved")}>View all →</span>
          </div>
          {saved.length === 0 && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
              No saved internships.{" "}
              <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/explore")}>Explore now →</span>
            </div>
          )}
          {saved.map((s) => (
            <div className="saved-item" key={s.id}>
              <div className="saved-logo" style={{ background: categoryBg[s.category] ?? categoryBg["Other"], display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
                {categoryIcon[s.category] ?? <Briefcase size={18} />}
              </div>
              <div className="saved-info">
                <div className="saved-role">{s.title}</div>
                <div className="saved-company">{s.company}</div>
              </div>
              <div className="heart-btn" onClick={() => unsave(s.id)}><Heart size={14} /></div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={11} /> AI Tip
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {userSkills.length < 3 ? "Add more skills to your profile to improve match scores." : "Apply to at least 3 internships this week to maximize your chances."}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}