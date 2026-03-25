import { useState, useEffect, useRef, ReactElement } from "react";
import './Explore.css';
import { useToast } from "../context/ToastContext";
import { Search, X, MapPin, Clock, Heart, HeartOff, ChevronDown, AlertTriangle, Loader2, RefreshCw, Check } from "lucide-react";


import * as apiSvc from "../services/api";


const CATEGORIES = ["All","AI/ML","Backend","Frontend","Cloud","Mobile","Data","Security","DevOps","Design","Other"];
const MODES      = ["All","Remote","Hybrid","On-site"];
const PAGE_SIZE  = 10;

interface ApplyModalProps {
  internship: any;
  onConfirm: () => void;
  onCancel: () => void;
  applying: boolean;
}

function ApplyModal({ internship, onConfirm, onCancel, applying }: ApplyModalProps): ReactElement {
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
          You're about to apply for{" "}
          <strong style={{ color: "var(--text)" }}>{internship?.title}</strong> at{" "}
          <strong style={{ color: "var(--accent)" }}>{internship?.company}</strong>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {internship?.mode && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.1)", color: "var(--accent)", fontWeight: 600 }}>{internship.mode}</span>}
          {internship?.stipend && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "var(--green)", fontWeight: 600 }}>{internship.stipend}</span>}
          {internship?.deadline && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "var(--gold)", fontWeight: 600 }}>Deadline: {internship.deadline}</span>}
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

