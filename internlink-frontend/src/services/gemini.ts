// src/services/gemini.ts
// AI service — calls Django backend (Groq/Llama). API key is server-side.

import * as apiSvc from "./api";


// ── Key management (kept for Settings UI compatibility, key lives on server) ──
const API_KEY_LS = "gemini_api_key";
export const getGeminiKey = (): string => localStorage.getItem(API_KEY_LS) ?? "";
export const setGeminiKey = (key: string) => localStorage.setItem(API_KEY_LS, key.trim());
export const hasGeminiKey = (): boolean => true; // backend always handles it

// ── Feature 1: Smart Match Score + Explanation ─────────────────────────────────
export interface MatchInput {
    userName: string; userSkills: string[]; userBranch: string; userBio: string;
    internTitle: string; company: string; location: string; mode: string;
    category: string; tags: string[]; stipend: string; deadline: string;
    matchScore: number | null;
}

export interface MatchResult {
    score: number;         // 0-100 AI-computed
    explanation: string;
}

export async function generateMatchExplanation(input: MatchInput): Promise<MatchResult> {
    const data = await apiSvc.ai.matchExplanation({
        internship: {
            title: input.internTitle, company: input.company,
            location: input.location, mode: input.mode,
            category: input.category, tags: input.tags,
            stipend: input.stipend, deadline: input.deadline,
            match_score: input.matchScore,
        },
        user: {
            name: input.userName,
            skills: input.userSkills.map((name) => ({ name })),
            branch: input.userBranch, bio: input.userBio,
        },
    });

    return {
        score: typeof data.score === "number" ? data.score : 0,
        explanation: data.explanation ?? "",
    };
}


// ── Feature 2: Skill Gap Detector ─────────────────────────────────────────────
export interface GapItem {
    skill: string;
    priority: "high" | "medium" | "low";
    reason: string;
    resource: string;
}

export async function fetchSkillGap(): Promise<GapItem[]> {
    const data = await apiSvc.ai.skillGap();
    return data.gaps ?? [];
}


// ── Feature 3: AI Resume Generator ────────────────────────────────────────────
export interface ResumeEntry { title: string; sub: string; date: string; desc: string; }
export interface GeneratedResume {
    summary: string;
    experience: ResumeEntry[];
    projects: ResumeEntry[];
    education: ResumeEntry[];
}

export async function generateResume(payload: {
    target_role: string;
    highlight_project: string;
    highlight_experience: string;
}): Promise<GeneratedResume> {
    return await apiSvc.ai.generateResume(payload);
}

