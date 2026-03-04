// src/layouts/DashboardLayout.tsx
import { useState, ReactElement } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import InternLinkLogo from "@/assets/InternlinkLogo";
import './DashboardLayout.css';
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Target,
  Search,
  Trophy,
  User,
  Brain,
  Bookmark,
  FileText,
  BarChart3,
  Briefcase,
  Settings,
  LogOut
} from "lucide-react";

interface NavItem {
  icon: ReactElement;
  label: string;
  path: string;
  badge?: number;
  badgeClass?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { icon: <LayoutDashboard size={18} />, label: "Dashboard",       path: "/dashboard" },
      { icon: <Target size={18} />,          label: "Recommendations",  path: "/recommendations", badge: 12 },
      { icon: <Search size={18} />,          label: "Explore",          path: "/explore" },
      { icon: <Trophy size={18} />,          label: "Hackathons",       path: "/hackathons" },
    ],
  },
  {
    label: "Profile",
    items: [
      { icon: <User size={18} />,     label: "My Profile",    path: "/profile" },
      { icon: <Brain size={18} />,    label: "Skill Analysis", path: "/skillAnalysis" },
      { icon: <Bookmark size={18} />, label: "Saved",          path: "/saved", badge: 7, badgeClass: "green" },
      { icon: <FileText size={18} />, label: "Resume Builder", path: "/resumeBuilder" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: <BarChart3 size={18} />, label: "Analytics",    path: "/analytics" },
      { icon: <Briefcase size={18} />, label: "Applications", path: "/applications", badge: 3, badgeClass: "gold" },
      { icon: <Settings size={18} />,  label: "Settings",     path: "/settings" },
    ],
  },
];

const pathToLabel: Record<string, string> = {};
navGroups.forEach(g => g.items.forEach(i => { pathToLabel[i.path] = i.label; }));

export default function DashboardLayout(): ReactElement {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { logout, user } = useAuth();
  const activeLabel = pathToLabel[location.pathname] ?? "Dashboard";

  const handleNav = (path: string) => navigate(path);

  return (
    <div className="app">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo" onClick={() => handleNav("/dashboard")} style={{ cursor: "pointer" }}>
          <InternLinkLogo size={36} variant="full" />
        </div>

        {navGroups.map((group) => (
          <div className="sidebar-section" key={group.label}>
            <div className="sidebar-label">{group.label}</div>
            {group.items.map((item) => (
              <div
                key={item.label}
                className={`nav-item${activeLabel === item.label ? " active" : ""}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge !== undefined && (
                  <span className={`badge${item.badgeClass ? " " + item.badgeClass : ""}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="user-card" onClick={() => handleNav("/profile")} style={{ cursor: "pointer" }}>
            <div className="avatar">{user?.name?.slice(0, 2).toUpperCase() ?? "SS"}</div>
            <div className="user-info">
              <div className="user-name">{user?.name ?? "Student"}</div>
              <div className="user-role">
                {user?.branch ?? ""}
                {user?.year ? `, ${user.year}${["st","nd","rd","th"][Math.min(user.year - 1, 3)]} Year` : ""}
              </div>
            </div>
          </div>
          <div className="nav-item" onClick={logout} style={{ color: "#ef4444", marginTop: 4 }}>
            <span className="nav-icon"><LogOut size={18} /></span>
            Logout
          </div>
        </div>
      </aside>

      {/* ── Page Content ── */}
      <main className="main">
        <Outlet />
      </main>

    </div>
  );
}