// src/pages/SkillAnalysis.tsx
import { useState, useEffect, ReactElement } from "react";
import { user as userApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Brain, Trophy, AlertTriangle, TrendingDown, Sparkles, Plus, X, Loader2, ExternalLink } from "lucide-react";
import { fetchSkillGap, GapItem } from "../services/groq";
import './SkillAnalysis.css';

interface ApiSkill {
  id: number; name: string; category: string; color: string | null; level: number; verified: boolean;
}
interface DisplaySkill extends ApiSkill {
  gradient: string; colorVar: string;
}

const GRADIENTS: Record<string, string> = {
  blue: "linear-gradient(to right,#3b82f6,#06b6d4)",
  purple: "linear-gradient(to right,#a78bfa,#3b82f6)",
  green: "linear-gradient(to right,#10b981,#3b82f6)",
  yellow: "linear-gradient(to right,#fbbf24,#f59e0b)",
  red: "linear-gradient(to right,#f43f5e,#fb923c)",
  cyan: "linear-gradient(to right,#06b6d4,#0891b2)",
  orange: "linear-gradient(to right,#fb923c,#f59e0b)",
  pink: "linear-gradient(to right,#ec4899,#a78bfa)",
};
const GRADIENT_LIST = Object.values(GRADIENTS);
const COLOR_VARS = ["#3b82f6", "#a78bfa", "#10b981", "#fbbf24", "#f43f5e", "#06b6d4", "#fb923c", "#ec4899"];

function toDisplay(s: ApiSkill, idx: number): DisplaySkill {
  const key = (s.color ?? "").toLowerCase();
  return {
    ...s,
    gradient: GRADIENTS[key] ?? GRADIENT_LIST[idx % GRADIENT_LIST.length],
    colorVar: COLOR_VARS[idx % COLOR_VARS.length],
  };
}


const RANK_ICONS = [
  <Trophy size={18} color="#fbbf24" />,
  <Trophy size={18} color="#9ca3af" />,
  <Trophy size={18} color="#b45309" />,
  <Trophy size={18} color="var(--muted)" />,
];

