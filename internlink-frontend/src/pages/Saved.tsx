// src/pages/Saved.tsx
import { useState, useEffect, ReactElement } from "react";
import { saved as savedApi, applications as applicationsApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Bookmark, Heart, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";
import "./Saved.css";

interface SavedItem {
  id: number;           // saved_internships.id
  internship_id: number;
  title: string;
  company: string;
  location: string;
  mode: string;
  stipend: string;
  deadline: string;
  tags: string[];
  saved_at: string;
}

function ApplyModal({ item, onConfirm, onCancel, applying }: {
  item: SavedItem; onConfirm: () => void; onCancel: () => void; applying: boolean;
}): ReactElement {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", maxWidth: 420, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>

        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Confirm Application</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Apply for <strong style={{ color: "var(--text)" }}>{item.title}</strong> at <strong style={{ color: "var(--accent)" }}>{item.company}</strong>?
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {item.mode && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.1)", color: "var(--accent)", fontWeight: 600 }}>{item.mode}</span>}
          {item.stipend && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "var(--green)", fontWeight: 600 }}>{item.stipend}</span>}
          {item.deadline && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "var(--gold)", fontWeight: 600 }}>Deadline: {item.deadline}</span>}
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

function ApplyButton({ item }: { item: SavedItem }): ReactElement {
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const { success, error } = useToast();

  const doApply = async () => {
    setApplying(true);
    try {
      await applicationsApi.apply(item.internship_id);
      setStatus("done");
      success(`Applied to ${item.title}!`);
    } catch {
      setStatus("error");
      error("Failed to apply. Try again.");
      setTimeout(() => setStatus("idle"), 2000);
    } finally {
      setApplying(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {showModal && <ApplyModal item={item} onConfirm={doApply} onCancel={() => setShowModal(false)} applying={applying} />}
      <button
        className={`status-pill${status === "done" ? " active" : ""}`}
        onClick={e => { e.stopPropagation(); if (status === "idle") setShowModal(true); }}
        disabled={status === "done"}
        style={{ display: "flex", alignItems: "center", gap: 5 }}
      >
        {status === "done" ? <><Check size={12} /> Applied</> : status === "error" ? "Failed" : "Apply"}
      </button>
    </>
  );
}

export default function Saved(): ReactElement {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "remote" | "hybrid" | "onsite">("all");

  useEffect(() => {
    savedApi.list().then((res: any) => {
      const list: SavedItem[] = Array.isArray(res)
        ? res
        : (res?.results ?? []);
      // Normalise shape — backend uses internship_id separately
      setItems(list.map((x: any) => ({
        id: x.id,
        internship_id: x.internship_id ?? x.id,
        title: x.title ?? "Untitled",
        company: x.company ?? "—",
        location: x.location ?? "—",
        mode: x.mode ?? "Remote",
        stipend: x.stipend ?? "—",
        deadline: x.deadline ?? "—",
        tags: Array.isArray(x.tags) ? x.tags.filter(Boolean) : [],
        saved_at: x.saved_at ?? "",
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const unsave = async (item: SavedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await savedApi.unsave(item.internship_id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch { /* silently fail */ }
  };

  const filtered = items.filter((i) => {
    if (filter === "all") return true;
    const m = i.mode.toLowerCase().replace("-", "");
    return m === filter.replace("-", "");
  });

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "remote", label: "Remote" },
    { key: "hybrid", label: "Hybrid" },
    { key: "onsite", label: "On-site" },
  ];

  return (
    <>
      <div className="saved-header">
        <div>
          <h1>Saved Internships</h1>
          <p>Track and manage your saved opportunities</p>
        </div>
        <div className="saved-count">{items.length} saved</div>
      </div>

      <div className="saved-tabs">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={"saved-tab" + (filter === key ? " active" : "")}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="tab-count">
              {key === "all" ? items.length : items.filter((i) => i.mode.toLowerCase().replace(/[^a-z]/g, "").startsWith(key.replace("-", ""))).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="saved-empty" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          Loading saved internships…
        </div>
      ) : filtered.length === 0 ? (
        <div className="saved-empty">
          <div className="saved-empty-icon"><Bookmark size={28} /></div>
          <div>{items.length === 0 ? "No saved internships yet. Explore and save some!" : "No internships in this category"}</div>
        </div>
      ) : (
        <div className="saved-list">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const modeClass = item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite";
            return (
              <div
                key={item.id}
                className={"saved-item-card" + (isExpanded ? " expanded" : "")}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="saved-item-row">
                  <div className="saved-item-info">
                    <div className="saved-item-title">{item.title}</div>
                    <div className="saved-item-company">{item.company} · {item.location}</div>
                  </div>

                  <div className="saved-item-tags">
                    <span className={`tag ${modeClass}`}>{item.mode}</span>
                    {item.tags.slice(0, 3).map((t) => (
                      <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>

                  <div className="saved-item-stipend">{item.stipend}</div>

                  <button
                    className="unsave-btn"
                    onClick={(e) => unsave(item, e)}
                    title="Remove from saved"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Heart size={14} />
                  </button>

                  <span className="saved-chevron">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>

                {isExpanded && (
                  <div className="saved-expanded">
                    <div className="saved-expanded-footer">
                      <span className="saved-meta">
                        Saved {item.saved_at ? new Date(item.saved_at).toLocaleDateString() : "—"} · Deadline {item.deadline}
                      </span>
                      <div className="saved-actions">
                        <ApplyButton item={item} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}