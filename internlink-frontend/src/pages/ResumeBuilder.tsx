// src/pages/ResumeBuilder.tsx
import { useState, useEffect, useRef, useCallback, memo, ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import { user as userApi } from "../services/api";
import { useToast } from "../context/ToastContext";
import { generateResume } from "../services/gemini";
import { FileText, Briefcase, Rocket, GraduationCap, Plus, X, Download, Loader2, Sparkles } from "lucide-react";
import './ResumeBuilder.css';

interface Entry { id: number; title: string; sub: string; date: string; desc: string; }

const DEFAULT_EXP:  Entry[] = [{ id: 1, title: "", sub: "", date: "", desc: "" }];
const DEFAULT_PROJ: Entry[] = [{ id: 1, title: "", sub: "", date: "", desc: "" }];
const DEFAULT_EDU:  Entry[] = [{ id: 1, title: "", sub: "", date: "", desc: "" }];

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL: Field, EntryCard, and Section are defined OUTSIDE the parent
// component. If they were inside, React would treat them as new component
// types on every re-render, causing unmount→remount of every input, which
// resets focus and scrolls the page to the top on every keystroke.
// ─────────────────────────────────────────────────────────────────────────────

const Field = memo(function Field({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      className="entry-input"
      placeholder={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", background: "transparent", border: "none",
        borderBottom: "1px dashed rgba(255,255,255,0.1)", color: "var(--text)",
        fontSize: 12, padding: "2px 0", marginBottom: 4, outline: "none",
      }}
    />
  );
});

const EntryCard = memo(function EntryCard({ entry, labels, onUpdate, onRemove }: {
  entry: Entry;
  labels: string[];
  onUpdate: (id: number, field: keyof Entry, value: string) => void;
  onRemove: (id: number) => void;
}) {
  // Stable per-field handlers so Field never sees new props on unrelated state changes
  const handleTitle = useCallback((v: string) => onUpdate(entry.id, "title", v), [entry.id, onUpdate]);
  const handleSub   = useCallback((v: string) => onUpdate(entry.id, "sub",   v), [entry.id, onUpdate]);
  const handleDate  = useCallback((v: string) => onUpdate(entry.id, "date",  v), [entry.id, onUpdate]);
  const handleDesc  = useCallback((v: string) => onUpdate(entry.id, "desc",  v), [entry.id, onUpdate]);
  const handleRemove = useCallback(() => onRemove(entry.id), [entry.id, onRemove]);

  return (
    <div className="entry-card" style={{ position: "relative" }}>
      <Field label={labels[0]} value={entry.title} onChange={handleTitle} />
      <Field label={labels[1]} value={entry.sub}   onChange={handleSub} />
      <Field label={labels[2]} value={entry.date}  onChange={handleDate} />
      <Field label={labels[3]} value={entry.desc}  onChange={handleDesc} />
      <span className="entry-remove" onClick={handleRemove}><X size={12} /></span>
    </div>
  );
});

