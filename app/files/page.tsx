"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

import Cookies from "js-cookie";
import Link from "next/link";

type FileCategory =
  | "DOCUMENT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "SPREADSHEET"
  | "PRESENTATION"
  | "OTHER";

interface FileEntry {
  id: number;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  description?: string;
  category: FileCategory;
  uploadedAt: string;
  usedForChat?: boolean;
}

interface StorageStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalFormatted: string;
  filesByCategory?: Record<string, number>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CAT: Record<
  FileCategory,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  DOCUMENT: {
    label: "Docs",
    emoji: "📄",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.30)",
  },
  IMAGE: {
    label: "Images",
    emoji: "🖼️",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.30)",
  },
  VIDEO: {
    label: "Videos",
    emoji: "🎬",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.30)",
  },
  AUDIO: {
    label: "Audio",
    emoji: "🎵",
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.30)",
  },
  SPREADSHEET: {
    label: "Sheets",
    emoji: "📊",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.30)",
  },
  PRESENTATION: {
    label: "Slides",
    emoji: "📑",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.30)",
  },
  OTHER: {
    label: "Other",
    emoji: "📌",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.30)",
  },
};

function fileIcon(mime?: string) {
  if (!mime) return "📄";
  if (mime.includes("pdf")) return "📕";
  if (mime.startsWith("image/")) return "🖼️";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime.includes("csv")
  )
    return "📊";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "📑";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  return "📄";
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authH(): Record<string, string> {
  const t = Cookies.get("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authH(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Error ${res.status}`,
    );
  }
  return res.json();
}

const api = {
  getAll: () => apiFetch<FileEntry[]>("/api/files"),
  getByCategory: (t: FileCategory) =>
    apiFetch<FileEntry[]>(`/api/files/category?type=${t}`),
  getPdfs: () => apiFetch<FileEntry[]>("/api/files/pdfs"),
  search: (q: string) =>
    apiFetch<FileEntry[]>(`/api/files/search?q=${encodeURIComponent(q)}`),
  getStats: () => apiFetch<StorageStats>("/api/files/stats"),
  delete: (id: number) =>
    apiFetch<void>(`/api/files/${id}`, { method: "DELETE" }),

  upload: async (file: File, desc?: string): Promise<FileEntry> => {
    const fd = new FormData();
    fd.append("file", file);
    if (desc) fd.append("description", desc);
    return apiFetch<FileEntry>("/api/files/upload", {
      method: "POST",
      body: fd,
    });
  },

  download: async (id: number, name: string) => {
    const res = await fetch(`${BASE}/api/files/${id}/download`, {
      headers: authH(),
    });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: name,
    });
    a.click();
    URL.revokeObjectURL(url);
  },

  prepare: (fileId: number) =>
    apiFetch<{ wordCount: number; message: string }>(
      `/api/chat/pdf/${fileId}/prepare`,
    ),

  chat: async (
    fileId: number,
    question: string,
    history: ChatMessage[],
  ): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = await apiFetch<Record<string, any>>("/api/chat/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, question, history }),
    });
    const answer =
      d.answer ??
      d.response ??
      d.text ??
      d.content ??
      d.message ??
      d.reply ??
      d.result;
    if (!answer) throw new Error("Empty response from server");
    return String(answer);
  },
};

