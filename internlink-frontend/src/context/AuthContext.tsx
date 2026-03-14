import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, setTokens, clearTokens, getToken } from "../services/api";

interface User {
  id: number;
  email: string;
  name: string;
  branch?: string;
  year?: number;
  university?: string;
  profile_strength?: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  googleLogin: (credential: string) => Promise<string>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && getToken()) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    if (res.error) throw new Error(res.error);
    setTokens(res.tokens.access, res.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user.role;
  };

  const googleLogin = async (credential: string) => {
    const res = await fetch(`${BASE_URL}/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    }).then(r => r.json());

    if (res.error) throw new Error(res.error);
    setTokens(res.tokens.access, res.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user.role as string;
  };

  const register = async (data: any) => {
    const res = await auth.register(data);
    if (res.error) throw new Error(res.error);
    setTokens(res.tokens.access, res.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};