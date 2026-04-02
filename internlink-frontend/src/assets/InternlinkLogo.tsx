// src/assets/InternlinkLogo.tsx
// Premium geometric logo — luxury refined aesthetic

interface InternLinkLogoProps {
  size?: number;
  variant?: "full" | "icon" | "splash";
  theme?: "dark" | "light";
}

export default function InternLinkLogo({
  size = 40,
  variant = "full",
  theme = "dark",
}: InternLinkLogoProps) {
  const wordmarkColor = theme === "dark" ? "#f1f5f9" : "#0f172a";
  const subColor      = theme === "dark" ? "#475569" : "#94a3b8";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28 }}>

      {/* ── Icon Mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="il-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#0d1b2e" />
            <stop offset="100%" stopColor="#0a1220" />
          </linearGradient>
          <linearGradient id="il-gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#d4a843" />
            <stop offset="50%"  stopColor="#f0c96a" />
            <stop offset="100%" stopColor="#c49432" />
          </linearGradient>
          <linearGradient id="il-silver" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#e2e8f0" stopOpacity="1" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="il-border" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#d4a843" stopOpacity="0.6" />
            <stop offset="40%"  stopColor="#1e3a5f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="il-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="il-drop" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* ── Background ── */}
        <rect width="48" height="48" rx="11" fill="url(#il-bg)" filter="url(#il-drop)" />
        {/* Shine — top half */}
        <path d="M0 0 Q0 0 11 0 L37 0 Q48 0 48 11 L48 24 L0 24 Z" fill="url(#il-shine)" />
        {/* Precision border with gold tint */}
        <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="10.5"
          fill="none" stroke="url(#il-border)" strokeWidth="1" />

        {/*
          ── The Mark: Two interlocked rectangular rings ──
          Clean. Geometric. Like two link rings in a chain, dead-on minimal.
          No curves, no swooshes — pure precision.
          Left ring: silver/white  |  Right ring: gold, offset downward
        */}

        {/* Left ring — silver */}
        <rect x="9" y="12" width="16" height="18" rx="4"
          className={variant === "splash" ? "splash-ring-silver" : ""}
          fill="none" stroke="url(#il-silver)" strokeWidth="2.4" />
        {/* Erase right wall of left ring (open side faces right ring) */}
        <rect x="21" y="16.5" width="5" height="9" 
          className={variant === "splash" ? "splash-erase" : ""}
          fill="url(#il-bg)" />

        {/* Right ring — gold, shifted right + down */}
        <rect x="23" y="18" width="16" height="18" rx="4"
          className={variant === "splash" ? "splash-ring-gold" : ""}
          fill="none" stroke="url(#il-gold)" strokeWidth="2.4" />
        {/* Erase left wall of right ring */}
        <rect x="22" y="22.5" width="5" height="9" 
          className={variant === "splash" ? "splash-erase" : ""}
          fill="url(#il-bg)" />

        {/* The overlap zone — clean cut */}
        <rect x="23" y="22.2" width="2.5" height="8.6" rx="0.5" fill="url(#il-bg)" />

        {/* Gold accent pip — top right corner, cardinal north */}
        <circle cx="38" cy="10" r="2.2" fill="url(#il-gold)" />
        <circle cx="38" cy="10" r="3.8" fill="none" stroke="#d4a843" strokeWidth="0.6" strokeOpacity="0.4" />

        {/* Hairline rule — bottom of mark, full width, gold */}
        <line x1="9" y1="40" x2="39" y2="40"
          stroke="url(#il-gold)" strokeWidth="0.8" strokeOpacity="0.3" />
      </svg>

      {/* ── Wordmark ── */}
      {(variant === "full" || variant === "splash") && (
        <div 
          className={variant === "splash" ? "splash-wordmark" : ""}
          style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}
        >
          {/* Main name */}
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: size * 0.45,
              letterSpacing: "-0.035em",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span style={{ color: wordmarkColor }}>Intern</span>
            <span style={{ color: "#d4a843", fontWeight: 800 }}>Link</span>
          </div>
          {/* Micro subtitle */}
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: size * 0.175,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: subColor,
            }}
          >
            Career Platform
          </div>
        </div>
      )}
    </div>
  );
}