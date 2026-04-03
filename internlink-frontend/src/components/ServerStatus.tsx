import { useState, useEffect, useRef } from "react";

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
const HEALTH_URL = `${BASE}/api/health/`;

// Only show the banner if the first health check takes > 3 seconds (cold start)
const COLD_START_THRESHOLD_MS = 3000;

export default function ServerStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "cold_start" | "offline">("checking");
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const doCheck = async () => {
      try {
        const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(120000) });
        if (res.ok) {
          const elapsed = Date.now() - startRef.current;
          setStatus(elapsed > COLD_START_THRESHOLD_MS ? "cold_start" : "online");
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-hide "cold_start" banner after 3 sec
          setTimeout(() => setStatus("online"), 3000);
        } else {
          setStatus("offline");
        }
      } catch {
        setStatus("offline");
      }
    };

    // Start ticking counter
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

    // Ping every 5 minutes to keep backend awake while the tab is open
    const keepAliveTimer = setInterval(() => {
      fetch(HEALTH_URL).catch(() => {});
    }, 5 * 60 * 1000);

    doCheck();
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      clearInterval(keepAliveTimer);
    };
  }, []);

  if (status === "online" || status === "checking" && seconds < 3) return null;

  const styles: Record<string, React.CSSProperties> = {
    bar: {
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 20px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      animation: "fadeUp 0.4s ease",
      whiteSpace: "nowrap",
    },
  };

  if (status === "cold_start") {
    return (
      <div style={{ ...styles.bar, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
        <span style={{ fontSize: 16 }}>✅</span> Server back online!
      </div>
    );
  }

  if (status === "offline") {
    return (
      <div style={{ ...styles.bar, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
        <span style={{ fontSize: 16 }}>⚠️</span> Backend is unreachable. Check your connection.
      </div>
    );
  }

  // Checking / cold-starting
  return (
    <div style={{ ...styles.bar, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 15 }}>⚙️</span>
        <span>Waking up server… {seconds}s</span>
      </div>
      <div style={{ fontSize: 11, color: "rgba(251,191,36,0.8)", fontWeight: 500 }}>
        Please allow up to 59s. Thank you for your patience!
      </div>
    </div>
  );
}