const Section = memo(function Section({ icon, title, entries, labels, onUpdate, onAdd, onRemove }: {
  icon: ReactElement; title: string; entries: Entry[]; labels: string[];
  onUpdate: (id: number, field: keyof Entry, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="section-card">
      <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}{title}</h3>
      {entries.map(e => (
        <EntryCard key={e.id} entry={e} labels={labels} onUpdate={onUpdate} onRemove={onRemove} />
      ))}
      <button className="add-btn" onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Plus size={13} /> Add {title}
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ResumeBuilder(): ReactElement {
  const { user }           = useAuth();
  const { success, error } = useToast();
  const previewRef         = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiTargetRole, setAiTargetRole] = useState("");
  const [aiProject,    setAiProject]    = useState("");
  const [aiExp,        setAiExp]        = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const [experience, setExperience] = useState<Entry[]>(DEFAULT_EXP);
  const [projects,   setProjects]   = useState<Entry[]>(DEFAULT_PROJ);
  const [education,  setEducation]  = useState<Entry[]>(DEFAULT_EDU);

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", github: "", linkedin: "", portfolio: "", location: "",
    summary: "",
    skills: [] as string[],
  });

  useEffect(() => {
    if (user) setProfile(p => ({ ...p, name: user.name ?? "", email: user.email ?? "" }));
    userApi.getProfile().then((data: any) => {
      if (!data) return;
      setProfile({
        name:      data.name      ?? "",
        email:     data.email     ?? "",
        phone:     "",
        summary:   "",
        github:    data.github_url    ?? "",
        linkedin:  data.linkedin_url  ?? "",
        portfolio: data.portfolio_url ?? "",
        location:  data.university    ?? "",
        skills:    (data.skills ?? []).map((s: any) => s.name).filter(Boolean),
      });
    });
  }, [user]);

  // useCallback keeps references stable → Section/EntryCard/Field never
  // receive new props just because sibling state changed → no remount → no scroll
  const updateExp  = useCallback((id: number, field: keyof Entry, v: string) =>
    setExperience(prev => prev.map(e => e.id === id ? { ...e, [field]: v } : e)), []);
  const updateProj = useCallback((id: number, field: keyof Entry, v: string) =>
    setProjects(prev => prev.map(e => e.id === id ? { ...e, [field]: v } : e)), []);
  const updateEdu  = useCallback((id: number, field: keyof Entry, v: string) =>
    setEducation(prev => prev.map(e => e.id === id ? { ...e, [field]: v } : e)), []);

  const removeExp  = useCallback((id: number) => setExperience(prev => prev.filter(e => e.id !== id)), []);
  const removeProj = useCallback((id: number) => setProjects(prev => prev.filter(e => e.id !== id)), []);
  const removeEdu  = useCallback((id: number) => setEducation(prev => prev.filter(e => e.id !== id)), []);

  const addExp  = useCallback(() => setExperience(prev => [...prev, { id: Date.now(), title: "", sub: "", date: "", desc: "" }]), []);
  const addProj = useCallback(() => setProjects(prev => [...prev,   { id: Date.now(), title: "", sub: "", date: "", desc: "" }]), []);
  const addEdu  = useCallback(() => setEducation(prev => [...prev,  { id: Date.now(), title: "", sub: "", date: "", desc: "" }]), []);

  const handleAiGenerate = async () => {
    setAiGenerating(true);
    try {
      const result = await generateResume({
        target_role:          aiTargetRole || "Software Engineer Intern",
        highlight_project:    aiProject,
        highlight_experience: aiExp,
      });
      if (result.experience?.length) setExperience(result.experience.map((e: any, i: number) => ({ id: Date.now() + i,       ...e })));
      if (result.projects?.length)   setProjects(result.projects.map((e: any, i: number)   => ({ id: Date.now() + 100 + i,   ...e })));
      if (result.education?.length)  setEducation(result.education.map((e: any, i: number)  => ({ id: Date.now() + 200 + i,  ...e })));
      setShowAiDrawer(false);
      success("Resume generated! Review and edit before exporting.");
    } catch (e: any) {
      error(e?.message ?? "Failed to generate resume. Try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const contactParts = [profile.email, profile.phone, profile.linkedin, profile.github, profile.location]
    .filter(Boolean);

  return (
    <>
      {/* AI Generate Drawer */}
      {showAiDrawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAiDrawer(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", maxWidth: 480, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="#a78bfa" /> Generate Resume with AI
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Answer 3 quick questions and Groq will write a tailored resume that fills your builder automatically.
            </p>
            {([
              { label: "Target Role",          placeholder: "e.g. Backend Engineer Intern at Google",                           value: aiTargetRole, set: setAiTargetRole },
              { label: "Your Best Project",    placeholder: "e.g. Built a real-time chat app with 500+ users using React",     value: aiProject,    set: setAiProject },
              { label: "Your Best Experience", placeholder: "e.g. Interned at startup, built REST APIs used by 10k users",     value: aiExp,        set: setAiExp },
            ] as { label: string; placeholder: string; value: string; set: (v: string) => void }[]).map(({ label, placeholder, value, set }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5 }}>{label}</label>
                <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder} rows={2}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "var(--text)", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowAiDrawer(false)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={handleAiGenerate} disabled={aiGenerating} style={{ flex: 2, padding: 10, borderRadius: 10, border: "none", background: aiGenerating ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg,#a78bfa,var(--accent))", color: "#fff", cursor: aiGenerating ? "default" : "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {aiGenerating ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />Generating…</> : <><Sparkles size={13} />Generate Resume</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="resume-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}><FileText size={26} /> Resume Builder</h1>
          <p>Build and export your resume section by section</p>
        </div>
        <button onClick={() => setShowAiDrawer(true)}
          style={{ padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#a78bfa,var(--accent))", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <Sparkles size={14} /> Generate with AI
        </button>
      </div>

      <div className="resume-layout">
        {/* Left editor */}
        <div>
          {/* ── Personal Details card ── */}
          <div className="section-card">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} /> Personal Details
            </h3>
            <Field label="Phone (e.g. +91-9876543210)" value={profile.phone}
              onChange={v => setProfile(p => ({ ...p, phone: v }))} />
            <label style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.5, display: "block", margin: "10px 0 4px" }}>
              Summary / Objective
            </label>
            <textarea
              value={profile.summary}
              onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))}
              placeholder="e.g. Final year CS student with expertise in full-stack development and AI…"
              rows={2}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px dashed rgba(255,255,255,0.1)", color: "var(--text)", fontSize: 12, padding: "2px 0", outline: "none", resize: "none" as const, fontFamily: "inherit", boxSizing: "border-box" as const }}
            />
          </div>

          {/* Education first — standard for students */}
          <Section icon={<GraduationCap size={16} />} title="Education" entries={education}
            labels={["Degree / Course", "Institution · Location", "Year Range", "Details / GPA"]}
            onUpdate={updateEdu} onAdd={addEdu} onRemove={removeEdu} />
          <Section icon={<Briefcase size={16} />} title="Experience" entries={experience}
            labels={["Job Title", "Company · Location", "Date Range", "Achievements (one per line)"]}
            onUpdate={updateExp} onAdd={addExp} onRemove={removeExp} />
          <Section icon={<Rocket size={16} />} title="Projects" entries={projects}
            labels={["Project Name", "Tech Stack", "Date", "Description (one per line)"]}
            onUpdate={updateProj} onAdd={addProj} onRemove={removeProj} />
        </div>

        {/* Right preview */}
        <div>
          <div className="preview-card">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} /> Live Preview <span className="ai-badge">Auto-updated</span>
            </h3>
            <div className="resume-preview" ref={previewRef}>

              {/* ═══ HEADER ═══ */}
              <div className="rp-header">
                <div className="rp-name">{profile.name || "YOUR NAME"}</div>
                {contactParts.length > 0 && (
                  <div className="rp-contact">{contactParts.join(" | ")}</div>
                )}
              </div>
              <hr className="rp-hr" />

              {/* ═══ SUMMARY ═══ */}
              {profile.summary && (
                <>
                  <div className="rp-section-title">SUMMARY</div>
                  <p className="rp-summary">{profile.summary}</p>
                </>
              )}

              {/* ═══ EDUCATION ═══ */}
              {education.some(e => e.title) && (
                <>
                  <div className="rp-section-title">EDUCATION</div>
                  {education.filter(e => e.title).map(e => (
                    <div className="rp-entry" key={e.id}>
                      <div className="rp-row">
                        <span className="rp-entry-title">{e.title}</span>
                        <span className="rp-entry-date">{e.date}</span>
                      </div>
                      {e.sub && <div className="rp-entry-sub">{e.sub}</div>}
                      {e.desc && <div className="rp-entry-desc">{e.desc}</div>}
                    </div>
                  ))}
                </>
              )}

              {/* ═══ EXPERIENCE ═══ */}
              {experience.some(e => e.title) && (
                <>
                  <div className="rp-section-title">EXPERIENCE</div>
                  {experience.filter(e => e.title).map(e => (
                    <div className="rp-entry" key={e.id}>
                      <div className="rp-row">
                        <span className="rp-entry-title">{e.title}</span>
                        <span className="rp-entry-date">{e.date}</span>
                      </div>
                      {e.sub && <div className="rp-entry-sub">{e.sub}</div>}
                      {e.desc && e.desc.split('\n').filter(Boolean).map((line, i) => (
                        <div className="rp-bullet" key={i}>• {line}</div>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* ═══ PROJECTS ═══ */}
              {projects.some(e => e.title) && (
                <>
                  <div className="rp-section-title">PROJECTS</div>
                  {projects.filter(e => e.title).map(e => (
                    <div className="rp-entry" key={e.id}>
                      <div className="rp-row">
                        <span className="rp-entry-title">
                          {e.title}
                          {e.sub && <span className="rp-tech"> | {e.sub}</span>}
                        </span>
                        <span className="rp-entry-date">{e.date}</span>
                      </div>
                      {e.desc && e.desc.split('\n').filter(Boolean).map((line, i) => (
                        <div className="rp-bullet" key={i}>• {line}</div>
                      ))}
                    </div>
                  ))}
                </>
              )}

              {/* ═══ SKILLS ═══ */}
              {profile.skills.length > 0 && (
                <>
                  <div className="rp-section-title">TECHNICAL SKILLS</div>
                  <div className="rp-skills-line">
                    <strong>Skills: </strong>{profile.skills.join(", ")}
                  </div>
                </>
              )}

            </div>

            <button className="export-btn" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={exporting}
              onClick={async () => {
                if (!previewRef.current) return;
                setExporting(true);
                try {
                  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
                  const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
                  const imgData = canvas.toDataURL("image/png");
                  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                  const pageW = pdf.internal.pageSize.getWidth();
                  const pageH = pdf.internal.pageSize.getHeight();
                  const imgH  = (canvas.height * pageW) / canvas.width;
                  let y = 0;
                  while (y < imgH) { pdf.addImage(imgData, "PNG", 0, -y, pageW, imgH); y += pageH; if (y < imgH) pdf.addPage(); }
                  pdf.save(`resume-${(profile.name || "download").toLowerCase().replace(/\s+/g, "-")}.pdf`);
                  success("Resume downloaded as PDF!");
                } catch { error("Failed to export PDF. Please try again."); }
                finally { setExporting(false); }
              }}>
              {exporting ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Exporting…</> : <><Download size={14} /> Export as PDF</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}