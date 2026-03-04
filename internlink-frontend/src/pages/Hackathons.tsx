// src/pages/Hackathons.tsx
import { useState, ReactElement } from "react";
import "./Hackathons.css";

interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  theme: string;
  mode: "Online" | "Offline" | "Hybrid";
  location: string;
  prizePool: string;
  prizeNum: number;
  teamSize: string;
  deadline: string;
  startDate: string;
  endDate: string;
  duration: string;
  tags: string[];
  description: string;
  source: string;
  registrationUrl: string;
  match: number;
  participants: number;
  logoBg: string;
  icon: string;
  status: "upcoming" | "ongoing" | "ended";
}

const HACKATHONS: Hackathon[] = [
  {
    id: 1, title: "Smart India Hackathon 2025", organizer: "MoE — Govt of India",
    theme: "GovTech", mode: "Offline", location: "Pan India",
    prizePool: "₹10,00,000", prizeNum: 1000000, teamSize: "6",
    deadline: "Mar 15", startDate: "Apr 1", endDate: "Apr 2", duration: "36 hrs",
    tags: ["Any Stack", "Civic Tech", "AI"], description: "India's biggest student hackathon. Solve real government problem statements across 7 sectors.",
    source: "unstop", registrationUrl: "#", match: 91, participants: 50000,
    logoBg: "rgba(251,191,36,0.12)", icon: "🇮🇳", status: "upcoming",
  },
  {
    id: 2, title: "HackWithInfy 2025", organizer: "Infosys",
    theme: "Enterprise AI", mode: "Online", location: "Remote",
    prizePool: "₹3,00,000", prizeNum: 300000, teamSize: "2–4",
    deadline: "Mar 20", startDate: "Mar 28", endDate: "Mar 30", duration: "48 hrs",
    tags: ["Python", "ML", "React", "Cloud"], description: "Build enterprise-grade AI solutions for real Infosys client challenges.",
    source: "devfolio", registrationUrl: "#", match: 88, participants: 12000,
    logoBg: "rgba(6,182,212,0.12)", icon: "💼", status: "upcoming",
  },
  {
    id: 3, title: "HackBMU 7.0", organizer: "BML Munjal University",
    theme: "Open Innovation", mode: "Offline", location: "Gurugram",
    prizePool: "₹2,50,000", prizeNum: 250000, teamSize: "2–4",
    deadline: "Mar 10", startDate: "Mar 22", endDate: "Mar 23", duration: "24 hrs",
    tags: ["Web3", "AI/ML", "IoT", "FinTech"], description: "One of North India's biggest college hackathons. Open innovation theme with 6 tracks.",
    source: "devfolio", registrationUrl: "#", match: 84, participants: 3000,
    logoBg: "rgba(167,139,250,0.12)", icon: "🚀", status: "upcoming",
  },
  {
    id: 4, title: "ETHIndia 2025", organizer: "Devfolio + ETHGlobal",
    theme: "Web3 & Blockchain", mode: "Offline", location: "Bangalore",
    prizePool: "$500,000", prizeNum: 4000000, teamSize: "1–5",
    deadline: "Apr 5", startDate: "Apr 18", endDate: "Apr 20", duration: "36 hrs",
    tags: ["Solidity", "Ethereum", "DeFi", "ZK"], description: "Asia's largest Ethereum hackathon. Build the next generation of decentralized applications.",
    source: "devfolio", registrationUrl: "#", match: 72, participants: 8000,
    logoBg: "rgba(59,130,246,0.12)", icon: "⛓️", status: "upcoming",
  },
  {
    id: 5, title: "Flipkart Grid 6.0", organizer: "Flipkart",
    theme: "E-Commerce Tech", mode: "Hybrid", location: "Bangalore",
    prizePool: "₹5,00,000 + PPO", prizeNum: 500000, teamSize: "2–3",
    deadline: "Mar 25", startDate: "May 1", endDate: "May 2", duration: "48 hrs",
    tags: ["System Design", "ML", "Backend", "Data"], description: "Flipkart's flagship tech challenge. Top performers get Pre-Placement Offers.",
    source: "unstop", registrationUrl: "#", match: 86, participants: 30000,
    logoBg: "rgba(16,185,129,0.12)", icon: "🛒", status: "upcoming",
  },
  {
    id: 6, title: "Codeforces Global Round", organizer: "Codeforces",
    theme: "Competitive Programming", mode: "Online", location: "Remote",
    prizePool: "$5,000", prizeNum: 420000, teamSize: "1",
    deadline: "Apr 12", startDate: "Apr 12", endDate: "Apr 12", duration: "3 hrs",
    tags: ["DSA", "Algorithms", "C++", "Python"], description: "Global competitive programming contest. Top 200 finishers get rating boosts and prizes.",
    source: "devpost", registrationUrl: "#", match: 78, participants: 15000,
    logoBg: "rgba(244,63,94,0.12)", icon: "🏆", status: "ongoing",
  },
  {
    id: 7, title: "Google Solution Challenge 2025", organizer: "Google Developer Student Clubs",
    theme: "UN Sustainable Development Goals", mode: "Online", location: "Remote",
    prizePool: "$15,000 + Google Mentorship", prizeNum: 1260000, teamSize: "3–4",
    deadline: "Mar 31", startDate: "Jan 1", endDate: "Apr 30", duration: "3 months",
    tags: ["Flutter", "Firebase", "GCP", "AI"], description: "Build an app that solves a real-world problem aligned with UN SDGs using Google tech.",
    source: "devpost", registrationUrl: "#", match: 82, participants: 100000,
    logoBg: "rgba(59,130,246,0.08)", icon: "🌱", status: "ongoing",
  },
  {
    id: 8, title: "Myntra HackerRamp 2025", organizer: "Myntra",
    theme: "Fashion Tech", mode: "Online", location: "Remote",
    prizePool: "₹1,50,000 + Internship", prizeNum: 150000, teamSize: "2–4",
    deadline: "Feb 28", startDate: "Mar 10", endDate: "Mar 11", duration: "24 hrs",
    tags: ["React", "Node.js", "ML", "UI/UX"], description: "Build fashion-tech solutions. Winners get fast-tracked to Myntra internship interviews.",
    source: "unstop", registrationUrl: "#", match: 79, participants: 8000,
    logoBg: "rgba(251,191,36,0.08)", icon: "👗", status: "ended",
  },
];

