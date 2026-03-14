import {
  format,
  isPast,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from "date-fns";

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy · h:mm a");
  } catch {
    return dateStr;
  }
}

export function formatTime(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
  } catch {
    return timeStr;
  }
}

export function isOverdue(dateStr: string, timeStr: string): boolean {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const taskDate = parseISO(dateStr);
    taskDate.setHours(hours, minutes, 0, 0);
    return isPast(taskDate);
  } catch {
    return false;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, "MMM d");
  } catch {
    return "";
  }
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
}
