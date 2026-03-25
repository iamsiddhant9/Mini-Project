const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ── Token Management ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

// ── Base Fetch ────────────────────────────────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in progress, reuse it (prevent race conditions)
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();
  if (!refresh) return false;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        console.error(`Token refresh failed: ${res.status} ${res.statusText}`);
        return false;
      }
      const data = await res.json();
      // Save both the new access token AND the rotated refresh token
      setTokens(data.access, data.refresh || refresh);
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function request(endpoint: string, options: RequestInit = {}) {

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE_URL}${endpoint}`;
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Only try to refresh if we actually have a refresh token (i.e. user was logged in)
    if (getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${getToken()}`;
        res = await fetch(url, { ...options, headers });
      } else {
        clearTokens();
        window.location.href = "/#/login";
        return { error: "Session expired. Please log in again." };
      }
    }
    // No refresh token → fall through and return the JSON error from the backend
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    console.error(`API Error: Expected JSON, but got ${contentType} from ${url}`);
    console.error(`Status: ${res.status} ${res.statusText}`);
    console.error(`Response snippet: ${text.substring(0, 200)}...`);
    throw new Error(`Invalid response from server: ${res.status}`);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register: (data: {
    email: string; password: string; name: string;
    branch?: string; year?: number; university?: string;
  }) => request("/auth/register/", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request("/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }),

  googleLogin: (credential: string) =>
    request("/auth/google/", { method: "POST", body: JSON.stringify({ credential }) }),

  logout: () => clearTokens(),
};


// ── User ──────────────────────────────────────────────────────────────────────
export const user = {
  getProfile: () => request("/users/me/"),
  updateProfile: (data: Record<string, unknown>) =>
    request("/users/me/", { method: "PATCH", body: JSON.stringify(data) }),
  getStats: () => request("/users/stats/"),
  getSkills: () => request("/users/skills/"),
  addSkill: (skill: string, level: number) =>
    request("/users/skills/", { method: "POST", body: JSON.stringify({ skill, level }) }),
  removeSkill: (skillId: number) =>
    request(`/users/skills/${skillId}/`, { method: "DELETE" }),
  computeMatches: () =>
    request("/users/compute-matches/", { method: "POST", body: JSON.stringify({}) }),
  getNotifications: () => request("/users/notifications/"),
  markNotificationRead: (id?: number) =>
    request("/users/notifications/", { method: "PATCH", body: JSON.stringify(id ? { id } : {}) }),
  logActivity: (data: { event_type: string; path?: string; duration?: number }) =>
    request("/users/activity/", { method: "POST", body: JSON.stringify(data) }),
};

// ── Internships ───────────────────────────────────────────────────────────────
export const internships = {
  list: (params?: {
    search?: string; category?: string; mode?: string;
    order_by?: string; limit?: number; offset?: number;
  }) => {
    const clean = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
    );
    const query = new URLSearchParams(clean as Record<string, string>).toString();
    return request(`/internships/${query ? "?" + query : ""}`);
  },
  detail: (id: number) => request(`/internships/${id}/`),
  recommendations: (limit = 10) => request(`/internships/recommendations/?limit=${limit}`),
  filters: () => request("/internships/filters/"),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applications = {
  list: () => request("/applications/"),
  apply: (internship_id: number, notes = "") =>
    request("/applications/", { method: "POST", body: JSON.stringify({ internship_id, notes }) }),
  update: (id: number, data: { status?: string; stage?: string; notes?: string }) =>
    request(`/applications/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => request(`/applications/${id}/`, { method: "DELETE" }),
  stats: () => request("/applications/stats/"),
};

// ── Saved ─────────────────────────────────────────────────────────────────────
export const saved = {
  list: () => request("/saved/"),
  save: (internship_id: number) =>
    request("/saved/", { method: "POST", body: JSON.stringify({ internship_id }) }),
  unsave: (internship_id: number) =>
    request(`/saved/${internship_id}/`, { method: "DELETE" }),
};

// ── Hackathons ────────────────────────────────────────────────────────────────
export const hackathons = {
  list: (params?: {
    theme?: string; mode?: string; status?: string;
    search?: string; order_by?: string;
  }) => {
    const clean = Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== "")
    );
    const query = new URLSearchParams(clean as Record<string, string>).toString();
    return request(`/hackathons/${query ? "?" + query : ""}`);
  },
  detail: (id: number) => request(`/hackathons/${id}/`),
  recommendations: (limit = 10) => request(`/hackathons/recommendations/?limit=${limit}`),
};

// ── Recruiter ────────────────────────────────────────────────────────────────
export const recruiter = {
  getStats: () => request("/recruiter/stats/"),
  getInternships: () => request("/recruiter/internships/"),
  postInternship: (data: any) => request("/recruiter/internships/", { method: "POST", body: JSON.stringify(data) }),
  getApplicants: (internshipId: number) => request(`/recruiter/internships/${internshipId}/applicants/`),
  updateApplicationStatus: (appId: number, status: string) =>
    request(`/recruiter/applications/${appId}/`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const ai = {
  matchExplanation: (data: any) => request("/ai/match-explanation/", { method: "POST", body: JSON.stringify(data) }),
  skillGap: () => request("/ai/skill-gap/", { method: "POST", body: JSON.stringify({}) }),
  generateResume: (data: any) => request("/ai/generate-resume/", { method: "POST", body: JSON.stringify(data) }),
};


// ── Admin ────────────────────────────────────────────────────────────────────
export const admin = {
  getStats: () => request("/admin-panel/stats/"),
  getPendingRecruiters: () => request("/admin-panel/pending-recruiters/"),
  getUsers: (params?: { role?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/admin-panel/users/${query ? "?" + query : ""}`);
  },
  getInternships: () => request("/admin-panel/internships/"),
  approveRecruiter: (userId: number, action: "approve" | "reject") =>
    request(`/admin-panel/users/${userId}/approve/`, { method: "PATCH", body: JSON.stringify({ action }) }),
  toggleUser: (userId: number) =>
    request(`/admin-panel/users/${userId}/toggle/`, { method: "PATCH", body: JSON.stringify({}) }),
  getUserDetail: (userId: number) =>
    request(`/admin-panel/users/${userId}/detail/`),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobs = {
  fetchAll: () => request("/jobs/fetch-all/", { method: "POST", body: JSON.stringify({}) }),
};