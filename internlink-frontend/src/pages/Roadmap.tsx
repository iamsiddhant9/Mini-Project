// src/pages/Roadmap.tsx
import { useState, useEffect } from "react";
import { ROADMAPS, Roadmap, RoadmapTopic } from "../data/roadmaps";
import { ExternalLink, CheckCircle2, Circle, Clock, ChevronRight, Map, RotateCcw, Trophy } from "lucide-react";
import "./Roadmap.css";

const LS_KEY = "roadmap_progress_v1";

type Status = "done" | "in_progress" | "todo";

function loadProgress(): Record<string, Status> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function saveProgress(p: Record<string, Status>) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

function nextStatus(s: Status): Status {
  if (s === "todo") return "in_progress";
  if (s === "in_progress") return "done";
  return "todo";
}

function statusIcon(s: Status, color: string) {
  if (s === "done") return <CheckCircle2 size={18} color={color} />;
  if (s === "in_progress") return <Clock size={18} color="#fbbf24" />;
  return <Circle size={18} color="var(--muted)" />;
}

function TopicCard({ topic, progress, onToggle, phaseColor }: {
  topic: RoadmapTopic;
  progress: Status;
  onToggle: () => void;
  phaseColor: string;
}) {
  const typeBadge: Record<string, { label: string; color: string; bg: string }> = {
    core:     { label: "Core",     color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    optional: { label: "Optional", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    tool:     { label: "Tool",     color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  };
  const badge = typeBadge[topic.type ?? "core"];

  return (
    <div
      className={`rm-topic ${progress}`}
      onClick={onToggle}
      style={progress === "done" ? { borderColor: `${phaseColor}40` } : {}}
    >
      <div className="rm-topic-left">
        <div className="rm-topic-icon">{statusIcon(progress, phaseColor)}</div>
        <div className="rm-topic-body">
          <div className="rm-topic-name" style={progress === "done" ? { color: phaseColor } : {}}>
            {topic.label}
          </div>
          <div className="rm-topic-desc">{topic.description}</div>
        </div>
      </div>
      <div className="rm-topic-right">
        <span className="rm-type-badge" style={{ color: badge.color, background: badge.bg }}>
          {badge.label}
        </span>
        {topic.resource && (
          <a
            href={topic.resource}
            target="_blank"
            rel="noopener noreferrer"
            className="rm-resource-link"
            onClick={e => e.stopPropagation()}
            title="Open free resource"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

function RoadmapDetail({ roadmap, progress, onToggle, onReset }: {
  roadmap: Roadmap;
  progress: Record<string, Status>;
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const allTopics = roadmap.phases.flatMap(p => p.topics);
  const done = allTopics.filter(t => progress[t.id] === "done").length;
  const inProgress = allTopics.filter(t => progress[t.id] === "in_progress").length;
  const pct = Math.round((done / allTopics.length) * 100);

  return (
    <div className="rm-detail">
      {/* Header */}
      <div className="rm-detail-header" style={{ background: roadmap.gradient }}>
        <div>
          <div className="rm-detail-icon">{roadmap.icon}</div>
          <h2 className="rm-detail-title">{roadmap.label} Roadmap</h2>
          <p className="rm-detail-desc">{roadmap.description}</p>
        </div>
        <div className="rm-header-stats">
          <div className="rm-stat-pill">
            <CheckCircle2 size={13} /> {done} done
          </div>
          <div className="rm-stat-pill in-prog">
            <Clock size={13} /> {inProgress} in progress
          </div>
          <button className="rm-reset-btn" onClick={onReset} title="Reset progress">
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rm-progress-wrap">
        <div className="rm-progress-bar">
          <div className="rm-progress-fill" style={{ width: `${pct}%`, background: roadmap.gradient }} />
        </div>
        <span className="rm-progress-pct">{pct}% complete</span>
        {pct === 100 && (
          <span className="rm-complete-badge">
            <Trophy size={13} /> Completed! 🎉
          </span>
        )}
      </div>

      {/* Phases */}
      <div className="rm-phases">
        {roadmap.phases.map((phase, pi) => {
          const phaseDone = phase.topics.filter(t => progress[t.id] === "done").length;
          return (
            <div key={phase.id} className="rm-phase">
              <div className="rm-phase-header">
                <div className="rm-phase-num" style={{ background: phase.color }}>{pi + 1}</div>
                <div className="rm-phase-label">{phase.label}</div>
                <div className="rm-phase-count" style={{ color: phase.color }}>
                  {phaseDone}/{phase.topics.length}
                </div>
              </div>
              <div className="rm-phase-line" style={{ borderColor: `${phase.color}30` }} />
              <div className="rm-topics-grid">
                {phase.topics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    progress={progress[topic.id] ?? "todo"}
                    onToggle={() => onToggle(topic.id)}
                    phaseColor={phase.color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="rm-hint">
        💡 Click any topic to cycle: <strong>Todo → In Progress → Done</strong>. Progress is saved to your browser.
      </p>
    </div>
  );
}

export default function RoadmapPage() {
  const [selected, setSelected] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<Record<string, Status>>(loadProgress);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const toggle = (id: string) => {
    setProgress(prev => {
      const cur: Status = prev[id] ?? "todo";
      return { ...prev, [id]: nextStatus(cur) };
    });
  };

  const resetRoadmap = (roadmap: Roadmap) => {
    const ids = roadmap.phases.flatMap(p => p.topics.map(t => t.id));
    setProgress(prev => {
      const next = { ...prev };
      ids.forEach(id => delete next[id]);
      return next;
    });
  };

  const getCompletionPct = (roadmap: Roadmap) => {
    const all = roadmap.phases.flatMap(p => p.topics);
    const done = all.filter(t => progress[t.id] === "done").length;
    return Math.round((done / all.length) * 100);
  };

  return (
    <div className="rm-page">
      {/* Track Selector */}
      <div className="rm-sidebar">
        <div className="rm-sidebar-header">
          <Map size={18} style={{ color: "var(--accent)" }} />
          <span>Learning Roadmaps</span>
        </div>
        <p className="rm-sidebar-sub">
          7 curated tracks — click a topic to track your progress.
        </p>
        <div className="rm-track-list">
          {ROADMAPS.map(r => {
            const pct = getCompletionPct(r);
            const isActive = selected?.id === r.id;
            return (
              <button
                key={r.id}
                className={`rm-track-btn ${isActive ? "active" : ""}`}
                onClick={() => setSelected(r)}
                style={isActive ? { borderColor: r.color, background: `${r.color}12` } : {}}
              >
                <span className="rm-track-icon">{r.icon}</span>
                <div className="rm-track-info">
                  <div className="rm-track-name" style={isActive ? { color: r.color } : {}}>{r.label}</div>
                  <div className="rm-track-bar">
                    <div className="rm-track-fill" style={{ width: `${pct}%`, background: r.gradient }} />
                  </div>
                </div>
                <div className="rm-track-pct" style={pct > 0 ? { color: r.color } : {}}>
                  {pct > 0 ? `${pct}%` : ""}
                </div>
                <ChevronRight size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="rm-content">
        {selected ? (
          <RoadmapDetail
            roadmap={selected}
            progress={progress}
            onToggle={toggle}
            onReset={() => resetRoadmap(selected)}
          />
        ) : (
          <div className="rm-empty">
            <div className="rm-empty-icon">🗺️</div>
            <h2>Pick a Roadmap</h2>
            <p>Select a learning track from the left to get started.<br />Track your progress topic by topic.</p>
            <div className="rm-empty-grid">
              {ROADMAPS.map(r => (
                <button key={r.id} className="rm-empty-card" onClick={() => setSelected(r)}
                  style={{ borderColor: `${r.color}30` }}>
                  <span style={{ fontSize: 28 }}>{r.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginTop: 6 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                    {r.phases.reduce((a, p) => a + p.topics.length, 0)} topics · 4 phases
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
