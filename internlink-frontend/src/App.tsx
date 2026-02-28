import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.tsx"
import Login from "./pages/Login.tsx"
import Dashboard from "./pages/Dashboard.tsx";
import Recommendations from "./pages/Recommendations.tsx";
import ResumeBuilder from "./pages/ResumeBuilder.tsx";
import Analytics from "./pages/Analytics.tsx";
import Explore from "./pages/Explore.tsx";
import Applications from "./pages/Applications.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import SkillAnalysis from "./pages/SkillAnalysis.tsx";
import Profile from "./pages/Profile.tsx";
import Settings from "./pages/Settings.tsx";
import Saved from "./pages/Saved.tsx";

function App() {
  return (
        
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/recommendations" element={<Recommendations/>}/>
        <Route path="/resumeBuilder" element={<ResumeBuilder/>} />
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path="/explore" element={<Explore/>}/>
        <Route path="/applications" element={<Applications/>}/>
        <Route path="/leaderboard" element={<Leaderboard/>}/>
        <Route path="/skillAnalysis" element={<SkillAnalysis/>}/>
        <Route path="/profile" element={<Profile/>} />
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/saved" element={<Saved/>}/>
         <Route path="/" element={<Dashboard />}/>
         
      </Routes>
    </BrowserRouter>
  );
}

export default App;
