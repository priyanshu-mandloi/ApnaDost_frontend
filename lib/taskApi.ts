import apiClient from "./apiRequest";

export interface Task {
  id: number;
  title: string;
  description: string;
  taskDate: string; // "2025-06-15"
  taskTime: string; // "14:30:00"
  priority: number; // 1=LOW 2=MEDIUM 3=HIGH
  priorityLabel: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface TaskRequest {
  title: string;
  description?: string;
  taskDate: string;
  taskTime: string;
  priority: number;
}

export const taskApi = {
  getAll: () => apiClient.get<Task[]>("/api/tasks").then((r) => r.data),
  getToday: () => apiClient.get<Task[]>("/api/tasks/today").then((r) => r.data),
  getByDate: (date: string) =>
    apiClient.get<Task[]>(`/api/tasks/date?date=${date}`).then((r) => r.data),
  create: (data: TaskRequest) =>
    apiClient.post<Task>("/api/tasks", data).then((r) => r.data),
  update: (id: number, data: TaskRequest) =>
    apiClient.put<Task>(`/api/tasks/${id}`, data).then((r) => r.data),
  markComplete: (id: number) =>
    apiClient.patch<Task>(`/api/tasks/${id}/complete`).then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete(`/api/tasks/${id}`).then((r) => r.data),
};

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId: number;
  createdAt: string;
  isRead: boolean;
}

export const notificationApi = {
  getLatest: () =>
    apiClient
      .get<Notification[]>("/api/notifications/latest")
      .then((r) => r.data),
  getUnreadCount: () =>
    apiClient
      .get<{ unreadCount: number }>("/api/notifications/count")
      .then((r) => r.data.unreadCount),
  markRead: (id: number) =>
    apiClient.patch(`/api/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    apiClient.patch("/api/notifications/read-all").then((r) => r.data),
  delete: (id: number) =>
    apiClient.delete(`/api/notifications/${id}`).then((r) => r.data),
};
