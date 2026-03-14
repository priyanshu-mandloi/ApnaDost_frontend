export type PasswordCategory =
  | "SOCIAL"
  | "BANKING"
  | "WORK"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "OTHER";

export interface PasswordEntry {
  id: number;
  siteName: string;
  siteUrl?: string;
  username: string;
  encryptedPassword: string;
  password?: string; // only present after /reveal
  notes?: string;
  category: PasswordCategory;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordRequest {
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string;
  notes?: string;
  category: PasswordCategory;
}
