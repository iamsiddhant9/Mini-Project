// src/pages/Profile.tsx
import { useState, ReactElement } from "react";
import { user, skills } from "../data/mock";
import './Profile.css';


export default function Profile(): ReactElement {
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
   
      <div className="profile-header">
        <h1>My Profile </h1>
        <p>Manage your personal info, links and profile strength</p>
      </div>

      <div className="profile-grid">
        {/* Left — profile card */}
        <div>
          <div className="profile-card">
            <div className="profile-avatar">{user.initials}</div>
            <div style={{ textAlign: "center" }}>
              <div className="profile-name">{form.name}</div>
              <div className="profile-sub">{form.branch} · {form.year}</div>
            </div>
            <div className="profile-strength-wrap">
              <div className="profile-strength-label">
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Profile Strength</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>{user.profileStrength}%</span>
              </div>
              <div className="profile-strength-track">
                <div className="profile-strength-fill" style={{ width: `${user.profileStrength}%` }} />
              </div>
            </div>
            <div className="profile-links">
              {[
                { icon: "✉️", val: form.email },
                { icon: "🐙", val: form.github },
                { icon: "💼", val: form.linkedin },
                { icon: "🌐", val: form.portfolio },
              ].map((l) => (
                <div className="profile-link" key={l.val}>
                  <span>{l.icon}</span>
                  <span>{l.val}</span>
                </div>
              ))}
            </div>
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Top Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.slice(0, 5).map((s) => (
                  <span key={s.name} className="chip" style={{ fontSize: 10, padding: "2px 8px" }}>{s.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — edit form */}
        <div>
          <div className="edit-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Full Name</label>
                <input value={form.name} onChange={update("name")} />
              </div>
              <div className="form-field">
                <label>Branch</label>
                <input value={form.branch} onChange={update("branch")} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Year</label>
                <input value={form.year} onChange={update("year")} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input value={form.email} onChange={update("email")} />
              </div>
            </div>
            <div className="form-field">
              <label>Bio</label>
              <textarea value={form.bio} onChange={update("bio")} />
            </div>
          </div>

          <div className="edit-section">
            <h3>Links & Socials</h3>
            <div className="form-row">
              <div className="form-field">
                <label>GitHub</label>
                <input value={form.github} onChange={update("github")} />
              </div>
              <div className="form-field">
                <label>LinkedIn</label>
                <input value={form.linkedin} onChange={update("linkedin")} />
              </div>
            </div>
            <div className="form-field">
              <label>Portfolio Website</label>
              <input value={form.portfolio} onChange={update("portfolio")} />
            </div>
          </div>

          <button className={`save-btn${saved ? " saved" : ""}`} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}