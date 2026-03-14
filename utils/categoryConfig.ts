import type { ExpenseCategory, PaymentMethod } from "@/types/expense.types";
import type { TaskPriority, TaskStatus } from "@/types/task.types";

import type { NotificationType } from "@/types/notification.types";
import type { PasswordCategory } from "@/types/password.types";

export const expenseCategoryConfig: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  FOOD: {
    label: "Food",
    emoji: "🍔",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  TRANSPORT: {
    label: "Transport",
    emoji: "🚗",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    emoji: "🎬",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
  },
  SHOPPING: {
    label: "Shopping",
    emoji: "🛍️",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
  },
  HEALTH: {
    label: "Health",
    emoji: "💊",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  UTILITIES: {
    label: "Utilities",
    emoji: "⚡",
    color: "#eab308",
    bg: "rgba(234,179,8,0.12)",
  },
  EDUCATION: {
    label: "Education",
    emoji: "📚",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
  },
  RENT: {
    label: "Rent",
    emoji: "🏠",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
  },
  SAVINGS: {
    label: "Savings",
    emoji: "💰",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
  OTHER: {
    label: "Other",
    emoji: "📦",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
  },
};

export const paymentMethodConfig: Record<
  PaymentMethod,
  { label: string; emoji: string }
> = {
  CASH: { label: "Cash", emoji: "💵" },
  UPI: { label: "UPI", emoji: "📱" },
  CREDIT_CARD: { label: "Credit Card", emoji: "💳" },
  DEBIT_CARD: { label: "Debit Card", emoji: "🏧" },
  NET_BANKING: { label: "Net Banking", emoji: "🌐" },
  OTHER: { label: "Other", emoji: "💼" },
};

export const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  HIGH: {
    label: "High",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.3)",
  },
  MEDIUM: {
    label: "Medium",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
  },
  LOW: {
    label: "Low",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
  },
};

export const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Pending", color: "#8ba3c7", bg: "rgba(139,163,199,0.12)" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
  },
  COMPLETED: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
};

export const passwordCategoryConfig: Record<
  PasswordCategory,
  { label: string; emoji: string; color: string }
> = {
  SOCIAL: { label: "Social", emoji: "💬", color: "#3b82f6" },
  BANKING: { label: "Banking", emoji: "🏦", color: "#f59e0b" },
  WORK: { label: "Work", emoji: "💼", color: "#10b981" },
  ENTERTAINMENT: { label: "Entertainment", emoji: "🎮", color: "#a855f7" },
  SHOPPING: { label: "Shopping", emoji: "🛒", color: "#ec4899" },
  OTHER: { label: "Other", emoji: "🔑", color: "#6b7280" },
};

export const notificationTypeConfig: Record<
  NotificationType,
  { label: string; emoji: string; color: string }
> = {
  TASK_REMINDER: { label: "Task Reminder", emoji: "⏰", color: "#3b82f6" },
  TASK_OVERDUE: { label: "Overdue", emoji: "🔴", color: "#f43f5e" },
  MOTIVATIONAL: { label: "Motivation", emoji: "✨", color: "#f59e0b" },
  EXPENSE_ALERT: { label: "Expense Alert", emoji: "💸", color: "#f97316" },
  SYSTEM: { label: "System", emoji: "🔔", color: "#6b7280" },
};