const THEMES = ["All", "AI/ML", "Web3", "GovTech", "FinTech", "Open Innovation", "Enterprise AI", "E-Commerce Tech"];
const MODES  = ["All", "Online", "Offline", "Hybrid"];
const STATUS = ["All", "Upcoming", "Ongoing", "Ended"];

function RegisterBtn({ url }: { url: string }): ReactElement {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      className={"hack-register-btn" + (clicked ? " registered" : "")}
      onClick={(e) => { e.stopPropagation(); setClicked(true); window.open(url, "_blank"); }}
    >
      {clicked ? "✓ Registered" : "Register"}
    </button>
  );
}

export default function Hackathons(): ReactElement {
  const [themeFilter, setThemeFilter] = useState("All");
  const [modeFilter,  setModeFilter]  = useState("All");
  const [statusFilter,setStatusFilter]= useState("All");
  const [sort,        setSort]        = useState("match");
  const [expandedId,  setExpandedId]  = useState<number | null>(null);

  const filtered = HACKATHONS
    .filter((h) => themeFilter === "All" || h.theme === themeFilter)
    .filter((h) => modeFilter  === "All" || h.mode  === modeFilter)
    .filter((h) => statusFilter=== "All" || h.status === statusFilter.toLowerCase())
    .sort((a, b) =>
      sort === "match"  ? b.match    - a.match    :
      sort === "prize"  ? b.prizeNum - a.prizeNum :
      sort === "deadline" ? a.deadline.localeCompare(b.deadline) : 0
    );

  return (
    <>
      {/* ── Header ── */}
      <div className="hack-header">
        <div>
          <h1>Hackathons <span className="ai-badge">✨ AI Matched</span></h1>
          <p>Competitions, challenges and hackathons matched to your skill set</p>
        </div>
        <div className="hack-header-stats">
          <div className="hack-stat"><span>{HACKATHONS.filter(h => h.status === "upcoming").length}</span>Upcoming</div>
          <div className="hack-stat"><span style={{ color: "var(--green)" }}>{HACKATHONS.filter(h => h.status === "ongoing").length}</span>Live Now</div>
          <div className="hack-stat"><span style={{ color: "var(--gold)" }}>{filtered.length}</span>Showing</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="hack-filters">
        <div className="hack-filter-row">
          <span className="hack-filter-label">Theme:</span>
          {THEMES.map((t) => (
            <button key={t} className={"filter-btn" + (themeFilter === t ? " active" : "")} onClick={() => setThemeFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="hack-filter-row">
          <span className="hack-filter-label">Mode:</span>
          {MODES.map((m) => (
            <button key={m} className={"filter-btn" + (modeFilter === m ? " active" : "")} onClick={() => setModeFilter(m)}>{m}</button>
          ))}
          <span className="hack-filter-label" style={{ marginLeft: 16 }}>Status:</span>
          {STATUS.map((s) => (
            <button key={s} className={"filter-btn" + (statusFilter === s ? " active" : "")} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
          <select className="sort-select" style={{ marginLeft: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="match">Sort: Best Match</option>
            <option value="prize">Sort: Highest Prize</option>
            <option value="deadline">Sort: Deadline</option>
          </select>
        </div>
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="hack-empty"><div>🔍</div>No hackathons match your filters</div>
      ) : (
        <div className="hack-list">
          {filtered.map((h) => {
            const isExpanded = expandedId === h.id;
            return (
              <div
                key={h.id}
                className={"hack-card" + (isExpanded ? " expanded" : "") + (h.status === "ongoing" ? " live" : h.status === "ended" ? " ended" : "")}
                onClick={() => setExpandedId(isExpanded ? null : h.id)}
              >
                {/* ── Main row ── */}
                <div className="hack-card-row">
                  <div className="hack-logo" style={{ background: h.logoBg }}>{h.icon}</div>

                  <div className="hack-info">
                    <div className="hack-title">
                      {h.title}
                      {h.status === "ongoing" && <span className="hack-live-dot" />}
                    </div>
                    <div className="hack-organizer">{h.organizer} · {h.location}</div>
                  </div>

                  <div className="hack-tags">
                    <span className={"hack-mode-tag " + (h.mode === "Online" ? "remote" : h.mode === "Offline" ? "onsite" : "hybrid")}>
                      {h.mode}
                    </span>
                    <span className={"hack-status-tag " + h.status}>{h.status === "ongoing" ? "🔴 Live" : h.status === "ended" ? "Ended" : "Upcoming"}</span>
                    {h.tags.slice(0, 2).map((t) => (
                      <span key={t} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>

                  <div className="hack-prize">{h.prizePool}</div>

                  <div className="hack-meta-col">
                    <div className="hack-deadline">⏰ {h.deadline}</div>
                    <div className="hack-team">👥 {h.teamSize}</div>
                  </div>

                  <div className="hack-match">{h.match}%<span>match</span></div>

                  <span className="hack-chevron">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* ── Expanded ── */}
                {isExpanded && (
                  <div className="hack-expanded">
                    <div className="hack-expanded-body">
                      <p className="hack-desc">{h.description}</p>
                      <div className="hack-all-tags">
                        {h.tags.map((t) => (
                          <span key={t} className="chip" style={{ fontSize: 11, padding: "3px 10px" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="hack-expanded-footer">
                      <div className="hack-expanded-meta">
                        <span>📅 {h.startDate} → {h.endDate}</span>
                        <span>⏱ {h.duration}</span>
                        <span>👥 {h.participants.toLocaleString()} participants</span>
                        <span className="hack-source">via {h.source}</span>
                      </div>
                      <RegisterBtn url={h.registrationUrl} />
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