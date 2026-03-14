// src/layouts/DashboardLayout.tsx
import { useState, useEffect, ReactElement } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import InternLinkLogo from "@/assets/InternlinkLogo";
import './DashboardLayout.css';
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Target, Search, BookOpen, User, Brain,
  Bookmark, FileText, BarChart3, Briefcase, Settings,
  LogOut, Menu, X
} from "lucide-react";
import { ModeToggle } from "../components/ModeToggle";

const BASE_URL = "http://localhost:8000/api";
const token = () => localStorage.getItem("access_token");
const apiFetch = (url: string) =>
  fetch(`${BASE_URL}${url}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json());

interface NavItem { icon: ReactElement; label: string; path: string; badge?: number; badgeClass?: string; }
interface NavGroup { label: string; items: NavItem[]; }

const pathToLabel: Record<string, string> = {
  "/dashboard": "Dashboard", "/recommendations": "Recommendations",
  "/explore": "Explore", "/resources": "Resources",
  "/profile": "My Profile", "/skillAnalysis": "Skill Analysis",
  "/saved": "Saved", "/resumeBuilder": "Resume Builder",
  "/analytics": "Analytics", "/applications": "Applications",
  "/settings": "Settings",
};

export default function DashboardLayout(): ReactElement {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, user } = useAuth();
  const activeLabel = pathToLabel[location.pathname] ?? "Dashboard";

  const [isMobile,    setIsMobile]    = useState(() => window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recCount,    setRecCount]    = useState<number | undefined>(undefined);
  const [appCount,    setAppCount]    = useState<number | undefined>(undefined);
  const [savedCount,  setSavedCount]  = useState<number | undefined>(undefined);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    apiFetch("/internships/recommendations/?limit=1").then(res => {
      const t = res?.total ?? res?.count ?? (Array.isArray(res) ? res.length : undefined);
      if (t) setRecCount(t);
    }).catch(() => {});
    apiFetch("/applications/stats/").then(res => {
      if (!res?.error) { const act = (res?.interview ?? 0) + (res?.offer ?? 0); setAppCount(act); }
    }).catch(() => {});
    apiFetch("/saved/").then(res => {
      const l = Array.isArray(res) ? res : (res?.saved ?? res?.results ?? []);
      if (l.length > 0) setSavedCount(l.length);
    }).catch(() => {});
  }, []);

  const navGroups: NavGroup[] = [
    { label: "Main", items: [
      { icon: <LayoutDashboard size={18} />, label: "Dashboard",       path: "/dashboard" },
      { icon: <Target size={18} />,          label: "Recommendations", path: "/recommendations", ...(recCount ? { badge: recCount } : {}) },
      { icon: <Search size={18} />,          label: "Explore",         path: "/explore" },
      { icon: <BookOpen size={18} />,        label: "Resources",       path: "/resources" },
    ]},
    { label: "Profile", items: [
      { icon: <User size={18} />,     label: "My Profile",    path: "/profile" },
      { icon: <Brain size={18} />,    label: "Skill Analysis",path: "/skillAnalysis" },
      { icon: <Bookmark size={18} />, label: "Saved",         path: "/saved", ...(savedCount ? { badge: savedCount, badgeClass: "green" } : {}) },
      { icon: <FileText size={18} />, label: "Resume Builder",path: "/resumeBuilder" },
    ]},
    { label: "Insights", items: [
      { icon: <BarChart3 size={18} />, label: "Analytics",   path: "/analytics" },
      { icon: <Briefcase size={18} />, label: "Applications",path: "/applications", ...(appCount ? { badge: appCount, badgeClass: "gold" } : {}) },
      { icon: <Settings size={18} />,  label: "Settings",    path: "/settings" },
    ]},
  ];

  const handleNav = (path: string) => navigate(path);

  const initials = (() => {
    const parts = (user?.name ?? "").trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase();
  })();

  /** Nav items rendered inside either sidebar */
  const SidebarContent = ({ closeable }: { closeable: boolean }) => (
    <>
      <div className="logo" style={{ cursor: "pointer", justifyContent: "space-between" }}>
        <span onClick={() => handleNav("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <InternLinkLogo size={36} variant="full" />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ModeToggle />
          {closeable && (
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          )}
        </span>
      </div>

      {navGroups.map(group => (
        <div className="sidebar-section" key={group.label}>
          <div className="sidebar-label">{group.label}</div>
          {group.items.map(item => (
            <div
              key={item.label}
              className={`nav-item${activeLabel === item.label ? " active" : ""}`}
              onClick={() => handleNav(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge !== undefined && (
                <span className={`badge${item.badgeClass ? " " + item.badgeClass : ""}`}>{item.badge}</span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="sidebar-bottom">
        <div className="user-card" onClick={() => handleNav("/profile")} style={{ cursor: "pointer" }}>
          <div className="avatar">{initials}</div>
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
    </>
  );

  /* ─── MOBILE LAYOUT ─── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

        {/* Fixed overlay behind open sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 299,
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* Slide-in sidebar */}
        <aside style={{
          position: "fixed", left: 0, top: 0,
          width: 240, height: "100vh",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          padding: "28px 0",
          zIndex: 300,
          overflowY: "auto",
          boxShadow: "4px 0 40px rgba(0,0,0,0.4)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <SidebarContent closeable />
        </aside>

        {/* Mobile top bar */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 100, gap: 12,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none", border: "none", color: "var(--text)",
              cursor: "pointer", padding: 6, borderRadius: 8,
              display: "flex", alignItems: "center",
            }}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span style={{ cursor: "pointer" }} onClick={() => handleNav("/dashboard")}>
            <InternLinkLogo size={28} variant="full" />
          </span>
          <ModeToggle />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "20px 16px", minWidth: 0, overflowX: "hidden" }}>
          <Outlet />
        </main>
      </div>
    );
  }

  /* ─── DESKTOP LAYOUT ─── */
  return (
    <div className="app">
      <aside className="sidebar">
        <SidebarContent closeable={false} />
      </aside>
      <div className="main-wrapper">
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}