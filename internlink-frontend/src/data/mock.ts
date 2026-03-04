// src/data/mock.ts
import { Internship, Application, Skill, User, LeaderboardEntry, NavGroup } from "../types";

export const user: User = {
  name: "Siddhant Sonarkar",
  initials: "SS",
  year: "2nd Year",
  branch: "Comps",
  bio: "Passionate about ML and building scalable systems. Currently exploring opportunities in AI research and backend engineering.",
  email: "siddhantsonarkar9@gmail.com",
  github: "github.com/siddhant",
  linkedin: "linkedin.com/in/siddhant",
  portfolio: "siddhant.dev",
  profileStrength: 87,
};

export const internships: Internship[] = [
  { id: 1, icon: "🧠", title: "ML Engineer Intern", company: "Google DeepMind", location: "London", mode: "Remote", stipend: "₹85k/mo", stipendNum: 85000, match: 96, logoBg: "rgba(0,100,255,0.08)", category: "AI/ML", description: "Work on cutting-edge ML models and research at DeepMind.", tags: ["Python", "TensorFlow", "Research"], posted: "2 days ago", deadline: "23 Feb" },
  { id: 2, icon: "☁️", title: "Cloud Solutions Intern", company: "Amazon AWS", location: "Bengaluru", mode: "Hybrid", stipend: "₹60k/mo", stipendNum: 60000, match: 91, logoBg: "rgba(255,165,0,0.08)", category: "Cloud", description: "Build and optimize cloud infrastructure solutions for enterprise clients.", tags: ["AWS", "Terraform", "DevOps"], posted: "3 days ago", deadline: "05 Mar" },
  { id: 3, icon: "📱", title: "iOS Dev Intern", company: "Swiggy", location: "Bengaluru", mode: "On-site", stipend: "₹45k/mo", stipendNum: 45000, match: 88, logoBg: "rgba(0,200,150,0.08)", category: "Mobile", description: "Develop features for the Swiggy iOS app used by millions.", tags: ["Swift", "iOS", "UIKit"], posted: "1 week ago", deadline: "10 Mar" },
  { id: 4, icon: "🤖", title: "AI Research Intern", company: "Microsoft Research", location: "Hyderabad", mode: "Remote", stipend: "₹75k/mo", stipendNum: 75000, match: 85, logoBg: "rgba(100,0,255,0.08)", category: "AI/ML", description: "Conduct AI research and publish papers alongside world-class researchers.", tags: ["Python", "PyTorch", "NLP"], posted: "4 days ago", deadline: "10 Mar" },
  { id: 5, icon: "🛡️", title: "Security Intern", company: "Zerodha", location: "Bengaluru", mode: "Hybrid", stipend: "₹50k/mo", stipendNum: 50000, match: 82, logoBg: "rgba(255,20,100,0.08)", category: "Security", description: "Perform security audits and vulnerability assessments.", tags: ["Security", "Python", "Networking"], posted: "5 days ago", deadline: "18 Mar" },
  { id: 6, icon: "💳", title: "Backend Intern", company: "Stripe", location: "Remote", mode: "Remote", stipend: "₹90k/mo", stipendNum: 90000, match: 79, logoBg: "rgba(0,150,255,0.08)", category: "Backend", description: "Build payment infrastructure used by millions of businesses.", tags: ["Go", "Ruby", "APIs"], posted: "1 day ago", deadline: "27 Feb" },
  { id: 7, icon: "🎨", title: "Design Intern", company: "Figma", location: "San Francisco", mode: "Remote", stipend: "₹70k/mo", stipendNum: 70000, match: 74, logoBg: "rgba(255,100,0,0.08)", category: "Design", description: "Design new features and improve UX for Figma's collaborative tools.", tags: ["Figma", "UI/UX", "Prototyping"], posted: "6 days ago", deadline: "15 Mar" },
  { id: 8, icon: "🔒", title: "Cybersecurity Intern", company: "Palo Alto Networks", location: "Bengaluru", mode: "Hybrid", stipend: "₹55k/mo", stipendNum: 55000, match: 71, logoBg: "rgba(0,200,200,0.08)", category: "Security", description: "Work on next-gen firewall and threat detection systems.", tags: ["Security", "C++", "Networking"], posted: "3 days ago", deadline: "20 Mar" },
  { id: 9, icon: "🛒", title: "Data Science Intern", company: "Flipkart", location: "Bengaluru", mode: "On-site", stipend: "₹50k/mo", stipendNum: 50000, match: 68, logoBg: "rgba(20,200,100,0.08)", category: "Data", description: "Analyze large datasets and build recommendation engines.", tags: ["Python", "SQL", "Spark"], posted: "1 week ago", deadline: "18 Mar" },
  { id: 10, icon: "🧬", title: "DevOps Intern", company: "Razorpay", location: "Bengaluru", mode: "Hybrid", stipend: "₹48k/mo", stipendNum: 48000, match: 65, logoBg: "rgba(255,0,100,0.08)", category: "DevOps", description: "Manage CI/CD pipelines and Kubernetes infrastructure.", tags: ["Docker", "K8s", "CI/CD"], posted: "5 days ago", deadline: "25 Mar" },
];

