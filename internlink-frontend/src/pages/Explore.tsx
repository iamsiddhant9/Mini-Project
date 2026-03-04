import { useState, useEffect, ReactElement } from "react";
import { internships as internshipsApi } from "../services/api";
import './Explore.css';

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
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [mode, setMode]           = useState("All");
  const [data, setData]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const params: Record<string, string> = {};
        if (search)            params.search   = search;
        if (category !== "All") params.category = category;
        if (mode !== "All")     params.mode     = mode;
        const res = await internshipsApi.list(params);
        setData(res.results || []);
      } catch {
        setError("Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [search, category, mode]);

  return (
    <>
      <div className="explore-header">
        <h1>Explore Internships</h1>
        <p>Browse all available opportunities across companies and roles</p>
      </div>

      <div className="search-bar">
        <span style={{ fontSize: 18, color: "var(--muted)" }}>🔍</span>
        <input
          placeholder="Search by role, company, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <span style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setSearch("")}>✕</span>
        )}
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
          {loading ? (
            <div style={{ color: "var(--muted)", padding: "40px", textAlign: "center" }}>
              Loading internships...
            </div>
          ) : error ? (
            <div style={{ color: "var(--red)", padding: "40px", textAlign: "center" }}>{error}</div>
          ) : (
            <>
              <div className="results-meta">{data.length} results found</div>
              <div className="explore-grid">
                {data.length === 0 ? (
                  <div style={{ color: "var(--muted)", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
                    No internships found. Try a different search.
                  </div>
                ) : data.map((item) => (
                  <div className="explore-card" key={item.id}>
                    <div className="explore-card-top">
                      <div className="explore-logo" style={{ background: "rgba(59,130,246,0.08)" }}>
                        {item.company?.[0] ?? "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="explore-title">{item.title}</div>
                        <div className="explore-co">{item.company} · {item.location}</div>
                      </div>
                      {item.match_score && (
                        <div className="explore-match">{item.match_score}%</div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "8px 0" }}>
                      <span className={`tag ${item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite"}`}>
                        {item.mode}
                      </span>
                      {(item.tags || []).map((t: string) => (
                        <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 7px" }}>{t}</span>
                      ))}
                    </div>

                    <div className="explore-footer">
                      <div>
                        <div className="explore-stipend">₹{item.stipend}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>
                          Deadline: {item.deadline}
                        </div>
                      </div>
                      <ApplySmall />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}