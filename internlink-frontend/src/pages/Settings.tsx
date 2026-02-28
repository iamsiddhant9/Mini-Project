// src/pages/Settings.tsx
import { useState, ReactElement } from "react";
import "./Settings.css";
import BackButton from '../components/BackButton';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps): ReactElement {
  return (
    <div className={`toggle${checked ? " on" : ""}`} onClick={onChange}>
      <div className="toggle-knob" />
    </div>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactElement;
}

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

export default function Settings(): ReactElement {
  const [notifications, setNotifications] = useState({
    newMatches: true,
    deadlines: true,
    messages: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showSkills: true,
    allowRecommendations: true,
  });

  const [preferences, setPreferences] = useState({
    remoteOnly: false,
    paidOnly: true,
    fullTimeOnly: false,
  });

  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    university: "IIT Bombay",
    degree: "B.Tech Computer Science",
    gradYear: "2026",
    bio: "Passionate about building products that matter.",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <BackButton />
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and notifications</p>
        </div>
        <button className={"save-btn" + (saved ? " saved" : "")} onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="settings-grid">

        {/* ── Profile ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"></span>
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
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>University</label>
                <input value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} />
              </div>
              <div className="field-group">
                <label>Degree</label>
                <input value={profile.degree} onChange={(e) => setProfile({ ...profile, degree: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Graduation Year</label>
                <input value={profile.gradYear} onChange={(e) => setProfile({ ...profile, gradYear: e.target.value })} />
              </div>
            </div>
            <div className="field-group full">
              <label>Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"></span>
            <span className="settings-card-title">Notifications</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="New Matches" description="Get notified when new internships match your profile">
              <Toggle checked={notifications.newMatches} onChange={() => setNotifications({ ...notifications, newMatches: !notifications.newMatches })} />
            </SettingRow>
            <SettingRow label="Deadline Reminders" description="Reminders 3 days before application deadlines">
              <Toggle checked={notifications.deadlines} onChange={() => setNotifications({ ...notifications, deadlines: !notifications.deadlines })} />
            </SettingRow>
            <SettingRow label="Messages" description="Notifications for recruiter messages">
              <Toggle checked={notifications.messages} onChange={() => setNotifications({ ...notifications, messages: !notifications.messages })} />
            </SettingRow>
            <SettingRow label="Weekly Digest" description="A summary of new opportunities every Monday">
              <Toggle checked={notifications.weeklyDigest} onChange={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })} />
            </SettingRow>
          </div>
        </div>

        {/* ── Preferences ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"></span>
            <span className="settings-card-title">Job Preferences</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="Remote Only" description="Only show remote internships">
              <Toggle checked={preferences.remoteOnly} onChange={() => setPreferences({ ...preferences, remoteOnly: !preferences.remoteOnly })} />
            </SettingRow>
            <SettingRow label="Paid Only" description="Filter out unpaid internships">
              <Toggle checked={preferences.paidOnly} onChange={() => setPreferences({ ...preferences, paidOnly: !preferences.paidOnly })} />
            </SettingRow>
            <SettingRow label="Full-Time Only" description="Only show full-time internship positions">
              <Toggle checked={preferences.fullTimeOnly} onChange={() => setPreferences({ ...preferences, fullTimeOnly: !preferences.fullTimeOnly })} />
            </SettingRow>
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"></span>
            <span className="settings-card-title">Privacy</span>
          </div>
          <div className="settings-rows">
            <SettingRow label="Public Profile" description="Allow recruiters to find and view your profile">
              <Toggle checked={privacy.profileVisible} onChange={() => setPrivacy({ ...privacy, profileVisible: !privacy.profileVisible })} />
            </SettingRow>
            <SettingRow label="Show Skills" description="Display your skills on your public profile">
              <Toggle checked={privacy.showSkills} onChange={() => setPrivacy({ ...privacy, showSkills: !privacy.showSkills })} />
            </SettingRow>
            <SettingRow label="AI Recommendations" description="Allow AI to use your data for better matches">
              <Toggle checked={privacy.allowRecommendations} onChange={() => setPrivacy({ ...privacy, allowRecommendations: !privacy.allowRecommendations })} />
            </SettingRow>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="settings-card danger-card">
          <div className="settings-card-header">
            <span className="settings-card-icon"></span>
            <span className="settings-card-title">Danger Zone</span>
          </div>
          <div className="danger-rows">
            <div className="danger-row">
              <div>
                <div className="setting-label">Clear Application History</div>
                <div className="setting-desc">Remove all your tracked applications</div>
              </div>
              <button className="danger-btn">Clear</button>
            </div>
            <div className="danger-row">
              <div>
                <div className="setting-label">Delete Account</div>
                <div className="setting-desc">Permanently delete your account and all data</div>
              </div>
              <button className="danger-btn">Delete</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}