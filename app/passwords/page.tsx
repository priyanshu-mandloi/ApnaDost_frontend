"use client";

/**
 * ApnaDost — Password Manager (/passwords)
 * Design: Heavy Glassmorphism, dual light/dark theme, CSS-variable driven.
 */

import {
  CATEGORY_META,
  PasswordCategory,
  PasswordEntry,
  PasswordRequest,
  getFaviconUrl,
  getPasswordStrength,
  passwordApi,
} from "@/lib/passwordApi";
import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

// ─── Shared scoped CSS ────────────────────────────────────────────────────────
const PW_CSS = `
  :root {
    --pw-bg-from:       #f0f4ff;
    --pw-bg-to:         #faf5ff;
    --pw-glass:         rgba(255,255,255,0.76);
    --pw-glass-border:  rgba(255,255,255,0.93);
    --pw-glass-shadow:  0 8px 32px rgba(80,60,180,0.09), 0 1.5px 6px rgba(0,0,0,0.05);
    --pw-glass-2:       rgba(255,255,255,0.54);
    --pw-heading:       oklch(0.18 0.02 255);
    --pw-subtext:       oklch(0.42 0.015 255);
    --pw-muted:         oklch(0.58 0.010 255);
    --pw-accent:        #d97706;
    --pw-input-bg:      rgba(255,255,255,0.65);
    --pw-input-border:  rgba(200,190,230,0.50);
    --pw-input-focus:   #d97706;
    --pw-input-text:    oklch(0.18 0.02 255);
    --pw-placeholder:   oklch(0.62 0.01 255);
    --pw-btn-bg:        #d97706;
    --pw-btn-hover:     #b45309;
    --pw-btn-text:      #fff;
    --pw-row-hover:     rgba(255,255,255,0.55);
    --pw-divider:       rgba(0,0,0,0.07);
    --pw-security-bg:   rgba(16,185,129,0.07);
    --pw-security-border: rgba(16,185,129,0.20);
  }
  .dark {
    --pw-bg-from:       #080d1a;
    --pw-bg-to:         #0d1525;
    --pw-glass:         rgba(18,26,50,0.72);
    --pw-glass-border:  rgba(255,255,255,0.08);
    --pw-glass-shadow:  0 8px 40px rgba(0,0,0,0.50), 0 1.5px 6px rgba(0,0,0,0.30);
    --pw-glass-2:       rgba(18,26,50,0.55);
    --pw-heading:       #f0f4ff;
    --pw-subtext:       #8ba3c7;
    --pw-muted:         #4d6b8a;
    --pw-accent:        #f59e0b;
    --pw-input-bg:      rgba(255,255,255,0.04);
    --pw-input-border:  rgba(255,255,255,0.10);
    --pw-input-focus:   #f59e0b;
    --pw-input-text:    #f0f4ff;
    --pw-placeholder:   #4d6b8a;
    --pw-btn-bg:        #f59e0b;
    --pw-btn-hover:     #d97706;
    --pw-btn-text:      #0d1120;
    --pw-row-hover:     rgba(255,255,255,0.04);
    --pw-divider:       rgba(255,255,255,0.07);
    --pw-security-bg:   rgba(16,185,129,0.06);
    --pw-security-border: rgba(16,185,129,0.18);
  }
  .pw-root {
    min-height: 100vh;
    background: linear-gradient(145deg, var(--pw-bg-from) 0%, var(--pw-bg-to) 100%);
    position: relative; overflow-x: hidden;
  }
  .pw-blob {
    position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none;
    animation: pw-blob 10s ease-in-out infinite alternate;
  }
  @keyframes pw-blob { from{transform:translate(0,0) scale(1);} to{transform:translate(25px,-20px) scale(1.05);} }
  .pw-blob:nth-child(2) { animation-delay: -5s; }
  .pw-grid {
    background-image: linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.025) 1px,transparent 1px);
    background-size: 36px 36px;
  }
  .pw-panel {
    background: var(--pw-glass); border: 1px solid var(--pw-glass-border);
    box-shadow: var(--pw-glass-shadow); border-radius: 1.35rem;
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
  }
  .pw-card {
    background: var(--pw-glass); border: 1px solid var(--pw-glass-border);
    box-shadow: var(--pw-glass-shadow); border-radius: 1.15rem;
    backdrop-filter: blur(24px) saturate(175%);
    -webkit-backdrop-filter: blur(24px) saturate(175%);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    overflow: hidden;
  }
  .pw-card:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(0,0,0,0.13); }
  .pw-stat {
    background: var(--pw-glass); border: 1px solid var(--pw-glass-border);
    box-shadow: var(--pw-glass-shadow); border-radius: 1.15rem;
    backdrop-filter: blur(22px) saturate(170%);
    -webkit-backdrop-filter: blur(22px) saturate(170%);
    transition: transform 0.2s ease; padding: 1rem; text-align: center;
  }
  .pw-stat:hover { transform: translateY(-2px); }
  .pw-input {
    width: 100%; background: var(--pw-input-bg);
    border: 1.5px solid var(--pw-input-border); border-radius: 0.875rem;
    color: var(--pw-input-text); font-family: var(--font-dm), system-ui, sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none;
    padding: 0.625rem 0.875rem; font-size: 0.875rem;
  }
  .pw-input::placeholder { color: var(--pw-placeholder); }
  .pw-input:focus {
    border-color: var(--pw-input-focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pw-input-focus) 18%, transparent);
  }
  textarea.pw-input { resize: none; }
  .pw-btn {
    background: var(--pw-btn-bg); color: var(--pw-btn-text);
    border-radius: 0.875rem; font-weight: 700;
    font-family: var(--font-sora), sans-serif; transition: all 0.18s;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--pw-btn-bg) 30%, transparent);
  }
  .pw-btn:hover  { background: var(--pw-btn-hover); }
  .pw-btn:active { transform: scale(0.97); }
  .pw-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .pw-icon-btn {
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.625rem; padding: 0.375rem; color: var(--pw-muted);
    transition: all 0.15s; background: transparent;
  }
  .pw-icon-btn:hover { background: var(--pw-row-hover); color: var(--pw-heading); }
  .pw-tab {
    border-radius: 0.875rem; padding: 0.35rem 0.875rem; font-size: 0.75rem;
    font-weight: 600; color: var(--pw-muted); border: 1px solid transparent;
    transition: all 0.15s; white-space: nowrap;
    font-family: var(--font-sora), sans-serif; background: transparent;
  }
  .pw-tab:hover { color: var(--pw-subtext); background: var(--pw-glass-2); }
  .pw-tab-active {
    background: color-mix(in srgb, var(--pw-accent) 15%, transparent) !important;
    border-color: color-mix(in srgb, var(--pw-accent) 40%, transparent) !important;
    color: var(--pw-accent) !important;
  }
  .pw-modal {
    background: var(--pw-glass); border: 1px solid var(--pw-glass-border);
    border-radius: 1.5rem; backdrop-filter: blur(36px) saturate(200%);
    -webkit-backdrop-filter: blur(36px) saturate(200%);
    box-shadow: 0 24px 80px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.10);
    padding: 1.75rem; width: 100%; max-width: 36rem;
    position: relative; z-index: 10; max-height: 90vh; overflow-y: auto;
  }
  @keyframes pw-modal-in {
    from { opacity:0; transform: scale(0.94) translateY(14px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  .pw-modal-animate { animation: pw-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .pw-toast {
    background: var(--pw-glass); border: 1px solid var(--pw-glass-border);
    border-radius: 9999px; backdrop-filter: blur(24px);
    box-shadow: var(--pw-glass-shadow); padding: 0.625rem 1.25rem;
    font-size: 0.875rem; color: var(--pw-heading);
  }
  .pw-fab {
    background: var(--pw-btn-bg); color: var(--pw-btn-text); border-radius: 9999px;
    box-shadow: 0 6px 24px color-mix(in srgb, var(--pw-btn-bg) 40%, transparent);
    transition: all 0.2s; width: 3.5rem; height: 3.5rem;
    display: flex; align-items: center; justify-content: center;
  }
  .pw-fab:hover { background: var(--pw-btn-hover); transform: scale(1.07) translateY(-1px); }
  @keyframes pw-slide-up { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  .pw-animate { opacity:0; animation: pw-slide-up 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes pw-shimmer { from{background-position:-400px 0;} to{background-position:400px 0;} }
  .pw-shimmer {
    background: linear-gradient(90deg, var(--pw-glass) 25%, color-mix(in srgb, var(--pw-glass) 80%, white) 50%, var(--pw-glass) 75%);
    background-size: 800px 100%; animation: pw-shimmer 1.5s infinite;
  }
  .pw-heading { color: var(--pw-heading); }
  .pw-subtext { color: var(--pw-subtext); }
  .pw-muted   { color: var(--pw-muted);   }
  .pw-accent  { color: var(--pw-accent);  }
  .pw-divider-line { background: var(--pw-divider); }
  @keyframes pw-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .pw-empty-bounce { animation: pw-bounce 2.2s ease-in-out infinite; }
  .pw-scroll::-webkit-scrollbar { width: 4px; }
  .pw-scroll::-webkit-scrollbar-track { background: transparent; }
  .pw-scroll::-webkit-scrollbar-thumb { background: var(--pw-glass-border); border-radius: 4px; }
`;

