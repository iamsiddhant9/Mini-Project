import { useState, useEffect, ReactElement } from "react";
import { BarChart2, TrendingUp, Target, Award, Briefcase, Clock, Loader2 } from "lucide-react";
import { applications as applicationsApi, user as userApi } from "../services/api";
import './Analytics.css';

function Donut({ total, slices }: { total: number; slices: { pct: number; color: string }[] }): ReactElement {
  let cum = 0;
  const gradient = slices.map(s => {
    const from = cum; cum += s.pct;
    return `${s.color} ${from}% ${cum}%`;
  }).join(", ");
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <div style={{ width: 110, height: 110, borderRadius: "50%", background: total === 0 ? "var(--border)" : `conic-gradient(${gradient})` }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 68, height: 68, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{total}</span>
        <span style={{ fontSize: 8, color: "var(--muted)" }}>total</span>
      </div>
    </div>
  );
}

function StatCard({ val, label, sub, color, icon }: { val: string; label: string; sub: string; color: string; icon: ReactElement }): ReactElement {
  return (
    <div className="a-stat">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ padding: 8, borderRadius: 10, background: `${color}15`, color }}>{icon}</div>
        <span className="a-stat-change up">{sub}</span>
      </div>
      <div className="a-stat-val" style={{ color }}>{val}</div>
      <div className="a-stat-label">{label}</div>
    </div>
  );
}

