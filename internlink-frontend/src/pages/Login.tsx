import AuthLeft from "../components/AuthLeft.tsx";
import Squares from "../components/Squares.tsx";
import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]       = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError]       = useState<string>("");
  const [loading, setLoading]   = useState<boolean>(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const role = await login(email, password);
    if (role === "admin")     navigate("/admin");
    else if (role === "recruiter") navigate("/recruiter");
    else navigate("/dashboard");
  } catch (err: any) {
    setError(err.message || "Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="liquid-fullscreen">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#271E37"
          hoverFillColor="#5227FF"
        />
      </div>

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

                {error && (
                  <p style={{ color: "#ef4444", fontSize: "14px", margin: "4px 0 8px" }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  style={{ color: "#5227FF", cursor: "pointer" }}
                >
                  Register
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}