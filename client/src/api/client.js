// Determine the API base URL.
// Prefer VITE_API_URL; fall back to Render and always include /api.
const rawApiUrl = import.meta.env.VITE_API_URL || "https://nirmaan-cm302-lakshya.onrender.com";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_BASE_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("lakshya_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data.message || data.error || response.statusText || "Request failed";
      throw new Error(`Request failed (${response.status}) ${detail} — ${url}`);
    }

    return data;
  } catch (err) {
    throw new Error(`${err.message || "Request failed"} — ${url}`);
  }
}


export const authApi = {
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  requestPasswordOtp: (payload) =>
    apiRequest("/auth/forgot-password/request-otp", { method: "POST", body: JSON.stringify(payload) }),
  resetPasswordWithOtp: (payload) =>
    apiRequest("/auth/forgot-password/reset", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiRequest("/auth/me")
};

export const studyPlanApi = {
  fromPdf: (formData) =>
    fetch(`${API_BASE_URL}/study-plans/from-pdf`, {
      method: "POST",
      body: formData
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "PDF API error");
      }

      return data;
    }),
  generate: (payload) => apiRequest("/study-plans/generate-plan", { method: "POST", body: JSON.stringify(payload) }),
  today: () => apiRequest("/study-plans/today-plan"),
  lastMinute: () => apiRequest("/study-plans/last-minute")
};

export const chatApi = {
  listRooms: () => apiRequest("/chat-rooms"),
  roomMessages: (roomId) => apiRequest(`/chat-rooms/${roomId}/messages`),
  sendMessage: (roomId, payload) => apiRequest(`/chat-rooms/${roomId}/messages`, { method: "POST", body: JSON.stringify(payload) }),
  inviteByEmail: (roomId, payload) =>
    apiRequest(`/chat-rooms/${roomId}/invitations`, { method: "POST", body: JSON.stringify(payload) })
};

export const examApi = {
  upcoming: () => apiRequest("/exam-sessions/upcoming"),
  active: () => apiRequest("/exam-sessions/active"),
  start: (payload) => apiRequest("/exam-sessions/start", { method: "POST", body: JSON.stringify(payload) })
};
