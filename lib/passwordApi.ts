import apiClient from "./apiRequest";

export type PasswordCategory =
  | "BANKING"
  | "SOCIAL_MEDIA"
  | "ENTERTAINMENT"
  | "WORK"
  | "SHOPPING"
  | "EMAIL"
  | "EDUCATION"
  | "OTHER";

export interface PasswordEntry {
  id: number;
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string; // "••••••••" when masked, real when revealed
  notes?: string;
  iconUrl?: string;
  category: PasswordCategory;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordRequest {
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string;
  notes?: string;
  iconUrl?: string;
  category: PasswordCategory;
}

export const passwordApi = {
  create: (data: PasswordRequest) =>
    apiClient.post<PasswordEntry>("/api/passwords", data).then((r) => r.data),

  getAll: () =>
    apiClient.get<PasswordEntry[]>("/api/passwords").then((r) => r.data),

  getByCategory: (type: PasswordCategory) =>
    apiClient
      .get<PasswordEntry[]>(`/api/passwords/category?type=${type}`)
      .then((r) => r.data),

  search: (q: string) =>
    apiClient
      .get<PasswordEntry[]>(`/api/passwords/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.data),

  reveal: (id: number) =>
    apiClient
      .get<PasswordEntry>(`/api/passwords/${id}/reveal`)
      .then((r) => r.data),

  update: (id: number, data: PasswordRequest) =>
    apiClient
      .put<PasswordEntry>(`/api/passwords/${id}`, data)
      .then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/passwords/${id}`).then((r) => r.data),

  getCount: () =>
    apiClient
      .get<{ total: number }>("/api/passwords/count")
      .then((r) => r.data.total),
};

export const CATEGORY_META: Record<
  PasswordCategory,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  BANKING: {
    label: "Banking",
    emoji: "🏦",
    color: "text-jade-400",
    bg: "bg-jade-500/10",
    border: "border-jade-500/30",
  },
  SOCIAL_MEDIA: {
    label: "Social Media",
    emoji: "📱",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    emoji: "🎬",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  WORK: {
    label: "Work",
    emoji: "💼",
    color: "text-saffron-400",
    bg: "bg-saffron-500/10",
    border: "border-saffron-500/30",
  },
  SHOPPING: {
    label: "Shopping",
    emoji: "🛍️",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
  },
  EMAIL: {
    label: "Email",
    emoji: "📧",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  EDUCATION: {
    label: "Education",
    emoji: "📚",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  OTHER: {
    label: "Other",
    emoji: "🔐",
    color: "text-[#8ba3c7]",
    bg: "bg-navy-700/40",
    border: "border-white/10",
  },
};

export function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pw || pw === "••••••••") return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-rose-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-saffron-500" };
  return { score, label: "Strong", color: "bg-jade-500" };
}

// Get favicon from URL
export function getFaviconUrl(siteUrl?: string): string | null {
  if (!siteUrl) return null;
  try {
    const url = new URL(
      siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`,
    );
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return null;
  }
}
