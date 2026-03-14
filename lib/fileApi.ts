import apiClient from "./apiRequest";

export type FileCategory = "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO" | "OTHER";

export interface FileEntry {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  category: FileCategory;
  description?: string;
  extractedText?: string;
  usedForChat: boolean;
  uploadedAt: string;
}

export interface StorageStats {
  totalFiles: number;
  totalBytes: number;
  totalFormatted: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  fileId: number;
  fileName: string;
  question: string;
  answer: string;
}

export interface PrepareResponse {
  fileId: number;
  fileName: string;
  wordCount: number;
  charCount: number;
  ready: boolean;
  message: string;
}

export const fileApi = {
  upload: (file: File, description?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (description) form.append("description", description);

    return apiClient
      .post<FileEntry>("/api/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  getAll: () => apiClient.get<FileEntry[]>("/api/files").then((r) => r.data),

  getByCategory: (type: FileCategory) =>
    apiClient
      .get<FileEntry[]>(`/api/files/category?type=${type}`)
      .then((r) => r.data),

  getPdfs: () =>
    apiClient.get<FileEntry[]>("/api/files/pdfs").then((r) => r.data),

  search: (q: string) =>
    apiClient
      .get<FileEntry[]>(`/api/files/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.data),

  getDownloadUrl: (id: number) => `/api/files/${id}/download`,

  delete: (id: number) =>
    apiClient.delete(`/api/files/${id}`).then((r) => r.data),

  getStats: () =>
    apiClient.get<StorageStats>("/api/files/stats").then((r) => r.data),

  preparePdf: (fileId: number) =>
    apiClient
      .get<PrepareResponse>(`/api/chat/pdf/${fileId}/prepare`)
      .then((r) => r.data),

  chatWithPdf: (fileId: number, question: string, history: ChatMessage[]) =>
    apiClient
      .post<ChatResponse>("/api/chat/pdf", { fileId, question, history })
      .then((r) => r.data),
};

export const CATEGORY_META: Record<
  FileCategory,
  {
    label: string;
    emoji: string;
    color: string;
    bg: string;
    border: string;
    accept: string;
  }
> = {
  DOCUMENT: {
    label: "Documents",
    emoji: "📄",
    color: "text-saffron-400",
    bg: "bg-saffron-500/10",
    border: "border-saffron-500/30",
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
  },
  IMAGE: {
    label: "Images",
    emoji: "🖼️",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    accept: "image/*",
  },
  VIDEO: {
    label: "Videos",
    emoji: "🎬",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    accept: "video/*",
  },
  AUDIO: {
    label: "Audio",
    emoji: "🎵",
    color: "text-jade-400",
    bg: "bg-jade-500/10",
    border: "border-jade-500/30",
    accept: "audio/*",
  },
  OTHER: {
    label: "Other",
    emoji: "📦",
    color: "text-[#8ba3c7]",
    bg: "bg-navy-700/40",
    border: "border-white/10",
    accept: "*",
  },
};

export function getFileIcon(fileType: string): string {
  if (fileType?.includes("pdf")) return "📕";
  if (fileType?.includes("word") || fileType?.includes("doc")) return "📘";
  if (fileType?.includes("excel") || fileType?.includes("sheet")) return "📗";
  if (fileType?.includes("text")) return "📝";
  if (fileType?.startsWith("image/")) return "🖼️";
  if (fileType?.startsWith("video/")) return "🎬";
  if (fileType?.startsWith("audio/")) return "🎵";
  return "📦";
}
