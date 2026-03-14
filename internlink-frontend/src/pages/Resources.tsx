import { useState, ReactElement } from "react";
import { ExternalLink, BookOpen, Code, FileText, Youtube, Globe, Star, Search, Briefcase, Brain, Terminal, Database } from "lucide-react";
import "./Resources.css";

const RESOURCES = [
  // DSA
  { id: 1,  category: "DSA", title: "Striver's A2Z DSA Sheet", description: "The most comprehensive DSA roadmap. 455 problems organized topic-wise from basics to advanced.", url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", type: "Article", free: true, rating: 5 },
  { id: 2,  category: "DSA", title: "NeetCode 150", description: "Curated 150 LeetCode problems that cover every pattern needed to ace FAANG interviews.", url: "https://neetcode.io/practice", type: "Practice", free: true, rating: 5 },
  { id: 3,  category: "DSA", title: "LeetCode Patterns", description: "Learn the 14 coding patterns (sliding window, two pointers, BFS/DFS etc.) that solve 80% of problems.", url: "https://seanprashad.com/leetcode-patterns", type: "Practice", free: true, rating: 4 },
  { id: 4,  category: "DSA", title: "CS50x — Harvard", description: "Harvard's legendary intro to computer science. Best foundations course on the internet.", url: "https://cs50.harvard.edu/x", type: "Course", free: true, rating: 5 },
  { id: 5,  category: "DSA", title: "Visualgo", description: "Visualize data structures and algorithms step by step. Great for understanding before coding.", url: "https://visualgo.net", type: "Tool", free: true, rating: 4 },

  // Interview Prep
  { id: 6,  category: "Interview", title: "Tech Interview Handbook", description: "End-to-end guide for software engineering interviews — resume, coding, system design, behavioral.", url: "https://www.techinterviewhandbook.org", type: "Guide", free: true, rating: 5 },
  { id: 7,  category: "Interview", title: "Pramp — Mock Interviews", description: "Free peer-to-peer mock technical interviews. Practice with real engineers and get feedback.", url: "https://www.pramp.com", type: "Tool", free: true, rating: 4 },
  { id: 8,  category: "Interview", title: "interviewing.io", description: "Anonymous mock interviews with engineers from Google, Facebook, Amazon. See how you compare.", url: "https://interviewing.io", type: "Tool", free: false, rating: 5 },
  { id: 9,  category: "Interview", title: "Behavioral Interview Guide", description: "Master the STAR method. 50 common behavioral questions with sample answers for tech internships.", url: "https://www.techinterviewhandbook.org/behavioral-interview", type: "Guide", free: true, rating: 4 },
  { id: 10, category: "Interview", title: "System Design Primer", description: "GitHub repo with 30k+ stars. Everything you need to know about system design for interviews.", url: "https://github.com/donnemartin/system-design-primer", type: "Article", free: true, rating: 5 },

  // Resume
  { id: 11, category: "Resume", title: "Jake's Resume Template", description: "The most popular LaTeX resume template used by students who got into FAANG. Clean, ATS-friendly.", url: "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs", type: "Template", free: true, rating: 5 },
  { id: 12, category: "Resume", title: "Harvard Resume Guide", description: "Harvard OCS resume guide specifically for tech internships. Includes before/after examples.", url: "https://ocs.fas.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf", type: "Guide", free: true, rating: 4 },
  { id: 13, category: "Resume", title: "Resumeworded", description: "AI-powered resume scorer. Get instant feedback on ATS compatibility and keyword optimization.", url: "https://resumeworded.com", type: "Tool", free: false, rating: 4 },
  { id: 14, category: "Resume", title: "Canva Resume Builder", description: "Beautiful resume templates that are easy to customize. Great for design/product roles.", url: "https://www.canva.com/resumes/templates", type: "Template", free: true, rating: 3 },

  // Web Dev
  { id: 15, category: "Web Dev", title: "The Odin Project", description: "Full-stack web development curriculum. Free, open source, project-based. From zero to job-ready.", url: "https://www.theodinproject.com", type: "Course", free: true, rating: 5 },
  { id: 16, category: "Web Dev", title: "Frontend Mentor", description: "Real-world frontend challenges with professional designs. Build portfolio projects employers love.", url: "https://www.frontendmentor.io", type: "Practice", free: true, rating: 4 },
  { id: 17, category: "Web Dev", title: "Roadmap.sh", description: "Visual roadmaps for every dev role — frontend, backend, DevOps, Android. Know what to learn next.", url: "https://roadmap.sh", type: "Guide", free: true, rating: 5 },
  { id: 18, category: "Web Dev", title: "CSS Tricks", description: "Comprehensive CSS reference and tutorials. Flexbox, Grid, animations — everything CSS.", url: "https://css-tricks.com", type: "Article", free: true, rating: 4 },

  // AI/ML
  { id: 19, category: "AI/ML", title: "Fast.ai", description: "Top-down approach to deep learning. Build real models first, understand theory later. Loved by practitioners.", url: "https://www.fast.ai", type: "Course", free: true, rating: 5 },
  { id: 20, category: "AI/ML", title: "Kaggle Learn", description: "Free micro-courses on ML, Python, SQL, deep learning. Complete with certificates.", url: "https://www.kaggle.com/learn", type: "Course", free: true, rating: 4 },
  { id: 21, category: "AI/ML", title: "Andrej Karpathy — Neural Nets", description: "Build neural networks from scratch with Karpathy. The best resource for understanding LLMs.", url: "https://www.youtube.com/@AndrejKarpathy", type: "Video", free: true, rating: 5 },
  { id: 22, category: "AI/ML", title: "Papers With Code", description: "Browse ML research papers alongside their code implementations. Stay current with SOTA.", url: "https://paperswithcode.com", type: "Tool", free: true, rating: 4 },

  // Career
  { id: 23, category: "Career", title: "Levels.fyi — Internship Pay", description: "Real internship salary data from verified students. Know your worth before negotiating.", url: "https://www.levels.fyi/internships", type: "Tool", free: true, rating: 5 },
  { id: 24, category: "Career", title: "LinkedIn Optimization Guide", description: "Step-by-step guide to optimize your LinkedIn profile for recruiter discovery and internship outreach.", url: "https://www.techinterviewhandbook.org/linkedin", type: "Guide", free: true, rating: 4 },
  { id: 25, category: "Career", title: "Cold Email Templates", description: "Proven cold email templates for reaching out to engineers and recruiters for referrals.", url: "https://www.careercup.com/page?pid=cold-email-templates", type: "Template", free: true, rating: 4 },
  { id: 26, category: "Career", title: "Glassdoor Interview Reviews", description: "Read real interview experiences at top companies. Know what questions to expect before you apply.", url: "https://www.glassdoor.com/Interview/index.htm", type: "Tool", free: true, rating: 4 },
];

const CATEGORIES = ["All", "DSA", "Interview", "Resume", "Web Dev", "AI/ML", "Career"];
const TYPES      = ["All", "Course", "Practice", "Guide", "Tool", "Article", "Template", "Video"];

const categoryIcon: Record<string, ReactElement> = {
  "DSA":       <Code size={14} />,
  "Interview": <Brain size={14} />,
  "Resume":    <FileText size={14} />,
  "Web Dev":   <Terminal size={14} />,
  "AI/ML":     <Database size={14} />,
  "Career":    <Briefcase size={14} />,
};

const categoryColor: Record<string, string> = {
  "DSA":       "#3b82f6",
  "Interview": "#a78bfa",
  "Resume":    "#10b981",
  "Web Dev":   "#06b6d4",
  "AI/ML":     "#f59e0b",
  "Career":    "#f43f5e",
};

const categoryBg: Record<string, string> = {
  "DSA":       "rgba(59,130,246,0.1)",
  "Interview": "rgba(167,139,250,0.1)",
  "Resume":    "rgba(16,185,129,0.1)",
  "Web Dev":   "rgba(6,182,212,0.1)",
  "AI/ML":     "rgba(245,158,11,0.1)",
  "Career":    "rgba(244,63,94,0.1)",
};

const typeIcon: Record<string, ReactElement> = {
  "Course":   <BookOpen size={11} />,
  "Practice": <Code size={11} />,
  "Guide":    <FileText size={11} />,
  "Tool":     <Globe size={11} />,
  "Article":  <FileText size={11} />,
  "Template": <FileText size={11} />,
  "Video":    <Youtube size={11} />,
};

export default function Resources(): ReactElement {
  const [category, setCategory] = useState("All");
  const [type,     setType]     = useState("All");
  const [search,   setSearch]   = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = RESOURCES.filter(r => {
    if (category !== "All" && r.category !== category) return false;
    if (type     !== "All" && r.type     !== type)     return false;
    if (freeOnly && !r.free)                           return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
                  !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c] = c === "All" ? RESOURCES.length : RESOURCES.filter(r => r.category === c).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Header */}
      <div className="res-header">
        <div>
          <h1>Resources</h1>
          <p>Curated links for DSA, interview prep, resume building and more</p>
        </div>
        <div className="res-header-stats">
          <div className="res-stat"><span>{RESOURCES.length}</span>Resources</div>
          <div className="res-stat"><span style={{ color: "var(--green)" }}>{RESOURCES.filter(r => r.free).length}</span>Free</div>
          <div className="res-stat"><span style={{ color: "var(--gold)" }}>{filtered.length}</span>Showing</div>
        </div>
      </div>

      {/* Search + free toggle */}
      <div className="res-search-row">
        <div className="res-search-box">
          <Search size={15} color="var(--muted)" />
          <input
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={"res-free-toggle" + (freeOnly ? " active" : "")}
          onClick={() => setFreeOnly(f => !f)}
        >
          <Star size={13} /> Free Only
        </button>
      </div>

      {/* Category filters */}
      <div className="res-filters">
        <div className="res-filter-row">
          <span className="res-filter-label">Category:</span>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={"res-filter-btn" + (category === c ? " active" : "")}
              onClick={() => setCategory(c)}
              style={category === c && c !== "All" ? { background: categoryBg[c], color: categoryColor[c], borderColor: categoryColor[c] + "40" } : {}}
            >
              {c !== "All" && <span style={{ marginRight: 4 }}>{categoryIcon[c]}</span>}
              {c} <span className="res-count">{counts[c]}</span>
            </button>
          ))}
        </div>
        <div className="res-filter-row">
          <span className="res-filter-label">Type:</span>
          {TYPES.map(t => (
            <button key={t} className={"res-filter-btn" + (type === t ? " active" : "")} onClick={() => setType(t)}>
              {t !== "All" && <span style={{ marginRight: 4 }}>{typeIcon[t]}</span>}{t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="res-empty">
          <Search size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
          <div>No resources match your filters</div>
        </div>
      ) : (
        <div className="res-list">
          {filtered.map(r => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="res-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="res-card-left">
                <div className="res-cat-icon" style={{ background: categoryBg[r.category], color: categoryColor[r.category] }}>
                  {categoryIcon[r.category]}
                </div>
                <div className="res-card-body">
                  <div className="res-card-title">{r.title}</div>
                  <div className="res-card-desc">{r.description}</div>
                  <div className="res-card-tags">
                    <span className="res-type-tag" style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      {typeIcon[r.type]} {r.type}
                    </span>
                    <span className="res-cat-tag" style={{ background: categoryBg[r.category], color: categoryColor[r.category] }}>
                      {r.category}
                    </span>
                    <span className={r.free ? "res-free-tag" : "res-paid-tag"}>
                      {r.free ? "Free" : r.rating >= 4 ? "Paid" : "Paid"}
                    </span>
                    <span className="res-rating">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                </div>
              </div>
              <ExternalLink size={14} className="res-external-icon" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}