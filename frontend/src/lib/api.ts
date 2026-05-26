const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 204) return {} as T;

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    return data;
  }

  // Auth
  async register(email: string, name: string, password: string) {
    return this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  // Meetings
  async uploadMeeting(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>("/meetings/upload", {
      method: "POST",
      body: formData,
    });
  }

  async getMeetings(limit = 20, offset = 0) {
    return this.request<any[]>(`/meetings?limit=${limit}&offset=${offset}`);
  }

  async getMeeting(id: string) {
    return this.request<any>(`/meetings/${id}`);
  }

  async deleteMeeting(id: string) {
    return this.request<any>(`/meetings/${id}`, { method: "DELETE" });
  }

  async searchMeetings(q: string) {
    return this.request<any[]>(`/meetings/search?q=${encodeURIComponent(q)}`);
  }

  async aiSearchMeetings(q: string) {
    return this.request<{
      query: string;
      summary: string;
      results: {
        meeting_id: string;
        title: string;
        snippet: string;
        relevance_score: number;
        category: string;
        created_at: string | null;
      }[];
    }>(`/meetings/ai-search/results?q=${encodeURIComponent(q)}`);
  }

  async aiAnalystQuery(q: string) {
    return this.request<{
      query: string;
      answer: string;
      key_points: string[];
      results: {
        meeting_id: string;
        title: string;
        snippet: string;
        relevance_score: number;
        category: string;
        created_at: string | null;
      }[];
    }>(`/meetings/ai-analyst?q=${encodeURIComponent(q)}`);
  }

  async getRelatedMeetings(meetingId: string) {
    return this.request<any[]>(`/meetings/${meetingId}/related`);
  }

  // Tasks
  async getTasks() {
    return this.request<any[]>("/meetings/tasks");
  }

  async updateTask(id: string, status: string) {
    return this.request<any>(`/meetings/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Chat
  async sendChatMessage(meetingId: string, message: string, sessionId?: string) {
    return this.request<any>("/chat", {
      method: "POST",
      body: JSON.stringify({
        meeting_id: meetingId,
        message,
        session_id: sessionId || null,
      }),
    });
  }

  async getChatSession(meetingId: string) {
    return this.request<any>(`/chat/session?meeting_id=${meetingId}`);
  }

  // Analytics
  async getAnalytics() {
    return this.request<any>("/analytics");
  }

  // Reports
  async downloadReport(meetingId: string) {
    const res = await fetch(`${API_BASE}/reports/${meetingId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to download report");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${meetingId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Settings
  async getProfile() {
    return this.request<any>("/settings/profile");
  }

  async updateProfile(data: { name?: string; language?: string }) {
    return this.request<any>("/settings/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>("/settings/avatar", {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient();
