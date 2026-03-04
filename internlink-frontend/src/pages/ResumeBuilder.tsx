// src/pages/ResumeBuilder.tsx
import { useState, ReactElement } from "react";
import './ResumeBuilder.css';

interface Entry { id: number; title: string; sub: string; date: string; desc: string; }

const initExp: Entry[] = [
  { id: 1, title: "SDE Intern", sub: "StartupX · Remote", date: "Jun–Aug 2024", desc: "Built REST APIs using Node.js, improved response time by 40%." },
];
const initProj: Entry[] = [
  { id: 1, title: "ML Price Predictor", sub: "Python, Scikit-learn, Flask", date: "Jan 2025", desc: "Trained regression model on 50k housing records with 92% accuracy." },
  { id: 2, title: "InternLink Platform", sub: "React, TypeScript, Vite", date: "Feb 2025", desc: "Full-stack internship dashboard with AI match scoring." },
];
const initEdu: Entry[] = [
  { id: 1, title: "B.E. Computer Engineering", sub: "Mumbai University", date: "2023–2027", desc: "CGPA: 9.1 / 10 · Relevant: DSA, DBMS, OS, ML" },
];

export default function ResumeBuilder(): ReactElement {
  const [experience, setExperience] = useState<Entry[]>(initExp);
  const [projects, setProjects]     = useState<Entry[]>(initProj);
  const [education, setEducation]   = useState<Entry[]>(initEdu);

  const removeEntry = (arr: Entry[], set: (e: Entry[]) => void, id: number) =>
    set(arr.filter((e) => e.id !== id));

  const addEntry = (arr: Entry[], set: (e: Entry[]) => void) =>
    set([...arr, { id: Date.now(), title: "New Entry", sub: "", date: "", desc: "" }]);

  return (
    <>
      
      <div className="resume-header">
        <h1>Resume Builder 📄</h1>
        <p>Build and export your resume section by section</p>
      </div>

      <div className="resume-layout">
        {/* Left — editor */}
        <div>
          {/* Experience */}
          <div className="section-card">
            <h3>💼 Experience</h3>
            {experience.map((e) => (
              <div className="entry-card" key={e.id}>
                <div className="entry-title">{e.title}</div>
                <div className="entry-sub">{e.sub} · {e.date}</div>
                <div className="entry-desc">{e.desc}</div>
                <span className="entry-remove" onClick={() => removeEntry(experience, setExperience, e.id)}>✕</span>
              </div>
            ))}
            <button className="add-btn" onClick={() => addEntry(experience, setExperience)}>+ Add Experience</button>
          </div>

          {/* Projects */}
          <div className="section-card">
            <h3>🚀 Projects</h3>
            {projects.map((e) => (
              <div className="entry-card" key={e.id}>
                <div className="entry-title">{e.title}</div>
                <div className="entry-sub">{e.sub} · {e.date}</div>
                <div className="entry-desc">{e.desc}</div>
                <span className="entry-remove" onClick={() => removeEntry(projects, setProjects, e.id)}>✕</span>
              </div>
            ))}
            <button className="add-btn" onClick={() => addEntry(projects, setProjects)}>+ Add Project</button>
          </div>

          {/* Education */}
          <div className="section-card">
            <h3>🎓 Education</h3>
            {education.map((e) => (
              <div className="entry-card" key={e.id}>
                <div className="entry-title">{e.title}</div>
                <div className="entry-sub">{e.sub} · {e.date}</div>
                <div className="entry-desc">{e.desc}</div>
                <span className="entry-remove" onClick={() => removeEntry(education, setEducation, e.id)}>✕</span>
              </div>
            ))}
            <button className="add-btn" onClick={() => addEntry(education, setEducation)}>+ Add Education</button>
          </div>
        </div>

        {/* Right — preview */}
        <div>
          <div className="preview-card">
            <h3>Live Preview <span className="ai-badge">Auto-updated</span></h3>
            <div className="resume-preview">
              <div className="rp-name">Siddhant Sonarkar</div>
              <div className="rp-contact">siddhant@example.com · github.com/siddhant · siddhant.dev · Mumbai</div>

              <div className="rp-section-title">EXPERIENCE</div>
              {experience.map((e) => (
                <div className="rp-entry" key={e.id}>
                  <div className="rp-entry-title">{e.title}</div>
                  <div className="rp-entry-sub">{e.sub} · {e.date}</div>
                  <div className="rp-entry-desc">{e.desc}</div>
                </div>
              ))}

              <div className="rp-section-title">PROJECTS</div>
              {projects.map((e) => (
                <div className="rp-entry" key={e.id}>
                  <div className="rp-entry-title">{e.title}</div>
                  <div className="rp-entry-sub">{e.sub} · {e.date}</div>
                  <div className="rp-entry-desc">{e.desc}</div>
                </div>
              ))}

              <div className="rp-section-title">EDUCATION</div>
              {education.map((e) => (
                <div className="rp-entry" key={e.id}>
                  <div className="rp-entry-title">{e.title}</div>
                  <div className="rp-entry-sub">{e.sub} · {e.date}</div>
                  <div className="rp-entry-desc">{e.desc}</div>
                </div>
              ))}

              <div className="rp-section-title">SKILLS</div>
              <div style={{ fontSize: 10, color: "#374151" }}>Python · React · TypeScript · Machine Learning · SQL · Node.js · Git</div>
            </div>
            <button className="export-btn">⬇ Export as PDF</button>
          </div>
        </div>
      </div>
    </>
  );
}