const CSS = `
  /* tokens */
  :root {
    --bg1:#eef2ff; --bg2:#f0f9ff;
    --gl:rgba(255,255,255,.78); --glb:rgba(255,255,255,.94);
    --sh:0 6px 28px rgba(80,60,180,.08),0 1px 5px rgba(0,0,0,.04);
    --gl2:rgba(255,255,255,.55);
    --fh:oklch(.18 .02 255); --fs:oklch(.42 .015 255); --fm:oklch(.58 .01 255);
    --ac:#d97706; --ach:#b45309; --act:#fff;
    --inb:rgba(255,255,255,.65); --inbd:rgba(200,190,230,.50);
    --inf:#d97706; --inc:oklch(.18 .02 255); --ph:oklch(.62 .01 255);
    --rh:rgba(255,255,255,.55); --dv:rgba(0,0,0,.06);
    --db:rgba(200,190,230,.40); --dh:rgba(217,119,6,.05);
    --pt:rgba(0,0,0,.07);
  }
  .dark {
    --bg1:#080d1a; --bg2:#0b1220;
    --gl:rgba(18,26,50,.74); --glb:rgba(255,255,255,.08);
    --sh:0 8px 36px rgba(0,0,0,.48),0 1px 5px rgba(0,0,0,.28);
    --gl2:rgba(18,26,50,.56);
    --fh:#f0f4ff; --fs:#8ba3c7; --fm:#4d6b8a;
    --ac:#f59e0b; --ach:#d97706; --act:#0d1120;
    --inb:rgba(255,255,255,.04); --inbd:rgba(255,255,255,.10);
    --inf:#f59e0b; --inc:#f0f4ff; --ph:#4d6b8a;
    --rh:rgba(255,255,255,.04); --dv:rgba(255,255,255,.07);
    --db:rgba(255,255,255,.10); --dh:rgba(245,158,11,.05);
    --pt:rgba(255,255,255,.07);
  }

  /* page */
  .pg{min-height:100vh;background:linear-gradient(145deg,var(--bg1) 0%,var(--bg2) 100%);position:relative;overflow-x:hidden;}
  .blob{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;animation:blb 10s ease-in-out infinite alternate;}
  @keyframes blb{from{transform:translate(0,0) scale(1);}to{transform:translate(24px,-20px) scale(1.04);}}
  .blob:nth-child(2){animation-delay:-5s;}.blob:nth-child(3){animation-delay:-8s;}
  .grd{background-image:linear-gradient(rgba(99,102,241,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.022) 1px,transparent 1px);background-size:36px 36px;}

  /* glass */
  .panel{background:var(--gl);border:1px solid var(--glb);box-shadow:var(--sh);border-radius:1.25rem;backdrop-filter:blur(24px) saturate(175%);-webkit-backdrop-filter:blur(24px) saturate(175%);}
  .card{background:var(--gl);border:1px solid var(--glb);box-shadow:var(--sh);border-radius:1.1rem;backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);transition:transform .18s,box-shadow .18s;}
  .card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.12);}
  .stat{background:var(--gl);border:1px solid var(--glb);box-shadow:var(--sh);border-radius:1.1rem;backdrop-filter:blur(18px) saturate(155%);-webkit-backdrop-filter:blur(18px) saturate(155%);transition:transform .2s;padding:.875rem .5rem;text-align:center;}
  .stat:hover{transform:translateY(-2px);}

  /* inputs */
  .inp{width:100%;background:var(--inb);border:1.5px solid var(--inbd);border-radius:.875rem;color:var(--inc);font-family:var(--font-dm),system-ui,sans-serif;transition:border-color .18s,box-shadow .18s;outline:none;padding:.6rem .85rem;font-size:.875rem;}
  .inp::placeholder{color:var(--ph);}
  .inp:focus{border-color:var(--inf);box-shadow:0 0 0 3px color-mix(in srgb,var(--inf) 16%,transparent);}

  /* primary button */
  .btn{background:var(--ac);color:var(--act);border-radius:.875rem;font-weight:700;font-family:var(--font-sora),sans-serif;transition:all .18s;box-shadow:0 3px 12px color-mix(in srgb,var(--ac) 28%,transparent);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
  .btn:hover{background:var(--ach);}
  .btn:active{transform:scale(.97);}
  .btn:disabled{opacity:.5;cursor:not-allowed;}

  /* icon button */
  .ibtn{display:flex;align-items:center;justify-content:center;border-radius:.6rem;padding:.35rem;color:var(--fm);transition:all .15s;background:transparent;cursor:pointer;flex-shrink:0;}
  .ibtn:hover{background:var(--rh);color:var(--fh);}

  /* ── CHAT BUTTON — always visible, amber pill ── */
  .chat-btn{
    display:inline-flex;align-items:center;gap:.3rem;
    border-radius:.8rem;padding:.3rem .65rem;
    font-size:.7rem;font-weight:700;letter-spacing:.02em;
    font-family:var(--font-sora),sans-serif;white-space:nowrap;flex-shrink:0;
    background:color-mix(in srgb,var(--ac) 15%,transparent);
    border:1.5px solid color-mix(in srgb,var(--ac) 42%,transparent);
    color:var(--ac);cursor:pointer;transition:all .18s;
  }
  .chat-btn:hover{background:color-mix(in srgb,var(--ac) 25%,transparent);transform:translateY(-1px);}
  .chat-btn:active{transform:scale(.96);}

  /* filter tabs */
  .tab{border-radius:.8rem;padding:.3rem .75rem;font-size:.72rem;font-weight:600;color:var(--fm);border:1px solid transparent;transition:all .14s;white-space:nowrap;font-family:var(--font-sora),sans-serif;background:transparent;cursor:pointer;}
  .tab:hover{color:var(--fs);background:var(--gl2);}
  .tab-on{background:color-mix(in srgb,var(--ac) 14%,transparent)!important;border-color:color-mix(in srgb,var(--ac) 38%,transparent)!important;color:var(--ac)!important;}

  /* drop zone */
  .dz{border:2px dashed var(--db);border-radius:1rem;transition:all .2s;cursor:pointer;background:transparent;}
  .dz:hover,.dz-on{border-color:var(--ac)!important;background:var(--dh)!important;}

  /* progress */
  .pt{height:4px;width:100%;border-radius:9999px;background:var(--pt);overflow:hidden;}
  .pf{height:100%;border-radius:9999px;background:var(--ac);transition:width .28s;}

  /* ── CHAT MODAL ── */
  /* On mobile: slides up from bottom, full width, ~95vh */
  /* On desktop: centered, max-width 44rem, max-height 86vh */
  .chat-modal{
    background:var(--gl);
    border:1px solid var(--glb);
    box-shadow:0 -6px 40px rgba(0,0,0,.22),0 0 0 1px var(--glb);
    backdrop-filter:blur(32px) saturate(190%);
    -webkit-backdrop-filter:blur(32px) saturate(190%);
    display:flex;flex-direction:column;
    position:relative;z-index:10;
    width:100%;
    border-radius:1.5rem 1.5rem 0 0;  /* mobile: rounded top only */
    height:95dvh;                       /* mobile: near full screen */
    max-height:95dvh;
  }
  @media(min-width:640px){
    .chat-modal{
      border-radius:1.5rem;            /* desktop: all corners */
      max-width:44rem;
      height:86vh;
      max-height:800px;
      box-shadow:0 24px 80px rgba(0,0,0,.30);
    }
  }

  /* slide-up animation for modal */
  @keyframes modal-up{from{opacity:0;transform:translateY(100%);}to{opacity:1;transform:translateY(0);}}
  @keyframes modal-fade{from{opacity:0;transform:scale(.96) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
  .modal-mob{animation:modal-up .32s cubic-bezier(.22,1,.36,1) both;}
  @media(min-width:640px){.modal-mob{animation:modal-fade .28s cubic-bezier(.22,1,.36,1) both;}}

  /* chat bubbles */
  .bu{background:color-mix(in srgb,var(--ac) 14%,transparent);border-radius:1rem 1rem .25rem 1rem;padding:.65rem .9rem;color:var(--fh);}
  .ba{background:var(--gl2);border-radius:1rem 1rem 1rem .25rem;padding:.65rem .9rem;color:var(--fh);}
  .be{background:rgba(239,68,68,.10);border:1px solid rgba(239,68,68,.25);border-radius:1rem 1rem 1rem .25rem;padding:.65rem .9rem;color:#f87171;}

  /* toast */
  .toast{background:var(--gl);border:1px solid var(--glb);border-radius:9999px;backdrop-filter:blur(20px);box-shadow:var(--sh);padding:.55rem 1.1rem;font-size:.85rem;color:var(--fh);}

  /* animations */
  @keyframes sup{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  .an{opacity:0;animation:sup .44s cubic-bezier(.22,1,.36,1) forwards;}
  @keyframes shim{from{background-position:-400px 0;}to{background-position:400px 0;}}
  .shim{background:linear-gradient(90deg,var(--gl) 25%,color-mix(in srgb,var(--gl) 78%,white) 50%,var(--gl) 75%);background-size:800px 100%;animation:shim 1.5s infinite;}
  @keyframes bonce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .bonce{animation:bonce 2.2s ease-in-out infinite;}
  @keyframes dot{0%,100%{opacity:1}50%{opacity:.3}}
  .dot{animation:dot 1.4s ease infinite;}
  .dot:nth-child(2){animation-delay:.2s;}.dot:nth-child(3){animation-delay:.4s;}

  /* colours */
  .ch{color:var(--fh);}.cs{color:var(--fs);}.cm{color:var(--fm);}.ca{color:var(--ac);}
  .dvl{background:var(--dv);}

  /* scroll */
  .scr::-webkit-scrollbar{width:3px;}
  .scr::-webkit-scrollbar-track{background:transparent;}
  .scr::-webkit-scrollbar-thumb{background:var(--glb);border-radius:3px;}

  /* mobile filter scroll */
  .tab-row{display:flex;gap:.375rem;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch;}
  .tab-row::-webkit-scrollbar{display:none;}

  /* file card action row — always show on mobile, hover on desktop */
  .act-row{display:flex;align-items:center;gap:.5rem;margin-top:.625rem;}
  @media(min-width:640px){
    .act-row{margin-top:0;opacity:0;transition:opacity .15s;}
    .card .act-row{opacity:1;}
    .act-row .chat-btn{opacity:1!important;}
  }

  /* FAB — floating upload button on mobile */
  .fab{
    position:fixed;bottom:1.5rem;right:1.25rem;z-index:40;
    width:3.25rem;height:3.25rem;border-radius:9999px;
    background:var(--ac);color:var(--act);
    box-shadow:0 6px 20px color-mix(in srgb,var(--ac) 42%,transparent);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all .2s;border:none;
  }
  .fab:hover{background:var(--ach);transform:scale(1.06);}
  .fab:active{transform:scale(.95);}
`;

