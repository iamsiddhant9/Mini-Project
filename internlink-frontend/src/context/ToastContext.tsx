// src/context/ToastContext.tsx
import { createContext, useContext, useState, useCallback, ReactElement, ReactNode } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, ReactElement> = {
    success: <Check size={14} />,
    error: <AlertTriangle size={14} />,
    info: <Info size={14} />,
};

const COLORS: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", color: "#10b981" },
    error: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)", color: "#f43f5e" },
    info: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", color: "#3b82f6" },
};

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = ++_id;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), 3500);
    }, [dismiss]);

    const success = useCallback((m: string) => toast(m, "success"), [toast]);
    const error = useCallback((m: string) => toast(m, "error"), [toast]);
    const info = useCallback((m: string) => toast(m, "info"), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, info }}>
            {children}
            {/* Toast container */}
            <div style={{
                position: "fixed", bottom: 24, right: 24, zIndex: 9999,
                display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
            }}>
                {toasts.map((t) => {
                    const c = COLORS[t.type];
                    return (
                        <div
                            key={t.id}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: c.bg, border: `1px solid ${c.border}`,
                                borderRadius: 12, padding: "10px 16px",
                                color: c.color, fontSize: 13, fontWeight: 600,
                                fontFamily: "DM Sans, sans-serif",
                                backdropFilter: "blur(12px)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                pointerEvents: "all",
                                animation: "slideInRight 0.25s ease",
                                minWidth: 200, maxWidth: 340,
                            }}
                        >
                            {ICONS[t.type]}
                            <span style={{ flex: 1, color: "var(--text)", fontWeight: 500 }}>{t.message}</span>
                            <button
                                onClick={() => dismiss(t.id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: c.color, padding: 0, display: "flex" }}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