export default function Explore(): ReactElement {
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [mode, setMode]               = useState("All");
  const [sortBy, setSortBy]           = useState("newest");
  const [data, setData]               = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState("");
  const [hasMore, setHasMore]         = useState(false);
  const [offset, setOffset]           = useState(0);
  const [totalCount, setTotalCount]   = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [applied, setApplied]               = useState<Set<number>>(new Set());
  const [applying, setApplying]             = useState(false);
  const [confirmTarget, setConfirmTarget]   = useState<any | null>(null);
  const [saved, setSaved]                   = useState<Set<number>>(new Set());
  const { success, error: toastError, info } = useToast();

  const fetchData = async (newOffset: number, replace: boolean, silent = false) => {
    if (!silent) {
      if (newOffset === 0) setLoading(true);
      else setLoadingMore(true);
    }
    setError("");
    try {
      const res = await apiSvc.internships.list({
        search,
        category: category !== "All" ? category : undefined,
        mode: mode !== "All" ? mode : undefined,
        order_by: sortBy,
        limit: PAGE_SIZE,
        offset: newOffset,
      });
      if (!res || res.error) throw new Error(res?.error || "Failed to load internships");
      const items: any[] = res.internships || res.results || [];
      const total: number = res.total ?? res.count ?? 0;
      setData(prev => replace ? items : [...prev, ...items]);
      setOffset(newOffset + items.length);
      setHasMore(items.length === PAGE_SIZE);
      setTotalCount(total || (replace ? items.length : offset + items.length));

    } catch {
      setError("Failed to load internships");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    const debounce = setTimeout(() => fetchData(0, true), 300);
    return () => clearTimeout(debounce);
  }, [search, category, mode, sortBy]);

  useEffect(() => {
    apiSvc.applications.list().then(res => {
      const apps = res.applications || res || [];
      if (Array.isArray(apps)) setApplied(new Set(apps.map((a: any) => a.internship_id)));
    });
    apiSvc.saved.list().then(res => {
      const s = res.saved || res || [];
      if (Array.isArray(s)) setSaved(new Set(s.map((i: any) => i.internship_id ?? i.id)));
    });
  }, []);

  // Detect when sidebar scrolls out of view
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSidebarVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  const handleRefresh = async () => {
    setRefreshing(true);
    setOffset(0);
    await fetchData(0, true, false);
    success("Internships refreshed!");
  };

  const requestApply = (item: any) => {
    if (applied.has(item.id)) return;
    setConfirmTarget(item);
  };

  const confirmApply = async () => {
  if (!confirmTarget) return;
  setApplying(true);
  try {
    const res = await apiSvc.applications.apply(confirmTarget.id);

    if (res.id || res.message) {
      setApplied(prev => new Set(prev).add(confirmTarget.id));
      const url = confirmTarget.source_url || confirmTarget.apply_url;
      if (url) {
        success(`Application tracked! Opening job page…`);
        window.open(url, "_blank");
      } else {
        success(`Application tracked!`);
        info("No direct link available for this internship.");
      }
    } else {
      toastError(res.error || "Failed to apply. Try again.");
    }
  } catch {
    toastError("Failed to apply. Try again.");
  } finally {
    setApplying(false);
    setConfirmTarget(null);
  }
};
  
  const handleSave = async (internshipId: number) => {
    if (saved.has(internshipId)) {
      const res = await apiSvc.saved.list();
      const s = res.saved || res || [];
      const match = s.find((i: any) => (i.internship_id ?? i.id) === internshipId);
      if (match) await apiSvc.saved.unsave(match.id);
      setSaved(prev => { const n = new Set(prev); n.delete(internshipId); return n; });
      info("Removed from saved");
    } else {
      await apiSvc.saved.save(internshipId);
      setSaved(prev => new Set(prev).add(internshipId));
      success("Saved!");
    }

  };

  return (
    <>
      {confirmTarget && (
        <ApplyModal
          internship={confirmTarget}
          onConfirm={confirmApply}
          onCancel={() => setConfirmTarget(null)}
          applying={applying}
        />
      )}

      {/* Header */}
      <div className="explore-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Explore Internships</h1>
          <p>{totalCount > 0 ? `${totalCount}+ opportunities` : "Browse opportunities"} across companies and roles</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--surface2)", color: "var(--muted)", fontSize: 12,
              fontFamily: "DM Sans, sans-serif", fontWeight: 600, cursor: "pointer", outline: "none",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="deadline">By Deadline</option>
            <option value="stipend">Highest Stipend</option>
          </select>
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              border: "1px solid rgba(99,179,237,0.2)",
              background: "rgba(99,179,237,0.06)", color: "var(--accent)",
              cursor: refreshing ? "default" : "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "DM Sans, sans-serif",
            }}
          >
            <RefreshCw size={13} style={refreshing ? { animation: "spin 1s linear infinite" } : {}} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} color="var(--muted)" />
        <input
          placeholder="Search by role, company, or skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <span style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setSearch("")}>
            <X size={14} />
          </span>
        )}
      </div>

      <div className={`explore-layout${sidebarVisible ? "" : " sidebar-hidden"}`}>
        {/* Sidebar Filters */}
        <div className="sidebar-filters" ref={sidebarRef}>
          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map(c => (
              <div key={c} className={`filter-option${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
                <input type="checkbox" readOnly checked={category === c} /> {c}
              </div>
            ))}
          </div>
          <div className="filter-group">
            <h4>Work Mode</h4>
            {MODES.map(m => (
              <div key={m} className={`filter-option${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>
                <input type="checkbox" readOnly checked={mode === m} /> {m}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ color: "var(--muted)", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Loading internships...
            </div>
          ) : error ? (
            <div style={{ color: "var(--red)", padding: "40px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <AlertTriangle size={16} /> {error}
            </div>
          ) : (
            <>
              <div className="results-meta">{data.length}{hasMore ? "+" : ""} results found</div>
              <div className="explore-grid">
                {data.length === 0 ? (
                  <div style={{ color: "var(--muted)", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
                    No internships found. Try a different search.
                  </div>
                ) : data.map(item => {
                  const isApplied = applied.has(item.id);
                  const isSaved   = saved.has(item.id);
                  return (
                    <div className="explore-card" key={item.id}>
                      <div className="explore-card-top">
                        <div className="explore-logo" style={{ background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#60a5fa" }}>
                          {item.company?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="explore-title">{item.title}</div>
                          <div className="explore-co">{item.company}</div>
                        </div>
                        {item.match_score > 0 && (
                          <div className="explore-match">{item.match_score}%</div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8, margin: "6px 0", flexWrap: "wrap" }}>
                        {item.location && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted)" }}><MapPin size={10} /> {item.location}</span>}
                        {item.deadline && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--muted)" }}><Clock size={10} /> {item.deadline}</span>}
                      </div>

                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "6px 0" }}>
                        <span className={`tag ${item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite"}`}>{item.mode}</span>
                        {(item.tags || []).slice(0, 3).map((t: string) => (
                          <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 7px" }}>{t}</span>
                        ))}
                      </div>

                      <div className="explore-footer">
                        <div>
                          <div className="explore-stipend">{item.stipend || "Competitive"}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{item.category}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button onClick={() => handleSave(item.id)} style={{
                            background: isSaved ? "rgba(251,191,36,0.15)" : "rgba(99,179,237,0.08)",
                            border: `1px solid ${isSaved ? "rgba(251,191,36,0.3)" : "rgba(99,179,237,0.12)"}`,
                            color: isSaved ? "var(--gold)" : "var(--muted)",
                            borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center",
                          }}>
                            {isSaved ? <Heart size={13} fill="currentColor" /> : <HeartOff size={13} />}
                          </button>
                          <button onClick={() => requestApply(item)} disabled={isApplied} style={{
                            fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 7,
                            background: isApplied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,var(--accent),var(--accent2))",
                            color: isApplied ? "var(--green)" : "#fff",
                            border: "none", cursor: isApplied ? "default" : "pointer",
                            fontFamily: "inherit", flexShrink: 0,
                          }}>
                            {isApplied ? <><Check size={11} style={{ display: "inline", marginRight: 2 }} />Applied</> : "Apply"}
                          </button>
                        </div>
                      </div>

                      {item.apply_url && (
                        <a href={item.apply_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--accent)", textDecoration: "none" }}>
                          View on job board →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 28 }}>
                  <button
                    onClick={() => fetchData(offset, false)}
                    disabled={loadingMore}
                    style={{
                      padding: "10px 32px", borderRadius: 10, border: "1px solid var(--border)",
                      background: "var(--surface2)", color: "var(--text)", cursor: loadingMore ? "default" : "pointer",
                      fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                      display: "inline-flex", alignItems: "center", gap: 8, opacity: loadingMore ? 0.7 : 1,
                    }}
                  >
                    {loadingMore
                      ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Loading…</>
                      : <><ChevronDown size={14} />Load More ({offset}+ loaded)</>}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}