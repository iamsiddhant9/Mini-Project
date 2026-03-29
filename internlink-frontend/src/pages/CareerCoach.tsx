import { useState, useRef, useEffect, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Send, Bot, User, Sparkles, RotateCcw, Briefcase,
  ChevronRight, Lightbulb, TrendingUp, Map, Heart
} from "lucide-react";
import * as apiSvc from "../services/api";
import "./CareerCoach.css";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Markdown-like renderer (bold, headers, bullets) ──────────────────────────
function RenderMarkdown({ 
  text, 
  onOptionClick,
  onRoadmapClick 
}: { 
  text: string; 
  onOptionClick?: (text: string) => void;
  onRoadmapClick?: () => void;
}): ReactElement {
  const lines = text.split("\n");

  const parsed = lines.map((line, i) => {
    // H2
    if (line.startsWith("## ")) {
      return (
        <div key={i} className="md-h2">
          <TrendingUp size={14} className="md-h2-icon" />
          {renderInline(line.slice(3))}
        </div>
      );
    }
    // H3
    if (line.startsWith("### ")) {
      return <div key={i} className="md-h3">{renderInline(line.slice(4))}</div>;
    }
    // Clickable Option
    const optMatch = line.match(/^(?:[-*•]\s+)?\[Option:\s*(.+)\]$/i);
    if (optMatch) {
      return (
        <button
          key={i}
          className="md-option-btn"
          onClick={() => onOptionClick?.(optMatch[1])}
        >
          {optMatch[1]}
          <ChevronRight size={14} className="md-option-arrow" />
        </button>
      );
    }
    // Visual Roadmap
    if (line.match(/^\[VISUAL_ROADMAP\]$/i)) {
      return (
        <button
          key={i}
          className="md-roadmap-btn"
          onClick={() => onRoadmapClick?.()}
        >
          <Map size={15} /> View Detailed Visual Roadmap
          <ChevronRight size={14} style={{ marginLeft: "auto" }} />
        </button>
      );
    }
    // Bullet
    if (line.match(/^[-*•]\s/)) {
      return (
        <div key={i} className="md-bullet">
          <ChevronRight size={12} className="md-bullet-icon" />
          <span>{renderInline(line.replace(/^[-*•]\s/, ""))}</span>
        </div>
      );
    }
    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)?.[1];
      return (
        <div key={i} className="md-numbered">
          <span className="md-num">{num}</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    }
    // Empty line
    if (line.trim() === "") return <div key={i} className="md-spacer" />;
    // Normal paragraph
    return <div key={i} className="md-para">{renderInline(line)}</div>;
  });

  return <div className="md-body">{parsed}</div>;
}

function renderInline(text: string): ReactElement {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ── Starter prompts ───────────────────────────────────────────────────────────
const STARTERS = [
  { icon: <Briefcase size={16} />, label: "I have no idea what career to choose" },
  { icon: <Map size={16} />,       label: "I don't like coding — what else can I do?" },
  { icon: <TrendingUp size={16} />,label: "I want a high-paying tech career" },
  { icon: <Lightbulb size={16} />, label: "I love design and creativity" },
  { icon: <Heart size={16} />,     label: "I want to work at a startup" },
];

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots(): ReactElement {
  return (
    <div className="typing-dots">
      <span /><span /><span />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CareerCoach(): ReactElement {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setError("");

    const userMsg: Message = { role: "user", content: content.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    setLoading(true);

    try {
      const res = await apiSvc.ai.careerCoach(newHistory);
      if (res.error) throw new Error(res.error);
      const assistantMsg: Message = { role: "assistant", content: res.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    setError("");
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hasMessages = messages.length > 0;

  return (
    <div className="coach-page">

      {/* ── Header ── */}
      <div className="coach-header">
        <div className="coach-header-left">
          <div className="coach-avatar-wrap">
            <Bot size={20} className="coach-bot-icon" />
          </div>
          <div>
            <h1 className="coach-title">
              Sid <span className="ai-badge-coach"><Sparkles size={11} /> AI Career Coach</span>
            </h1>
            <p className="coach-subtitle">Your personal guide to finding the perfect career path</p>
          </div>
        </div>
        {hasMessages && (
          <button className="coach-reset-btn" onClick={reset} title="Start over">
            <RotateCcw size={15} /> New Chat
          </button>
        )}
      </div>

      {/* ── Chat area ── */}
      <div className="coach-chat-area">

        {/* Empty state */}
        {!hasMessages && (
          <div className="coach-empty">
            <div className="coach-welcome-icon">
              <Bot size={36} />
            </div>
            <h2 className="coach-welcome-title">Hi {firstName}! I'm Sid.</h2>
            <p className="coach-welcome-sub">
              I'm here to help you discover the career that truly fits <em>you</em>.<br />
              No judgement, no pressure — just honest, friendly guidance.
            </p>

            <div className="coach-starters">
              {STARTERS.map((s, i) => (
                <button
                  key={i}
                  className="starter-chip"
                  onClick={() => sendMessage(s.label)}
                  disabled={loading}
                >
                  <span className="starter-icon">{s.icon}</span>
                  {s.label}
                  <ChevronRight size={13} className="starter-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <div className="coach-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`coach-msg-row ${msg.role}`}>
                <div className={`coach-msg-avatar ${msg.role}`}>
                  {msg.role === "assistant"
                    ? <Bot size={15} />
                    : <User size={15} />}
                </div>
                <div className={`coach-bubble ${msg.role}`}>
                  {msg.role === "assistant"
                    ? <RenderMarkdown
                        text={msg.content}
                        onRoadmapClick={() => navigate("/roadmap", { state: { history: messages } })}
                        onOptionClick={(text) => {
                          if (!loading && i === messages.length - 1) sendMessage(text);
                        }}
                      />
                    : <span>{msg.content}</span>}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="coach-msg-row assistant">
                <div className="coach-msg-avatar assistant">
                  <Bot size={15} />
                </div>
                <div className="coach-bubble assistant typing-bubble">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="coach-error-banner">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="coach-input-bar">
        <div className="coach-input-wrap">
          <textarea
            ref={inputRef}
            className="coach-textarea"
            placeholder="Ask Sid anything about your career…  (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="coach-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="coach-input-hint">
          <Sparkles size={11} /> Powered by Groq · Llama 3.3 70B · Your data stays private
        </div>
      </div>

    </div>
  );
}
