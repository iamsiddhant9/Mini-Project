import { HashRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { ToastProvider } from "./context/ToastContext";
import ActivityTracker from "./components/ActivityTracker";
import ServerStatus from "./components/ServerStatus";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import ResumeBuilder from "./pages/ResumeBuilder";
import Analytics from "./pages/Analytics";
import Explore from "./pages/Explore";
import Applications from "./pages/Applications";
import Resources from "./pages/Resources";
import SkillAnalysis from "./pages/SkillAnalysis";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Saved from "./pages/Saved";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Roadmap from "./pages/Roadmap";
import CareerCoach from "./pages/CareerCoach";

function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <ServerStatus />
        <ActivityTracker />
        <Routes>

          {/* ── Public only (redirect if logged in) ── */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* ── Recruiter only ── */}
          <Route path="/recruiter" element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          } />

          {/* ── Admin only ── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── Student routes ── */}
          <Route element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/skillAnalysis" element={<SkillAnalysis />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/resumeBuilder" element={<ResumeBuilder />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/careercoach" element={<CareerCoach />} />
          </Route>

        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;