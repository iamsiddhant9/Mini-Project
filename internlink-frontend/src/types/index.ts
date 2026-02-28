// src/types/index.ts

export interface Internship {
  id: number;
  icon: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  stipend: string;
  stipendNum: number;
  match: number;
  logoBg: string;
  category: string;
  description: string;
  tags: string[];
  posted: string;
  deadline: string;
}

export interface Application {
  id: number;
  internship: Internship;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  appliedDate: string;
  stage: string;
  notes: string;
}

export interface Skill {
  name: string;
  pct: number;
  category: string;
  color: string;
  gradient: string;
}

export interface User {
  name: string;
  initials: string;
  year: string;
  branch: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  portfolio: string;
  profileStrength: number;
}

export interface Activity {
  icon: string;
  text: string;
  boldPart: string;
  time: string;
  dotClass: string;
  chip?: string;
  chipStyle?: React.CSSProperties;
}

export interface Deadline {
  date: string;
  month: string;
  role: string;
  company: string;
  urgency: "hot" | "warm" | "cool";
  label: string;
  dayColor?: string;
  borderColor?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  branch: string;
  year: string;
  applications: number;
  interviews: number;
  offers: number;
  profileStrength: number;
  avatarGradient: string;
  isCurrentUser?: boolean;
}

export interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
  badgeClass?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
