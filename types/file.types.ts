export type FileCategory = "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO" | "OTHER";

export interface FileEntry {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileType: string; // MIME type e.g. "application/pdf"
  fileSize: number;
  fileSizeFormatted: string;
  category: FileCategory;
  description?: string;
  usedForChat: boolean;
  extractedText?: string;
  uploadedAt: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  byCategory: Record<FileCategory, number>;
}
