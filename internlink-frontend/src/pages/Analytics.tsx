// src/pages/Analytics.tsx
import { ReactElement } from "react";
import './Analytics.css';

  

const MONTHLY = [
  { label: "Sep", val: 2, h: 28 }, { label: "Oct", val: 3, h: 38 }, { label: "Nov", val: 4, h: 50 },
  { label: "Dec", val: 2, h: 28 }, { label: "Jan", val: 6, h: 75 }, { label: "Feb", val: 14, h: 140 },
];

const STATUS_DONUT = [
  { label: "Applied", color: "var(--accent)", pct: 58 },
  { label: "Interview", color: "var(--gold)", pct: 25 },
  { label: "Offer", color: "var(--green)", pct: 8 },
  { label: "Rejected", color: "var(--red)", pct: 9 },
];

const MATCH_TRENDS = [
  { company: "Google DeepMind", match: 96 },
  { company: "Amazon AWS", match: 91 },
  { company: "Microsoft Research", match: 85 },
  { company: "Swiggy", match: 88 },
  { company: "Zerodha", match: 82 },
];

// Simple donut using conic-gradient
function Donut(): ReactElement {
  const gradient = `conic-gradient(
    var(--accent) 0% 58%,
    var(--gold) 58% 83%,
    var(--green) 83% 91%,
    var(--red) 91% 100%
  )`;
  return (
    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: gradient }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 60, height: 60, borderRadius: "50%", background: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
      }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>14</span>
        <span style={{ fontSize: 8, color: "var(--muted)" }}>total</span>
      </div>
    </div>
  );
}

export default function Analytics(): ReactElement {
  return (
    <>
     
      <div className="analytics-header">
        <h1>Analytics 📊</h1>
        <p>Visualize your internship search performance over time</p>
      </div>

      <div className="analytics-stats">
        {[
          { val: "14", label: "Total Applications", change: "↑ 5 this week", cls: "up", color: "var(--accent)" },
          { val: "96%", label: "Best Match Score", change: "↑ 4%", cls: "up", color: "var(--green)" },
          { val: "6", label: "Interview Calls", change: "↑ 2 new", cls: "up", color: "var(--gold)" },
          { val: "43%", label: "Response Rate", change: "↓ 2%", cls: "down", color: "var(--accent3)" },
        ].map((s) => (
          <div className="a-stat" key={s.label}>
            <div className="a-stat-val" style={{ color: s.color }}>{s.val}</div>
            <div className="a-stat-label">{s.label}</div>
            <span className={`a-stat-change ${s.cls}`}>{s.change}</span>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Applications over time */}
        <div className="chart-card">
          <h3>Applications Over Time</h3>
          <div className="chart-sub">Monthly application count — Feb is current month</div>
          <div className="bar-chart">
            {MONTHLY.map((m, i) => (
              <div className="b-col" key={m.label}>
                <div className="b-val">{m.val}</div>
                <div className="b-bar" style={{
                  height: m.h,
                  background: i === MONTHLY.length - 1
                    ? "linear-gradient(to top,var(--accent),var(--accent2))"
                    : "var(--surface2)",
                  animationDelay: `${i * 0.08}s`,
                }} />
                <div className="b-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Application status donut */}
        <div className="chart-card">
          <h3>Application Status</h3>
          <div className="chart-sub">Breakdown of all applications</div>
          <div className="donut-wrap">
            <Donut />
            <div className="donut-legend">
              {STATUS_DONUT.map((d) => (
                <div className="legend-item" key={d.label}>
                  <div className="legend-dot" style={{ background: d.color }} />
                  <span style={{ color: "var(--muted)" }}>{d.label}</span>
                  <span style={{ fontWeight: 700, marginLeft: "auto", color: "var(--text)" }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-grid2">
        {/* Match scores */}
        <div className="chart-card">
          <h3>Top Match Scores</h3>
          <div className="chart-sub">Your AI-matched internships this month</div>
          {MATCH_TRENDS.map((t) => (
            <div className="trend-row" key={t.company}>
              <div className="trend-company">{t.company}</div>
              <div className="trend-bar-track">
                <div className="trend-bar-fill" style={{ width: `${t.match}%` }} />
              </div>
              <div className="trend-match">{t.match}%</div>
            </div>
          ))}
        </div>

        {/* Profile score over time */}
        <div className="chart-card">
          <h3>Profile Strength Over Time</h3>
          <div className="chart-sub">Your profile has grown 12% in 6 weeks</div>
          <svg viewBox="0 0 240 120" className="line-chart" style={{ marginTop: 8 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0,30,60,90,120].map((y) => (
              <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}
            {/* Area fill */}
            <path d="M0,110 L40,100 L80,90 L120,80 L160,55 L200,40 L240,28 L240,120 L0,120Z"
              fill="url(#lineGrad)" />
            {/* Line */}
            <polyline
              points="0,110 40,100 80,90 120,80 160,55 200,40 240,28"
              fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }}
            />
            {/* Dots */}
            {[[0,110],[40,100],[80,90],[120,80],[160,55],[200,40],[240,28]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
            ))}
            {/* Labels */}
            {["W1","W2","W3","W4","W5","W6","W7"].map((l,i) => (
              <text key={l} x={i*40} y="118" fontSize="8" fill="var(--muted)" textAnchor="middle">{l}</text>
            ))}
          </svg>
        </div>
      </div>
    </>
  );
}