import { useState, useEffect, ReactElement } from "react";
import './Applications.css';
import {
  Send, MessageSquare, Star, XCircle, MapPin, FileText,
  Calendar, Briefcase, Banknote, ChevronDown, ChevronUp,
  Clock, Video, Building2, Trophy, ExternalLink,
  CheckCircle2, Loader2, Bell, AlertTriangle, X
} from "lucide-react";

const BASE_URL = "https://mini-project-production-8656.up.railway.app/api";
const token = () => localStorage.getItem("access_token");
const api = {
  get:    (url: string)            => fetch(`${BASE_URL}${url}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
  patch:  (url: string, data: any) => fetch(`${BASE_URL}${url}`, { method: "PATCH",  headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  delete: (url: string)            => fetch(`${BASE_URL}${url}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } }),
};

const PIPELINE = [
  { status: "Applied",              label: "Applied",        color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  icon: <Send size={14} />,         desc: "Application submitted" },
  { status: "Shortlisted",         label: "Shortlisted",    color: "#a78bfa", bg: "rgba(167,139,250,0.08)", icon: <CheckCircle2 size={14} />,  desc: "You've been shortlisted" },
  { status: "Interview Scheduled", label: "Interview",      color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  icon: <MessageSquare size={14} />, desc: "Interview coming up" },
  { status: "Interview Done",      label: "Interview Done", color: "#fb923c", bg: "rgba(251,146,60,0.08)",  icon: <CheckCircle2 size={14} />,  desc: "Interview completed" },
  { status: "Offer",               label: "Offer",          color: "#34d399", bg: "rgba(52,211,153,0.08)",  icon: <Star size={14} />,          desc: "You got an offer!" },
  { status: "Rejected",            label: "Rejected",       color: "#f87171", bg: "rgba(248,113,113,0.08)", icon: <XCircle size={14} />,       desc: "Not selected" },
];

