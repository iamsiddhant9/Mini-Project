import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import './AdminDashboard.css';
import { LayoutDashboard, Clock, Users, Briefcase, LogOut, GraduationCap, Building2, AlertCircle, CheckCircle, Send, RefreshCw } from "lucide-react";
import { getToken, getRefreshToken, setTokens, clearTokens } from "../services/api";

import * as apiSvc from "../services/api";


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