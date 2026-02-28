// Register.tsx
import AuthLeft from "../components/AuthLeft.tsx";
import Squares from "../components/Squares.tsx";
import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_SKILLS = 5;

export default function Register() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [skillError, setSkillError] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();

      if (skills.length >= MAX_SKILLS) {
        setSkillError(`You can only add ${MAX_SKILLS}`);
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
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    setSkillError("");
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (skills.length === 0) {
      setSkillError("Please add at least one skill");
      return;
    }

    const registerData = { name, email, password, skills };
    console.log("Register Data:", registerData);

    localStorage.setItem("user", JSON.stringify({ name, email, skills }));
    navigate("/dashboard");
  };

  return (
    <div className="register-page">

      {/* Squares background */}
      <div className="liquid-fullscreen">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#271E37"
          hoverFillColor="#5227FF"
        />
      </div>

      {/* Form overlaid on top */}
      <div className="register-overlay">
        <div className="auth-wrapper">

          <div className="auth-left">
            <div className="brand-block">
              <AuthLeft />
            </div>
          </div>

          <div className="auth-right register-page-right">
            <div className="login-card register-card">
              <h2>Register</h2>

              <form onSubmit={handleRegister}>

                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Password</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

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

                <button type="submit">Create Account</button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}