function StorageRing({ used, total }: { used: number; total: number }) {
  const R = 40,
    cx = 50,
    cy = 50,
    sw = 9;
  const C = 2 * Math.PI * R;
  const p = total > 0 ? Math.min(used / total, 1) : 0;
  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="var(--pt)"
          strokeWidth={sw}
        />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="var(--ac)"
          strokeWidth={sw}
          strokeDasharray={`${p * C} ${(1 - p) * C}`}
          strokeDashoffset={C / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray .6s ease" }}
        />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="var(--fh)"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font-sora),sans-serif"
        >
          {Math.round(p * 100)}%
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="var(--fm)"
          fontSize="8"
        >
          used
        </text>
      </svg>
      <div>
        <p className="cm text-xs">Storage used</p>
        <p
          className="ch text-base font-bold tabular-nums mt-0.5"
          style={{ fontFamily: "var(--font-sora),sans-serif" }}
        >
          {(used / 1024 / 1024).toFixed(1)} MB
        </p>
        <p className="cm text-xs">of {(total / 1024 / 1024).toFixed(0)} MB</p>
      </div>
    </div>
  );
}

function UploadZone({
  onUpload,
  onClose,
}: {
  onUpload: (f: File, d: string) => Promise<void>;
  onClose?: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const go = async () => {
    if (!file) return;
    setBusy(true);
    setPct(0);
    setErr(null);
    const iv = setInterval(() => setPct((p) => (p < 82 ? p + 10 : p)), 180);
    try {
      await onUpload(file, desc);
      setPct(100);
      setTimeout(() => {
        setFile(null);
        setDesc("");
        setPct(0);
        onClose?.();
      }, 700);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      clearInterval(iv);
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) {
            setFile(f);
            setErr(null);
          }
        }}
        onClick={() => !file && ref.current?.click()}
        className={`dz flex flex-col items-center justify-center py-8 px-4 ${drag ? "dz-on" : ""}`}
      >
        <input
          ref={ref}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              setErr(null);
            }
          }}
        />
        {file ? (
          <div className="text-center">
            <div className="text-4xl mb-2">{fileIcon(file.type)}</div>
            <p
              className="ch text-sm font-semibold"
              style={{ fontFamily: "var(--font-sora),sans-serif" }}
            >
              {file.name}
            </p>
            <p className="cm text-xs mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setErr(null);
              }}
              className="mt-2 text-xs"
              style={{ color: "#f87171" }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl mx-auto text-2xl"
              style={{
                background: "color-mix(in srgb,var(--ac) 13%,transparent)",
                border:
                  "1px solid color-mix(in srgb,var(--ac) 28%,transparent)",
              }}
            >
              ☁️
            </div>
            <p className="cs text-sm font-medium">Tap or drag & drop</p>
            <p className="cm text-xs mt-1">PDFs, images, videos, audio, docs</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4 space-y-3">
          <input
            className="inp"
            placeholder="Optional description…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {busy && (
            <div className="pt">
              <div className="pf" style={{ width: `${pct}%` }} />
            </div>
          )}
          {err && (
            <p className="text-xs" style={{ color: "#f87171" }}>
              ⚠️ {err}
            </p>
          )}
          <button
            onClick={go}
            disabled={busy}
            className="btn w-full py-3 text-sm"
          >
            {busy ? `Uploading… ${pct}%` : "Upload File"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PDF Chat Modal ───────────────────────────────────────────────────────────
function PdfChat({ file, onClose }: { file: FileEntry; onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prepErr, setPrepErr] = useState<string | null>(null);
  const [wc, setWc] = useState<number | null>(null);
  const [prepMsg, setPrepMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prepare: GET /api/chat/pdf/{fileId}/prepare
  useEffect(() => {
    api
      .prepare(file.id)
      .then((d) => {
        setWc(d.wordCount ?? null);
        setPrepMsg(d.message ?? null);
      })
      .catch((e) => setPrepErr((e as Error).message))
      .finally(() => {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 200);
      });
  }, [file.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  // Send: POST /api/chat/pdf
  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy || loading || prepErr) return;
    setInput("");
    const um: ChatMessage = { role: "user", content: q };
    setMsgs((prev) => [...prev, um]);
    setBusy(true);
    try {
      const answer = await api.chat(file.id, q, [...msgs, um]);
      setMsgs((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${(e as Error).message}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const starters = [
    "Summarize this document",
    "What are the key points?",
    "List all main topics",
    "What is the conclusion?",
  ];

  return (
    /* Full-screen overlay */
    <div
      className="fixed inset-0 z-50 flex flex-col items-end justify-end sm:items-center sm:justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(10px)" }}
    >
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal — slides up from bottom on mobile, scales in on desktop */}
      <div
        className="chat-modal modal-mob"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center gap-3 border-b px-4 py-3.5 sm:px-5 sm:py-4"
          style={{ borderColor: "var(--dv)" }}
        >
          {/* Mobile drag handle */}
          <div
            className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full sm:hidden"
            style={{ background: "var(--glb)" }}
          />

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{
              background: "color-mix(in srgb,var(--ac) 14%,transparent)",
              border: "1px solid color-mix(in srgb,var(--ac) 30%,transparent)",
            }}
          >
            📕
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="ch text-sm font-semibold truncate"
              style={{ fontFamily: "var(--font-sora),sans-serif" }}
            >
              {file.originalFileName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                style={{
                  background: "color-mix(in srgb,var(--ac) 14%,transparent)",
                  color: "var(--ac)",
                  border:
                    "1px solid color-mix(in srgb,var(--ac) 35%,transparent)",
                  fontFamily: "var(--font-sora),sans-serif",
                }}
              >
                Groq AI
              </span>
              {wc !== null && (
                <span className="cm text-[10px]">
                  {wc.toLocaleString()} words
                </span>
              )}
            </div>
          </div>

          <button onClick={onClose} className="ibtn shrink-0">
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

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 scr">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div
                className="h-9 w-9 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "color-mix(in srgb,var(--ac) 25%,transparent)",
                  borderTopColor: "var(--ac)",
                }}
              />
              <p className="cs text-sm">Indexing PDF content…</p>
              <p className="cm text-xs">This may take a few seconds</p>
            </div>
          )}

          {!loading && prepErr && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="text-5xl">⚠️</div>
              <p
                className="ch text-base font-bold"
                style={{ fontFamily: "var(--font-sora),sans-serif" }}
              >
                Could not prepare PDF
              </p>
              <p className="cm text-sm max-w-xs">{prepErr}</p>
              <button
                onClick={onClose}
                className="btn px-5 py-2.5 text-sm mt-2"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !prepErr && msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-2">
              <div className="text-5xl">🤖</div>
              <p
                className="ch text-base font-bold"
                style={{ fontFamily: "var(--font-sora),sans-serif" }}
              >
                Ask anything about this PDF
              </p>
              <p className="cm text-sm max-w-xs">
                {prepMsg ??
                  "I've indexed the document. What would you like to know?"}
              </p>
              {/* Starter chips — scrollable row on mobile */}
              <div className="w-full mt-3 flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full px-3.5 py-2 text-xs cs transition-all"
                    style={{
                      border: "1px solid var(--inbd)",
                      background: "var(--gl2)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor =
                        "color-mix(in srgb,var(--ac) 45%,transparent)";
                      el.style.color = "var(--ac)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "";
                      el.style.color = "";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && !prepErr && msgs.length > 0 && (
            <div className="space-y-4">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{
                      background:
                        m.role === "user"
                          ? "color-mix(in srgb,var(--ac) 18%,transparent)"
                          : "var(--gl2)",
                    }}
                  >
                    {m.role === "user" ? "👤" : "🤖"}
                  </div>
                  {/* Bubble */}
                  <div
                    className={`max-w-[82%] text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bu"
                        : m.content.startsWith("⚠️")
                          ? "be"
                          : "ba"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex gap-2.5">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ background: "var(--gl2)" }}
                  >
                    🤖
                  </div>
                  <div className="ba flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full dot"
                        style={{ background: "var(--ac)" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ─────────────────────────────────── */}
        <div
          className="shrink-0 border-t px-3 py-3 sm:px-4 sm:py-3.5"
          style={{ borderColor: "var(--dv)" }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              className="inp flex-1 py-2.5 text-sm"
              placeholder={loading ? "Preparing…" : "Ask about this PDF…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading || busy || !!prepErr}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || busy || loading || !!prepErr}
              className="btn h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl text-sm disabled:opacity-40"
              style={{ borderRadius: ".875rem" }}
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
          <p className="cm text-center text-[10px] mt-1.5">
            Enter to send · Groq AI
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Sheet (mobile bottom-sheet) ──────────────────────────────────────
function UploadSheet({
  onUpload,
  onClose,
}: {
  onUpload: (f: File, d: string) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md panel p-5 rounded-t-3xl sm:rounded-2xl modal-mob">
        {/* drag handle */}
        <div
          className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full sm:hidden"
          style={{ background: "var(--glb)" }}
        />
        <div className="flex items-center justify-between mb-4 mt-2 sm:mt-0">
          <h3
            className="ch text-sm font-bold"
            style={{ fontFamily: "var(--font-sora),sans-serif" }}
          >
            📤 Upload File
          </h3>
          <button onClick={onClose} className="ibtn">
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
        <UploadZone onUpload={onUpload} onClose={onClose} />
      </div>
    </div>
  );
}

// ─── File Card ────────────────────────────────────────────────────────────────
function FileCard({
  file,
  onDelete,
  onChat,
}: {
  file: FileEntry;
  onDelete: (id: number) => void;
  onChat: (file: FileEntry) => void;
}) {
  const cat = CAT[file.category] ?? CAT.OTHER;
  const isPdf = file.fileType?.includes("pdf");
  const [del, setDel] = useState(false);

  return (
    <div className="card p-3.5 sm:p-4">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-2xl"
          style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
        >
          {fileIcon(file.fileType)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="ch text-sm font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-sora),sans-serif",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {file.originalFileName}
          </p>
          {file.description && (
            <p className="cm text-xs mt-0.5 truncate">{file.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold border"
              style={{
                background: cat.bg,
                borderColor: cat.border,
                color: cat.color,
                fontFamily: "var(--font-sora),sans-serif",
              }}
            >
              {cat.emoji} {cat.label}
            </span>
            <span className="cm text-[10px]">{file.fileSizeFormatted}</span>
            <span className="cm text-[10px]">
              {file.uploadedAt
                ? format(parseISO(file.uploadedAt), "d MMM yy")
                : ""}
            </span>
            {file.usedForChat && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] border"
                style={{
                  background: "rgba(52,211,153,.10)",
                  borderColor: "rgba(52,211,153,.25)",
                  color: "#34d399",
                }}
              >
                💬 Ready
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="act-row pt-2.5">
        {/* Chat — always visible on PDFs */}
        {isPdf && (
          <button onClick={() => onChat(file)} className="chat-btn">
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
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            Chat with PDF
          </button>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Download */}
          <button
            onClick={() => api.download(file.id, file.originalFileName)}
            className="ibtn"
            title="Download"
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

          {/* Delete */}
          {del ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(file.id)}
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                style={{ background: "rgba(239,68,68,.15)", color: "#f87171" }}
              >
                Delete
              </button>
              <button
                onClick={() => setDel(false)}
                className="rounded-lg px-2.5 py-1 text-[11px] cm"
                style={{ background: "var(--gl2)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDel(true)}
              className="ibtn"
              title="Delete"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,.12)";
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
    </div>
  );
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FileCategory | "ALL">("ALL");
  const [chatFile, setChatFile] = useState<FileEntry | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let data: FileEntry[];
      if (search.trim()) {
        data = await api.search(search.trim());
      } else if (filter === "DOCUMENT") {
        const [pdfs, docs] = await Promise.all([
          api.getPdfs(),
          api.getByCategory("DOCUMENT"),
        ]);
        const seen = new Set(pdfs.map((f) => f.id));
        data = [...pdfs, ...docs.filter((f) => !seen.has(f.id))];
      } else if (filter !== "ALL") {
        data = await api.getByCategory(filter);
      } else {
        data = await api.getAll();
      }
      setFiles(data);
    } catch (e) {
      showToast(`Failed to load: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await api.getStats());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchFiles, 280);
    return () => clearTimeout(t);
  }, [fetchFiles]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleUpload = async (f: File, d: string) => {
    await api.upload(f, d);
    showToast("Uploaded! 🎉");
    fetchFiles();
    fetchStats();
  };
  const handleDelete = async (id: number) => {
    await api.delete(id);
    showToast("Deleted");
    fetchFiles();
    fetchStats();
  };

  const categories = Object.keys(CAT) as FileCategory[];
  const pdfCount = files.filter((f) => f.fileType?.includes("pdf")).length;

  const grouped =
    filter === "ALL" && !search
      ? files.reduce<Record<string, FileEntry[]>>((acc, f) => {
          if (!acc[f.category]) acc[f.category] = [];
          acc[f.category].push(f);
          return acc;
        }, {})
      : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="pg">
        <div
          className="blob"
          style={{
            width: "500px",
            height: "500px",
            background: "rgba(245,158,11,.07)",
            top: "-120px",
            right: "-110px",
          }}
        />
        <div
          className="blob"
          style={{
            width: "380px",
            height: "380px",
            background: "rgba(168,85,247,.05)",
            bottom: "-80px",
            left: "-80px",
          }}
        />
        <div
          className="blob"
          style={{
            width: "250px",
            height: "250px",
            background: "rgba(59,130,246,.04)",
            top: "44%",
            left: "38%",
          }}
        />
        <div className="pointer-events-none fixed inset-0 grd opacity-50" />

        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-3 sm:px-4 pb-24 pt-6 sm:pt-8">
          <div className="an mb-6 sm:mb-8" style={{ animationDelay: "40ms" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="ibtn">
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
                <p className="cm text-xs font-semibold uppercase tracking-widest">
                  {stats
                    ? `${stats.totalFiles} files · ${stats.totalFormatted}`
                    : "Files"}
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="btn hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm"
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
                Upload
              </button>
            </div>
            <h1
              className="ch text-2xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-sora),sans-serif" }}
            >
              File Storage
            </h1>
            <p className="cs mt-1 text-sm">
              Upload & organise files. Chat with PDFs using Groq AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 mb-5">
            {[
              {
                label: "Total",
                value: stats?.totalFiles ?? 0,
                icon: "📁",
                color: "var(--fh)",
              },
              {
                label: "Used",
                value: stats?.totalFormatted ?? "0 B",
                icon: "💾",
                color: "var(--ac)",
              },
              { label: "PDFs", value: pdfCount, icon: "📕", color: "#f87171" },
              {
                label: "Images",
                value: files.filter((f) => f.category === "IMAGE").length,
                icon: "🖼️",
                color: "#60a5fa",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="stat an"
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                <div className="text-lg mb-0.5">{s.icon}</div>
                <p
                  className="text-lg sm:text-xl font-bold tabular-nums leading-tight"
                  style={{
                    color: s.color,
                    fontFamily: "var(--font-sora),sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p className="cm text-[10px] sm:text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {pdfCount > 0 && (
            <div
              className="panel mb-4 px-4 py-3.5 an flex items-center gap-3"
              style={{ animationDelay: "200ms" }}
            >
              <span className="text-2xl shrink-0">🤖</span>
              <div className="flex-1 min-w-0">
                <p
                  className="ch text-xs font-bold"
                  style={{ fontFamily: "var(--font-sora),sans-serif" }}
                >
                  PDF Chat ready
                </p>
                <p className="cm text-xs mt-0.5">
                  Tap <span className="ca font-semibold">Chat with PDF</span> on
                  any PDF to ask questions using Groq AI.
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: "color-mix(in srgb,var(--ac) 14%,transparent)",
                  color: "var(--ac)",
                  border:
                    "1px solid color-mix(in srgb,var(--ac) 35%,transparent)",
                }}
              >
                {pdfCount} PDF{pdfCount > 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div
            className="panel mb-4 p-3.5 sm:p-4 an"
            style={{ animationDelay: "240ms" }}
          >
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 cm"
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
                className="inp pl-9"
                placeholder="Search files…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cm"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--fh)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.color = "")}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="tab-row">
              <button
                onClick={() => setFilter("ALL")}
                className={`tab ${filter === "ALL" ? "tab-on" : ""}`}
              >
                All
              </button>
              {categories.map((c) => {
                const m = CAT[c];
                const on = filter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(on ? "ALL" : c)}
                    className="tab"
                    style={
                      on
                        ? {
                            background: m.bg,
                            borderColor: m.border,
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

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shim rounded-2xl"
                  style={{ height: "90px" }}
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center py-14 text-center">
              <div className="bonce text-5xl mb-4">📁</div>
              <p
                className="ch text-base font-bold"
                style={{ fontFamily: "var(--font-sora),sans-serif" }}
              >
                {search ? "No files found" : "No files yet"}
              </p>
              <p className="cm text-sm mt-1">
                {search
                  ? "Try a different term"
                  : "Tap the ＋ button to upload your first file"}
              </p>
            </div>
          ) : grouped ? (
            <div className="space-y-5">
              {Object.entries(grouped).map(([cat, items]) => {
                const m = CAT[cat as FileCategory] ?? CAT.OTHER;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-sm">{m.emoji}</span>
                      <span
                        className="cs text-xs font-semibold"
                        style={{ fontFamily: "var(--font-sora),sans-serif" }}
                      >
                        {m.label}
                      </span>
                      <div className="h-px flex-1 dvl" />
                      <span className="cm text-xs">{items.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {items.map((f, i) => (
                        <div
                          key={f.id}
                          className="an"
                          style={{ animationDelay: `${i * 28}ms` }}
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
            <div className="space-y-2.5">
              {files.map((f, i) => (
                <div
                  key={f.id}
                  className="an"
                  style={{ animationDelay: `${i * 28}ms` }}
                >
                  <FileCard
                    file={f}
                    onDelete={handleDelete}
                    onChat={setChatFile}
                  />
                </div>
              ))}
              <p className="cm text-center text-xs pt-2">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {stats && (
            <div
              className="panel mt-5 p-4 an"
              style={{ animationDelay: "420ms" }}
            >
              <h3
                className="ch text-sm font-bold mb-3.5"
                style={{ fontFamily: "var(--font-sora),sans-serif" }}
              >
                Storage Overview
              </h3>
              <StorageRing
                used={stats.totalSizeBytes ?? 0}
                total={500 * 1024 * 1024}
              />
              {stats.filesByCategory &&
                Object.keys(stats.filesByCategory).length > 0 && (
                  <div
                    className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t pt-3.5"
                    style={{ borderColor: "var(--dv)" }}
                  >
                    {Object.entries(stats.filesByCategory).map(
                      ([cat, count]) => {
                        const m = CAT[cat as FileCategory] ?? CAT.OTHER;
                        return (
                          <div key={cat} className="flex items-center gap-2">
                            <span className="text-sm">{m.emoji}</span>
                            <span className="cm text-xs flex-1">{m.label}</span>
                            <span
                              className="text-xs font-bold tabular-nums"
                              style={{
                                color: m.color,
                                fontFamily: "var(--font-sora),sans-serif",
                              }}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="fab sm:hidden"
          aria-label="Upload file"
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

        {showUpload && (
          <UploadSheet
            onUpload={handleUpload}
            onClose={() => setShowUpload(false)}
          />
        )}

        {chatFile && (
          <PdfChat file={chatFile} onClose={() => setChatFile(null)} />
        )}

        {toast && (
          <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 an">
            <div className="toast flex items-center gap-2 whitespace-nowrap">
              {toast}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