export default function Analytics(): ReactElement {
  const [stats,     setStats]     = useState<any>(null);
  const [skills,    setSkills]    = useState<any[]>([]);
  const [appList,   setAppList]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      applicationsApi.stats(),
      userApi.getSkills(),
      applicationsApi.list(),
    ]).then(([s, sk, al]) => {
      setStats(s);
      if (Array.isArray(sk)) setSkills(sk.slice(0, 6));
      const apps = al?.applications ?? al ?? [];
      if (Array.isArray(apps)) setAppList(apps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: "var(--muted)" }}>
      <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading analytics…
    </div>
  );

  const total     = stats?.total     ?? 0;
  const applied   = stats?.pending   ?? 0;
  const interview = stats?.interview ?? 0;
  const offer     = stats?.offer     ?? 0;
  const rejected  = stats?.rejected  ?? 0;
  const topMatch  = stats?.top_match_score ?? 0;

  // Derived
  const responseRate   = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
  const offerRate      = total > 0 ? Math.round((offer / total) * 100) : 0;
  const interviewRate  = total > 0 ? Math.round((interview / total) * 100) : 0;

  // Status breakdown for bar chart
  const breakdown = [
    { label: "Applied",    val: applied,   color: "#60a5fa" },
    { label: "Shortlisted",val: appList.filter((a: any) => a.status === "Shortlisted").length, color: "#a78bfa" },
    { label: "Interview",  val: interview, color: "#fbbf24" },
    { label: "Offer",      val: offer,     color: "#34d399" },
    { label: "Rejected",   val: rejected,  color: "#f87171" },
  ];
  const maxBar = Math.max(...breakdown.map(b => b.val), 1);

  // Donut slices
  const donutSlices = [
    { pct: total > 0 ? Math.round((applied   / total) * 100) : 0, color: "#60a5fa" },
    { pct: total > 0 ? Math.round((interview / total) * 100) : 0, color: "#fbbf24" },
    { pct: total > 0 ? Math.round((offer     / total) * 100) : 0, color: "#34d399" },
    { pct: total > 0 ? Math.round((rejected  / total) * 100) : 0, color: "#f87171" },
  ];

  // Applications per category from real list
  const catCounts: Record<string, number> = {};
  appList.forEach((a: any) => { if (a.category) catCounts[a.category] = (catCounts[a.category] ?? 0) + 1; });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat  = Math.max(...topCats.map(c => c[1]), 1);

  return (
    <>
      <div className="analytics-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}><BarChart2 size={26} />Analytics</h1>
        <p>Your internship search performance at a glance</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="analytics-stats">
        <StatCard val={String(total)}        label="Total Applications" sub="Live"            color="#60a5fa" icon={<Briefcase size={16} />} />
        <StatCard val={`${Math.round(topMatch)}%`} label="Best Match Score" sub="AI Powered"  color="#a78bfa" icon={<Target size={16} />} />
        <StatCard val={`${responseRate}%`}   label="Response Rate"      sub={`${interview + offer} responses`} color="#fbbf24" icon={<TrendingUp size={16} />} />
        <StatCard val={`${offerRate}%`}      label="Offer Rate"         sub={offer > 0 ? `${offer} offer${offer > 1 ? "s" : ""}` : "Keep going!"} color="#34d399" icon={<Award size={16} />} />
      </div>

      <div className="analytics-grid">
        {/* ── Bar chart — applications by stage ── */}
        <div className="chart-card">
          <h3>Applications by Stage</h3>
          <div className="chart-sub">How your applications are distributed</div>
          {total === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 16 }}>No applications yet — start applying!</div>
          ) : (
            <div className="bar-chart" style={{ alignItems: "flex-end", height: 160 }}>
              {breakdown.map((b, i) => (
                <div className="b-col" key={b.label}>
                  <div className="b-val" style={{ color: b.color }}>{b.val}</div>
                  <div className="b-bar" style={{
                    height: Math.max(4, Math.round((b.val / maxBar) * 130)),
                    background: b.color,
                    boxShadow: `0 0 8px ${b.color}40`,
                    animationDelay: `${i * 0.08}s`,
                  }} />
                  <div className="b-label">{b.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Donut ── */}
        <div className="chart-card">
          <h3>Application Status</h3>
          <div className="chart-sub">Breakdown of all applications</div>
          {total === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 16 }}>No applications yet.</div>
          ) : (
            <div className="donut-wrap">
              <Donut total={total} slices={donutSlices} />
              <div className="donut-legend">
                {[
                  { label: "Applied",   color: "#60a5fa", val: applied },
                  { label: "Interview", color: "#fbbf24", val: interview },
                  { label: "Offer",     color: "#34d399", val: offer },
                  { label: "Rejected",  color: "#f87171", val: rejected },
                ].map(d => (
                  <div className="legend-item" key={d.label}>
                    <div className="legend-dot" style={{ background: d.color }} />
                    <span style={{ color: "var(--muted)" }}>{d.label}</span>
                    <span style={{ fontWeight: 700, marginLeft: "auto", color: "var(--text)" }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="analytics-grid2">
        {/* ── Skill proficiency ── */}
        <div className="chart-card">
          <h3>Skill Proficiency</h3>
          <div className="chart-sub">Your added skills and their levels</div>
          {skills.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 12 }}>
              Add skills in Skill Analysis to see this chart.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {skills.map((s: any) => (
                <div key={s.name} className="trend-row">
                  <div className="trend-company">{s.name}</div>
                  <div className="trend-bar-track">
                    <div className="trend-bar-fill" style={{ width: `${s.level ?? 50}%`, background: "var(--accent)" }} />
                  </div>
                  <div className="trend-match">{s.level ?? 50}%</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top categories applied ── */}
        <div className="chart-card">
          <h3>Top Categories Applied</h3>
          <div className="chart-sub">Which roles you apply to most</div>
          {topCats.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 12 }}>
              Apply to internships to see category breakdown.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {topCats.map(([cat, cnt], i) => {
                const colors = ["#60a5fa","#a78bfa","#fbbf24","#34d399","#f87171"];
                return (
                  <div key={cat} className="trend-row">
                    <div className="trend-company">{cat}</div>
                    <div className="trend-bar-track">
                      <div className="trend-bar-fill" style={{ width: `${Math.round((cnt / maxCat) * 100)}%`, background: colors[i % colors.length] }} />
                    </div>
                    <div className="trend-match" style={{ color: colors[i % colors.length] }}>{cnt}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conversion funnel */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>Conversion Funnel</div>
            {[
              { label: "Applied → Interview", rate: interviewRate, color: "#fbbf24" },
              { label: "Interview → Offer",   rate: interview > 0 ? Math.round((offer / interview) * 100) : 0, color: "#34d399" },
              { label: "Overall Offer Rate",  rate: offerRate, color: "#a78bfa" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", width: 140, flexShrink: 0 }}>{f.label}</div>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${f.rate}%`, background: f.color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: f.color, width: 36, textAlign: "right" }}>{f.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}