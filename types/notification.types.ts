export type NotificationType =
  | "TASK_REMINDER"
  | "TASK_OVERDUE"
  | "MOTIVATIONAL"
  | "EXPENSE_ALERT"
  | "SYSTEM";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}
