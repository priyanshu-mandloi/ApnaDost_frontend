"use client";

import { Task, TaskRequest, taskApi } from "@/lib/taskApi";
import { format, isToday, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { playSound } from "@/lib/soundManager";

// ─── Priority / Status config ─────────────────────────────────────────────────
const PRIORITY = {
  3: { label: "HIGH", color: "--p-rose", dot: "bg-rose-400", hex: "#f87171" },
  2: { label: "MED", color: "--p-amber", dot: "bg-amber-400", hex: "#fbbf24" },
  1: {
    label: "LOW",
    color: "--p-emerald",
    dot: "bg-emerald-400",
    hex: "#34d399",
  },
} as const;

const STATUS_CFG = {
  PENDING: { label: "Pending", dot: "#94a3b8" },
  IN_PROGRESS: { label: "In Progress", dot: "#fbbf24" },
  COMPLETED: { label: "Done", dot: "#34d399" },
};

type FilterStatus = "ALL" | "PENDING" | "COMPLETED";
type FilterDate = "today" | "all" | string;

// ─── Shared scoped CSS ────────────────────────────────────────────────────────
const SHARED_CSS = `
  :root {
    --tk-bg-from:        #eef2ff;
    --tk-bg-to:          #f5f3ff;
    --tk-glass:          rgba(255,255,255,0.75);
    --tk-glass-border:   rgba(255,255,255,0.92);
    --tk-glass-shadow:   0 8px 32px rgba(80,60,180,0.09), 0 1.5px 6px rgba(0,0,0,0.05);
    --tk-glass-2:        rgba(255,255,255,0.52);
    --tk-glass-2b:       rgba(255,255,255,0.72);
    --tk-heading:        oklch(0.18 0.02 255);
    --tk-subtext:        oklch(0.42 0.015 255);
    --tk-muted:          oklch(0.58 0.010 255);
    --tk-accent:         #d97706;
    --tk-accent-glow:    rgba(217,119,6,0.18);
    --tk-input-bg:       rgba(255,255,255,0.65);
    --tk-input-border:   rgba(200,190,230,0.50);
    --tk-input-focus:    #d97706;
    --tk-input-text:     oklch(0.18 0.02 255);
    --tk-placeholder:    oklch(0.62 0.01 255);
    --tk-btn-bg:         #d97706;
    --tk-btn-hover:      #b45309;
    --tk-btn-text:       #fff;
    --tk-row-hover:      rgba(255,255,255,0.55);
    --tk-bar-track:      rgba(0,0,0,0.07);
    --tk-divider:        rgba(0,0,0,0.07);
    --tk-shimmer-from:   rgba(255,255,255,0);
    --tk-shimmer-to:     rgba(255,255,255,0.6);
    --p-rose:            #f87171;
    --p-amber:           #fbbf24;
    --p-emerald:         #34d399;
  }
  .dark {
    --tk-bg-from:        #080d1a;
    --tk-bg-to:          #0d1525;
    --tk-glass:          rgba(18,26,50,0.72);
    --tk-glass-border:   rgba(255,255,255,0.08);
    --tk-glass-shadow:   0 8px 40px rgba(0,0,0,0.50), 0 1.5px 6px rgba(0,0,0,0.30);
    --tk-glass-2:        rgba(18,26,50,0.55);
    --tk-glass-2b:       rgba(18,26,50,0.70);
    --tk-heading:        #f0f4ff;
    --tk-subtext:        #8ba3c7;
    --tk-muted:          #4d6b8a;
    --tk-accent:         #f59e0b;
    --tk-accent-glow:    rgba(245,158,11,0.18);
    --tk-input-bg:       rgba(255,255,255,0.04);
    --tk-input-border:   rgba(255,255,255,0.10);
    --tk-input-focus:    #f59e0b;
    --tk-input-text:     #f0f4ff;
    --tk-placeholder:    #4d6b8a;
    --tk-btn-bg:         #f59e0b;
    --tk-btn-hover:      #d97706;
    --tk-btn-text:       #0d1120;
    --tk-row-hover:      rgba(255,255,255,0.04);
    --tk-bar-track:      rgba(255,255,255,0.07);
    --tk-divider:        rgba(255,255,255,0.07);
    --tk-shimmer-from:   rgba(255,255,255,0);
    --tk-shimmer-to:     rgba(255,255,255,0.04);
  }

  /* ── root ── */
  .tk-root {
    min-height: 100vh;
    background: linear-gradient(145deg, var(--tk-bg-from) 0%, var(--tk-bg-to) 100%);
    position: relative; overflow-x: hidden;
  }
  .tk-blob {
    position: fixed; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
    animation: tk-blob-drift 10s ease-in-out infinite alternate;
  }
  @keyframes tk-blob-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(28px,-22px) scale(1.05); }
  }
  .tk-blob:nth-child(2) { animation-delay: -5s; }
  .tk-grid-overlay {
    background-image:
      linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px);
    background-size: 36px 36px;
  }

  /* ── glass panels ── */
  .tk-panel {
    background: var(--tk-glass);
    border: 1px solid var(--tk-glass-border);
    box-shadow: var(--tk-glass-shadow);
    border-radius: 1.35rem;
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
  }
  .tk-panel-sm {
    background: var(--tk-glass-2);
    border: 1px solid var(--tk-glass-border);
    border-radius: 1.1rem;
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
  }
  .tk-card {
    background: var(--tk-glass);
    border: 1px solid var(--tk-glass-border);
    box-shadow: var(--tk-glass-shadow);
    border-radius: 1.15rem;
    backdrop-filter: blur(24px) saturate(175%);
    -webkit-backdrop-filter: blur(24px) saturate(175%);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    position: relative; overflow: hidden;
  }
  .tk-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 44px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  }

  /* ── inputs ── */
  .tk-input {
    width: 100%;
    background: var(--tk-input-bg);
    border: 1.5px solid var(--tk-input-border);
    border-radius: 0.875rem;
    color: var(--tk-input-text);
    font-family: var(--font-dm), system-ui, sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }
  .tk-input::placeholder { color: var(--tk-placeholder); }
  .tk-input:focus {
    border-color: var(--tk-input-focus);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--tk-input-focus) 18%, transparent);
  }
  textarea.tk-input { resize: none; }

  /* ── buttons ── */
  .tk-btn-primary {
    background: var(--tk-btn-bg);
    color: var(--tk-btn-text);
    border-radius: 0.875rem;
    font-weight: 700;
    font-family: var(--font-sora), sans-serif;
    transition: all 0.18s;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--tk-btn-bg) 30%, transparent);
  }
  .tk-btn-primary:hover  { background: var(--tk-btn-hover); }
  .tk-btn-primary:active { transform: scale(0.97); }
  .tk-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

  .tk-icon-btn {
    display: flex; align-items: center; justify-content: center;
    border-radius: 0.625rem; padding: 0.375rem;
    color: var(--tk-muted);
    transition: all 0.15s;
    background: transparent;
  }
  .tk-icon-btn:hover { background: var(--tk-row-hover); color: var(--tk-heading); }

  /* ── filter tabs ── */
  .tk-tab {
    border-radius: 0.875rem; padding: 0.375rem 0.875rem;
    font-size: 0.75rem; font-weight: 600;
    color: var(--tk-muted);
    border: 1px solid transparent;
    transition: all 0.15s; white-space: nowrap;
    font-family: var(--font-sora), sans-serif;
    background: transparent;
  }
  .tk-tab:hover { color: var(--tk-subtext); background: var(--tk-glass-2); }
  .tk-tab-active {
    background: color-mix(in srgb, var(--tk-accent) 15%, transparent) !important;
    border-color: color-mix(in srgb, var(--tk-accent) 40%, transparent) !important;
    color: var(--tk-accent) !important;
  }
  .tk-tab-rose   { --t-c: #f87171; }
  .tk-tab-amber  { --t-c: #fbbf24; }
  .tk-tab-green  { --t-c: #34d399; }
  .tk-tab-p-active {
    background: color-mix(in srgb, var(--t-c) 15%, transparent) !important;
    border-color: color-mix(in srgb, var(--t-c) 40%, transparent) !important;
    color: var(--t-c) !important;
  }

  /* ── priority pill ── */
  .p-pill {
    display: inline-flex; align-items: center; gap: 0.3rem;
    border-radius: 9999px; padding: 0.2rem 0.65rem;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
    font-family: var(--font-sora), sans-serif;
    border: 1px solid;
  }

  /* ── completion ring ── */
  .tk-check {
    width: 1.25rem; height: 1.25rem; border-radius: 50%;
    border: 2px solid var(--tk-muted);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; cursor: pointer;
  }
  .tk-check:hover { border-color: #34d399; background: rgba(52,211,153,0.1); }
  .tk-check-done  { border-color: #34d399 !important; background: #34d399 !important; }

  /* ── stat card ── */
  .tk-stat {
    background: var(--tk-glass);
    border: 1px solid var(--tk-glass-border);
    box-shadow: var(--tk-glass-shadow);
    border-radius: 1.15rem;
    backdrop-filter: blur(22px) saturate(170%);
    -webkit-backdrop-filter: blur(22px) saturate(170%);
    transition: transform 0.2s ease;
    padding: 1rem;
    text-align: center;
  }
  .tk-stat:hover { transform: translateY(-2px); }

  /* ── modal ── */
  .tk-modal {
    background: var(--tk-glass);
    border: 1px solid var(--tk-glass-border);
    border-radius: 1.5rem;
    backdrop-filter: blur(36px) saturate(200%);
    -webkit-backdrop-filter: blur(36px) saturate(200%);
    box-shadow: 0 24px 80px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.10);
    padding: 1.75rem;
    width: 100%; max-width: 32rem;
    position: relative; z-index: 10;
  }
  @keyframes tk-modal-in {
    from { opacity:0; transform: scale(0.94) translateY(14px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }
  .tk-modal-animate { animation: tk-modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

  /* ── toast ── */
  .tk-toast {
    background: var(--tk-glass);
    border: 1px solid var(--tk-glass-border);
    border-radius: 9999px;
    backdrop-filter: blur(24px);
    box-shadow: var(--tk-glass-shadow);
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    color: var(--tk-heading);
  }

  /* ── shimmer loading ── */
  @keyframes tk-shimmer {
    from { background-position: -400px 0; }
    to   { background-position: 400px 0; }
  }
  .tk-shimmer {
    background: linear-gradient(90deg,
      var(--tk-glass) 25%,
      color-mix(in srgb, var(--tk-glass) 80%, white) 50%,
      var(--tk-glass) 75%);
    background-size: 800px 100%;
    animation: tk-shimmer 1.5s infinite;
  }

  /* ── divider ── */
  .tk-divider { background: var(--tk-divider); }

  /* ── colours ── */
  .tk-heading { color: var(--tk-heading); }
  .tk-subtext  { color: var(--tk-subtext); }
  .tk-muted    { color: var(--tk-muted); }
  .tk-accent-c { color: var(--tk-accent); }

  /* ── progress bar ── */
  .tk-progress-track {
    height: 6px; width: 100%; border-radius: 9999px;
    background: var(--tk-bar-track); overflow: hidden;
  }
  .tk-progress-fill {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, var(--tk-accent), color-mix(in srgb, var(--tk-accent) 60%, #10b981));
    transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
  }

  /* ── FAB ── */
  .tk-fab {
    background: var(--tk-btn-bg);
    color: var(--tk-btn-text);
    border-radius: 9999px;
    box-shadow: 0 6px 24px color-mix(in srgb, var(--tk-btn-bg) 40%, transparent);
    transition: all 0.2s;
    width: 3.5rem; height: 3.5rem;
    display: flex; align-items: center; justify-content: center;
  }
  .tk-fab:hover { background: var(--tk-btn-hover); transform: scale(1.07) translateY(-1px); }
  .tk-fab:active { transform: scale(0.96); }

  /* ── slide-up ── */
  @keyframes tk-slide-up {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .tk-animate { opacity:0; animation: tk-slide-up 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* ── priority accent bar on card left ── */
  .tk-card-accent {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    border-radius: 4px 0 0 4px;
  }

  /* ── scrollbar ── */
  .tk-scroll::-webkit-scrollbar { width: 4px; }
  .tk-scroll::-webkit-scrollbar-track { background: transparent; }
  .tk-scroll::-webkit-scrollbar-thumb { background: var(--tk-glass-border); border-radius: 4px; }

  /* ── empty state bounce ── */
  @keyframes tk-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .tk-empty-bounce { animation: tk-bounce 2.2s ease-in-out infinite; }
`;

// ─── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task | null;
  onClose: () => void;
  onSave: (data: TaskRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<TaskRequest>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    taskDate: task?.taskDate ?? format(new Date(), "yyyy-MM-dd"),
    taskTime: task?.taskTime?.slice(0, 5) ?? "",
    priority: task?.priority ?? 2,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, taskTime: form.taskTime + ":00" });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="tk-modal tk-modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="tk-heading text-lg font-bold"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              {task ? "Edit Task" : "New Task"}
            </h2>
            <p className="tk-muted text-xs mt-0.5">
              {task ? "Update task details" : "Plan something great"}
            </p>
          </div>
          <button onClick={onClose} className="tk-icon-btn">
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
          <div>
            <label className="tk-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Title *
            </label>
            <input
              required
              className="tk-input"
              placeholder="e.g. Complete project report"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="tk-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Description
            </label>
            <textarea
              rows={3}
              className="tk-input"
              placeholder="Optional details…"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="tk-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
                Date *
              </label>
              <input
                type="date"
                required
                className="tk-input"
                value={form.taskDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, taskDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="tk-muted mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
                Time *
              </label>
              <input
                type="time"
                required
                className="tk-input"
                value={form.taskTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, taskTime: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Priority selector */}
          <div>
            <label className="tk-muted mb-2 block text-[10px] font-semibold uppercase tracking-widest">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((p) => {
                const cfg = PRIORITY[p];
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, priority: p }))
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all border"
                    style={{
                      fontFamily: "var(--font-sora), sans-serif",
                      background: active
                        ? `color-mix(in srgb, ${cfg.hex} 15%, transparent)`
                        : "var(--tk-glass-2)",
                      borderColor: active
                        ? `${cfg.hex}60`
                        : "var(--tk-input-border)",
                      color: active ? cfg.hex : "var(--tk-muted)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: cfg.hex }}
                    />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="tk-btn-primary mt-2 w-full py-3 text-sm"
          >
            {saving ? "Saving…" : task ? "Update Task" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const pCfg = PRIORITY[task.priority as keyof typeof PRIORITY] ?? PRIORITY[1];
  const sCfg = STATUS_CFG[task.status] ?? STATUS_CFG.PENDING;
  const done = task.status === "COMPLETED";
  const dateObj = task.taskDate ? parseISO(task.taskDate) : null;
  const isTaskToday = dateObj ? isToday(dateObj) : false;
  const timeStr = task.taskTime?.slice(0, 5) ?? "";

  return (
    <div
      className={`tk-card group pl-4 pr-4 pt-4 pb-4 ${done ? "opacity-55" : ""}`}
    >
      {/* Priority accent bar */}
      <div
        className="tk-card-accent"
        style={{ background: pCfg.hex, opacity: 0.7 }}
      />

      <div className="ml-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Completion circle */}
            <button
              onClick={() => !done && onComplete(task.id)}
              disabled={done}
              className={`tk-check mt-0.5 ${done ? "tk-check-done" : ""}`}
            >
              {done && (
                <svg className="h-3 w-3" fill="white" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold truncate ${done ? "line-through tk-muted" : "tk-heading"}`}
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="tk-muted mt-0.5 truncate text-xs">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="tk-icon-btn"
              style={{ color: "var(--tk-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--tk-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--tk-muted)")
              }
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
              onClick={() => onDelete(task.id)}
              className="tk-icon-btn"
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
          </div>
        </div>

        {/* Footer chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs tk-muted">
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {timeStr}
          </span>
          <span
            className={`flex items-center gap-1 text-xs ${isTaskToday ? "font-semibold" : "tk-muted"}`}
            style={{ color: isTaskToday ? "var(--tk-accent)" : undefined }}
          >
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
              />
            </svg>
            {isTaskToday ? "Today" : dateObj ? format(dateObj, "MMM d") : ""}
          </span>
          <span
            className="p-pill"
            style={{
              background: `color-mix(in srgb, ${pCfg.hex} 14%, transparent)`,
              borderColor: `${pCfg.hex}55`,
              color: pCfg.hex,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: pCfg.hex }}
            />
            {pCfg.label}
          </span>
          <span className="flex items-center gap-1 text-[10px] tk-muted">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: sCfg.dot }}
            />
            {sCfg.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<FilterDate>("today");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterPriority, setFilterPriority] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [customDate, setCustomDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let data: Task[];
      if (filterDate === "today") data = await taskApi.getToday();
      else if (filterDate === "all") data = await taskApi.getAll();
      else data = await taskApi.getByDate(filterDate);
      setTasks(data);
    } catch {
      showToast("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = async (data: TaskRequest) => {
    if (editingTask) {
      await taskApi.update(editingTask.id, data);
      showToast("Task updated!");
    } else {
      await taskApi.create(data);
      showToast("Task created! 🎯");
    }
    fetchTasks();
  };
  const handleComplete = async (id: number) => {
    await taskApi.markComplete(id);
    playSound("success");
    showToast("🎉 Task completed!");
    fetchTasks();
  };
  const handleDelete = async (id: number) => {
    await taskApi.delete(id);
    showToast("Task deleted");
    fetchTasks();
  };

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const high = tasks.filter(
    (t) => t.priority === 3 && t.status !== "COMPLETED",
  ).length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <style>{SHARED_CSS}</style>
      <div className="tk-root">
        {/* Blobs */}
        <div
          className="tk-blob"
          style={{
            width: "580px",
            height: "580px",
            background: "rgba(245,158,11,0.07)",
            top: "-150px",
            right: "-130px",
          }}
        />
        <div
          className="tk-blob"
          style={{
            width: "420px",
            height: "420px",
            background: "rgba(52,211,153,0.05)",
            bottom: "-80px",
            left: "-100px",
          }}
        />
        <div
          className="tk-blob"
          style={{
            width: "280px",
            height: "280px",
            background: "rgba(239,68,68,0.04)",
            top: "45%",
            left: "20%",
          }}
        />
        <div className="pointer-events-none fixed inset-0 tk-grid-overlay opacity-50" />

        {/* Navbar spacer */}
        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-8">
          {/* ── Header ── */}
          <div
            className="tk-animate mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
            style={{ animationDelay: "40ms" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="tk-icon-btn">
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
                <span className="text-xl">📋</span>
                <p className="tk-muted text-xs font-semibold uppercase tracking-widest">
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
              </div>
              <h1
                className="tk-heading text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Task Planner
              </h1>
              <p className="tk-subtext mt-1.5 text-sm">
                Stay focused. Ship it.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTask(null);
                setShowModal(true);
              }}
              className="tk-btn-primary hidden sm:flex items-center gap-2 px-5 py-3 text-sm shrink-0"
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
              New Task
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
            {[
              {
                label: "Total",
                value: total,
                icon: "📋",
                color: "var(--tk-heading)",
              },
              {
                label: "Pending",
                value: pending,
                icon: "⏳",
                color: "#fbbf24",
              },
              {
                label: "Completed",
                value: completed,
                icon: "✅",
                color: "#34d399",
              },
              {
                label: "High Priority",
                value: high,
                icon: "🔥",
                color: "#f87171",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className="tk-stat tk-animate"
                style={{ animationDelay: `${80 + i * 45}ms` }}
              >
                <div className="text-xl mb-1">{s.icon}</div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    color: s.color,
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p className="tk-muted text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div
              className="tk-panel mb-5 px-5 py-4 tk-animate"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="tk-subtext text-xs font-semibold">
                  Today's Progress
                </span>
                <span
                  className="tk-accent-c text-xs font-bold tabular-nums"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  {progressPct}%
                </span>
              </div>
              <div className="tk-progress-track">
                <div
                  className="tk-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="tk-muted text-[10px] mt-1.5">
                {completed} of {total} tasks complete
              </p>
            </div>
          )}

          {/* ── Filters panel ── */}
          <div
            className="tk-panel mb-5 p-4 tk-animate"
            style={{ animationDelay: "280ms" }}
          >
            {/* Search */}
            <div className="relative mb-3">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 tk-muted"
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
                className="tk-input pl-10"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date tabs */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {(["today", "all"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDate(d)}
                  className={`tk-tab capitalize ${filterDate === d ? "tk-tab-active" : ""}`}
                >
                  {d === "today" ? "📅 Today" : "🗂 All Time"}
                </button>
              ))}
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setFilterDate(e.target.value);
                }}
                className="tk-input py-1.5 px-3 text-xs w-auto"
                style={{ width: "auto" }}
              />
            </div>

            {/* Status + Priority */}
            <div className="flex flex-wrap gap-1.5">
              {(["ALL", "PENDING", "COMPLETED"] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`tk-tab ${filterStatus === s ? "tk-tab-active" : ""}`}
                >
                  {s === "ALL"
                    ? "All Status"
                    : s === "PENDING"
                      ? "⏳ Pending"
                      : "✅ Done"}
                </button>
              ))}
              <div className="h-5 w-px tk-divider mx-1 self-center" />
              {(
                [
                  { v: "ALL", l: "All" },
                  { v: 3, l: "🔥 High" },
                  { v: 2, l: "⚡ Med" },
                  { v: 1, l: "🌿 Low" },
                ] as const
              ).map(({ v, l }) => {
                const hexes: Record<string, string> = {
                  "3": "#f87171",
                  "2": "#fbbf24",
                  "1": "#34d399",
                };
                const hex = hexes[String(v)];
                const active = filterPriority === v;
                return (
                  <button
                    key={String(v)}
                    onClick={() => setFilterPriority(v)}
                    className="tk-tab"
                    style={
                      active
                        ? {
                            background: hex
                              ? `color-mix(in srgb, ${hex} 15%, transparent)`
                              : "color-mix(in srgb, var(--tk-accent) 15%, transparent)",
                            borderColor: hex
                              ? `${hex}50`
                              : "color-mix(in srgb, var(--tk-accent) 40%, transparent)",
                            color: hex ?? "var(--tk-accent)",
                          }
                        : {}
                    }
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Task list ── */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="tk-shimmer rounded-2xl"
                  style={{ height: "96px" }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="tk-panel flex flex-col items-center justify-center py-16 text-center tk-animate"
              style={{ animationDelay: "320ms" }}
            >
              <div className="tk-empty-bounce text-5xl mb-4">📋</div>
              <p
                className="tk-heading text-lg font-bold"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                {search ? "No tasks found" : "Nothing planned yet"}
              </p>
              <p className="tk-muted text-sm mt-1">
                {search
                  ? "Try a different search term"
                  : "Create your first task and own the day"}
              </p>
              {!search && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowModal(true);
                  }}
                  className="tk-btn-primary mt-5 px-6 py-2.5 text-sm"
                >
                  ➕ Add Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task, i) => (
                <div
                  key={task.id}
                  className="tk-animate"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <TaskCard
                    task={task}
                    onComplete={handleComplete}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setShowModal(true);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
              <p className="tk-muted text-center text-xs pt-2">
                {filtered.length} of {tasks.length} tasks
              </p>
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <button
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
          className="tk-fab fixed bottom-6 right-6 z-40 sm:hidden"
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
          <TaskModal
            task={editingTask}
            onClose={() => {
              setShowModal(false);
              setEditingTask(null);
            }}
            onSave={handleSave}
          />
        )}

        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 tk-animate">
            <div className="tk-toast flex items-center gap-2">{toastMsg}</div>
          </div>
        )}
      </div>
    </>
  );
}