export default function SkillAnalysis(): ReactElement {
  const [skills, setSkills] = useState<DisplaySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Skill Gap AI state
  const [gapItems, setGapItems] = useState<GapItem[]>([]);
  const [gapLoading, setGapLoading] = useState(false);

  // Add skill form state
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState(50);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchSkills = () =>
    userApi.getSkills().then((data: any) => {
      const list: ApiSkill[] = Array.isArray(data) ? data : [];
      setSkills(list.map(toDisplay));
      setLoading(false);
    }).catch(() => setLoading(false));

  useEffect(() => { fetchSkills(); }, []);

  const handleAdd = async () => {
    if (!newSkill.trim()) return;
    setAdding(true);
    try {
      await userApi.addSkill(newSkill.trim(), newLevel);
      setNewSkill("");
      setNewLevel(50);
      setShowForm(false);
      success(`"${newSkill.trim()}" added to your skills!`);
      await fetchSkills();
    } catch {
      error("Failed to add skill. Please try again.");
    } finally { setAdding(false); }
  };

  const handleRemove = async (id: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(id);
    try {
      await userApi.removeSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      success(`"${name}" removed.`);
    } catch {
      error("Failed to remove skill.");
    } finally { setRemovingId(null); }
  };

  const topSkills = [...skills].sort((a, b) => b.level - a.level);
  const gaps = skills.filter((s) => s.level < 70).sort((a, b) => a.level - b.level).slice(0, 3);

  return (
    <>
      <div className="skills-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Brain size={26} /> Skill Analysis
        </h1>
        <p>Understand your strengths, gaps and what to improve next</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          Loading skills…
        </div>
      ) : (
        <>
          {/* ── Add Skill Form ── */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {showForm ? (
              <>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Skill name (e.g. React, Python)"
                  style={{
                    background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "8px 14px", color: "var(--text)", fontSize: 13, fontFamily: "inherit", outline: "none", width: 220,
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                  <label style={{ fontSize: 11, color: "var(--muted)" }}>Level: {newLevel}%</label>
                  <input type="range" min={1} max={100} value={newLevel} onChange={(e) => setNewLevel(Number(e.target.value))}
                    style={{ width: 120, accentColor: "var(--accent)" }} />
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding || !newSkill.trim()}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {adding ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                  {adding ? "Adding…" : "Add"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit",
                  background: "var(--surface2)", color: "var(--accent)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Plus size={14} /> Add Skill
              </button>
            )}
          </div>

          {skills.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0" }}>
              No skills added yet. Use the button above to add your first skill!
            </div>
          ) : (
            <div className="skills-grid">
              {/* ── Proficiency bars ── */}
              <div className="skill-card">
                <h3>Skill Proficiency</h3>
                {skills.map((s) => (
                  <div className="skill-row" key={s.id} style={{ position: "relative" }}>
                    <div className="skill-row-top">
                      <div>
                        <div className="skill-row-name">{s.name}</div>
                        <div className="skill-row-cat">{s.category}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="skill-row-pct" style={{ color: s.colorVar }}>{s.level}%</div>
                        <button
                          onClick={(e) => handleRemove(s.id, s.name, e)}
                          title="Remove skill"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2, display: "flex" }}
                        >
                          {removingId === s.id
                            ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                            : <X size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="skill-track">
                      <div className="skill-fill" style={{ width: `${s.level}%`, background: s.gradient }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Top skills + Gaps ── */}
              <div>
                <div className="skill-card" style={{ marginBottom: 20 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Trophy size={16} /> Top Skills</h3>
                  {topSkills.slice(0, 4).map((s, i) => (
                    <div className="top-skill-card" key={s.id}>
                      <div className="top-skill-icon" style={{ background: `${s.colorVar}20` }}>{RANK_ICONS[i]}</div>
                      <div>
                        <div className="top-skill-name">{s.name}</div>
                        <div className="top-skill-cat">{s.category}</div>
                      </div>
                      <div className="top-skill-pct" style={{ color: s.colorVar }}>{s.level}%</div>
                    </div>
                  ))}
                </div>

                <div className="skill-card">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={16} /> Skill Gaps</h3>
                  {gaps.length === 0 ? (
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>All your skills look great!</div>
                  ) : (
                    gaps.map((g) => (
                      <div className="gap-item" key={g.id}>
                        <div className="gap-icon"><TrendingDown size={16} /></div>
                        <div className="gap-info">
                          <div className="gap-name">{g.name}</div>
                          <div className="gap-desc">{g.category} · currently at {g.level}%</div>
                        </div>
                        <div className="gap-pct">{g.level}%</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── AI Skill Gap Detector ── */}
      <div className="suggest-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <Sparkles size={16} /> AI Skill Gap Detector <span className="ai-badge">Powered by Groq</span>
          </h3>
          <button
            onClick={async () => {
              setGapLoading(true);
              setGapItems([]);
              try {
                const gaps = await fetchSkillGap();
                setGapItems(gaps);
              } catch {
                error("Failed to analyze skill gap. Try again.");
              } finally { setGapLoading(false); }
            }}
            disabled={gapLoading}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "none", cursor: gapLoading ? "default" : "pointer",
              background: gapLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg,var(--accent),var(--accent2))",
              color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Sparkles size={13} /> {gapItems.length > 0 ? "Re-analyze" : "Analyze My Gaps"}
          </button>
        </div>

        {gapLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            Groq is analyzing your skills vs top internship requirements…
          </div>
        ) : gapItems.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {gapItems.map((g, i) => {
              const priorityColor = g.priority === "high" ? "var(--red)" : g.priority === "medium" ? "var(--gold)" : "var(--green)";
              const priorityBg = g.priority === "high" ? "rgba(244,63,94,0.1)" : g.priority === "medium" ? "rgba(251,191,36,0.1)" : "rgba(16,185,129,0.1)";
              return (
                <div key={i} style={{
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{g.skill}</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: priorityBg, color: priorityColor, fontWeight: 700, textTransform: "uppercase" }}>
                      {g.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.5 }}>{g.reason}</p>
                  <div style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink size={10} />
                    {g.resource.startsWith("http") ? (
                      <a href={g.resource} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{g.resource}</a>
                    ) : g.resource}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
            Click <strong>Analyze My Gaps</strong> to see which skills you need to land top internships.
          </p>
        )}
      </div>
    </>
  );
}