import { getStoredToken } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function buildUrl(path) {
  if (!path.startsWith("/")) return `${API_BASE}/${path}`;
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const token = getStoredToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let text;
  try {
    text = await response.text();
  } catch (e) {
    const error = new Error("Cannot reach server. Make sure the backend is running on port 5000.");
    error.status = 0;
    error.data = error.message;
    throw error;
  }

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("pmtool_token");
      localStorage.removeItem("pmtool_user");
      window.location.href = "/login";
    }
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || data?.msg || (data && JSON.stringify(data)) || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.data = typeof data === "string" ? data : message;
    throw error;
  }

  return data;
}

export const api = {
  // ─── Auth ───────────────────────────────────────
  login(credentials) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  register(payload) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getMe() {
    return request("/api/auth/me");
  },

  updateProfile(data) {
    return request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  // ─── Workspaces ─────────────────────────────────
  getWorkspaces() {
    return request("/api/workspaces");
  },

  createWorkspace(payload) {
    return request("/api/workspaces", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  deleteWorkspace(id) {
    return request(`/api/workspaces/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Projects ───────────────────────────────────
  getProjects(workspaceId) {
    return request(`/api/projects/${workspaceId}`);
  },

  createProject(data) {
    return request("/api/projects", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateProject(id, data) {
    return request(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteProject(id) {
    return request(`/api/projects/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Tasks ──────────────────────────────────────
  getTasks(projectId) {
    return request(`/api/tasks/${projectId}`);
  },

  createTask(data) {
    return request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  updateTask(id, data) {
    return request(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  deleteTask(id) {
    return request(`/api/tasks/${id}`, {
      method: "DELETE"
    });
  },

  // ─── Members ────────────────────────────────────
  getMembers(projectId) {
    return request(`/api/members/${projectId}`);
  },

  addMember(data) {
    return request("/api/members/add", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // ─── Comments ───────────────────────────────────
  getComments(taskId) {
    return request(`/api/comments/${taskId}`);
  },

  addComment(data) {
    return request("/api/comments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // ─── Messages ───────────────────────────────────
  getReceivedMessages() {
    return request("/api/messages/received");
  },

  getSentMessages() {
    return request("/api/messages/sent");
  },

  sendMessage(data) {
    return request("/api/messages", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // ─── Notifications ──────────────────────────────
  getNotifications() {
    return request("/api/notifications");
  },

  markNotificationRead(id) {
    return request(`/api/notifications/${id}`, {
      method: "PUT"
    });
  },

  // ─── Inbox ──────────────────────────────────────
  getInbox() {
    return request("/api/inbox");
  },

  // ─── Analytics ──────────────────────────────────
  getProjectAnalytics(projectId) {
    return request(`/api/analytics/${projectId}`);
  },

  // ─── Activity ───────────────────────────────────
  getWorkspaceActivity(workspaceId) {
    return request(`/api/activity/workspace/${workspaceId}`);
  },

  getProjectActivity(projectId) {
    return request(`/api/activity/${projectId}`);
  },

  // ─── Invitations ────────────────────────────────
  sendInvite(workspaceId, data) {
    return request(`/api/workspace/${workspaceId}/invite`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  verifyInvite(token) {
    return request(`/api/invite?token=${token}`);
  },

  acceptInvite(token) {
    return request("/api/invite/accept", {
      method: "POST",
      body: JSON.stringify({ token })
    });
  },

  getWorkspaceMembers(workspaceId) {
    return request(`/api/workspace/${workspaceId}/members`);
  },

  getWorkspaceInvites(workspaceId) {
    return request(`/api/workspace/${workspaceId}/invites`);
  }
};