export const applications: Application[] = [
  { id: 1, internship: internships[0], status: "Interview", appliedDate: "20 Feb 2025", stage: "Technical Round 2", notes: "Prepare ML system design questions" },
  { id: 2, internship: internships[1], status: "Applied", appliedDate: "18 Feb 2025", stage: "Application Review", notes: "Follow up in 5 days" },
  { id: 3, internship: internships[5], status: "Applied", appliedDate: "15 Feb 2025", stage: "Application Review", notes: "Referral applied" },
];

export const skills: Skill[] = [
  { name: "Python", pct: 92, category: "Languages", color: "var(--accent2)", gradient: "linear-gradient(to right,#3b82f6,#06b6d4)" },
  { name: "React / TypeScript", pct: 78, category: "Frontend", color: "var(--accent3)", gradient: "linear-gradient(to right,#a78bfa,#3b82f6)" },
  { name: "Machine Learning", pct: 85, category: "AI/ML", color: "var(--green)", gradient: "linear-gradient(to right,#10b981,#3b82f6)" },
  { name: "SQL / Databases", pct: 65, category: "Data", color: "var(--gold)", gradient: "linear-gradient(to right,#fbbf24,#f59e0b)" },
  { name: "System Design", pct: 55, category: "Architecture", color: "var(--red)", gradient: "linear-gradient(to right,#f43f5e,#fb923c)" },
  { name: "Node.js", pct: 60, category: "Backend", color: "var(--accent)", gradient: "linear-gradient(to right,#3b82f6,#6366f1)" },
  { name: "Docker / DevOps", pct: 48, category: "DevOps", color: "var(--accent2)", gradient: "linear-gradient(to right,#06b6d4,#0891b2)" },
  { name: "Data Structures", pct: 80, category: "CS Fundamentals", color: "var(--green)", gradient: "linear-gradient(to right,#10b981,#059669)" },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Priya Sharma", initials: "PS", branch: "Comps", year: "3rd Year", applications: 28, interviews: 12, offers: 3, profileStrength: 98, avatarGradient: "linear-gradient(135deg,#f43f5e,#a78bfa)" },
  { rank: 2, name: "Arjun Mehta", initials: "AM", branch: "IT", year: "3rd Year", applications: 24, interviews: 10, offers: 2, profileStrength: 95, avatarGradient: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
  { rank: 3, name: "Riya Patel", initials: "RP", branch: "Comps", year: "2nd Year", applications: 21, interviews: 8, offers: 2, profileStrength: 92, avatarGradient: "linear-gradient(135deg,#10b981,#3b82f6)" },
  { rank: 4, name: "Siddhant Sonarkar", initials: "SS", branch: "Comps", year: "2nd Year", applications: 14, interviews: 6, offers: 0, profileStrength: 87, avatarGradient: "linear-gradient(135deg,#a78bfa,#3b82f6)", isCurrentUser: true },
  { rank: 5, name: "Karan Verma", initials: "KV", branch: "EXTC", year: "3rd Year", applications: 18, interviews: 5, offers: 1, profileStrength: 84, avatarGradient: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
  { rank: 6, name: "Ananya Singh", initials: "AS", branch: "IT", year: "2nd Year", applications: 16, interviews: 4, offers: 1, profileStrength: 81, avatarGradient: "linear-gradient(135deg,#f43f5e,#fbbf24)" },
  { rank: 7, name: "Dev Nair", initials: "DN", branch: "Comps", year: "3rd Year", applications: 12, interviews: 3, offers: 0, profileStrength: 78, avatarGradient: "linear-gradient(135deg,#06b6d4,#10b981)" },
  { rank: 8, name: "Sneha Kulkarni", initials: "SK", branch: "EXTC", year: "2nd Year", applications: 10, interviews: 2, offers: 0, profileStrength: 74, avatarGradient: "linear-gradient(135deg,#a78bfa,#f43f5e)" },
];

export const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { icon: "⚡", label: "Dashboard", path: "/" },
      { icon: "🎯", label: "Recommendations", path: "/recommendations", badge: 12 },
      { icon: "🔍", label: "Explore", path: "/explore" },
      { icon: "📋", label: "Applications", path: "/applications", badge: 3, badgeClass: "gold" },
    ],
  },
  {
    label: "Profile",
    items: [
      { icon: "👤", label: "My Profile", path: "/profile" },
      { icon: "🧠", label: "Skill Analysis", path: "/skills" },
      { icon: "❤️", label: "Saved", path: "/saved", badge: 7, badgeClass: "green" },
      { icon: "📄", label: "Resume Builder", path: "/resume" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: "📊", label: "Analytics", path: "/analytics" },
      { icon: "🏆", label: "Leaderboard", path: "/leaderboard" },
      { icon: "⚙️", label: "Settings", path: "/settings" },
    ],
  },
];
