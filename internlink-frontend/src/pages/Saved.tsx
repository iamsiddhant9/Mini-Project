// src/pages/Saved.tsx
import { useState, ReactElement } from "react";
import "./Saved.css";

interface SavedInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  stipend: string;
  deadline: string;
  match: number;
  icon: string;
  logoBg: string;
  tags: string[];
  description: string;
  savedOn: string;
  status: "saved" | "applied" | "interviewing" | "rejected";
}

const MOCK_SAVED: SavedInternship[] = [
  { id: "1", title: "ML Engineer Intern", company: "Google DeepMind", location: "Bangalore", mode: "Hybrid", stipend: "₹80,000/mo", deadline: "Mar 15", match: 94, icon: "🧠", logoBg: "rgba(59,130,246,0.15)", tags: ["Python", "PyTorch"], description: "Work on cutting-edge ML research and deployment pipelines.", savedOn: "Feb 12", status: "applied" },
  { id: "2", title: "Frontend Engineer Intern", company: "Razorpay", location: "Bangalore", mode: "On-site", stipend: "₹60,000/mo", deadline: "Mar 20", match: 88, icon: "💳", logoBg: "rgba(6,182,212,0.15)", tags: ["React", "TypeScript"], description: "Build and maintain core payment UI components.", savedOn: "Feb 14", status: "saved" },
  { id: "3", title: "Backend Developer Intern", company: "Zepto", location: "Mumbai", mode: "On-site", stipend: "₹55,000/mo", deadline: "Apr 1", match: 82, icon: "🛒", logoBg: "rgba(16,185,129,0.15)", tags: ["Node.js", "Go"], description: "Scale backend services for 10M+ daily orders.", savedOn: "Feb 15", status: "interviewing" },
  { id: "4", title: "Data Science Intern", company: "CRED", location: "Bangalore", mode: "Remote", stipend: "₹50,000/mo", deadline: "Mar 30", match: 79, icon: "📊", logoBg: "rgba(167,139,250,0.15)", tags: ["Python", "SQL"], description: "Analyze credit behavior and build scoring models.", savedOn: "Feb 16", status: "saved" },
  { id: "5", title: "iOS Developer Intern", company: "Swiggy", location: "Bangalore", mode: "Hybrid", stipend: "₹65,000/mo", deadline: "Mar 25", match: 76, icon: "🍔", logoBg: "rgba(251,191,36,0.15)", tags: ["Swift", "UIKit"], description: "Build features for Swiggy iOS app used by millions.", savedOn: "Feb 17", status: "rejected" },
  { id: "6", title: "DevOps Intern", company: "Flipkart", location: "Bangalore", mode: "On-site", stipend: "₹58,000/mo", deadline: "Apr 5", match: 72, icon: "📦", logoBg: "rgba(244,63,94,0.15)", tags: ["K8s", "AWS"], description: "Manage CI/CD pipelines and cloud infrastructure.", savedOn: "Feb 18", status: "saved" },
];

const STATUS_LABELS: Record<SavedInternship["status"], string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<SavedInternship["status"], string> = {
  saved: "status-saved",
  applied: "status-applied",
  interviewing: "status-interviewing",
  rejected: "status-rejected",
};

const FILTERS: Array<"all" | SavedInternship["status"]> = ["all", "saved", "applied", "interviewing", "rejected"];

export default function Saved(): ReactElement {
  const [items, setItems] = useState<SavedInternship[]>(MOCK_SAVED);
  const [filter, setFilter] = useState<"all" | SavedInternship["status"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const unsave = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const setStatus = (id: string, status: SavedInternship["status"]) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  return (
    <>
      <div className="saved-header">
        <div>
          <h1>Saved Internships</h1>
          <p>Track and manage your saved opportunities</p>
        </div>
        <div className="saved-count">{items.length} saved</div>
      </div>

      {/* ── Status filter tabs ── */}
      <div className="saved-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={"saved-tab" + (filter === f ? " active" : "")}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : STATUS_LABELS[f]}
            <span className="tab-count">
              {f === "all" ? items.length : items.filter((i) => i.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="saved-empty">
          <div className="saved-empty-icon">🔖</div>
          <div>No internships in this category</div>
        </div>
      ) : (
        <div className="saved-list">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={"saved-item-card" + (isExpanded ? " expanded" : "")}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {/* ── Main row ── */}
                <div className="saved-item-row">
                  <div className="saved-item-logo" style={{ background: item.logoBg }}>
                    {item.icon}
                  </div>

                  <div className="saved-item-info">
                    <div className="saved-item-title">{item.title}</div>
                    <div className="saved-item-company">{item.company} · {item.location}</div>
                  </div>

                  <div className="saved-item-tags">
                    <span className={"tag " + (item.mode === "Remote" ? "remote" : item.mode === "Hybrid" ? "hybrid" : "onsite")}>
                      {item.mode}
                    </span>
                    {item.tags.map((t) => (
                      <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>

                  <div className="saved-item-stipend">{item.stipend}</div>

                  <div className={"status-badge " + STATUS_COLORS[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </div>

                  <div className="saved-item-match">{item.match}%<span>match</span></div>

                  <button
                    className="unsave-btn"
                    onClick={(e) => { e.stopPropagation(); unsave(item.id); }}
                    title="Remove from saved"
                  >
                    ♥
                  </button>

                  <span className="saved-chevron">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="saved-expanded">
                    <p className="saved-description">{item.description}</p>
                    <div className="saved-expanded-footer">
                      <span className="saved-meta">Saved {item.savedOn} · Deadline {item.deadline}</span>
                      <div className="saved-actions">
                        <span style={{ fontSize: 11, color: "var(--muted)", marginRight: 8 }}>Update status:</span>
                        {(["saved", "applied", "interviewing", "rejected"] as SavedInternship["status"][]).map((s) => (
                          <button
                            key={s}
                            className={"status-pill" + (item.status === s ? " active" : "")}
                            onClick={(e) => { e.stopPropagation(); setStatus(item.id, s); }}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
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