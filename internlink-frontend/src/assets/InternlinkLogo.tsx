 // InternLinkLogo.tsx
// Drop-in SVG logo component - no image file needed

interface InternLinkLogoProps {
  size?: number;
  variant?: "full" | "icon";
}

export default function InternLinkLogo({ size = 40, variant = "full" }: InternLinkLogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="il-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="il-link" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="il-arrow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="il-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background rounded square */}
        <rect width="40" height="40" rx="10" fill="url(#il-bg)" />

        {/* Subtle inner highlight */}
        <rect width="40" height="40" rx="10" fill="url(#il-bg)" opacity="0.1" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="white" strokeOpacity="0.15" />

        {/* Chain link left ring */}
        <path
          d="M13 17.5 C13 14.5 15.5 12 18.5 12 L20 12 C21.1 12 22 12.9 22 14 C22 15.1 21.1 16 20 16 L18.5 16 C17.7 16 17 16.7 17 17.5 C17 18.3 17.7 19 18.5 19 L20 19 C21.1 19 22 19.9 22 21 C22 22.1 21.1 23 20 23 L18.5 23 C15.5 23 13 20.5 13 17.5 Z"
          fill="url(#il-link)"
          filter="url(#il-glow)"
        />

        {/* Chain link right ring */}
        <path
          d="M27 22.5 C27 25.5 24.5 28 21.5 28 L20 28 C18.9 28 18 27.1 18 26 C18 24.9 18.9 24 20 24 L21.5 24 C22.3 24 23 23.3 23 22.5 C23 21.7 22.3 21 21.5 21 L20 21 C18.9 21 18 20.1 18 19 C18 17.9 18.9 17 20 17 L21.5 17 C24.5 17 27 19.5 27 22.5 Z"
          fill="url(#il-link)"
          filter="url(#il-glow)"
          opacity="0.85"
        />

        {/* Upward trending arrow */}
        <path
          d="M23 13 L28 13 L28 18"
          stroke="url(#il-arrow)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 20 L28 13"
          stroke="url(#il-arrow)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Star dot accent */}
        <circle cx="28" cy="13" r="1.5" fill="#fbbf24" opacity="0.9" />
      </svg>

      {/* Wordmark */}
      {variant === "full" && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.48,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #ffffff 40%, #93c5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Intern<span style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Link</span>
          </div>
        </div>
      )}
    </div>
  );
}