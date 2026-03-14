import AuthLeft from "../components/AuthLeft.tsx";
import Squares from "../components/Squares.tsx";
import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID = "201990083542-bh5213dhvhjqaq6kkiot1rcj15jv0q91.apps.googleusercontent.com";

export default function Login() {
  const [email, setEmail]       = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError]       = useState<string>("");
  const [loading, setLoading]   = useState<boolean>(false);
  const [gLoading, setGLoading] = useState<boolean>(false);
  const { login, googleLogin }  = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const existing = document.getElementById("gsi-script");
    if (existing) { initGoogle(); return; }
    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogle();
    document.body.appendChild(script);
  }, []);

  const initGoogle = () => {
    (window as any).google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });
    (window as any).google?.accounts.id.renderButton(
      document.getElementById("google-btn-login"),
      { theme: "filled_black", size: "large", width: 340, text: "signin_with", shape: "rectangular" }
    );
  };

  const handleGoogleCallback = async (response: any) => {
    setGLoading(true);
    setError("");
    try {
      const role = await googleLogin(response.credential);
      if (role === "admin")          navigate("/admin");
      else if (role === "recruiter") navigate("/recruiter");
      else                           navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      if (role === "admin")          navigate("/admin");
      else if (role === "recruiter") navigate("/recruiter");
      else                           navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="liquid-fullscreen">
        <Squares speed={0.5} squareSize={40} direction="diagonal" borderColor="#271E37" hoverFillColor="#5227FF" />
      </div>
      <div className="login-overlay">
        <div className="auth-wrapper">
          <div className="auth-left">
            <div className="brand-block"><AuthLeft /></div>
          </div>
          <div className="auth-right">
            <div className="login-card">
              <h2>Login</h2>

              {/* ── Google button ── */}
              <div id="google-btn-login" style={{ width: "100%", marginBottom: 4 }} />
              {gLoading && <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", margin: "4px 0 8px" }}>Signing in with Google…</p>}

              {/* ── Divider ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              <form onSubmit={handleLogin}>
                <label>Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label>Password</label>
                <input type="password" placeholder="**********" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p style={{ color: "#ef4444", fontSize: "14px", margin: "4px 0 8px" }}>{error}</p>}
                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
              </form>

              <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
                Don't have an account?{" "}
                <span onClick={() => navigate("/register")} style={{ color: "#5227FF", cursor: "pointer" }}>Register</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}