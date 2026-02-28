// Login.tsx
import AuthLeft from "../components/AuthLeft.tsx";
import Squares from "../components/Squares.tsx";
import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ email }));
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      {/* Background Layer */}
      <div className="liquid-fullscreen">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#271E37"
          hoverFillColor="#5227FF"
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="login-overlay">
        <div className="auth-wrapper">

          <div className="auth-left">
            <div className="brand-block">
              <AuthLeft />
            </div>
          </div>

          <div className="auth-right">
            <div className="login-card">
              <h2>Login</h2>
              <form onSubmit={handleLogin}>
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
                  placeholder="**********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit">Login</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}