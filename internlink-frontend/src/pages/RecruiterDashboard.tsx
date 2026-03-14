import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import './RecruiterDashboard.css';
import { LayoutDashboard, PlusCircle, ClipboardList, Users, LogOut, MessageSquare, Gift, Building2, CheckCircle2 } from "lucide-react";
const BASE_URL = "http://localhost:8000/api";
const token = () => localStorage.getItem("access_token");

const api = {
  get:   (url: string) => fetch(`${BASE_URL}${url}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
  post:  (url: string, data: any) => fetch(`${BASE_URL}${url}`, { method: "POST", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
  patch: (url: string, data: any) => fetch(`${BASE_URL}${url}`, { method: "PATCH", headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
};

const CATEGORIES = ["AI/ML","Backend","Frontend","Cloud","Mobile","Data","Security","DevOps","Design","Other"];
const MODES = ["Remote","Hybrid","On-site"];
const STATUSES = ["Applied","Interview","Offer","Rejected"];

const statusColor: Record<string, string> = {
  Applied: "#3b82f6", Interview: "#f59e0b", Offer: "#10b981", Rejected: "#ef4444", Withdrawn: "#64748b"
};

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]               = useState<"overview"|"post"|"listings"|"applicants">("overview");
  const [stats, setStats]           = useState<any>(null);
  const [listings, setListings]     = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState("");
  const [form, setForm] = useState({
    title: "", description: "", location: "", mode: "Remote",
    category: "Backend", stipend: "", stipend_num: 0,
    deadline: "", company: "", tags: ""
  });

  useEffect(() => {
    api.get("/recruiter/stats/").then(res => { if (!res.error) setStats(res); });
    api.get("/recruiter/internships/").then(res => { if (Array.isArray(res)) setListings(res); });
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await api.post("/recruiter/internships/", {
      ...form,
      stipend_num: parseInt(form.stipend_num as any) || 0,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setLoading(false);
    if (res.id) {
      setSuccess("Internship posted successfully!");
      setTab("listings");
      api.get("/recruiter/internships/").then(res => { if (Array.isArray(res)) setListings(res); });
      api.get("/recruiter/stats/").then(res => { if (!res.error) setStats(res); });
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const loadApplicants = async (listing: any) => {
    setSelectedListing(listing);
    const res = await api.get(`/recruiter/internships/${listing.id}/applicants/`);
    setApplicants(res.applicants || []);
    setTab("applicants");
  };

  const updateStatus = async (appId: number, status: string) => {
    await api.patch(`/recruiter/applications/${appId}/`, { status });
    if (selectedListing) {
      const res = await api.get(`/recruiter/internships/${selectedListing.id}/applicants/`);
      setApplicants(res.applicants || []);
    }
  };

  return (
    <div className="recruiter-page">

      {/* Sidebar */}
      <div className="recruiter-sidebar">
        <div className="recruiter-sidebar-logo"><Building2 size={18} /> Recruiter</div>
        {[
          { key: "overview",   icon: <LayoutDashboard size={15} />, label: "Overview" },
{ key: "post",       icon: <PlusCircle size={15} />,      label: "Post Internship" },
{ key: "listings",   icon: <ClipboardList size={15} />,   label: "My Listings" },
{ key: "applicants", icon: <Users size={15} />,           label: "Applicants" },
        ].map(item => (
          <button key={item.key} onClick={() => setTab(item.key as any)} className={`recruiter-nav-btn${tab === item.key ? " active" : ""}`}>
            {item.icon} {item.label}
          </button>
        ))}
        <button onClick={logout} className="recruiter-logout-btn"><LogOut size={14} /> Logout</button>
      </div>

      {/* Main */}
      <div className="recruiter-main">
        <div className="recruiter-header">
          <h1>Hey {user?.name?.split(" ")[0]} </h1>
          <p>Manage your internship listings and applicants</p>
        </div>

        {success && <div className="recruiter-success"><CheckCircle2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />{success}</div>}

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div className="recruiter-stats-grid">
              {[
                { label: "Active Listings",  val: stats?.active_listings  ?? 0, icon: <ClipboardList size={22} />, color: "#3b82f6" },
{ label: "Total Applicants", val: stats?.total_applicants ?? 0, icon: <Users size={22} />,         color: "#06b6d4" },
{ label: "Interviews",       val: stats?.interviews       ?? 0, icon: <MessageSquare size={22} />, color: "#f59e0b" },
{ label: "Offers Made",      val: stats?.offers           ?? 0, icon: <Gift size={22} />,          color: "#10b981" },
              ].map(s => (
                <div key={s.label} className="recruiter-stat-card">
                  <div className="recruiter-stat-icon">{s.icon}</div>
                  <div className="recruiter-stat-value" style={{ color: s.color }}>{s.val}</div>
                  <div className="recruiter-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="recruiter-card">
              <h3>Recent Listings</h3>
              {listings.slice(0, 5).map(l => (
                <div key={l.id} className="recruiter-listing-row">
                  <div>
                    <div className="recruiter-listing-title">{l.title}</div>
                    <div className="recruiter-listing-meta">{l.company} · {l.mode}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="recruiter-listing-meta">{l.applicant_count} applicants</span>
                    <button onClick={() => loadApplicants(l)} className="btn-view">View →</button>
                  </div>
                </div>
              ))}
              {listings.length === 0 && <div className="empty-state">No listings yet. Post your first internship!</div>}
            </div>
          </div>
        )}

        {/* Post Internship */}
        {tab === "post" && (
          <div className="recruiter-form-card">
            <h2>Post New Internship</h2>
            <form onSubmit={handlePost}>
              {[
                { label: "Job Title",     key: "title",    placeholder: "e.g. Software Engineering Intern" },
                { label: "Company Name",  key: "company",  placeholder: "e.g. Google" },
                { label: "Location",      key: "location", placeholder: "e.g. Bangalore or Remote" },
                { label: "Stipend",       key: "stipend",  placeholder: "e.g. 85,000/mo" },
                { label: "Deadline",      key: "deadline", placeholder: "", type: "date" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type || "text"} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={["title","company","deadline"].includes(f.key)}
                    className="form-input" />
                </div>
              ))}

              <div className="form-row">
                <div>
                  <label className="form-label">Mode</label>
                  <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} className="form-input">
                    {MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="form-input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  required rows={4} placeholder="Describe the role, responsibilities, requirements..."
                  className="form-input" style={{ resize: "vertical" }} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Skills Required <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(comma separated)</span></label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. Python, React, PostgreSQL" className="form-input" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Posting..." : "<PlusCircle size={15} style={{ marginRight: 6 }} /> Post Internship"}
              </button>
            </form>
          </div>
        )}

        {/* My Listings */}
        {tab === "listings" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "Syne, sans-serif" }}>My Listings ({listings.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {listings.map(l => (
                <div key={l.id} className="applicant-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="applicant-name">{l.title}</div>
                    <div className="applicant-meta">{l.company} · {l.location} · {l.mode}</div>
                    <div className="applicant-meta" style={{ marginTop: 4 }}>Deadline: {l.deadline} · {l.applicant_count} applicants</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className={l.is_active ? "badge-active" : "badge-inactive"}>
                      {l.is_active ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => loadApplicants(l)} className="btn-view">Applicants →</button>
                  </div>
                </div>
              ))}
              {listings.length === 0 && (
                <div className="empty-state">
                  No listings yet.
                  <span onClick={() => setTab("post")} style={{ color: "#3b82f6", cursor: "pointer", marginLeft: 6 }}>Post one now →</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applicants */}
        {tab === "applicants" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button onClick={() => setTab("listings")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>←</button>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "Syne, sans-serif" }}>Applicants — {selectedListing?.title}</h2>
                <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: 13 }}>{applicants.length} total applicants</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {applicants.map(a => (
                <div key={a.id} className="applicant-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div className="applicant-name">{a.name}</div>
                      <div className="applicant-meta">{a.email} · {a.university} · Year {a.year}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {(a.skills || []).map((s: string) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${statusColor[a.status]}20`, color: statusColor[a.status] }}>
                        {a.status}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {STATUSES.filter(s => s !== a.status).map(s => (
                          <button key={s} onClick={() => updateStatus(a.id, s)} style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${statusColor[s]}40`, background: `${statusColor[s]}10`, color: statusColor[s], cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    {a.github_url    && <a href={a.github_url}    target="_blank" className="applicant-meta">GitHub →</a>}
                    {a.linkedin_url  && <a href={a.linkedin_url}  target="_blank" className="applicant-meta">LinkedIn →</a>}
                    {a.portfolio_url && <a href={a.portfolio_url} target="_blank" className="applicant-meta">Portfolio →</a>}
                  </div>
                </div>
              ))}
              {applicants.length === 0 && <div className="empty-state">No applicants yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}