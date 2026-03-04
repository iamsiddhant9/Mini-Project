// src/pages/Leaderboard.tsx
import { ReactElement } from "react";
import { leaderboard } from "../data/mock";
import './Leaderboard.css';


export default function Leaderboard(): ReactElement {
  const top3 = leaderboard.slice(0, 3);
  const rest  = leaderboard.slice(3);

  const rankClass = (r: number) => r === 1 ? "top1" : r === 2 ? "top2" : r === 3 ? "top3" : "";
  const rankEmoji = (r: number) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd visual order

  return (
    <>
     
      <div className="lb-header">
        <h1>Leaderboard 🏆</h1>
        <p>See how you rank among your peers in internship applications</p>
      </div>

      {/* Podium */}
      <div className="lb-podium">
        {podiumOrder.map((entry, i) => {
          const isFirst = entry.rank === 1;
          const cls = isFirst ? "first" : entry.rank === 2 ? "second" : "third";
          return (
            <div key={entry.rank} className={`podium-card ${cls}`} style={{ marginTop: isFirst ? 0 : 20 }}>
              <div className="podium-rank">{rankEmoji(entry.rank)}</div>
              <div className="podium-avatar" style={{ background: entry.avatarGradient }}>{entry.initials}</div>
              <div className="podium-name">{entry.name} {entry.isCurrentUser && <span className="lb-you">You</span>}</div>
              <div className="podium-sub">{entry.branch} · {entry.year}</div>
              <div className="podium-stats">
                <div className="podium-stat">
                  <div className="podium-stat-val" style={{ color: "var(--accent)" }}>{entry.applications}</div>
                  <div className="podium-stat-label">Apps</div>
                </div>
                <div className="podium-stat">
                  <div className="podium-stat-val" style={{ color: "var(--gold)" }}>{entry.interviews}</div>
                  <div className="podium-stat-label">Interviews</div>
                </div>
                <div className="podium-stat">
                  <div className="podium-stat-val" style={{ color: "var(--green)" }}>{entry.offers}</div>
                  <div className="podium-stat-label">Offers</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="lb-table">
        <div className="lb-table-header">
          <div>Rank</div>
          <div>Student</div>
          <div style={{ textAlign: "right" }}>Apps</div>
          <div style={{ textAlign: "right" }}>Interviews</div>
          <div style={{ textAlign: "right" }}>Offers</div>
          <div style={{ textAlign: "right" }}>Profile</div>
        </div>
        {leaderboard.map((entry) => (
          <div key={entry.rank} className={`lb-row${entry.isCurrentUser ? " me" : ""}`}>
            <div className={`lb-rank ${rankClass(entry.rank)}`}>{rankEmoji(entry.rank)}</div>
            <div className="lb-user">
              <div className="lb-avatar" style={{ background: entry.avatarGradient }}>{entry.initials}</div>
              <div>
                <div className="lb-name">
                  {entry.name}
                  {entry.isCurrentUser && <span className="lb-you">You</span>}
                </div>
                <div className="lb-sub">{entry.branch} · {entry.year}</div>
              </div>
            </div>
            <div className="lb-val" style={{ color: "var(--accent)" }}>{entry.applications}</div>
            <div className="lb-val" style={{ color: "var(--gold)" }}>{entry.interviews}</div>
            <div className="lb-val" style={{ color: "var(--green)" }}>{entry.offers}</div>
            <div className="lb-val">
              <div className="lb-strength-wrap">
                <div className="lb-strength-bar">
                  <div className="lb-strength-fill" style={{ width: `${entry.profileStrength}%` }} />
                </div>
                <span style={{ color: "var(--accent2)", fontSize: 12, fontWeight: 700 }}>{entry.profileStrength}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}