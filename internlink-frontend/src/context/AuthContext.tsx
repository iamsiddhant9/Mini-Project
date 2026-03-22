import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as apiSvc from "../services/api";

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



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token  = apiSvc.getToken();

    if (stored && token) {
      setUser(JSON.parse(stored));
    } else {
      apiSvc.clearTokens();
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiSvc.auth.login(email, password);

    if (res.error) throw new Error(res.error);
    apiSvc.setTokens(res.tokens.access, res.tokens.refresh);

    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user.role;
  };

  const googleLogin = async (credential: string) => {
    const res = await apiSvc.auth.googleLogin(credential);

    if (res.error) throw new Error(res.error);
    apiSvc.setTokens(res.tokens.access, res.tokens.refresh);

    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user.role as string;
  };


  const register = async (data: any) => {
    const res = await apiSvc.auth.register(data);
    if (res.error) throw new Error(res.error);
    apiSvc.setTokens(res.tokens.access, res.tokens.refresh);

    localStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    apiSvc.clearTokens();

    setUser(null);
    window.location.href = "/#/login";
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