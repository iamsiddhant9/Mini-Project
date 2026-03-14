// src/pages/Recommendations.tsx
import { useState, useEffect, useRef, ReactElement } from "react";
import { internships as internshipsApi, applications as applicationsApi, user as userApi } from "../services/api";
import { generateMatchExplanation } from "../services/gemini";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Search, Clock, Brain, Cloud, Smartphone, Cog, Shield, LayoutDashboard, BarChart2, Briefcase, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import './Recommendations.css';

interface ApiRec {
  id: number; title: string; company: string; location: string;
  mode: "Remote" | "Hybrid" | "On-site"; stipend: string; deadline: string;
  category: string; match_score: number | null; tags: string[] | null;
}

// ── Apply Confirmation Modal ──────────────────────────────────────────────────
function ApplyModal({ internship, onConfirm, onCancel, applying }: {
  internship: ApiRec; onConfirm: () => void; onCancel: () => void; applying: boolean;
}): ReactElement {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onCancel}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "28px 32px", maxWidth: 420, width: "90%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
      }} onClick={e => e.stopPropagation()}>

        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Confirm Application</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Apply for <strong style={{ color: "var(--text)" }}>{internship.title}</strong> at{" "}
          <strong style={{ color: "var(--accent)" }}>{internship.company}</strong>?
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {internship.mode && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.1)", color: "var(--accent)", fontWeight: 600 }}>{internship.mode}</span>}
          {internship.stipend && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "var(--green)", fontWeight: 600 }}>{internship.stipend}</span>}
          {internship.deadline && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "var(--gold)", fontWeight: 600 }}>Deadline: {internship.deadline}</span>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button onClick={onConfirm} disabled={applying} style={{ flex: 2, padding: 10, borderRadius: 10, border: "none", background: applying ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg,var(--accent),var(--accent2))", color: "#fff", cursor: applying ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {applying ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Applying…</> : "Confirm & Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplyButton({ item, isApplied }: { item: ApiRec; isApplied: boolean }): ReactElement {
  const [status, setStatus] = useState<"idle" | "done" | "error">(isApplied ? "done" : "idle");
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);

  const doApply = async () => {
    setApplying(true);
    try {
      await applicationsApi.apply(item.id);
      setStatus("done");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    } finally {
      setApplying(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {showModal && <ApplyModal internship={item} onConfirm={doApply} onCancel={() => setShowModal(false)} applying={applying} />}
      <button
        className={`apply-btn-outline${status === "done" ? " sent" : ""}`}
        onClick={e => { e.stopPropagation(); if (status === "idle") setShowModal(true); }}
        disabled={status === "done"}
        style={{ display: "flex", alignItems: "center", gap: 5 }}
      >
        {status === "done" ? <><Check size={13} /> Applied</> : status === "error" ? "Failed" : "Apply"}
      </button>
    </>
  );
}

// ── AI Explanation pill for each expanded card ────────────────────────────────
function AIExplanation({ item, userSkills, userName, userBranch, userBio, onScore }: {
  item: ApiRec; userSkills: string[]; userName: string; userBranch: string;
  userBio: string; onScore?: (score: number) => void;
}): ReactElement {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    generateMatchExplanation({
      userName, userSkills, userBranch, userBio,
      internTitle: item.title, company: item.company,
      location: item.location, mode: item.mode,
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
      stipend: item.stipend ?? "—",
      deadline: item.deadline ?? "—",
      matchScore: item.match_score,
    }).then((result) => {
      setText(result.explanation);
      setDone(true);
      if (result.score > 0) onScore?.(result.score);
    })
      .catch((err) => {
        setText(`AI error: ${err?.message ?? "Unknown error"}`);
        setDone(true);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div style={{
      background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: 10, padding: "10px 14px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
        <Sparkles size={11} /> AI Match Insight
      </div>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 12 }}>
          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Analyzing your profile…
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: 0, opacity: done ? 1 : 0, transition: "opacity 0.4s" }}>
          {text}
        </p>
      )}
    </div>
  );
}

const MODES = ["All", "Remote", "Hybrid", "On-site"];
const CATEGORIES = ["All", "AI/ML", "Backend", "Frontend", "Cloud", "Mobile", "Data", "Security", "DevOps", "Design"];

const CATEGORY_ICONS: Record<string, ReactElement> = {
  "AI/ML": <Brain size={20} />, Backend: <Cog size={20} />, Frontend: <LayoutDashboard size={20} />,
  Cloud: <Cloud size={20} />, Mobile: <Smartphone size={20} />, Data: <BarChart2 size={20} />,
  Security: <Shield size={20} />, DevOps: <Cog size={20} />, Design: <Sparkles size={20} />,
  Other: <Briefcase size={20} />,
};

