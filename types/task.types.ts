export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: number;
  title: string;
  description?: string;
  taskDate: string; // "YYYY-MM-DD"
  taskTime: string; // "HH:mm"
  priority: TaskPriority;
  status: TaskStatus;
  notificationSent: boolean;
}

export interface TaskRequest {
  title: string;
  description?: string;
  taskDate: string;
  taskTime: string;
  priority: TaskPriority;
  status?: TaskStatus;
}
