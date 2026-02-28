// src/components/BackButton.tsx
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/dashboard")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height:40,

        gap: 6,
        padding: "7px 14px",
        borderRadius: 10,
        border: "1px solid rgba(99,179,237,0.12)",
        background: "rgba(13,20,36,0.8)",
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "all 0.2s",
        margin: 10,
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.3)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,179,237,0.12)";
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(13,20,36,0.8)";
      }}
    >
      ← Dashboard
    </button>
  );
}