// src/pages/Settings.tsx
import { useState, useEffect, ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import { user as userApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Sparkles, User, Bell, Target, Lock, Settings as SettingsIcon, AlertTriangle, Check } from "lucide-react";
import "./Settings.css";

const BASE_URL = "http://localhost:8000/api";
const token = () => localStorage.getItem("access_token");

async function apiDelete(url: string) {
  return fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });
}

interface ToggleProps { checked: boolean; onChange: () => void; }
function Toggle({ checked, onChange }: ToggleProps): ReactElement {
  return (
    <div className={`toggle${checked ? " on" : ""}`} onClick={onChange}>
      <div className="toggle-knob" />
    </div>
  );
}

interface SettingRowProps { label: string; description?: string; children: ReactElement; }
function SettingRow({ label, description, children }: SettingRowProps): ReactElement {
  return (
    <div className="setting-row">
      <div className="setting-info">
        <div className="setting-label">{label}</div>
        {description && <div className="setting-desc">{description}</div>}
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}): ReactElement {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:3000,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onCancel}>
      <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:28,width:360,boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:700,fontSize:16,marginBottom:10 }}>{title}</div>
        <div style={{ fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:22 }}>{message}</div>
        <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ padding:"8px 18px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",color:"var(--muted)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:"8px 18px",borderRadius:8,border:"none",background:danger?"#ef4444":"var(--accent)",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings(): ReactElement {
  const { user, logout } = useAuth();
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState({ newMatches:true, deadlines:true, messages:false, weeklyDigest:true });
  const [privacy, setPrivacy] = useState({ profileVisible:true, showSkills:true, allowRecommendations:true });
  const [preferences, setPreferences] = useState({ remoteOnly:false, paidOnly:true, fullTimeOnly:false });
  const [profile, setProfile] = useState({ name:"", email:"", university:"", branch:"", year:"", bio:"" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{ title:string; message:string; confirmLabel:string; danger?:boolean; onConfirm:()=>void } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile(p => ({ ...p, name:user.name??"", email:user.email??"", branch:(user as any).branch??"", year:String((user as any).year??"") }));
    }
    userApi.getProfile().then((data: any) => {
      if (!data) return;
      setProfile({ name:data.name??"", email:data.email??"", university:data.university??"", branch:data.branch??"", year:String(data.year??""), bio:data.bio??"" });
      try { if (data.settings_notifications) setNotifications(prev => ({ ...prev, ...(typeof data.settings_notifications==="string"?JSON.parse(data.settings_notifications):data.settings_notifications) })); } catch {}
      try { if (data.settings_privacy)       setPrivacy(prev       => ({ ...prev, ...(typeof data.settings_privacy==="string"?JSON.parse(data.settings_privacy):data.settings_privacy) })); } catch {}
      try { if (data.settings_preferences)   setPreferences(prev   => ({ ...prev, ...(typeof data.settings_preferences==="string"?JSON.parse(data.settings_preferences):data.settings_preferences) })); } catch {}
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: profile.name, branch: profile.branch, university: profile.university,
        year: parseInt(profile.year) || undefined, bio: profile.bio,
        settings_notifications: JSON.stringify(notifications),
        settings_privacy:       JSON.stringify(privacy),
        settings_preferences:   JSON.stringify(preferences),
      });
      setSaved(true);
      success("Settings saved!");
      setTimeout(() => setSaved(false), 2000);
    } catch { error("Failed to save settings. Please try again."); }
    finally { setSaving(false); }
  };

  const handleClearApplications = () => setConfirm({
    title: "Clear Application History",
    message: "This will permanently delete all your tracked applications. This action cannot be undone.",
    confirmLabel: "Yes, Clear All", danger: true,
    onConfirm: async () => {
      setConfirm(null);
      try {
        const res = await apiDelete("/applications/");
        if (res.ok || res.status === 204) success("Application history cleared.");
        else error("Failed to clear applications.");
      } catch { error("Failed to clear applications."); }
    },
  });

  const handleDeleteAccount = () => setConfirm({
    title: "Delete Account",
    message: "This will permanently delete your InternLink account and ALL data — profile, applications, skills, saved internships. This cannot be undone.",
    confirmLabel: "Delete My Account", danger: true,
    onConfirm: async () => {
      setConfirm(null);
      try {
        const res = await apiDelete("/users/me/");
        if (res.ok || res.status === 204) { success("Account deleted. Goodbye!"); setTimeout(() => logout(), 1500); }
        else error("Failed to delete account.");
      } catch { error("Failed to delete account."); }
    },
  });

  if (loading) return <div style={{ color:"var(--muted)",textAlign:"center",padding:"60px 0",fontSize:14 }}>Loading settings…</div>;

  return (
    <>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and notifications</p>
        </div>
        <button className={"save-btn" + (saved ? " saved" : "")} onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : saved ? <><Check size={14} style={{ display: "inline", marginRight: 4 }} />Saved</> : "Save Changes"}
        </button>
      </div>

      <div className="settings-grid">

        {/* ── Profile ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><User size={16} /></span>
            <span className="settings-card-title">Profile</span>
          </div>
          <div className="settings-fields">
            <div className="field-row">
              <div className="field-group">
                <label>Full Name</label>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input type="email" value={profile.email} disabled style={{ opacity:0.5,cursor:"not-allowed" }} title="Email cannot be changed here" />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>University</label>
                <input value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} placeholder="e.g. Mumbai University" />
              </div>
              <div className="field-group">
                <label>Branch</label>
                <input value={profile.branch} onChange={(e) => setProfile({ ...profile, branch: e.target.value })} placeholder="e.g. Computer Engineering" />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Year of Study</label>
                <input value={profile.year} onChange={(e) => setProfile({ ...profile, year: e.target.value })} placeholder="e.g. 2" type="number" min={1} max={6} />
              </div>
            </div>
            <div className="field-group full">
              <label>Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell recruiters about yourself…" />
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Bell size={16} /></span>
            <span className="settings-card-title">Notifications</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="New Matches" description="Get notified when new internships match your profile">
              <Toggle checked={notifications.newMatches} onChange={() => setNotifications(n => ({ ...n, newMatches:!n.newMatches }))} />
            </SettingRow>
            <SettingRow label="Deadline Reminders" description="Reminders 3 days before application deadlines">
              <Toggle checked={notifications.deadlines} onChange={() => setNotifications(n => ({ ...n, deadlines:!n.deadlines }))} />
            </SettingRow>
            <SettingRow label="Messages" description="Notifications for recruiter messages">
              <Toggle checked={notifications.messages} onChange={() => setNotifications(n => ({ ...n, messages:!n.messages }))} />
            </SettingRow>
            <SettingRow label="Weekly Digest" description="A summary of new opportunities every Monday">
              <Toggle checked={notifications.weeklyDigest} onChange={() => setNotifications(n => ({ ...n, weeklyDigest:!n.weeklyDigest }))} />
            </SettingRow>
          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Target size={16} /></span>
            <span className="settings-card-title">Job Preferences</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="Remote Only" description="Only show remote internships">
              <Toggle checked={preferences.remoteOnly} onChange={() => setPreferences(p => ({ ...p, remoteOnly:!p.remoteOnly }))} />
            </SettingRow>
            <SettingRow label="Paid Only" description="Filter out unpaid internships">
              <Toggle checked={preferences.paidOnly} onChange={() => setPreferences(p => ({ ...p, paidOnly:!p.paidOnly }))} />
            </SettingRow>
            <SettingRow label="Full-Time Only" description="Only show full-time internship positions">
              <Toggle checked={preferences.fullTimeOnly} onChange={() => setPreferences(p => ({ ...p, fullTimeOnly:!p.fullTimeOnly }))} />
            </SettingRow>
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Lock size={16} /></span>
            <span className="settings-card-title">Privacy</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="Public Profile" description="Allow recruiters to find and view your profile">
              <Toggle checked={privacy.profileVisible} onChange={() => setPrivacy(p => ({ ...p, profileVisible:!p.profileVisible }))} />
            </SettingRow>
            <SettingRow label="Show Skills" description="Display your skills on your public profile">
              <Toggle checked={privacy.showSkills} onChange={() => setPrivacy(p => ({ ...p, showSkills:!p.showSkills }))} />
            </SettingRow>
            <SettingRow label="AI Recommendations" description="Allow AI to use your data for better matches">
              <Toggle checked={privacy.allowRecommendations} onChange={() => setPrivacy(p => ({ ...p, allowRecommendations:!p.allowRecommendations }))} />
            </SettingRow>
          </div>
        </div>

        {/* ── Account ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><SettingsIcon size={16} /></span>
            <span className="settings-card-title">Account</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="Sign Out" description="Log out of your InternLink account">
              <button onClick={logout} style={{ padding:"6px 18px",borderRadius:8,border:"none",background:"rgba(59,130,246,0.12)",color:"var(--accent)",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"inherit" }}>Logout</button>
            </SettingRow>
          </div>
        </div>

        {/* ── AI Settings ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><Sparkles size={16} /></span>
            <span className="settings-card-title">AI Settings</span>
          </div>
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">AI Match Explanations</div>
              <div className="setting-desc">Powered by <strong style={{ color:"var(--accent)" }}>Groq — Llama 3.3 70B</strong> on the backend. The API key is configured server-side — no setup needed.</div>
            </div>
            <div style={{ padding:"5px 14px",borderRadius:8,fontSize:12,fontWeight:600,background:"rgba(16,185,129,0.12)",color:"var(--green)",border:"1px solid rgba(16,185,129,0.25)", display:"flex", alignItems:"center", gap:4 }}><Check size={12} />Active</div>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="settings-card danger-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"><AlertTriangle size={16} /></span>
            <span className="settings-card-title">Danger Zone</span>
          </div>
          <div className="danger-rows">
            <div className="danger-row">
              <div>
                <div className="setting-label">Clear Application History</div>
                <div className="setting-desc">Remove all your tracked applications permanently</div>
              </div>
              <button className="danger-btn" onClick={handleClearApplications}>Clear</button>
            </div>
            <div className="danger-row">
              <div>
                <div className="setting-label">Delete Account</div>
                <div className="setting-desc">Permanently delete your account and all data</div>
              </div>
              <button className="danger-btn" onClick={handleDeleteAccount}>Delete</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}