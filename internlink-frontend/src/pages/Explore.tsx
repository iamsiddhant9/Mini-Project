// src/pages/Explore.tsx
import { useState, ReactElement } from "react";
import { internships } from "../data/mock";
import './Explore.css';
import BackButton from '../components/BackButton';

const CATEGORIES = ["All","AI/ML","Backend","Frontend","Cloud","Mobile","Data","Security","DevOps","Design"];
const MODES = ["All","Remote","Hybrid","On-site"];

function ApplySmall(): ReactElement {
  const [sent, setSent] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setSent(true); setTimeout(() => setSent(false), 2000); }}
      style={{
        fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
        background: sent ? "var(--green)" : "linear-gradient(135deg,var(--accent),var(--accent2))",
        color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
      }}
    >{sent ? "✓" : "Apply"}</button>
  );
}

export default function Explore(): ReactElement {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");

  const filtered = internships.filter((i) => {
    const q = search.toLowerCase();
    return (
      (category === "All" || i.category === category) &&
      (mode === "All" || i.mode === mode) &&
      (i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  return (
    <>
      
      <BackButton />
      <div className="explore-header">
        <h1>Explore Internships </h1>
        <p>Browse all available opportunities across companies and roles</p>
      </div>

      <div className="search-bar">
        <span style={{ fontSize: 18, color: "var(--muted)" }}>🔍</span>
        <input placeholder="Search by role, company, or skill..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <span style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setSearch("")}>✕</span>}
      </div>

      <div className="explore-layout">
        <div className="sidebar-filters">
          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map((c) => (
              <div key={c} className={`filter-option${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
                <input type="checkbox" readOnly checked={category === c} /> {c}
              </div>
            ))}
          </div>
          <div className="filter-group">
            <h4>Work Mode</h4>
            {MODES.map((m) => (
              <div key={m} className={`filter-option${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>
                <input type="checkbox" readOnly checked={mode === m} /> {m}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="results-meta">{filtered.length} results found</div>
          <div className="explore-grid">
            {filtered.map((item) => (
              <div className="explore-card" key={item.id}>
                <div className="explore-card-top">
                  <div className="explore-logo" style={{ background: item.logoBg }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="explore-title">{item.title}</div>
                    <div className="explore-co">{item.company} · {item.location}</div>
                  </div>
                  <div className="explore-match">{item.match}%</div>
                </div>
                <div className="explore-desc">{item.description}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <span className={`tag ${item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite"}`}>{item.mode}</span>
                  {item.tags.map((t) => <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 7px" }}>{t}</span>)}
                </div>
                <div className="explore-footer">
                  <div>
                    <div className="explore-stipend">{item.stipend}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>Deadline: {item.deadline}</div>
                  </div>
                  <ApplySmall />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}