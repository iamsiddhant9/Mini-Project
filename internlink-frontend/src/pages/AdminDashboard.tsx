import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import './AdminDashboard.css';
import {
  LayoutDashboard, Clock, Users, Briefcase, LogOut,
  GraduationCap, Building2, AlertCircle, CheckCircle, Send, RefreshCw,
  X, ExternalLink, Github, Linkedin, Globe,
} from "lucide-react";

import * as apiSvc from "../services/api";


// ────────────────────────────────────────────────────────
//  User Detail Drawer
// ────────────────────────────────────────────────────────
function UserDetailDrawer({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiSvc.admin.getUserDetail(userId).then((res: any) => {
      setDetail(res);
      setLoading(false);
    });
  }, [userId]);

  const statusColor: Record<string, string> = {
    Applied:   "#3b82f6",
    Interview: "#f59e0b",
    Offer:     "#10b981",
    Rejected:  "#ef4444",
  };

  const initials = (name: string) =>
    name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <>
      {/* Backdrop */}
      <div className="user-detail-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="user-detail-drawer">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
            Loading…
          </div>
        ) : detail?.error ? (
          <div style={{ padding: 32, color: "#ef4444" }}>{detail.error}</div>
        ) : (
          <>
            {/* ── Drawer Header ── */}
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div className="drawer-avatar">
                  {initials(detail.profile.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#f0f4ff", fontFamily: "Syne, sans-serif" }}>
                    {detail.profile.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail.profile.email}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span className={`role-badge ${detail.profile.role}`}>{detail.profile.role}</span>
                    {!detail.profile.is_active && <span className="status-badge inactive">Inactive</span>}
                    {detail.profile.role === "recruiter" && !detail.profile.is_approved && (
                      <span className="status-badge pending">Pending</span>
                    )}
                    {detail.profile.is_verified && (
                      <span className="status-badge active">Verified</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={onClose}><X size={16} /></button>
            </div>

            {/* ── Stats Row ── */}
            <div className="drawer-stats-row">
              {[
                { label: "Applications", val: detail.stats.total_applications },
                { label: "Saved",        val: detail.stats.total_saved },
                { label: "Profile",      val: `${detail.profile.profile_strength ?? 0}%` },
                { label: "Top Match",    val: `${detail.stats.top_match_score ?? 0}%` },
              ].map(s => (
                <div key={s.label} className="drawer-stat">
                  <div className="drawer-stat-val">{s.val}</div>
                  <div className="drawer-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="drawer-body">
              {/* ── Profile Info ── */}
              <div className="drawer-section">
                <div className="drawer-section-title">Profile</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#94a3b8" }}>
                  {detail.profile.university && (
                    <div><span style={{ color: "#64748b" }}>University: </span>{detail.profile.university}</div>
                  )}
                  {detail.profile.branch && (
                    <div><span style={{ color: "#64748b" }}>Branch: </span>{detail.profile.branch}{detail.profile.year ? `, Year ${detail.profile.year}` : ""}</div>
                  )}
                  {detail.profile.bio && (
                    <div style={{ color: "#94a3b8", lineHeight: 1.5 }}>{detail.profile.bio}</div>
                  )}
                  {detail.profile.created_at && (
                    <div><span style={{ color: "#64748b" }}>Joined: </span>
                      {new Date(detail.profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    {detail.profile.github_url && (
                      <a href={detail.profile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <Github size={13} /> GitHub <ExternalLink size={10} />
                      </a>
                    )}
                    {detail.profile.linkedin_url && (
                      <a href={detail.profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <Linkedin size={13} /> LinkedIn <ExternalLink size={10} />
                      </a>
                    )}
                    {detail.profile.portfolio_url && (
                      <a href={detail.profile.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                        <Globe size={13} /> Portfolio <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Skills ── */}
              {detail.skills.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">Skills ({detail.skills.length})</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {detail.skills.map((sk: any, i: number) => (
                      <span key={i} className="skill-pill" style={{ borderColor: sk.color || "#a78bfa", color: sk.color || "#a78bfa" }}>
                        {sk.name}
                        {sk.level != null && <span style={{ opacity: 0.6, marginLeft: 4 }}>{sk.level}%</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Applications ── */}
              <div className="drawer-section">
                <div className="drawer-section-title">
                  Applications ({detail.stats.total_applications})
                </div>
                {detail.applications.length === 0 ? (
                  <div style={{ color: "#3d4a6b", fontSize: 13 }}>No applications yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detail.applications.map((app: any) => (
                      <div key={app.id} className="drawer-app-row">
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.internship_title}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {app.company} · {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>
                        <span className="app-status-chip" style={{
                          background: `${statusColor[app.status] || "#64748b"}18`,
                          color:       statusColor[app.status] || "#64748b",
                          borderColor: `${statusColor[app.status] || "#64748b"}40`,
                        }}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Saved Internships ── */}
              <div className="drawer-section">
                <div className="drawer-section-title">
                  Saved Internships ({detail.stats.total_saved})
                </div>
                {detail.saved.length === 0 ? (
                  <div style={{ color: "#3d4a6b", fontSize: 13 }}>No saved internships.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detail.saved.map((sv: any) => (
                      <div key={sv.id} className="drawer-app-row">
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sv.internship_title}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {sv.company} · {sv.saved_at ? new Date(sv.saved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}


// ────────────────────────────────────────────────────────
//  Admin Dashboard
// ────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]                 = useState<"overview"|"users"|"recruiters"|"internships">("overview");
  const [stats, setStats]             = useState<any>(null);
  const [users, setUsers]             = useState<any[]>([]);
  const [pending, setPending]         = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("");

  const [fetching,  setFetching]  = useState(false);
  const [fetchMsg,  setFetchMsg]  = useState("");

  // Detail drawer
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  useEffect(() => {
    apiSvc.admin.getStats().then(setStats);
    apiSvc.admin.getPendingRecruiters().then(setPending);
  }, []);


  useEffect(() => {
    if (tab === "users") {
      apiSvc.admin.getUsers({ role: roleFilter, search }).then(setUsers);
    }
    if (tab === "internships") apiSvc.admin.getInternships().then(setInternships);
  }, [tab, roleFilter, search]);


  const approveRecruiter = async (userId: number, action: "approve"|"reject") => {
    await apiSvc.admin.approveRecruiter(userId, action);
    apiSvc.admin.getPendingRecruiters().then(setPending);
    apiSvc.admin.getStats().then(setStats);
  };


  const toggleUser = async (userId: number) => {
    await apiSvc.admin.toggleUser(userId);
    apiSvc.admin.getUsers({ role: roleFilter }).then(setUsers);
  };


  const fetchJobs = async () => {
    setFetching(true);
    setFetchMsg("");
    const res = await apiSvc.jobs.fetchAll();
    setFetching(false);
    setFetchMsg(res.message || "Done");
    apiSvc.admin.getStats().then(setStats);
    setTimeout(() => setFetchMsg(""), 5000);
  };




  return (
    <div className="admin-page">

      {/* Detail Drawer */}
      {detailUserId !== null && (
        <UserDetailDrawer userId={detailUserId} onClose={() => setDetailUserId(null)} />
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo"><LayoutDashboard size={18} /> Admin Panel</div>
        {[
          { key: "overview",    icon: <LayoutDashboard size={15} />, label: "Overview",    badge: pending.length > 0 ? pending.length : null },
          { key: "recruiters",  icon: <Clock size={15} />,           label: "Pending",     badge: pending.length > 0 ? pending.length : null },
          { key: "users",       icon: <Users size={15} />,           label: "All Users",   badge: null },
          { key: "internships", icon: <Briefcase size={15} />,       label: "Internships", badge: null },
        ].map(item => (
          <button key={item.key} onClick={() => setTab(item.key as any)} className={`admin-nav-btn${tab === item.key ? " active" : ""}`}>
            {item.icon} {item.label}
            {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
          </button>
        ))}
        <button onClick={logout} className="admin-logout-btn"><LogOut size={14} /> Logout</button>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Hey {user?.name}</h1>
          <p>Platform overview and management</p>
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div className="admin-stats-grid">
              {[
                { label: "Students",          val: stats?.students           ?? 0, icon: <GraduationCap size={22} />, color: "#3b82f6" },
                { label: "Recruiters",         val: stats?.recruiters         ?? 0, icon: <Building2 size={22} />,     color: "#f59e0b" },
                { label: "Pending Approval",   val: stats?.pending_recruiters ?? 0, icon: <Clock size={22} />,         color: "#ef4444" },
                { label: "Active Internships", val: stats?.active_internships ?? 0, icon: <Briefcase size={22} />, color: "#10b981" },
                { label: "Applications",       val: stats?.total_applications ?? 0, icon: <Send size={22} />,     color: "#06b6d4" },
              ].map(s => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-icon">{s.icon}</div>
                  <div className="admin-stat-value" style={{ color: s.color }}>{s.val}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {pending.length > 0 ? (
              <div className="admin-pending-alert">
                <h3><AlertCircle size={15} style={{ display: "inline", marginRight: 6 }} />{pending.length} Recruiter{pending.length > 1 ? "s" : ""} Awaiting Approval</h3>
                {pending.map(r => (
                  <div key={r.id} className="admin-pending-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div className="admin-card-meta">{r.email} · Applied {new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approveRecruiter(r.id, "approve")} className="btn-approve"><CheckCircle size={13} style={{ marginRight: 4 }} /> Approve</button>
                      <button onClick={() => approveRecruiter(r.id, "reject")}  className="btn-reject"><AlertCircle size={13} style={{ marginRight: 4 }} /> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-all-good"><CheckCircle size={14} style={{ marginRight: 6 }} /> No pending recruiter approvals</div>
            )}

            {/* Fetch Internships */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={fetchJobs} disabled={fetching} style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: fetching ? "rgba(59,130,246,0.2)" : "linear-gradient(135deg,#3b82f6,#06b6d4)",
                  color: fetching ? "#64748b" : "#fff", cursor: fetching ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 700, fontFamily: "DM Sans, sans-serif",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <RefreshCw size={14} style={fetching ? { animation: "spin 1s linear infinite" } : {}} />
                  {fetching ? "Fetching Jobs..." : "Fetch Internships from Adzuna"}
                </button>
                {fetchMsg && <span style={{ fontSize: 13, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={13} /> {fetchMsg}</span>}
              </div>
            </div>
          </div>
        )}


        {/* Pending Recruiters */}
        {tab === "recruiters" && (
          <div>
            <h2 className="admin-section-title">Pending Recruiter Approvals ({pending.length})</h2>
            {pending.length === 0 && <div className="admin-empty">No pending approvals</div>}
            {pending.map(r => (
              <div key={r.id} className="admin-card">
                <div>
                  <div className="admin-card-title">{r.name}</div>
                  <div className="admin-card-meta">{r.email}</div>
                  <div className="admin-card-meta">Registered {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setDetailUserId(r.id)} className="btn-detail">View Details</button>
                  <button onClick={() => approveRecruiter(r.id, "approve")} className="btn-approve"><CheckCircle size={13} style={{ marginRight: 4 }} /> Approve</button>
                  <button onClick={() => approveRecruiter(r.id, "reject")}  className="btn-reject"><AlertCircle size={13} style={{ marginRight: 4 }} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Users */}
        {tab === "users" && (
          <div>
            <div className="admin-search-row">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="admin-search-input" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="admin-role-select">
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="admin-results-count">{users.length} users found</div>
            {users.map(u => (
              <div key={u.id} className="admin-card">
                <div>
                  <div className="admin-card-title">
                    {u.name}
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                    {!u.is_active && <span className="status-badge inactive">Inactive</span>}
                    {u.role === "recruiter" && !u.is_approved && <span className="status-badge pending">Pending</span>}
                  </div>
                  <div className="admin-card-meta">{u.email} · {u.university || "—"} · Year {u.year || "—"}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setDetailUserId(u.id)} className="btn-detail">View Details</button>
                  {u.role === "recruiter" && !u.is_approved && (
                    <button onClick={() => approveRecruiter(u.id, "approve")} className="btn-approve">Approve</button>
                  )}
                  <button onClick={() => toggleUser(u.id)} className={u.is_active ? "btn-deactivate" : "btn-activate"}>
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Internships */}
        {tab === "internships" && (
          <div>
            <h2 className="admin-section-title">All Internships ({internships.length})</h2>
            {internships.map(i => (
              <div key={i.id} className="admin-card">
                <div>
                  <div className="admin-card-title">
                    {i.title}
                    <span className={`status-badge ${i.is_active ? "active" : "inactive"}`}>
                      {i.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="admin-card-meta">
                    {i.company} · {i.mode} · {i.applicant_count} applicants · Posted by {i.posted_by_name || "Scraper"}
                  </div>
                </div>
                <div className="admin-card-meta">Deadline: {i.deadline}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}