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
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("user");
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

    sessionStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    
    // Log explicit login event
    apiSvc.user.logActivity({ 
      event_type: "login",
      metadata: { 
        theme: localStorage.getItem("theme") || "system", 
        referrer: document.referrer || "Direct"
      }
    }).catch(() => {});
    
    return res.user.role;
  };

  const googleLogin = async (credential: string) => {
    const res = await apiSvc.auth.googleLogin(credential);

    if (res.error) throw new Error(res.error);
    apiSvc.setTokens(res.tokens.access, res.tokens.refresh);

    sessionStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
    
    // Log explicit login event
    apiSvc.user.logActivity({ 
      event_type: "login",
      metadata: { theme: localStorage.getItem("theme") || "system", screen_width: window.innerWidth, os: navigator.platform }
    }).catch(() => {});
    
    return res.user.role as string;
  };


  const register = async (data: any) => {
    const res = await apiSvc.auth.register(data);
    if (res.error) throw new Error(res.error);
    apiSvc.setTokens(res.tokens.access, res.tokens.refresh);

    sessionStorage.setItem("user", JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    // Log explicit logout event; do it synchronously before clearing tokens
    apiSvc.user.logActivity({ 
      event_type: "logout",
      metadata: { session_end: new Date().toISOString() } 
    }).catch(() => {}).finally(() => {
      apiSvc.clearTokens();
      setUser(null);
      window.location.href = "/#/login";
    });
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};