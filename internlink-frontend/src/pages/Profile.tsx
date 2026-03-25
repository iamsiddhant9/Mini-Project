// src/pages/Profile.tsx
import { useState, useEffect, ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import { user as userApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Mail, Github, Linkedin, Globe, User, Save, Check, Sparkles } from "lucide-react";
import './Profile.css';

interface Skill { id: number; name: string; category: string; level: number; }

export default function Profile(): ReactElement {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    name: "", branch: "", year: "", email: "",
    bio: "", github: "", linkedin: "", portfolio: "", profileStrength: 0,
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topMatch, setTopMatch] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name ?? "",
        branch: (user as any).branch ?? "",
        year: String((user as any).year ?? ""),
        email: user.email ?? "",
        profileStrength: (user as any).profile_strength ?? 0,
      }));
    }
    userApi.getProfile().then((data: any) => {
      if (!data) return;
      setForm({
        name: data.name ?? "",
        branch: data.branch ?? "",
        year: String(data.year ?? ""),
        email: data.email ?? "",
        bio: data.bio ?? "",
        github: data.github_url ?? "",
        linkedin: data.linkedin_url ?? "",
        portfolio: data.portfolio_url ?? "",
        profileStrength: data.profile_strength ?? 0,
      });
      setSkills(data.skills ?? []);
      setLoading(false);

      // Compute match scores in background — updates profile_strength + top match
      userApi.computeMatches().then((res: any) => {
        if (res?.profile_strength != null) {
          setForm(f => ({ ...f, profileStrength: res.profile_strength }));
        }
        if (res?.top_match_score != null) {
          setTopMatch(res.top_match_score);
        }
      }).catch(() => { /* silent — score compute is non-critical */ });
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    try {
      await userApi.updateProfile({
        name: form.name, branch: form.branch,
        year: parseInt(form.year) || undefined,
        bio: form.bio, github_url: form.github,
        linkedin_url: form.linkedin, portfolio_url: form.portfolio,
      });
      
      updateUser({
        name: form.name,
        branch: form.branch,
        year: parseInt(form.year) || undefined,
      });

      setSaved(true);
      success("Profile saved successfully!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      error("Failed to save profile. Please try again.");
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <>
      <div className="profile-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}><User size={26} /> My Profile</h1>
        <p>Manage your personal info, links and profile strength</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "60px 0" }}>Loading profile…</div>
      ) : (
        <div className="profile-grid">
          <div>
            <div className="profile-card">
              <div className="profile-avatar">{initials}</div>
              <div style={{ textAlign: "center" }}>
                <div className="profile-name">{form.name}</div>
                <div className="profile-sub">{form.branch} · {form.year}</div>
              </div>
              <div className="profile-strength-wrap">
                <div className="profile-strength-label">
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Profile Strength</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{form.profileStrength}%</span>
                </div>
                <div className="profile-strength-track">
                  <div className="profile-strength-fill" style={{ width: `${form.profileStrength}%` }} />
                </div>
              </div>
              {topMatch !== null && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                    <Sparkles size={13} color="#10b981" /> Top Match Score
                  </div>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--green)" }}>
                    {topMatch}%
                  </span>
                </div>
              )}
              <div className="profile-links">
                {[
                  { icon: <Mail size={14} />, val: form.email },
                  { icon: <Github size={14} />, val: form.github || "—" },
                  { icon: <Linkedin size={14} />, val: form.linkedin || "—" },
                  { icon: <Globe size={14} />, val: form.portfolio || "—" },
                ].map((l, i) => (
                  <div className="profile-link" key={i}>
                    <span style={{ display: "flex", color: "var(--accent)" }}>{l.icon}</span>
                    <span>{l.val}</span>
                  </div>
                ))}
              </div>
              {skills.length > 0 && (
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Top Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.slice(0, 5).map((s) => (
                      <span key={s.id} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="edit-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-field"><label>Full Name</label><input value={form.name} onChange={update("name")} /></div>
                <div className="form-field"><label>Branch</label><input value={form.branch} onChange={update("branch")} /></div>
              </div>
              <div className="form-row">
                <div className="form-field"><label>Year</label><input value={form.year} onChange={update("year")} /></div>
                <div className="form-field"><label>Email</label><input value={form.email} onChange={update("email")} disabled style={{ opacity: 0.6 }} /></div>
              </div>
              <div className="form-field"><label>Bio</label><textarea value={form.bio} onChange={update("bio")} /></div>
            </div>

            <div className="edit-section">
              <h3>Links & Socials</h3>
              <div className="form-row">
                <div className="form-field"><label>GitHub</label><input value={form.github} onChange={update("github")} placeholder="https://github.com/..." /></div>
                <div className="form-field"><label>LinkedIn</label><input value={form.linkedin} onChange={update("linkedin")} placeholder="https://linkedin.com/in/..." /></div>
              </div>
              <div className="form-field"><label>Portfolio Website</label><input value={form.portfolio} onChange={update("portfolio")} placeholder="https://yoursite.dev" /></div>
            </div>

            <button className={`save-btn${saved ? " saved" : ""}`} onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}