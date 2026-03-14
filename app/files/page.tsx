"use client";

/**
 * ApnaDost — File Storage (/files)
 * Design: Heavy Glassmorphism, dual light/dark theme, CSS-variable driven.
 */

import {
  CATEGORY_META,
  FileCategory,
  FileEntry,
  StorageStats,
  fileApi,
  getFileIcon,
} from "@/lib/fileApi";
import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const FL_CSS = `
  :root {
    --fl-bg-from:       #eef2ff;
    --fl-bg-to:         #f0f9ff;
    --fl-glass:         rgba(255,255,255,0.76);
    --fl-glass-border:  rgba(255,255,255,0.93);
    --fl-glass-shadow:  0 8px 32px rgba(80,60,180,0.09), 0 1.5px 6px rgba(0,0,0,0.05);
    --fl-glass-2:       rgba(255,255,255,0.54);
    --fl-heading:       oklch(0.18 0.02 255);
    --fl-subtext:       oklch(0.42 0.015 255);
    --fl-muted:         oklch(0.58 0.010 255);
    --fl-accent:        #d97706;
    --fl-input-bg:      rgba(255,255,255,0.65);
    --fl-input-border:  rgba(200,190,230,0.50);
    --fl-input-focus:   #d97706;
    --fl-input-text:    oklch(0.18 0.02 255);
    --fl-placeholder:   oklch(0.62 0.01 255);
    --fl-btn-bg:        #d97706;
    --fl-btn-hover:     #b45309;
    --fl-btn-text:      #fff;
    --fl-row-hover:     rgba(255,255,255,0.55);
    --fl-divider:       rgba(0,0,0,0.07);
    --fl-drop-border:   rgba(200,190,230,0.40);
    --fl-drop-hover:    rgba(217,119,6,0.06);
    --fl-progress-track: rgba(0,0,0,0.07);
  }
  .dark {
    --fl-bg-from:       #080d1a;
    --fl-bg-to:         #0b1220;
    --fl-glass:         rgba(18,26,50,0.72);
    --fl-glass-border:  rgba(255,255,255,0.08);
    --fl-glass-shadow:  0 8px 40px rgba(0,0,0,0.50), 0 1.5px 6px rgba(0,0,0,0.30);
    --fl-glass-2:       rgba(18,26,50,0.55);
    --fl-heading:       #f0f4ff;
    --fl-subtext:       #8ba3c7;
    --fl-muted:         #4d6b8a;
    --fl-accent:        #f59e0b;
    --fl-input-bg:      rgba(255,255,255,0.04);
    --fl-input-border:  rgba(255,255,255,0.10);
    --fl-input-focus:   #f59e0b;
    --fl-input-text:    #f0f4ff;
    --fl-placeholder:   #4d6b8a;
    --fl-btn-bg:        #f59e0b;
    --fl-btn-hover:     #d97706;
    --fl-btn-text:      #0d1120;
    --fl-row-hover:     rgba(255,255,255,0.04);
    --fl-divider:       rgba(255,255,255,0.07);
    --fl-drop-border:   rgba(255,255,255,0.10);
    --fl-drop-hover:    rgba(245,158,11,0.05);
    --fl-progress-track: rgba(255,255,255,0.07);
  }
  .fl-root {
    min-height: 100vh;
    background: linear-gradient(145deg, var(--fl-bg-from) 0%, var(--fl-bg-to) 100%);
    position: relative; overflow-x: hidden;
  }
  .fl-blob {
    position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none;
    animation: fl-blob 10s ease-in-out infinite alternate;
  }
  @keyframes fl-blob { from{transform:translate(0,0) scale(1);} to{transform:translate(25px,-20px) scale(1.05);} }
  .fl-blob:nth-child(2) { animation-delay: -5s; }
  .fl-grid {
    background-image: linear-gradient(rgba(99,102,241,0.025) 1px,transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.025) 1px,transparent 1px);
    background-size: 36px 36px;
  }
  .fl-panel {
    background: var(--fl-glass); border: 1px solid var(--fl-glass-border);
    box-shadow: var(--fl-glass-shadow); border-radius: 1.35rem;
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
  }
  .fl-card {
    background: var(--fl-glass); border: 1px solid var(--fl-glass-border);
    box-shadow: var(--fl-glass-shadow); border-radius: 1.15rem;
    backdrop-filter: blur(24px) saturate(175%);
    -webkit-backdrop-filter: blur(24px) saturate(175%);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    overflow: hidden;
  }
  .fl-card:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(0,0,0,0.12); }
  .fl-stat {
    background: var(--fl-glass); border: 1px solid var(--fl-glass-border);
    box-shadow: var(--fl-glass-shadow); border-radius: 1.15rem;
    backdrop-filter: blur(22px) saturate(170%);
    -webkit-backdrop-filter: blur(22px) saturate(170%);
    transition: transform 0.2s; padding: 1rem; text-align: center;
  }
  .fl-stat:hover { transform: translateY(-2px); }
  .fl-input {
    width: 100%; background: var(--fl-input-bg);
    border: 1.5px solid var(--fl-input-border); border-radius: 0.875rem;
    color: var(--fl-input-text); font-family: var(--font-dm), system-ui, sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s; outline: none;
    padding: 0.625rem 0.875rem; font-size: 0.875rem;
  }
  .fl-input::placeholder { color: var(--fl-placeholder); }
  .fl-input:focus {
    border-color: var(--fl-input-focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fl-input-focus) 18%, transparent);
  }
  .fl-btn {
    background: var(--fl-btn-bg); color: var(--fl-btn-text); border-radius: 0.875rem;
    font-weight: 700; font-family: var(--font-sora), sans-serif; transition: all 0.18s;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--fl-btn-bg) 30%, transparent);
  }
  .fl-btn:hover  { background: var(--fl-btn-hover); }
  .fl-btn:active { transform: scale(0.97); }
  .fl-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .fl-icon-btn {
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.625rem; padding: 0.375rem; color: var(--fl-muted);
    transition: all 0.15s; background: transparent;
  }
  .fl-icon-btn:hover { background: var(--fl-row-hover); color: var(--fl-heading); }
  .fl-tab {
    border-radius: 0.875rem; padding: 0.35rem 0.875rem; font-size: 0.75rem;
    font-weight: 600; color: var(--fl-muted); border: 1px solid transparent;
    transition: all 0.15s; white-space: nowrap;
    font-family: var(--font-sora), sans-serif; background: transparent;
  }
  .fl-tab:hover { color: var(--fl-subtext); background: var(--fl-glass-2); }
  .fl-tab-active {
    background: color-mix(in srgb, var(--fl-accent) 15%, transparent) !important;
    border-color: color-mix(in srgb, var(--fl-accent) 40%, transparent) !important;
    color: var(--fl-accent) !important;
  }
  /* drop zone */
  .fl-drop {
    border: 2px dashed var(--fl-drop-border); border-radius: 1.15rem;
    transition: all 0.2s; cursor: pointer;
    background: transparent;
  }
  .fl-drop:hover, .fl-drop-active { border-color: var(--fl-accent) !important; background: var(--fl-drop-hover) !important; }
  /* progress */
  .fl-progress-track { height: 4px; width: 100%; border-radius: 9999px; background: var(--fl-progress-track); overflow: hidden; }
  .fl-progress-fill  { height: 100%; border-radius: 9999px; background: var(--fl-accent); transition: width 0.3s ease; }
  /* chat modal */
  .fl-chat-modal {
    background: var(--fl-glass); border: 1px solid var(--fl-glass-border);
    border-radius: 1.5rem; backdrop-filter: blur(36px) saturate(200%);
    -webkit-backdrop-filter: blur(36px) saturate(200%);
    box-shadow: 0 24px 80px rgba(0,0,0,0.28); width: 100%; max-width: 36rem;
    position: relative; z-index: 10; display: flex; flex-direction: column;
    height: 85vh; max-height: 700px;
  }
  .fl-msg-user      { background: color-mix(in srgb, var(--fl-accent) 14%, transparent); border-radius: 1rem 1rem 0.25rem 1rem; padding: 0.75rem 1rem; }
  .fl-msg-assistant { background: var(--fl-glass-2); border-radius: 1rem 1rem 1rem 0.25rem; padding: 0.75rem 1rem; }
  /* toast */
  .fl-toast {
    background: var(--fl-glass); border: 1px solid var(--fl-glass-border);
    border-radius: 9999px; backdrop-filter: blur(24px);
    box-shadow: var(--fl-glass-shadow); padding: 0.625rem 1.25rem;
    font-size: 0.875rem; color: var(--fl-heading);
  }
  .fl-fab {
    background: var(--fl-btn-bg); color: var(--fl-btn-text); border-radius: 9999px;
    box-shadow: 0 6px 24px color-mix(in srgb, var(--fl-btn-bg) 40%, transparent);
    transition: all 0.2s; width: 3.5rem; height: 3.5rem;
    display: flex; align-items: center; justify-content: center;
  }
  .fl-fab:hover { background: var(--fl-btn-hover); transform: scale(1.07) translateY(-1px); }
  @keyframes fl-slide-up { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  .fl-animate { opacity:0; animation: fl-slide-up 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes fl-shimmer { from{background-position:-400px 0;} to{background-position:400px 0;} }
  .fl-shimmer {
    background: linear-gradient(90deg, var(--fl-glass) 25%, color-mix(in srgb,var(--fl-glass) 80%,white) 50%, var(--fl-glass) 75%);
    background-size: 800px 100%; animation: fl-shimmer 1.5s infinite;
  }
  .fl-heading { color: var(--fl-heading); }
  .fl-subtext { color: var(--fl-subtext); }
  .fl-muted   { color: var(--fl-muted);   }
  .fl-accent  { color: var(--fl-accent);  }
  .fl-divider-line { background: var(--fl-divider); }
  @keyframes fl-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .fl-empty-bounce { animation: fl-bounce 2.2s ease-in-out infinite; }
  .fl-scroll::-webkit-scrollbar { width: 4px; }
  .fl-scroll::-webkit-scrollbar-track { background: transparent; }
  .fl-scroll::-webkit-scrollbar-thumb { background: var(--fl-glass-border); border-radius: 4px; }
  @keyframes fl-dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .fl-dot-pulse { animation: fl-dot-pulse 1.4s ease infinite; }
  .fl-dot-pulse:nth-child(2) { animation-delay: 0.2s; }
  .fl-dot-pulse:nth-child(3) { animation-delay: 0.4s; }
`;