// ─── Site Avatar ──────────────────────────────────────────────────────────────
function SiteAvatar({ entry }: { entry: PasswordEntry }) {
  const favicon = getFaviconUrl(entry.siteUrl);
  const cat = CATEGORY_META[entry.category];
  const [imgError, setImgError] = useState(false);

  const avatarStyle = {
    background: `color-mix(in srgb, var(--pw-glass-2) 100%, transparent)`,
    border: "1px solid var(--pw-glass-border)",
  };

  if (favicon && !imgError) {
    return (
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={avatarStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={favicon}
          alt={entry.siteName}
          className="h-7 w-7 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
      style={avatarStyle}
    >
      {cat.emoji}
    </div>
  );
}

// ─── Password Field ────────────────────────────────────────────────────────────
function PasswordField({ entryId }: { entryId: number }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(null);
      return;
    }
    setLoading(true);
    try {
      const data = await passwordApi.reveal(entryId);
      setRevealed(data.password);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setRevealed(null), 15000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    setLoading(true);
    try {
      const data = revealed
        ? { password: revealed }
        : await passwordApi.reveal(entryId);
      await navigator.clipboard.writeText(data.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs pw-subtext tracking-widest select-none">
        {revealed ?? "••••••••"}
      </span>
      <button
        onClick={handleReveal}
        disabled={loading}
        className="pw-icon-btn"
        title={revealed ? "Hide" : "Reveal"}
      >
        {loading ? (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : revealed ? (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>
      <button
        onClick={handleCopy}
        className="pw-icon-btn"
        title="Copy password"
        style={{ color: copied ? "#34d399" : undefined }}
      >
        {copied ? (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Password Modal ────────────────────────────────────────────────────────────
function PasswordModal({
  entry,
  onClose,
  onSave,
}: {
  entry: PasswordEntry | null;
  onClose: () => void;
  onSave: (data: PasswordRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<PasswordRequest>({
    siteName: entry?.siteName ?? "",
    siteUrl: entry?.siteUrl ?? "",
    username: entry?.username ?? "",
    password: "",
    notes: entry?.notes ?? "",
    iconUrl: entry?.iconUrl ?? "",
    category: entry?.category ?? "OTHER",
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);

  const strength = getPasswordStrength(form.password);
  const categories = Object.keys(CATEGORY_META) as PasswordCategory[];
  const set = (k: keyof PasswordRequest, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}";
    let pw = "";
    for (let i = 0; i < 18; i++)
      pw += chars[Math.floor(Math.random() * chars.length)];
    setForm((p) => ({ ...p, password: pw }));
    setShowPw(true);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const strengthColors = [
    "",
    "#ef4444",
    "#f97316",
    "#fbbf24",
    "#84cc16",
    "#22c55e",
  ];
  const strengthColor = strengthColors[strength.score] ?? "#22c55e";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="pw-modal pw-modal-animate pw-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--pw-accent) 14%, transparent)",
              }}
            >
              🔐
            </div>
            <div>
              <h2
                className="pw-heading text-lg font-bold"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {entry ? "Edit Password" : "Save Password"}
              </h2>
              <p className="pw-muted text-xs">
                {entry ? "Update credentials" : "Securely store credentials"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="pw-icon-btn">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pw-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
                Site Name *
              </label>
              <input
                required
                className="pw-input"
                placeholder="Google, Netflix…"
                value={form.siteName}
                onChange={(e) => set("siteName", e.target.value)}
              />
            </div>
            <div>
              <label className="pw-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
                URL
              </label>
              <input
                className="pw-input"
                placeholder="https://…"
                value={form.siteUrl}
                onChange={(e) => set("siteUrl", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="pw-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Username / Email *
            </label>
            <input
              required
              className="pw-input"
              placeholder="you@example.com"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
            />
          </div>
          <div>
            <label className="pw-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Password *
            </label>
            <div className="relative">
              <input
                required
                type={showPw ? "text" : "password"}
                className="pw-input pr-20 font-mono"
                placeholder="Enter or generate…"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="pw-icon-btn"
                >
                  {showPw ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="pw-icon-btn"
                  style={{ color: generated ? "#22c55e" : undefined }}
                  title="Generate password"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          i <= strength.score
                            ? strengthColor
                            : "var(--pw-divider)",
                      }}
                    />
                  ))}
                </div>
                <p className="pw-muted text-xs mt-1">
                  Strength: <span className="pw-subtext">{strength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Category grid */}
          <div>
            <label className="pw-muted mb-2 block text-[10px] font-semibold uppercase tracking-widest">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((c) => {
                const m = CATEGORY_META[c];
                const active = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: c }))}
                    className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all border"
                    style={{
                      background: active ? `${m.bg}` : "var(--pw-glass-2)",
                      borderColor: active
                        ? `${m.border}`
                        : "var(--pw-input-border)",
                    }}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span
                      className="text-[9px] font-semibold leading-tight"
                      style={{
                        fontFamily: "var(--font-sora), sans-serif",
                        color: active ? m.color : "var(--pw-muted)",
                      }}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="pw-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Notes
            </label>
            <textarea
              rows={2}
              className="pw-input"
              placeholder="Any additional notes…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="pw-btn mt-2 w-full py-3 text-sm"
          >
            {saving ? "Saving…" : entry ? "Update Password" : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Password Card ─────────────────────────────────────────────────────────────
function PasswordCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: PasswordEntry;
  onEdit: (e: PasswordEntry) => void;
  onDelete: (id: number) => void;
}) {
  const cat = CATEGORY_META[entry.category];
  const [copiedUser, setCopiedUser] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const copyUsername = async () => {
    await navigator.clipboard.writeText(entry.username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  return (
    <div className="pw-card group flex items-center gap-4 p-4">
      <SiteAvatar entry={entry} />

      <div className="flex-1 min-w-0">
        {/* Name + URL */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="pw-heading text-sm font-semibold truncate"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              {entry.siteName}
            </p>
            {entry.siteUrl && (
              <a
                href={
                  entry.siteUrl.startsWith("http")
                    ? entry.siteUrl
                    : `https://${entry.siteUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-[10px] pw-muted transition-colors"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--pw-accent)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                {entry.siteUrl}
              </a>
            )}
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold border"
            style={{
              background: cat.bg,
              borderColor: cat.border,
              color: cat.color,
              fontFamily: "var(--font-sora), sans-serif",
            }}
          >
            {cat.emoji} {cat.label}
          </span>
        </div>

        {/* Username */}
        <div className="mt-1.5 flex items-center gap-1.5">
          <svg
            className="h-3 w-3 pw-muted shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <span className="truncate text-xs pw-subtext">{entry.username}</span>
          <button
            onClick={copyUsername}
            className="pw-icon-btn"
            style={{ color: copiedUser ? "#34d399" : undefined }}
          >
            {copiedUser ? (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Password */}
        <div className="mt-1">
          <PasswordField entryId={entry.id} />
        </div>

        {entry.notes && (
          <p className="mt-1.5 truncate text-[10px] pw-muted">
            📝 {entry.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDel ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(entry.id)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="rounded-lg px-2 py-1 text-[10px] pw-muted"
              style={{ background: "var(--pw-glass-2)" }}
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(entry)}
              className="pw-icon-btn"
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--pw-accent)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                />
              </svg>
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="pw-icon-btn"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "";
              }}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    PasswordCategory | "ALL"
  >("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchPasswords = useCallback(async () => {
    setLoading(true);
    try {
      let data: PasswordEntry[];
      if (search.trim()) data = await passwordApi.search(search.trim());
      else if (filterCategory !== "ALL")
        data = await passwordApi.getByCategory(filterCategory);
      else data = await passwordApi.getAll();
      setPasswords(data);
    } catch {
      showToast("Failed to load passwords");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => {
    passwordApi
      .getCount()
      .then(setTotalCount)
      .catch(() => {});
  }, []);
  useEffect(() => {
    const t = setTimeout(fetchPasswords, 350);
    return () => clearTimeout(t);
  }, [fetchPasswords]);

  const handleSave = async (data: PasswordRequest) => {
    if (editingEntry) {
      await passwordApi.update(editingEntry.id, data);
      showToast("Password updated!");
    } else {
      await passwordApi.create(data);
      showToast("Password saved securely! 🔐");
    }
    const count = await passwordApi.getCount();
    setTotalCount(count);
    fetchPasswords();
  };
  const handleDelete = async (id: number) => {
    await passwordApi.delete(id);
    showToast("Deleted");
    const count = await passwordApi.getCount();
    setTotalCount(count);
    fetchPasswords();
  };

  const categories = Object.keys(CATEGORY_META) as PasswordCategory[];

  const grouped = passwords.reduce<Record<string, PasswordEntry[]>>(
    (acc, p) => {
      const key = p.siteName[0]?.toUpperCase() ?? "#";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {},
  );

  return (
    <>
      <style>{PW_CSS}</style>
      <div className="pw-root">
        <div
          className="pw-blob"
          style={{
            width: "550px",
            height: "550px",
            background: "rgba(245,158,11,0.07)",
            top: "-140px",
            left: "-110px",
          }}
        />
        <div
          className="pw-blob"
          style={{
            width: "400px",
            height: "400px",
            background: "rgba(16,185,129,0.05)",
            bottom: "-80px",
            right: "-90px",
          }}
        />
        <div
          className="pw-blob"
          style={{
            width: "280px",
            height: "280px",
            background: "rgba(168,85,247,0.04)",
            top: "40%",
            right: "20%",
          }}
        />
        <div className="pointer-events-none fixed inset-0 pw-grid opacity-50" />

        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-8">
          {/* ── Header ── */}
          <div
            className="pw-animate mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            style={{ animationDelay: "40ms" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="pw-icon-btn">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </Link>
                <span className="text-xl">🔐</span>
                <p className="pw-muted text-xs font-semibold uppercase tracking-widest">
                  AES-256 Encrypted
                </p>
              </div>
              <h1
                className="pw-heading text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Password Vault
              </h1>
              <p className="pw-subtext mt-1.5 text-sm">
                {totalCount} credential{totalCount !== 1 ? "s" : ""} stored with
                bank-grade encryption.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingEntry(null);
                setShowModal(true);
              }}
              className="pw-btn hidden sm:flex items-center gap-2 px-5 py-3 text-sm shrink-0"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Password
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
            {[
              {
                label: "Total",
                value: totalCount,
                icon: "🔐",
                color: "var(--pw-heading)",
              },
              {
                label: "Banking",
                value: passwords.filter((p) => p.category === "BANKING").length,
                icon: "🏦",
                color: "#34d399",
              },
              {
                label: "Social",
                value: passwords.filter((p) => p.category === "SOCIAL_MEDIA")
                  .length,
                icon: "📱",
                color: "#60a5fa",
              },
              {
                label: "Work",
                value: passwords.filter((p) => p.category === "WORK").length,
                icon: "💼",
                color: "#fbbf24",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="pw-stat pw-animate"
                style={{ animationDelay: `${80 + i * 45}ms` }}
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <p
                  className="text-xl font-bold tabular-nums"
                  style={{
                    color: s.color,
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p className="pw-muted text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div
            className="pw-animate mb-5 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              animationDelay: "230ms",
              background: "var(--pw-security-bg)",
              border: "1px solid var(--pw-security-border)",
            }}
          >
            <span className="text-xl">🛡️</span>
            <div>
              <p
                className="text-xs font-bold"
                style={{
                  color: "#34d399",
                  fontFamily: "var(--font-sora), sans-serif",
                }}
              >
                Bank-grade Encryption Active
              </p>
              <p className="pw-muted text-xs">
                AES-256 GCM encryption. Zero-knowledge — even admins can't read
                your passwords.
              </p>
            </div>
          </div>

          {/* Search + Filter */}
          <div
            className="pw-panel mb-5 p-4 pw-animate"
            style={{ animationDelay: "270ms" }}
          >
            <div className="relative mb-3">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pw-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                className="pw-input pl-10"
                placeholder="Search by site or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterCategory("ALL")}
                className={`pw-tab ${filterCategory === "ALL" ? "pw-tab-active" : ""}`}
              >
                All
              </button>
              {categories.map((c) => {
                const m = CATEGORY_META[c];
                const active = filterCategory === c;
                return (
                  <button
                    key={c}
                    onClick={() => setFilterCategory(active ? "ALL" : c)}
                    className="pw-tab"
                    style={
                      active
                        ? {
                            background: `${m.bg}`,
                            borderColor: `${m.border}`,
                            color: m.color,
                          }
                        : {}
                    }
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="pw-shimmer rounded-2xl"
                  style={{ height: "88px" }}
                />
              ))}
            </div>
          ) : passwords.length === 0 ? (
            <div
              className="pw-panel flex flex-col items-center justify-center py-16 text-center pw-animate"
              style={{ animationDelay: "310ms" }}
            >
              <div className="pw-empty-bounce text-5xl mb-4">🔐</div>
              <p
                className="pw-heading text-lg font-bold"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {search ? "No results found" : "Vault is empty"}
              </p>
              <p className="pw-muted text-sm mt-1">
                {search
                  ? "Try a different term"
                  : "Start securing your credentials"}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setShowModal(true);
                  }}
                  className="pw-btn mt-5 px-6 py-2.5 text-sm"
                >
                  🔐 Add First Password
                </button>
              )}
            </div>
          ) : search ? (
            <div className="space-y-3">
              {passwords.map((p, i) => (
                <div
                  key={p.id}
                  className="pw-animate"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <PasswordCard
                    entry={p}
                    onEdit={(e) => {
                      setEditingEntry(e);
                      setShowModal(true);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, items]) => (
                  <div key={letter}>
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="text-xs font-bold pw-animate"
                        style={{
                          color: "var(--pw-accent)",
                          fontFamily: "var(--font-sora), sans-serif",
                        }}
                      >
                        {letter}
                      </span>
                      <div className="h-px flex-1 pw-divider-line" />
                    </div>
                    <div className="space-y-3">
                      {items.map((p, i) => (
                        <div
                          key={p.id}
                          className="pw-animate"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <PasswordCard
                            entry={p}
                            onEdit={(e) => {
                              setEditingEntry(e);
                              setShowModal(true);
                            }}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              <p className="pw-muted text-center text-xs pt-2">
                {passwords.length} result{passwords.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          onClick={() => {
            setEditingEntry(null);
            setShowModal(true);
          }}
          className="pw-fab fixed bottom-6 right-6 z-40 sm:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>

        {showModal && (
          <PasswordModal
            entry={editingEntry}
            onClose={() => {
              setShowModal(false);
              setEditingEntry(null);
            }}
            onSave={handleSave}
          />
        )}

        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pw-animate">
            <div className="pw-toast flex items-center gap-2">{toastMsg}</div>
          </div>
        )}
      </div>
    </>
  );
}
