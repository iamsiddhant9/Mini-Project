// src/components/Layout/Sidebar.tsx
import { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navGroups, user } from "../../data/mock";

const sidebarCSS = `
  .sidebar {
    width: 240px; min-height: 100vh;
    background: rgba(13,20,36,0.95);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 28px 0;
    position: sticky; top: 0; height: 100vh;
    backdrop-filter: blur(20px);
    flex-shrink: 0;
  }
  .logo { padding: 0 24px 32px; display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 16px; box-shadow: 0 0 20px rgba(59,130,246,0.4);
  }
  .logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
    background: linear-gradient(135deg, #fff 40%, var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  .sidebar-section { padding: 8px 16px; margin-bottom: 4px; }
  .sidebar-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted); padding: 0 8px 8px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    transition: all 0.2s; font-size: 14px; font-weight: 500;
    color: var(--muted); position: relative; user-select: none;
  }
  .nav-item:hover { background: rgba(59,130,246,0.08); color: var(--text); }
  .nav-item.active { background: rgba(59,130,246,0.12); color: var(--accent); }
  .nav-item.active::before {
    content: ''; position: absolute;
    left: -16px; top: 50%; transform: translateY(-50%);
    width: 3px; height: 20px;
    background: var(--accent); border-radius: 0 3px 3px 0;
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-bottom { margin-top: auto; padding: 16px 16px 0; border-top: 1px solid var(--border); }
  .user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.2s;
  }
  .user-card:hover { background: rgba(59,130,246,0.08); }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 11px; color: var(--muted); }
`;

export default function Sidebar(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{sidebarCSS}</style>
      <aside className="sidebar">
        <div className="logo" onClick={() => navigate("/")}>
          <div className="logo-icon">🔗</div>
          <span className="logo-text">InternLink</span>
        </div>

        {navGroups.map((group) => (
          <div className="sidebar-section" key={group.label}>
            <div className="sidebar-label">{group.label}</div>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.label}
                  className={`nav-item${isActive ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge !== undefined && (
                    <span className={`badge${item.badgeClass ? " " + item.badgeClass : ""}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="user-card" onClick={() => navigate("/profile")}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{user.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.branch}, {user.year}</div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 16 }}>⋯</span>
          </div>
        </div>
      </aside>
    </>
  );
}