// ─── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({
  onUpload,
}: {
  onUpload: (file: File, desc: string) => Promise<void>;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    const interval = setInterval(
      () => setProgress((p) => (p < 85 ? p + 12 : p)),
      200,
    );
    try {
      await onUpload(selectedFile, description);
      setProgress(100);
      setTimeout(() => {
        setSelectedFile(null);
        setDescription("");
        setProgress(0);
      }, 600);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  return (
    <div className="fl-panel p-5">
      <h3
        className="fl-heading text-sm font-bold mb-4"
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        📤 Upload File
      </h3>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`fl-drop flex flex-col items-center justify-center py-8 ${dragging ? "fl-drop-active" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setSelectedFile(f);
          }}
        />
        {selectedFile ? (
          <div className="text-center">
            <div className="text-4xl mb-2">
              {getFileIcon(selectedFile.type)}
            </div>
            <p
              className="fl-heading text-sm font-semibold"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              {selectedFile.name}
            </p>
            <p className="fl-muted text-xs mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="mt-2 text-xs transition-colors"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl mx-auto text-2xl"
              style={{
                background:
                  "color-mix(in srgb, var(--fl-accent) 13%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--fl-accent) 30%, transparent)",
              }}
            >
              ☁️
            </div>
            <p className="fl-subtext text-sm font-medium">
              Drag & drop or{" "}
              <span style={{ color: "var(--fl-accent)" }}>browse</span>
            </p>
            <p className="fl-muted text-xs mt-1">
              PDFs, images, videos, audio, docs
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4 space-y-3">
          <input
            className="fl-input"
            placeholder="Optional description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {uploading && (
            <div className="fl-progress-track">
              <div
                className="fl-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="fl-btn w-full py-3 text-sm"
          >
            {uploading ? `Uploading… ${progress}%` : "Upload File"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PDF Chat Panel ────────────────────────────────────────────────────────────
function PdfChatPanel({
  file,
  onClose,
}: {
  file: FileEntry;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fileApi
      .preparePdf(file.id)
      .then((info) => setWordCount(info.wordCount ?? 0))
      .catch(() => {})
      .finally(() => setPreparing(false));
  }, [file.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const userMsg = { role: "user" as const, content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fileApi.chatWithPdf(file.id, q, messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, couldn't process that. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starters = [
    "Summarize this document",
    "What are the key points?",
    "List the main topics",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="fl-chat-modal fl-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--fl-divider)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--fl-accent) 13%, transparent)",
              }}
            >
              📕
            </div>
            <div className="min-w-0">
              <p
                className="fl-heading text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {file.originalFileName}
              </p>
              {wordCount > 0 && (
                <p className="fl-muted text-[10px]">
                  {wordCount.toLocaleString()} words · Groq AI
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="fl-icon-btn shrink-0">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 fl-scroll">
          {preparing ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div
                className="h-8 w-8 rounded-full border-2 animate-spin"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--fl-accent) 30%, transparent)",
                  borderTopColor: "var(--fl-accent)",
                }}
              />
              <p className="fl-subtext text-sm">Preparing PDF for chat…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="text-5xl">🤖</div>
              <p
                className="fl-heading text-base font-bold"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Ask anything about this PDF
              </p>
              <p className="fl-muted text-sm max-w-xs">
                I've analysed the document. What do you want to know?
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full px-3 py-1.5 text-xs fl-subtext transition-all"
                    style={{
                      border: "1px solid var(--fl-input-border)",
                      background: "var(--fl-glass-2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "color-mix(in srgb, var(--fl-accent) 40%, transparent)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--fl-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "";
                      (e.currentTarget as HTMLElement).style.color = "";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{
                      background:
                        m.role === "user"
                          ? "color-mix(in srgb, var(--fl-accent) 18%, transparent)"
                          : "var(--fl-glass-2)",
                    }}
                  >
                    {m.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div
                    className={`max-w-[80%] text-sm leading-relaxed fl-heading ${m.role === "user" ? "fl-msg-user" : "fl-msg-assistant"}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ background: "var(--fl-glass-2)" }}
                  >
                    🤖
                  </div>
                  <div className="fl-msg-assistant flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full fl-dot-pulse"
                        style={{ background: "var(--fl-accent)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="shrink-0 px-4 py-3 border-t"
          style={{ borderColor: "var(--fl-divider)" }}
        >
          <div className="flex items-center gap-2">
            <input
              className="fl-input flex-1 py-2.5 text-sm"
              placeholder="Ask about this PDF…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              disabled={preparing || loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || preparing}
              className="fl-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ borderRadius: "0.875rem" }}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
          <p className="fl-muted text-center text-[10px] mt-1.5">
            Enter to send · Powered by Groq AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── File Card ─────────────────────────────────────────────────────────────────
function FileCard({
  file,
  onDelete,
  onChat,
}: {
  file: FileEntry;
  onDelete: (id: number) => void;
  onChat: (file: FileEntry) => void;
}) {
  const cat = CATEGORY_META[file.category];
  const isPdf = file.fileType?.includes("pdf");
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDownload = () => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/files/${file.id}/download`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.originalFileName;
        link.click();
      });
  };

  return (
    <div className="fl-card group flex items-center gap-4 p-4">
      {/* Icon */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
      >
        {getFileIcon(file.fileType)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="fl-heading text-sm font-semibold truncate"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          {file.originalFileName}
        </p>
        {file.description && (
          <p className="fl-muted truncate text-xs mt-0.5">{file.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold border"
            style={{
              background: cat.bg,
              borderColor: cat.border,
              color: cat.color,
              fontFamily: "var(--font-sora), sans-serif",
            }}
          >
            {cat.emoji} {cat.label}
          </span>
          <span className="fl-muted text-[10px]">{file.fileSizeFormatted}</span>
          <span className="fl-muted text-[10px]">
            {file.uploadedAt
              ? format(parseISO(file.uploadedAt), "d MMM yyyy")
              : ""}
          </span>
          {file.usedForChat && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] border"
              style={{
                background: "rgba(16,185,129,0.10)",
                borderColor: "rgba(16,185,129,0.25)",
                color: "#34d399",
              }}
            >
              💬 Chat ready
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isPdf && (
          <button
            onClick={() => onChat(file)}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all"
            style={{
              background:
                "color-mix(in srgb, var(--fl-accent) 13%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--fl-accent) 35%, transparent)",
              color: "var(--fl-accent)",
              fontFamily: "var(--font-sora), sans-serif",
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
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            Chat
          </button>
        )}
        <button
          onClick={handleDownload}
          className="fl-icon-btn"
          onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </button>
        {confirmDel ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(file.id)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold"
              style={{ background: "rgba(239,68,68,0.14)", color: "#f87171" }}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDel(false)}
              className="rounded-lg px-2 py-1 text-[10px] fl-muted"
              style={{ background: "var(--fl-glass-2)" }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDel(true)}
            className="fl-icon-btn"
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
              className="h-4 w-4"
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
        )}
      </div>
    </div>
  );
}

// ─── Storage Ring (SVG) ────────────────────────────────────────────────────────
function StorageRing({ used, total }: { used: number; total: number }) {
  const R = 44;
  const cx = 56;
  const cy = 56;
  const stroke = 10;
  const circ = 2 * Math.PI * R;
  const pct = total > 0 ? Math.min(used / total, 1) : 0;
  const dash = pct * circ;

  return (
    <div className="flex items-center gap-4">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="var(--fl-progress-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="var(--fl-accent)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="var(--fl-heading)"
          fontSize="13"
          fontWeight="700"
          fontFamily="var(--font-sora), sans-serif"
        >
          {Math.round(pct * 100)}%
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="var(--fl-muted)"
          fontSize="8"
        >
          used
        </text>
      </svg>
      <div>
        <p className="fl-muted text-xs">Storage Used</p>
        <p
          className="fl-heading text-base font-bold tabular-nums mt-0.5"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          {(used / 1024 / 1024).toFixed(1)} MB
        </p>
        <p className="fl-muted text-xs">
          of {(total / 1024 / 1024).toFixed(0)} MB
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<FileCategory | "ALL">(
    "ALL",
  );
  const [chatFile, setChatFile] = useState<FileEntry | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let data: FileEntry[];
      if (search.trim()) data = await fileApi.search(search.trim());
      else if (filterCategory !== "ALL")
        data = await fileApi.getByCategory(filterCategory);
      else data = await fileApi.getAll();
      setFiles(data);
    } catch {
      showToast("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await fileApi.getStats());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchFiles, 300);
    return () => clearTimeout(t);
  }, [fetchFiles]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpload = async (file: File, description: string) => {
    await fileApi.upload(file, description);
    showToast("File uploaded! 🎉");
    fetchFiles();
    fetchStats();
  };
  const handleDelete = async (id: number) => {
    await fileApi.delete(id);
    showToast("File deleted");
    fetchFiles();
    fetchStats();
  };

  const categories = Object.keys(CATEGORY_META) as FileCategory[];
  const pdfCount = files.filter((f) => f.fileType?.includes("pdf")).length;

  const grouped =
    filterCategory === "ALL" && !search
      ? files.reduce<Record<string, FileEntry[]>>((acc, f) => {
          const k = f.category;
          if (!acc[k]) acc[k] = [];
          acc[k].push(f);
          return acc;
        }, {})
      : null;

  return (
    <>
      <style>{FL_CSS}</style>
      <div className="fl-root">
        <div
          className="fl-blob"
          style={{
            width: "550px",
            height: "550px",
            background: "rgba(245,158,11,0.07)",
            top: "-130px",
            right: "-120px",
          }}
        />
        <div
          className="fl-blob"
          style={{
            width: "400px",
            height: "400px",
            background: "rgba(168,85,247,0.05)",
            bottom: "-80px",
            left: "-90px",
          }}
        />
        <div
          className="fl-blob"
          style={{
            width: "280px",
            height: "280px",
            background: "rgba(59,130,246,0.04)",
            top: "40%",
            left: "35%",
          }}
        />
        <div className="pointer-events-none fixed inset-0 fl-grid opacity-50" />

        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-8">
          {/* ── Header ── */}
          <div
            className="fl-animate mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            style={{ animationDelay: "40ms" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="fl-icon-btn">
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
                <span className="text-xl">📁</span>
                <p className="fl-muted text-xs font-semibold uppercase tracking-widest">
                  {stats
                    ? `${stats.totalFiles} files · ${stats.totalFormatted} used`
                    : "File Storage"}
                </p>
              </div>
              <h1
                className="fl-heading text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                File Storage
              </h1>
              <p className="fl-subtext mt-1.5 text-sm">
                Upload anything. Chat with PDFs using Groq AI.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
            {[
              {
                label: "Total Files",
                value: stats?.totalFiles ?? 0,
                icon: "📁",
                color: "var(--fl-heading)",
              },
              {
                label: "Storage",
                value: stats?.totalFormatted ?? "0 B",
                icon: "💾",
                color: "var(--fl-accent)",
              },
              {
                label: "PDFs (AI)",
                value: pdfCount,
                icon: "📕",
                color: "#f87171",
              },
              {
                label: "Images",
                value: files.filter((f) => f.category === "IMAGE").length,
                icon: "🖼️",
                color: "#60a5fa",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="fl-stat fl-animate"
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
                <p className="fl-muted text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            {/* Left — list */}
            <div>
              {/* Search + filter */}
              <div
                className="fl-panel mb-5 p-4 fl-animate"
                style={{ animationDelay: "270ms" }}
              >
                <div className="relative mb-3">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 fl-muted"
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
                    className="fl-input pl-10"
                    placeholder="Search files by name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCategory("ALL")}
                    className={`fl-tab ${filterCategory === "ALL" ? "fl-tab-active" : ""}`}
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
                        className="fl-tab"
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

              {/* Files */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="fl-shimmer rounded-2xl"
                      style={{ height: "80px" }}
                    />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div
                  className="fl-panel flex flex-col items-center justify-center py-16 text-center fl-animate"
                  style={{ animationDelay: "310ms" }}
                >
                  <div className="fl-empty-bounce text-5xl mb-4">📁</div>
                  <p
                    className="fl-heading text-lg font-bold"
                    style={{ fontFamily: "var(--font-sora), sans-serif" }}
                  >
                    {search ? "No files found" : "No files uploaded yet"}
                  </p>
                  <p className="fl-muted text-sm mt-1">
                    {search
                      ? "Try a different name"
                      : "Upload your first file using the panel →"}
                  </p>
                </div>
              ) : grouped ? (
                <div className="space-y-6">
                  {Object.entries(grouped).map(([cat, items]) => {
                    const m = CATEGORY_META[cat as FileCategory];
                    return (
                      <div key={cat}>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="text-sm">{m.emoji}</span>
                          <span
                            className="fl-subtext text-xs font-semibold"
                            style={{
                              fontFamily: "var(--font-sora), sans-serif",
                            }}
                          >
                            {m.label}
                          </span>
                          <div className="h-px flex-1 fl-divider-line" />
                          <span className="fl-muted text-xs">
                            {items.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {items.map((f, i) => (
                            <div
                              key={f.id}
                              className="fl-animate"
                              style={{ animationDelay: `${i * 30}ms` }}
                            >
                              <FileCard
                                file={f}
                                onDelete={handleDelete}
                                onChat={setChatFile}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((f, i) => (
                    <div
                      key={f.id}
                      className="fl-animate"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <FileCard
                        file={f}
                        onDelete={handleDelete}
                        onChat={setChatFile}
                      />
                    </div>
                  ))}
                  <p className="fl-muted text-center text-xs pt-2">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Right — upload + storage ring */}
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <UploadZone onUpload={handleUpload} />

              {/* Storage ring */}
              {stats && (
                <div
                  className="fl-panel p-5 fl-animate"
                  style={{ animationDelay: "400ms" }}
                >
                  <h3
                    className="fl-heading text-sm font-bold mb-4"
                    style={{ fontFamily: "var(--font-sora), sans-serif" }}
                  >
                    Storage Overview
                  </h3>
                  <StorageRing
                    used={stats.totalSizeBytes ?? 0}
                    total={500 * 1024 * 1024}
                  />
                </div>
              )}

              {/* PDF chat hint */}
              {pdfCount > 0 && (
                <div
                  className="fl-panel p-4 fl-animate"
                  style={{ animationDelay: "450ms" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p
                        className="fl-heading text-sm font-bold"
                        style={{ fontFamily: "var(--font-sora), sans-serif" }}
                      >
                        PDF Chat
                      </p>
                      <p className="fl-muted text-xs mt-0.5">
                        You have {pdfCount} PDF{pdfCount !== 1 ? "s" : ""}.
                        Hover any PDF and click{" "}
                        <span style={{ color: "var(--fl-accent)" }}>Chat</span>{" "}
                        to ask questions powered by Groq AI.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {chatFile && (
          <PdfChatPanel file={chatFile} onClose={() => setChatFile(null)} />
        )}

        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 fl-animate">
            <div className="fl-toast flex items-center gap-2">{toastMsg}</div>
          </div>
        )}
      </div>
    </>
  );
}
