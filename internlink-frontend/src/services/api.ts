const BASE_URL = "http://localhost:8000/api";

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
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Auto refresh token if expired
  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getToken()}`;
      const retry = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      return retry.json();
    } else {
      clearTokens();
      window.location.href = "/login";
      return;
    }
  }

  return res.json();
}

async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  setTokens(data.access, refresh);
  return true;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register: (data: {
    email: string; password: string; name: string;
    branch?: string; year?: number; university?: string;
  }) => request("/auth/register/", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request("/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }),

  logout: () => clearTokens(),
};

// ── User ──────────────────────────────────────────────────────────────────────
export const user = {
  getProfile:   () => request("/users/me/"),
  updateProfile: (data: Record<string, unknown>) =>
    request("/users/me/", { method: "PATCH", body: JSON.stringify(data) }),
  getStats:     () => request("/users/stats/"),
  getSkills:    () => request("/users/skills/"),
  addSkill:     (skill: string, level: number) =>
    request("/users/skills/", { method: "POST", body: JSON.stringify({ skill, level }) }),
  removeSkill:  (skillId: number) =>
    request(`/users/skills/${skillId}/`, { method: "DELETE" }),
};

// ── Internships ───────────────────────────────────────────────────────────────
export const internships = {
  list: (params?: {
    search?: string; category?: string; mode?: string;
    order_by?: string; limit?: number; offset?: number;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/internships/${query ? "?" + query : ""}`);
  },
  detail:          (id: number) => request(`/internships/${id}/`),
  recommendations: (limit = 10)  => request(`/internships/recommendations/?limit=${limit}`),
  filters:         ()             => request("/internships/filters/"),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applications = {
  list:   () => request("/applications/"),
  apply:  (internship_id: number, notes = "") =>
    request("/applications/", { method: "POST", body: JSON.stringify({ internship_id, notes }) }),
  update: (id: number, data: { status?: string; stage?: string; notes?: string }) =>
    request(`/applications/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => request(`/applications/${id}/`, { method: "DELETE" }),
  stats:  () => request("/applications/stats/"),
};

// ── Saved ─────────────────────────────────────────────────────────────────────
export const saved = {
  list:   () => request("/saved/"),
  save:   (internship_id: number) =>
    request("/saved/", { method: "POST", body: JSON.stringify({ internship_id }) }),
  unsave: (internship_id: number) => request(`/saved/${internship_id}/`, { method: "DELETE" }),
};

// ── Hackathons ────────────────────────────────────────────────────────────────
export const hackathons = {
  list: (params?: {
    theme?: string; mode?: string; status?: string;
    search?: string; order_by?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/hackathons/${query ? "?" + query : ""}`);
  },
  detail:          (id: number) => request(`/hackathons/${id}/`),
  recommendations: (limit = 10)  => request(`/hackathons/recommendations/?limit=${limit}`),
};