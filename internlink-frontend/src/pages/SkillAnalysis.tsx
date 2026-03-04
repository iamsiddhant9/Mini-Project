// src/pages/SkillAnalysis.tsx
import { ReactElement } from "react";
import { skills } from "../data/mock";
import './SkillAnalysis.css';



const GAPS = [
  { name: "System Design", pct: 55, desc: "Practice HLD/LLD — needed for most SDE roles" },
  { name: "Docker / DevOps", pct: 48, desc: "Containerization basics will boost your profile" },
  { name: "SQL / Databases", pct: 65, desc: "Strengthen query optimization and indexing" },
];

const SUGGESTIONS = [
  { icon: "📘", title: "System Design Primer", desc: "Complete the GitHub system design course to jump from 55% → 75%" },
  { icon: "🐳", title: "Docker Fundamentals", desc: "Build 2 Dockerized projects to demonstrate DevOps capability" },
  { icon: "🗄️", title: "SQL Practice", desc: "Solve 30 LeetCode SQL problems — estimated 2 weeks" },
  { icon: "🧪", title: "ML Project", desc: "Deploy an end-to-end ML project on HuggingFace Spaces" },
];

export default function SkillAnalysis(): ReactElement {
  const topSkills = [...skills].sort((a, b) => b.pct - a.pct);

  return (
    <>
   
      <div className="skills-header">
        <h1>Skill Analysis </h1>
        <p>Understand your strengths, gaps and what to improve next</p>
      </div>

      <div className="skills-grid">
        {/* Proficiency bars */}
        <div className="skill-card">
          <h3>Skill Proficiency</h3>
          {skills.map((s) => (
            <div className="skill-row" key={s.name}>
              <div className="skill-row-top">
                <div>
                  <div className="skill-row-name">{s.name}</div>
                  <div className="skill-row-cat">{s.category}</div>
                </div>
                <div className="skill-row-pct" style={{ color: s.color }}>{s.pct}%</div>
              </div>
              <div className="skill-track">
                <div className="skill-fill" style={{ width: `${s.pct}%`, background: s.gradient }} />
              </div>
            </div>
          ))}
        </div>

        {/* Right col */}
        <div>
          {/* Top skills */}
          <div className="skill-card" style={{ marginBottom: 20 }}>
            <h3>🏆 Top Skills</h3>
            {topSkills.slice(0, 4).map((s, i) => (
              <div className="top-skill-card" key={s.name}>
                <div className="top-skill-icon" style={{ background: `${s.color}20` }}>
                  {["🥇","🥈","🥉","4️⃣"][i]}
                </div>
                <div>
                  <div className="top-skill-name">{s.name}</div>
                  <div className="top-skill-cat">{s.category}</div>
                </div>
                <div className="top-skill-pct" style={{ color: s.color }}>{s.pct}%</div>
              </div>
            ))}
          </div>

          {/* Skill gaps */}
          <div className="skill-card">
            <h3>⚠️ Skill Gaps</h3>
            {GAPS.map((g) => (
              <div className="gap-item" key={g.name}>
                <div className="gap-icon">📉</div>
                <div className="gap-info">
                  <div className="gap-name">{g.name}</div>
                  <div className="gap-desc">{g.desc}</div>
                </div>
                <div className="gap-pct">{g.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="suggest-card">
        <h3>✨ AI-Powered Suggestions <span className="ai-badge">Personalized</span></h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {SUGGESTIONS.map((s) => (
            <div key={s.title} style={{
              background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "14px 16px", display: "flex", gap: 12,
            }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div className="suggest-title">{s.title}</div>
                <div className="suggest-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}