// src/pages/Applications.tsx
import { useState, ReactElement } from "react";
import { applications } from "../data/mock";
import { Application } from "../types";
import './Applications.css';

const COLUMNS: { status: Application["status"]; label: string; color: string; bg: string; icon: string }[] = [
  { status: "Applied",   label: "Applied",   color: "var(--accent)",  bg: "rgba(59,130,246,0.08)",  icon: "📨" },
  { status: "Interview", label: "Interview", color: "var(--gold)",    bg: "rgba(251,191,36,0.08)",  icon: "💬" },
  { status: "Offer",     label: "Offer",     color: "var(--green)",   bg: "rgba(16,185,129,0.08)",  icon: "🎉" },
  { status: "Rejected",  label: "Rejected",  color: "var(--red)",     bg: "rgba(244,63,94,0.08)",   icon: "❌" },
];

// Seed with some extra mock entries
const allApps: Application[] = [
  ...applications,
  {
    id: 4,
    internship: {
      id: 6, icon: "💳", title: "Backend Intern", company: "Stripe", location: "Remote",
      mode: "Remote", stipend: "₹90k/mo", stipendNum: 90000, match: 79,
      logoBg: "rgba(0,150,255,0.08)", category: "Backend",
      description: "", tags: ["Go"], posted: "", deadline: "27 Feb",
    },
    status: "Offer",
    appliedDate: "10 Feb 2025",
    stage: "Offer Received",
    notes: "Review offer letter — deadline 3 Mar",
  },
];

export default function Applications(): ReactElement {
  const [apps] = useState<Application[]>(allApps);

  const byStatus = (s: Application["status"]) => apps.filter((a) => a.status === s);

  return (
    <>
      <div className="apps-header">
        <h1>My Applications </h1>
        <p>Track every application across all stages</p>
      </div>

      <div className="stats-row">
        {[
          { label: "Total Applied", val: apps.length, color: "var(--accent)" },
          { label: "In Interview", val: byStatus("Interview").length, color: "var(--gold)" },
          { label: "Offers", val: byStatus("Offer").length, color: "var(--green)" },
          { label: "Rejected", val: byStatus("Rejected").length, color: "var(--red)" },
        ].map((s) => (
          <div className="mini-stat" key={s.label}>
            <div className="mini-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="mini-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="kanban">
        {COLUMNS.map((col) => {
          const colApps = byStatus(col.status);
          return (
            <div className="kanban-col" key={col.status}>
              <div className="kanban-col-header" style={{ background: col.bg }}>
                <span className="kanban-col-title" style={{ color: col.color }}>{col.icon} {col.label}</span>
                <span className="kanban-count" style={{ background: col.bg, color: col.color }}>{colApps.length}</span>
              </div>
              {colApps.length === 0 ? (
                <div className="empty-col"><div>{col.icon}</div>No applications here</div>
              ) : (
                colApps.map((app) => (
                  <div className="app-card" key={app.id}>
                    <div className="app-card-top">
                      <div className="app-logo" style={{ background: app.internship.logoBg }}>{app.internship.icon}</div>
                      <div>
                        <div className="app-title">{app.internship.title}</div>
                        <div className="app-company">{app.internship.company}</div>
                      </div>
                    </div>
                    <div className="app-stage">📍 {app.stage}</div>
                    {app.notes && <div className="app-notes">📝 {app.notes}</div>}
                    <div className="app-footer">
                      <span className="app-date">Applied {app.appliedDate}</span>
                      <span className={`tag ${col.status === "Applied" ? "paid" : col.status === "Interview" ? "hybrid" : col.status === "Offer" ? "remote" : "onsite"}`}>
                        {col.label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}