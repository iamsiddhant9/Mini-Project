// src/pages/Recommendations.tsx
import { useState, ReactElement } from "react";
import { internships } from "../data/mock";
import { Internship } from "../types";
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import './Recommendations.css';
import BackButton from '../components/BackButton';

// ── Components ──

function ApplyOutline(): ReactElement {
  const [sent, setSent] = useState(false);
  return (
    <button
      className={`apply-btn-outline${sent ? " sent" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setSent(true);
        setTimeout(() => setSent(false), 2000);
      }}
    >
      {sent ? "✓ Sent" : "Apply"}
    </button>
  );
}

const MODES = ["All", "Remote", "Hybrid", "On-site"];
const CATEGORIES = ["All", "AI/ML", "Backend", "Frontend", "Cloud", "Mobile", "Data", "Security", "DevOps", "Design"];

export default function Recommendations(): ReactElement {
  // ✅ FIXED: Hooks are now inside the function body
  // ✅ FIXED: Type includes 'number' to overlap with item.id
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [modeFilter, setModeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("match");

  const toggleExpand = (id: string | number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filtered = internships
    .filter((i) => modeFilter === "All" || i.mode === modeFilter)
    .filter((i) => categoryFilter === "All" || i.category === categoryFilter)
    .sort((a, b) =>
      sort === "match" ? b.match - a.match :
      sort === "stipend" ? b.stipendNum - a.stipendNum : 0
    );

  return (
    <div className="recommendations-page">
      <BackButton />
      {/* ── Header ── */}
      <div className="rec-header">
        <div>
          <h1>Internship Recommendations <span className="ai-badge">✨ AI Powered</span></h1>
          <p>Curated based on your skills, preferences & profile strength</p>
        </div>
        <div style={{ marginRight: 50 , fontSize: 13, color: "white" }}>{filtered.length} internships found</div>
      </div>

      {/* ── Filters ── */}
      <div className="filters">
        <div className="filter-section">
          <span className="filter-label">Mode:</span>
          {MODES.map((m) => (
            <button
              key={m}
              className={`filter-btn${modeFilter === m ? " active" : ""}`}
              onClick={() => setModeFilter(m)}
            >{m}</button>
          ))}
        </div>
        <div className="filter-section">
          <span className="filter-label">Category:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-btn${categoryFilter === c ? " active" : ""}`}
              onClick={() => setCategoryFilter(c)}
            >{c}</button>
          ))}
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="match">Sort: Best Match</option>
          <option value="stipend">Sort: Highest Stipend</option>
        </select>
      </div>

      {/* ── Internship Stack ── */}
      {filtered.length === 0 ? (
        <div className="empty"><div>🔍</div>No internships match your filters</div>
      ) : (
        <ScrollStack
          itemDistance={80}
          itemScale={0.04}
          itemStackDistance={20}
          stackPosition="15%"
          scaleEndPosition="8%"
          baseScale={0.88}
        >
          {filtered.map((item: Internship) => (
            <ScrollStackItem key={item.id}>
              {/* FIXED: Comparing string|number|null to item.id (number) now works */}
              <div 
                className={"rec-card" + (expandedId === item.id ? " expanded" : "")} 
                onClick={() => toggleExpand(item.id)}
              >
                
                <div className="rec-card-top">
                  <div className="rec-logo" style={{ background: item.logoBg }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rec-title">{item.title}</div>
                    <div className="rec-company">{item.company} · {item.location}</div>
                  </div>
                  <div className="rec-tags">
                    <span className={"tag " + (item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite")}>
                      {item.mode}
                    </span>
                    {item.tags.map((t) => (
                      <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>
                  <div className="rec-stipend">{item.stipend}</div>
                  <div className="rec-match">{item.match}%<span>match</span></div>
                  <span className="rec-chevron">{expandedId === item.id ? "▲" : "▼"}</span>
                </div>

                {expandedId === item.id && (
                  <div className="rec-expanded">
                    <p className="rec-description">{item.description}</p>
                    <div className="rec-expanded-footer">
                      <span className="rec-meta">Posted {item.posted} · Deadline {item.deadline}</span>
                      <ApplyOutline />
                    </div>
                  </div>
                )}
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      )}
    </div>
  );
}