// ── Nudge logic ───────────────────────────────────────────────────────────────
function daysSince(dateStr: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function getNudge(app: any): { msg: string; color: string; icon: ReactElement } | null {
  const days = daysSince(app.applied_at);
  const interviewPast = app.interview_date && new Date(app.interview_date) < new Date();

  if (app.status === "Interview Done" && !app.offer_ctc)
    return { msg: "Interview done — heard back yet? Update your status.", color: "#fb923c", icon: <Bell size={11} /> };
  if (interviewPast && app.status === "Interview Scheduled")
    return { msg: "Your interview date has passed — how did it go?", color: "#fbbf24", icon: <AlertTriangle size={11} /> };
  if (app.status === "Applied" && days >= 14)
    return { msg: `No update in ${days} days — consider following up or marking rejected.`, color: "#f87171", icon: <Clock size={11} /> };
  if (app.status === "Applied" && days >= 7)
    return { msg: `Applied ${days} days ago — heard back? Update your status if so.`, color: "#fbbf24", icon: <Bell size={11} /> };
  if (app.status === "Shortlisted" && days >= 5)
    return { msg: "You're shortlisted! Log your interview details when you get an invite.", color: "#a78bfa", icon: <MessageSquare size={11} /> };
  return null;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (hours < 1)  return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ── Nudge Banner (top of page) ────────────────────────────────────────────────
function NudgeBanner({ apps, onDismiss }: { apps: any[]; onDismiss: () => void }): ReactElement | null {
  const urgent = apps.filter(a => {
    const n = getNudge(a);
    return n && (a.status === "Interview Done" || daysSince(a.applied_at) >= 7 ||
      (a.interview_date && new Date(a.interview_date) < new Date()));
  });

  if (urgent.length === 0) return null;

  return (
    <div style={{
      background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)",
      borderRadius: 12, padding: "12px 16px", marginBottom: 20,
      display: "flex", alignItems: "flex-start", gap: 12,
      animation: "fadeUp 0.3s ease",
    }}>
      <Bell size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
          {urgent.length} application{urgent.length > 1 ? "s" : ""} need{urgent.length === 1 ? "s" : ""} your attention
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {urgent.slice(0, 3).map(a => {
            const n = getNudge(a)!;
            return (
              <div key={a.id} style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: n.color }}>{n.icon}</span>
                <strong style={{ color: "var(--text)" }}>{a.company}</strong> — {n.msg}
              </div>
            );
          })}
          {urgent.length > 3 && (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>+{urgent.length - 3} more below</div>
          )}
        </div>
      </div>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0, flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── How it works guide (first visit) ─────────────────────────────────────────
function HowItWorks({ onDismiss }: { onDismiss: () => void }): ReactElement {
  return (
    <div style={{
      background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)",
      borderRadius: 12, padding: "16px 20px", marginBottom: 20,
      animation: "fadeUp 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 6 }}>
          <Bell size={14} /> How application tracking works
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0 }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { step: "1", text: "Apply to internships from Explore", color: "#60a5fa" },
          { step: "2", text: "Company calls/emails you → tap → Shortlisted", color: "#a78bfa" },
          { step: "3", text: "Get interview invite → tap → Interview Scheduled, log date & round", color: "#fbbf24" },
          { step: "4", text: "After interview → tap → Interview Done", color: "#fb923c" },
          { step: "5", text: "Get offer → tap → Offer, log the CTC", color: "#34d399" },
        ].map(s => (
          <div key={s.step} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 8, background: "var(--surface2)", flex: "1 1 160px" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${s.color}20`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Interview Modal ───────────────────────────────────────────────────────────
function InterviewModal({ app, onSave, onClose }: { app: any; onSave: (data: any) => void; onClose: () => void }): ReactElement {
  const [date, setDate]     = useState(app.interview_date  ?? "");
  const [mode, setMode]     = useState(app.interview_mode  ?? "Online");
  const [round, setRound]   = useState(app.interview_round ?? 1);
  const [notes, setNotes]   = useState(app.interview_notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ interview_date: date, interview_mode: mode, interview_round: round, interview_notes: notes });
    setSaving(false); onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", maxWidth: 420, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700 }}>Interview Details</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted)" }}>{app.title} at {app.company}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Interview Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Mode</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Online", "In-person", "Phone"].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${mode === m ? "#fbbf24" : "var(--border)"}`, background: mode === m ? "rgba(251,191,36,0.12)" : "var(--surface2)", color: mode === m ? "#fbbf24" : "var(--muted)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
                  {m === "Online" ? <Video size={11} style={{ marginRight: 3 }} /> : m === "In-person" ? <Building2 size={11} style={{ marginRight: 3 }} /> : <Clock size={11} style={{ marginRight: 3 }} />}{m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Round</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4].map(r => (
                <button key={r} onClick={() => setRound(r)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${round === r ? "#fbbf24" : "var(--border)"}`, background: round === r ? "rgba(251,191,36,0.12)" : "var(--surface2)", color: round === r ? "#fbbf24" : "var(--muted)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>R{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Topics to prepare, interviewer name, etc." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 12, fontFamily: "inherit", resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 10, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#000", cursor: saving ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {saving ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />Saving…</> : "Save Interview Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Offer Modal ───────────────────────────────────────────────────────────────
function OfferModal({ app, onSave, onClose }: { app: any; onSave: (data: any) => void; onClose: () => void }): ReactElement {
  const [ctc, setCtc]       = useState(app.offer_ctc   ?? "");
  const [notes, setNotes]   = useState(app.offer_notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ offer_ctc: ctc, offer_notes: notes });
    setSaving(false); onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--surface)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 16, padding: "28px 32px", maxWidth: 400, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: 8 }}><Trophy size={32} color="#34d399" /></div>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#34d399" }}>Offer Received!</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted)" }}>{app.title} at {app.company}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Stipend / CTC Offered</label>
            <input type="text" value={ctc} onChange={e => setCtc(e.target.value)} placeholder="e.g. ₹50,000/mo" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Joining date, perks, deadline to respond..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 12, fontFamily: "inherit", resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Skip</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 10, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#34d399,#10b981)", color: "#000", cursor: saving ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {saving ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />Saving…</> : <><Trophy size={13} />Log Offer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Card ──────────────────────────────────────────────────────────────────
function AppCard({ app, onStatusChange, onDelete, onSaveNote, onSaveInterview, onSaveOffer }: {
  app: any;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onSaveNote: (id: number, note: string) => void;
  onSaveInterview: (id: number, data: any) => void;
  onSaveOffer: (id: number, data: any) => void;
}): ReactElement {
  const [expanded,     setExpanded]     = useState(false);
  const [editingNote,  setEditingNote]  = useState(false);
  const [noteVal,      setNoteVal]      = useState(app.notes ?? "");
  const [showIntModal, setShowIntModal] = useState(false);
  const [showOffModal, setShowOffModal] = useState(false);
  const [savingNote,   setSavingNote]   = useState(false);

  const stage  = PIPELINE.find(p => p.status === app.status) ?? PIPELINE[0];
  const nudge  = getNudge(app);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(app.id, newStatus);
    if (newStatus === "Interview Scheduled") setShowIntModal(true);
    if (newStatus === "Offer")               setShowOffModal(true);
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    await onSaveNote(app.id, noteVal);
    setSavingNote(false);
    setEditingNote(false);
  };

  return (
    <>
      {showIntModal && <InterviewModal app={app} onSave={d => onSaveInterview(app.id, d)} onClose={() => setShowIntModal(false)} />}
      {showOffModal && <OfferModal     app={app} onSave={d => onSaveOffer(app.id, d)}     onClose={() => setShowOffModal(false)} />}

      <div className={`app-card ${expanded ? "expanded" : ""}`} style={{ borderColor: nudge ? nudge.color + "40" : `${stage.color}30` }}>

        {/* ── Nudge inline banner ── */}
        {nudge && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: `${nudge.color}10`, border: `1px solid ${nudge.color}30`, marginBottom: 10, fontSize: 11, color: nudge.color }}>
            {nudge.icon} {nudge.msg}
          </div>
        )}

        {/* Top row */}
        <div className="app-card-top" onClick={() => setExpanded(p => !p)} style={{ cursor: "pointer" }}>
          <div className="app-logo" style={{ background: stage.bg, color: stage.color }}>
            <Briefcase size={16} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="app-title">{app.title}</div>
            <div className="app-company">{app.company}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: stage.bg, color: stage.color }}>{stage.label}</span>
            {expanded ? <ChevronUp size={14} color="var(--muted)" /> : <ChevronDown size={14} color="var(--muted)" />}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, margin: "10px 0 6px" }}>
          {PIPELINE.filter(p => p.status !== "Rejected").map((p, i, arr) => {
            const activeIdx = arr.findIndex(pp => pp.status === app.status);
            const done = i <= activeIdx && app.status !== "Rejected";
            return (
              <div key={p.status} style={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: done ? p.color : "var(--border)", transition: "background 0.3s" }} />
                {i === arr.length - 1 && <div style={{ width: 6, height: 6, borderRadius: "50%", background: done ? p.color : "var(--border)" }} />}
              </div>
            );
          })}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          {app.location && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted)" }}><MapPin size={10} />{app.location}</span>}
          {app.stipend  && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted)" }}><Banknote size={10} />{app.stipend}</span>}
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}><Calendar size={10} />{timeAgo(app.applied_at)}</span>
        </div>

        {/* Interview badge */}
        {app.interview_date && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: 8, fontSize: 12 }}>
            <MessageSquare size={12} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: 600 }}>Round {app.interview_round ?? 1}</span>
            <span style={{ color: "var(--muted)" }}>· {app.interview_mode ?? "Online"} · {app.interview_date}</span>
            <button onClick={() => setShowIntModal(true)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>Edit</button>
          </div>
        )}

        {/* Offer badge */}
        {app.offer_ctc && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", marginBottom: 8, fontSize: 12 }}>
            <Trophy size={12} color="#34d399" />
            <span style={{ color: "#34d399", fontWeight: 600 }}>Offer: {app.offer_ctc}</span>
          </div>
        )}

        {/* Expanded */}
        {expanded && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4, animation: "fadeUp 0.2s ease" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <FileText size={11} /> Notes
              </div>
              {editingNote ? (
                <div>
                  <textarea value={noteVal} onChange={e => setNoteVal(e.target.value)} rows={3} style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 12, padding: "8px 10px", fontFamily: "inherit", resize: "none", boxSizing: "border-box" }} placeholder="Add notes about this application..." />
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <button onClick={handleSaveNote} disabled={savingNote} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "rgba(16,185,129,0.15)", color: "var(--green)", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>{savingNote ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingNote(false)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingNote(true)} style={{ cursor: "pointer", fontSize: 12, color: app.notes ? "var(--text)" : "var(--muted)", fontStyle: app.notes ? "normal" : "italic", padding: "6px 10px", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  {app.notes || "Click to add notes…"}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {app.apply_url && (
                <a href={app.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "var(--accent)", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
                  <ExternalLink size={11} /> View Job
                </a>
              )}
              {(app.status === "Interview Scheduled" || app.status === "Shortlisted") && (
                <button onClick={() => setShowIntModal(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>
                  <MessageSquare size={11} /> {app.interview_date ? "Edit Interview" : "Log Interview"}
                </button>
              )}
              <button onClick={() => onDelete(app.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit", marginLeft: "auto" }}>
                <XCircle size={11} /> Remove
              </button>
            </div>
          </div>
        )}

        {/* Move status buttons */}
        <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
          {PIPELINE.filter(p => p.status !== app.status).map(p => (
            <button key={p.status} onClick={() => handleStatusChange(p.status)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${p.color}30`, background: `${p.color}10`, color: p.color, cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: 600 }}>
              → {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const GUIDE_KEY = "internlink_apps_guide_dismissed";

export default function Applications(): ReactElement {
  const [apps,          setApps]          = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("All");
  const [showGuide,     setShowGuide]     = useState(!localStorage.getItem(GUIDE_KEY));
  const [showNudgeBanner, setShowNudgeBanner] = useState(true);

  useEffect(() => {
    api.get("/applications/").then(res => {
      if (res.all && Array.isArray(res.all)) setApps(res.all);
      else if (Array.isArray(res)) setApps(res);
      setLoading(false);
    });
  }, []);

  const dismissGuide = () => {
    localStorage.setItem(GUIDE_KEY, "1");
    setShowGuide(false);
  };

  const updateApp = (id: number, data: any) =>
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));

  const updateStatus = async (id: number, status: string) => {
    updateApp(id, { status });
    await api.patch(`/applications/${id}/`, { status });
  };

  const deleteApp = async (id: number) => {
    setApps(prev => prev.filter(a => a.id !== id));
    await api.delete(`/applications/${id}/`);
  };

  const saveNote = async (id: number, notes: string) => {
    await api.patch(`/applications/${id}/`, { notes });
    updateApp(id, { notes });
  };

  const saveInterview = async (id: number, data: any) => {
    await api.patch(`/applications/${id}/`, data);
    updateApp(id, data);
  };

  const saveOffer = async (id: number, data: any) => {
    await api.patch(`/applications/${id}/`, data);
    updateApp(id, data);
  };

  const displayed = filter === "All" ? apps : apps.filter(a => a.status === filter);
  const counts    = Object.fromEntries(PIPELINE.map(p => [p.status, apps.filter(a => a.status === p.status).length]));
  const nudgeCount = apps.filter(a => getNudge(a) !== null).length;

  return (
    <>
      <div className="apps-header">
        <div>
          <h1>My Applications</h1>
          <p>Track your full interview pipeline — from applied to offer</p>
        </div>
        {nudgeCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: 12, fontWeight: 700 }}>
            <Bell size={13} /> {nudgeCount} need attention
          </div>
        )}
      </div>

      {/* How it works guide — shown once */}
      {showGuide && <HowItWorks onDismiss={dismissGuide} />}

      {/* Nudge banner */}
      {showNudgeBanner && !loading && <NudgeBanner apps={apps} onDismiss={() => setShowNudgeBanner(false)} />}

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: "Total",       val: apps.length,                        color: "#60a5fa" },
          { label: "Shortlisted", val: counts["Shortlisted"] ?? 0,         color: "#a78bfa" },
          { label: "Interviews",  val: counts["Interview Scheduled"] ?? 0, color: "#fbbf24" },
          { label: "Offers",      val: counts["Offer"] ?? 0,               color: "#34d399" },
        ].map(s => (
          <div className="mini-stat" key={s.label}>
            <div className="mini-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="mini-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...PIPELINE.map(p => p.status)].map(f => {
          const pipeStage = PIPELINE.find(p => p.status === f);
          const isActive  = filter === f;
          const col       = pipeStage?.color ?? "var(--accent)";
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${isActive ? col : "var(--border)"}`, background: isActive ? `${col}15` : "var(--surface)", color: isActive ? col : "var(--muted)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
              {f} ({f === "All" ? apps.length : counts[f] ?? 0})
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ color: "var(--muted)", textAlign: "center", padding: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading applications...
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
          <Send size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {filter === "All" ? "No applications yet" : `No applications in "${filter}"`}
          </div>
          <div style={{ fontSize: 13 }}>
            {filter === "All" ? "Start applying from the Explore page" : "Move cards here as your process progresses"}
          </div>
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <div className="apps-grid">
          {displayed.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onStatusChange={updateStatus}
              onDelete={deleteApp}
              onSaveNote={saveNote}
              onSaveInterview={saveInterview}
              onSaveOffer={saveOffer}
            />
          ))}
        </div>
      )}
    </>
  );
}