export default function Recommendations(): ReactElement {
  const { user } = useAuth();
  const [recs, setRecs] = useState<ApiRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modeFilter, setModeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("match");

  // AI-computed scores per internship id (lifted here to avoid hooks-in-map)
  const [aiScores, setAiScores] = useState<Map<number, number>>(new Map());
  const setAiScore = (id: number, score: number) =>
    setAiScores(prev => new Map(prev).set(id, score));

  // Profile data for AI context
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userBio, setUserBio] = useState("");
  const [userBranch, setUserBranch] = useState("");
  const [applied, setApplied] = useState<Set<number>>(new Set());

  useEffect(() => {
    internshipsApi.recommendations(20).then((data: any) => {
      setRecs(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));

    applicationsApi.list()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.all ?? data?.results ?? []);
        setApplied(new Set(list.map((a: any) => a.internship?.id ?? a.internship_id)));
      })
      .catch(() => {});

    // Fetch profile for AI context
    userApi.getProfile().then((p: any) => {
      if (!p) return;
      setUserBio(p.bio ?? "");
      setUserBranch(p.branch ?? "");
      setUserSkills((p.skills ?? []).map((s: any) => s.name).filter(Boolean));
    });
  }, []);

  const filtered = recs
    .filter((i) => modeFilter === "All" || i.mode === modeFilter)
    .filter((i) => categoryFilter === "All" || i.category === categoryFilter)
    .sort((a, b) =>
      sort === "match" ? (b.match_score ?? 0) - (a.match_score ?? 0) :
        sort === "stipend" ? Number(b.stipend?.replace(/[^\d]/g, "") ?? 0) - Number(a.stipend?.replace(/[^\d]/g, "") ?? 0) : 0
    );

  return (
    <div className="recommendations-page">
      <div className="rec-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Internship Recommendations
            <span className="ai-badge" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={11} /> AI Powered
            </span>
          </h1>
          <p>Curated based on your skills, preferences &amp; profile strength</p>
        </div>
        <div style={{ marginRight: 50, fontSize: 13, color: "white" }}>
          {loading ? "Loading…" : `${filtered.length} internships found`}
        </div>
      </div>

      <div className="filters">
        <div className="filter-section">
          <span className="filter-label">Mode:</span>
          {MODES.map((m) => (
            <button key={m} className={`filter-btn${modeFilter === m ? " active" : ""}`} onClick={() => setModeFilter(m)}>{m}</button>
          ))}
        </div>
        <div className="filter-section">
          <span className="filter-label">Category:</span>
          {CATEGORIES.map((c) => (
            <button key={c} className={`filter-btn${categoryFilter === c ? " active" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>
          ))}
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="match">Sort: Best Match</option>
          <option value="stipend">Sort: Highest Stipend</option>
        </select>
      </div>

      {loading ? (
        <div className="empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          Loading recommendations…
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Search size={28} />
          {recs.length === 0
            ? "No recommendations yet. Complete your profile and add skills to get personalised matches!"
            : "No internships match your filters"}
        </div>
      ) : (
        <ScrollStack itemDistance={80} itemScale={0.04} itemStackDistance={20} stackPosition="15%" scaleEndPosition="8%" baseScale={0.88}>
          {filtered.map((item) => {
            const icon = CATEGORY_ICONS[item.category] ?? <Briefcase size={20} />;
            const tags: string[] = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
            const isExp = expandedId === item.id;

            const aiScore = aiScores.get(item.id) ?? null;
            const displayScore = aiScore ?? (item.match_score != null ? Math.round(item.match_score) : null);

            return (
              <ScrollStackItem key={item.id}>
                <div className={"rec-card" + (isExp ? " expanded" : "")} onClick={() => setExpandedId((p) => (p === item.id ? null : item.id))}>
                  <div className="rec-card-top">
                    <div className="rec-logo" style={{ background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>{icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="rec-title">{item.title}</div>
                      <div className="rec-company">{item.company} · {item.location}</div>
                    </div>
                    <div className="rec-tags">
                      <span className={"tag " + (item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite")}>{item.mode}</span>
                      {tags.slice(0, 3).map((t) => (
                        <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                      ))}
                    </div>
                    <div className="rec-stipend">{item.stipend ?? "—"}</div>
                    {displayScore !== null && (
                      <div className="rec-match" title={aiScore ? "AI-computed match" : "Platform match"}>
                        {aiScore && <Sparkles size={9} style={{ marginRight: 2, opacity: 0.8 }} />}
                        {displayScore}%<span>match</span>
                      </div>
                    )}
                    <span className="rec-chevron">{isExp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                  </div>

                  {isExp && (
                    <div className="rec-expanded" onClick={(e) => e.stopPropagation()}>
                      {/* ── AI Match Explanation ── */}
                      <AIExplanation
                        item={item}
                        userSkills={userSkills}
                        userName={user?.name ?? ""}
                        userBranch={userBranch}
                        userBio={userBio}
                        onScore={(s: number) => setAiScore(item.id, s)}
                      />
                      <div className="rec-expanded-footer">
                        <span className="rec-meta" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} /> Deadline: {item.deadline}
                        </span>
                        <ApplyButton item={item} isApplied={applied.has(item.id)} />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      )}
    </div>
  );
}