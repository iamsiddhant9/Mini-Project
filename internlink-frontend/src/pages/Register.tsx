import AuthLeft from "../components/AuthLeft.tsx";
import Squares from "../components/Squares.tsx";
import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MAX_SKILLS = 5;

export default function Register() {
  const [skills, setSkills]         = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [skillError, setSkillError] = useState<string>("");
  const [name, setName]             = useState<string>("");
  const [email, setEmail]           = useState<string>("");
  const [password, setPassword]     = useState<string>("");
  const [year, setYear]             = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [role, setRole]             = useState<string>("student");
  const [error, setError]           = useState<string>("");
  const [loading, setLoading]       = useState<boolean>(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();
      if (skills.length >= MAX_SKILLS) {
        setSkillError(`You can only add ${MAX_SKILLS} skills`);
        return;
      }
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
        setSkillError("");
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    setSkillError("");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (role === "student" && skills.length === 0) {
      setSkillError("Please add at least one skill");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        university,
        year: year ? parseInt(year) : undefined,
        role,
      });
      if (role === "recruiter") {
        navigate("/login");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="liquid-fullscreen">
        <Squares speed={0.5} squareSize={40} direction="diagonal" borderColor="#271E37" hoverFillColor="#5227FF" />
      </div>

      <div className="register-overlay">
        <div className="auth-wrapper">
          <div className="auth-left">
            <div className="brand-block"><AuthLeft /></div>
          </div>

          <div className="auth-right register-page-right">
            <div className="login-card register-card">
              <h2>Create Account</h2>

              {/* Role Toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
                {["student", "recruiter"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                      background: role === r ? "linear-gradient(135deg, #3b82f6, #06b6d4)" : "transparent",
                      color: role === r ? "#fff" : "#94a3b8",
                      transition: "all 0.2s",
                    }}
                  >
                    {r === "student" ? " Student" : " Recruiter"}
                  </button>
                ))}
              </div>

              {role === "recruiter" && (
                <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#fbbf24" }}>
                  ⚠️ Recruiter accounts require admin approval before you can login.
                </div>
              )}

              <form onSubmit={handleRegister}>
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />

                <label>Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {/* Student-only fields */}
                {role === "student" && (
                  <>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label>University</label>
                        <input type="text" placeholder="e.g. Mumbai University" value={university} onChange={(e) => setUniversity(e.target.value)} />
                      </div>
                      <div style={{ width: 110 }}>
                        <label>Year</label>
                        <select value={year} onChange={(e) => setYear(e.target.value)}>
                          <option value="">Year</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                        </select>
                      </div>
                    </div>

                    <label>Skills</label>
                    <div className="skills-input">
                      {skills.map((skill, index) => (
                        <span key={index} className="skill-chip">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)}>×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                    </div>
                    {skillError && <p className="skill-error">{skillError}</p>}
                  </>
                )}

                {/* Recruiter-only fields */}
                {role === "recruiter" && (
                  <>
                    <label>Company Name</label>
                    <input type="text" placeholder="e.g. Google, Razorpay" value={university} onChange={(e) => setUniversity(e.target.value)} />
                  </>
                )}

                {error && (
                  <p style={{ color: "#ef4444", fontSize: "14px", margin: "4px 0 8px" }}>{error}</p>
                )}

                <button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : role === "recruiter" ? "Submit for Approval" : "Create Account"}
                </button>
              </form>

              <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
                Already have an account?{" "}
                <span onClick={() => navigate("/login")} style={{ color: "#5227FF", cursor: "pointer" }}>Login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}