"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PayMethod = "CASH" | "UPI" | "CARD" | "NET_BANKING" | "OTHER";
type Category =
  | "FOOD"
  | "TRANSPORT"
  | "SHOPPING"
  | "ENTERTAINMENT"
  | "HEALTH"
  | "UTILITIES"
  | "EDUCATION"
  | "OTHER";

interface Expense {
  id: string;
  amount: number;
  category: Category;
  paymentMethod: PayMethod;
  note?: string;
  date: string; // ISO
}

const CATEGORIES: {
  value: Category;
  label: string;
  emoji: string;
  color: string;
  glass: string;
}[] = [
  {
    value: "FOOD",
    label: "Food",
    emoji: "🍜",
    color: "#f59e0b",
    glass: "rgba(245,158,11,0.13)",
  },
  {
    value: "TRANSPORT",
    label: "Transport",
    emoji: "🚗",
    color: "#3b82f6",
    glass: "rgba(59,130,246,0.13)",
  },
  {
    value: "SHOPPING",
    label: "Shopping",
    emoji: "🛍️",
    color: "#a855f7",
    glass: "rgba(168,85,247,0.13)",
  },
  {
    value: "ENTERTAINMENT",
    label: "Entertainment",
    emoji: "🎬",
    color: "#ec4899",
    glass: "rgba(236,72,153,0.13)",
  },
  {
    value: "HEALTH",
    label: "Health",
    emoji: "💊",
    color: "#10b981",
    glass: "rgba(16,185,129,0.13)",
  },
  {
    value: "UTILITIES",
    label: "Utilities",
    emoji: "⚡",
    color: "#06b6d4",
    glass: "rgba(6,182,212,0.13)",
  },
  {
    value: "EDUCATION",
    label: "Education",
    emoji: "📚",
    color: "#f97316",
    glass: "rgba(249,115,22,0.13)",
  },
  {
    value: "OTHER",
    label: "Other",
    emoji: "📌",
    color: "#8b5cf6",
    glass: "rgba(139,92,246,0.13)",
  },
];

const PAY_METHODS: { value: PayMethod; label: string; emoji: string }[] = [
  { value: "CASH", label: "Cash", emoji: "💵" },
  { value: "UPI", label: "UPI", emoji: "📲" },
  { value: "CARD", label: "Card", emoji: "💳" },
  { value: "NET_BANKING", label: "Net Banking", emoji: "🏦" },
  { value: "OTHER", label: "Other", emoji: "🔄" },
];

const catMeta = (c: Category) => CATEGORIES.find((x) => x.value === c)!;
const payMeta = (p: PayMethod) => PAY_METHODS.find((x) => x.value === p)!;

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useMockExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 320,
      category: "FOOD",
      paymentMethod: "UPI",
      note: "Swiggy lunch",
      date: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: "2",
      amount: 1200,
      category: "SHOPPING",
      paymentMethod: "CARD",
      note: "Amazon order",
      date: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "3",
      amount: 80,
      category: "TRANSPORT",
      paymentMethod: "CASH",
      note: "Auto rickshaw",
      date: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "4",
      amount: 499,
      category: "ENTERTAINMENT",
      paymentMethod: "UPI",
      note: "Netflix monthly",
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "5",
      amount: 250,
      category: "HEALTH",
      paymentMethod: "CASH",
      note: "Pharmacy",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "6",
      amount: 850,
      category: "UTILITIES",
      paymentMethod: "NET_BANKING",
      note: "Electricity bill",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "7",
      amount: 180,
      category: "FOOD",
      paymentMethod: "UPI",
      note: "Zomato dinner",
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "8",
      amount: 2500,
      category: "EDUCATION",
      paymentMethod: "CARD",
      note: "Udemy course",
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ]);

  const addExpense = (e: Omit<Expense, "id">) => {
    setExpenses((prev) => [{ ...e, id: String(Date.now()) }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return { expenses, addExpense, deleteExpense };
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────
function CategoryBar({ expenses }: { expenses: Expense[] }) {
  const totals = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return CATEGORIES.map((c) => ({ ...c, total: map[c.value] ?? 0 }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const max = totals[0]?.total ?? 1;

  return (
    <div className="space-y-2.5">
      {totals.map((c) => (
        <div key={c.value}>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs exp-label">
              <span>{c.emoji}</span> {c.label}
            </span>
            <span
              className="text-xs font-bold exp-value tabular-nums"
              style={{ color: c.color }}
            >
              {formatINR(c.total)}
            </span>
          </div>
          <div className="exp-bar-track h-1.5 w-full rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(c.total / max) * 100}%`,
                background: c.color,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      ))}
      {totals.length === 0 && (
        <p className="exp-muted text-xs text-center py-4">
          No expenses yet this month
        </p>
      )}
    </div>
  );
}

function DonutChart({ expenses }: { expenses: Expense[] }) {
  const totals = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return CATEGORIES.map((c) => ({ ...c, total: map[c.value] ?? 0 })).filter(
      (c) => c.total > 0,
    );
  }, [expenses]);

  const grand = totals.reduce((s, c) => s + c.total, 0);
  if (!grand)
    return <p className="exp-muted text-xs text-center py-8">No data</p>;

  const R = 52,
    cx = 64,
    cy = 64,
    stroke = 18;
  const circumference = 2 * Math.PI * R;
  let cumulative = 0;

  const slices = totals.map((c) => {
    const pct = c.total / grand;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { ...c, dash, gap, offset };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {slices.map((s) => (
            <circle
              key={s.value}
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="var(--exp-heading)"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sora), sans-serif"
          >
            {formatINR(grand).replace("₹", "₹")}
          </text>
          <text
            x={cx}
            y={cy + 9}
            textAnchor="middle"
            fill="var(--exp-muted)"
            fontSize="7.5"
          >
            total
          </text>
        </svg>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
        {totals.slice(0, 6).map((c) => (
          <div key={c.value} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: c.color }}
            />
            <span className="exp-label text-[10px] truncate">{c.label}</span>
            <span className="exp-label text-[10px] ml-auto opacity-70">
              {Math.round((c.total / grand) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddExpenseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: Omit<Expense, "id">) => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("FOOD");
  const [method, setMethod] = useState<PayMethod>("UPI");
  const [note, setNote] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onAdd({
      amount: n,
      category,
      paymentMethod: method,
      note: note.trim() || undefined,
      date: new Date().toISOString(),
    });
    onClose();
  };

  // Close on backdrop click
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className="exp-modal w-full max-w-md animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="exp-heading text-lg font-bold"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              Log Expense
            </h2>
            <p className="exp-muted text-xs mt-0.5">Add a new transaction</p>
          </div>
          <button
            onClick={onClose}
            className="exp-close-btn flex h-8 w-8 items-center justify-center rounded-xl transition-all"
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="exp-field-label mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Amount (₹)
            </label>
            <div
              className={`exp-amount-wrap relative ${shake ? "animate-shake" : ""}`}
            >
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: "var(--exp-accent)" }}
              >
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="exp-input w-full pl-8 pr-4 py-3 text-lg font-bold tabular-nums"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
                autoFocus
              />
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label className="exp-field-label mb-2 block text-[10px] font-semibold uppercase tracking-widest">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`exp-cat-btn flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all ${category === c.value ? "exp-cat-active" : ""}`}
                  style={
                    category === c.value
                      ? ({
                          "--cat-color": c.color,
                          background: c.glass,
                          borderColor: `${c.color}60`,
                        } as React.CSSProperties)
                      : {}
                  }
                >
                  <span className="text-xl leading-none">{c.emoji}</span>
                  <span
                    className="text-[9px] font-semibold leading-none"
                    style={category === c.value ? { color: c.color } : {}}
                  >
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="exp-field-label mb-2 block text-[10px] font-semibold uppercase tracking-widest">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-2">
              {PAY_METHODS.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setMethod(p.value)}
                  className={`exp-method-btn flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${method === p.value ? "exp-method-active" : ""}`}
                >
                  <span>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="exp-field-label mb-1.5 block text-[10px] font-semibold uppercase tracking-widest">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for?"
              className="exp-input w-full px-4 py-2.5 text-sm"
              maxLength={80}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="exp-submit-btn w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}

function TxnRow({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: (id: string) => void;
}) {
  const cat = catMeta(expense.category);
  const pay = payMeta(expense.paymentMethod);
  const [confirming, setConfirming] = useState(false);

  const relTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className="txn-row group flex items-center gap-3 rounded-2xl p-3.5 transition-all"
      style={{ "--txn-color": cat.color } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        className="txn-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ background: cat.glass }}
      >
        {cat.emoji}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="exp-heading text-sm font-semibold truncate">
            {expense.note || cat.label}
          </p>
          <span
            className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: cat.glass, color: cat.color }}
          >
            {pay.emoji} {pay.label}
          </span>
        </div>
        <p className="exp-muted text-[11px] mt-0.5">
          {cat.label} · {relTime(expense.date)}
        </p>
      </div>

      {/* Amount */}
      <p
        className="shrink-0 text-sm font-bold tabular-nums"
        style={{ color: cat.color, fontFamily: "var(--font-sora), sans-serif" }}
      >
        {formatINR(expense.amount)}
      </p>

      {/* Delete */}
      {confirming ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onDelete(expense.id)}
            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 transition-all"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg px-2.5 py-1 text-[10px] exp-muted exp-cat-btn transition-all"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-xl transition-all exp-delete-btn"
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useMockExpenses();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Category | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Summary
  const monthTotal = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  );
  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return expenses
      .filter((e) => new Date(e.date).toDateString() === today)
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);
  const txnCount = expenses.length;
  const avgPerDay = useMemo(() => {
    const days = now.getDate();
    return days > 0 ? Math.round(monthTotal / days) : 0;
  }, [monthTotal]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const catOk = filter === "ALL" || e.category === filter;
      const searchOk =
        !search ||
        e.note?.toLowerCase().includes(search.toLowerCase()) ||
        catMeta(e.category).label.toLowerCase().includes(search.toLowerCase());
      return catOk && searchOk;
    });
  }, [expenses, filter, search]);

  const monthName = now.toLocaleString("en-IN", { month: "long" });

  return (
    <>
      <style>{`
        /* ════ CSS VARIABLE TOKENS ════ */
        :root {
          --exp-bg-from:       #f0f4ff;
          --exp-bg-to:         #faf5ff;
          --exp-glass:         rgba(255,255,255,0.72);
          --exp-glass-border:  rgba(255,255,255,0.90);
          --exp-glass-shadow:  0 8px 32px rgba(80,60,180,0.10), 0 1.5px 6px rgba(0,0,0,0.06);
          --exp-glass-2:       rgba(255,255,255,0.55);
          --exp-glass-2-border:rgba(255,255,255,0.75);
          --exp-heading:       oklch(0.18 0.02 255);
          --exp-subtext:       oklch(0.38 0.015 255);
          --exp-muted:         oklch(0.54 0.010 255);
          --exp-accent:        #d97706;
          --exp-input-bg:      rgba(255,255,255,0.65);
          --exp-input-border:  rgba(200,190,230,0.50);
          --exp-input-focus:   #d97706;
          --exp-input-text:    oklch(0.18 0.02 255);
          --exp-placeholder:   oklch(0.62 0.01 255);
          --exp-btn-bg:        #d97706;
          --exp-btn-hover:     #b45309;
          --exp-btn-text:      #fff;
          --exp-bar-track:     rgba(0,0,0,0.07);
          --exp-row-hover:     rgba(255,255,255,0.55);
          --exp-delete:        rgba(239,68,68,0.12);
          --exp-close:         rgba(0,0,0,0.06);
          --exp-cat-border:    rgba(200,190,230,0.40);
        }

        .dark {
          --exp-bg-from:       #080d1a;
          --exp-bg-to:         #0d1525;
          --exp-glass:         rgba(18,26,50,0.72);
          --exp-glass-border:  rgba(255,255,255,0.08);
          --exp-glass-shadow:  0 8px 40px rgba(0,0,0,0.50), 0 1.5px 6px rgba(0,0,0,0.30);
          --exp-glass-2:       rgba(18,26,50,0.55);
          --exp-glass-2-border:rgba(255,255,255,0.07);
          --exp-heading:       #f0f4ff;
          --exp-subtext:       #8ba3c7;
          --exp-muted:         #4d6b8a;
          --exp-accent:        #f59e0b;
          --exp-input-bg:      rgba(255,255,255,0.04);
          --exp-input-border:  rgba(255,255,255,0.10);
          --exp-input-focus:   #f59e0b;
          --exp-input-text:    #f0f4ff;
          --exp-placeholder:   #4d6b8a;
          --exp-btn-bg:        #f59e0b;
          --exp-btn-hover:     #d97706;
          --exp-btn-text:      #0d1120;
          --exp-bar-track:     rgba(255,255,255,0.07);
          --exp-row-hover:     rgba(255,255,255,0.04);
          --exp-delete:        rgba(239,68,68,0.14);
          --exp-close:         rgba(255,255,255,0.07);
          --exp-cat-border:    rgba(255,255,255,0.10);
        }

        /* ════ PAGE ROOT ════ */
        .exp-root {
          min-height: 100vh;
          background: linear-gradient(145deg, var(--exp-bg-from) 0%, var(--exp-bg-to) 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Mesh gradient blobs */
        .exp-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: blob-drift 10s ease-in-out infinite alternate;
        }
        @keyframes blob-drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(30px,-25px) scale(1.06); }
        }
        .exp-blob:nth-child(2) { animation-delay: -5s; }
        .exp-blob:nth-child(3) { animation-delay: -3s; }

        /* Grid overlay */
        .exp-grid-overlay {
          background-image:
            linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        /* ════ GLASS PANELS ════ */
        .glass-panel {
          background: var(--exp-glass);
          border: 1px solid var(--exp-glass-border);
          box-shadow: var(--exp-glass-shadow);
          border-radius: 1.35rem;
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
        }
        .glass-panel-2 {
          background: var(--exp-glass-2);
          border: 1px solid var(--exp-glass-2-border);
          border-radius: 1.15rem;
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
        }

        /* ════ SUMMARY CARDS ════ */
        .summary-card {
          background: var(--exp-glass);
          border: 1px solid var(--exp-glass-border);
          border-radius: 1.25rem;
          backdrop-filter: blur(24px) saturate(175%);
          -webkit-backdrop-filter: blur(24px) saturate(175%);
          box-shadow: var(--exp-glass-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
        }

        /* ════ INPUTS ════ */
        .exp-input {
          background: var(--exp-input-bg);
          border: 1.5px solid var(--exp-input-border);
          border-radius: 0.875rem;
          color: var(--exp-input-text);
          font-family: var(--font-dm), system-ui, sans-serif;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .exp-input::placeholder { color: var(--exp-placeholder); }
        .exp-input:focus {
          border-color: var(--exp-input-focus);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--exp-input-focus) 18%, transparent);
        }
        .exp-amount-wrap .exp-input { font-size: 1.5rem; }

        /* ════ CATEGORY BUTTONS ════ */
        .exp-cat-btn {
          background: var(--exp-glass-2);
          border: 1px solid var(--exp-cat-border);
          color: var(--exp-subtext);
          transition: all 0.16s;
        }
        .exp-cat-btn:hover { background: var(--exp-row-hover); }
        .exp-cat-active {
          border-color: var(--cat-color, #f59e0b) !important;
        }

        /* ════ METHOD BUTTONS ════ */
        .exp-method-btn {
          background: var(--exp-glass-2);
          border: 1px solid var(--exp-cat-border);
          color: var(--exp-subtext);
          transition: all 0.16s;
        }
        .exp-method-btn:hover { background: var(--exp-row-hover); }
        .exp-method-active {
          background: color-mix(in srgb, var(--exp-accent) 15%, transparent) !important;
          border-color: color-mix(in srgb, var(--exp-accent) 45%, transparent) !important;
          color: var(--exp-accent) !important;
        }

        /* ════ SUBMIT BUTTON ════ */
        .exp-submit-btn {
          background: var(--exp-btn-bg);
          color: var(--exp-btn-text);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--exp-btn-bg) 35%, transparent);
        }
        .exp-submit-btn:hover { background: var(--exp-btn-hover); }

        /* ════ MODAL ════ */
        .exp-modal {
          background: var(--exp-glass);
          border: 1px solid var(--exp-glass-border);
          border-radius: 1.5rem;
          backdrop-filter: blur(36px) saturate(200%);
          -webkit-backdrop-filter: blur(36px) saturate(200%);
          box-shadow: 0 24px 80px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.12);
          padding: 1.75rem;
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        /* ════ CLOSE / DELETE BUTTONS ════ */
        .exp-close-btn {
          background: var(--exp-close);
          color: var(--exp-muted);
          transition: all 0.15s;
        }
        .exp-close-btn:hover { color: var(--exp-heading); background: var(--exp-row-hover); }
        .exp-delete-btn {
          background: var(--exp-delete);
          color: #f87171;
        }
        .exp-delete-btn:hover { background: rgba(239,68,68,0.22); }

        /* ════ TRANSACTION ROW ════ */
        .txn-row {
          transition: background 0.18s, transform 0.18s;
        }
        .txn-row:hover {
          background: var(--exp-row-hover);
          transform: translateX(2px);
        }

        /* ════ FILTER TABS ════ */
        .filter-tab {
          background: transparent;
          border: 1px solid transparent;
          color: var(--exp-muted);
          border-radius: 0.875rem;
          padding: 0.35rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-tab:hover { color: var(--exp-subtext); background: var(--exp-glass-2); }
        .filter-tab-active {
          background: color-mix(in srgb, var(--exp-accent) 15%, transparent) !important;
          border-color: color-mix(in srgb, var(--exp-accent) 40%, transparent) !important;
          color: var(--exp-accent) !important;
        }

        /* ════ FAB ════ */
        .exp-fab {
          background: var(--exp-btn-bg);
          color: var(--exp-btn-text);
          box-shadow: 0 6px 24px color-mix(in srgb, var(--exp-btn-bg) 40%, transparent),
                      0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .exp-fab:hover {
          background: var(--exp-btn-hover);
          transform: scale(1.06) translateY(-1px);
          box-shadow: 0 10px 32px color-mix(in srgb, var(--exp-btn-bg) 50%, transparent);
        }
        .exp-fab:active { transform: scale(0.97); }

        /* ════ BAR TRACK ════ */
        .exp-bar-track { background: var(--exp-bar-track); }

        /* ════ COLOURS ════ */
        .exp-heading { color: var(--exp-heading); }
        .exp-subtext  { color: var(--exp-subtext); }
        .exp-muted    { color: var(--exp-muted); }
        .exp-label    { color: var(--exp-subtext); }
        .exp-value    { color: var(--exp-heading); }
        .exp-field-label { color: var(--exp-muted); }

        /* ════ SLIDE-UP ════ */
        @keyframes exp-slide-up {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .exp-animate { opacity:0; animation: exp-slide-up 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }

        /* ════ SHAKE ════ */
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .animate-shake { animation: shake 0.45s ease; }

        /* ════ EMPTY STATE ════ */
        @keyframes empty-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .empty-bounce { animation: empty-bounce 2s ease-in-out infinite; }

        /* ════ SCROLLBAR ════ */
        .exp-scroll::-webkit-scrollbar { width: 4px; }
        .exp-scroll::-webkit-scrollbar-track { background: transparent; }
        .exp-scroll::-webkit-scrollbar-thumb { background: var(--exp-glass-border); border-radius: 4px; }
      `}</style>

      <div className="exp-root">
        {/* ── Background blobs ── */}
        <div
          className="exp-blob"
          style={{
            width: "600px",
            height: "600px",
            background: "rgba(245,158,11,0.07)",
            top: "-150px",
            right: "-150px",
          }}
        />
        <div
          className="exp-blob"
          style={{
            width: "450px",
            height: "450px",
            background: "rgba(16,185,129,0.05)",
            bottom: "-100px",
            left: "-120px",
          }}
        />
        <div
          className="exp-blob"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(168,85,247,0.04)",
            top: "40%",
            left: "30%",
          }}
        />

        {/* Grid overlay */}
        <div className="pointer-events-none fixed inset-0 exp-grid-overlay opacity-60" />

        {/* Navbar spacer */}
        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8">
          {/* ══ PAGE HEADER ══════════════════════════════════════════════ */}
          <div
            className="exp-animate mb-8 flex items-start justify-between gap-4"
            style={{ animationDelay: "40ms" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💸</span>
                <p className="exp-muted text-xs uppercase tracking-widest font-semibold">
                  {monthName} {year}
                </p>
              </div>
              <h1
                className="exp-heading text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Expense Tracker
              </h1>
              <p className="exp-subtext mt-1.5 text-sm max-w-md">
                Every rupee tracked. Stay on top of your spending with real-time
                insights.
              </p>
            </div>

            {/* Desktop add button */}
            <button
              onClick={() => setShowModal(true)}
              className="exp-fab hidden sm:flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold shrink-0"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
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
              Log Expense
            </button>
          </div>

          {/* ══ SUMMARY CARDS ROW ════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
            {[
              {
                label: "Month Total",
                value: formatINR(monthTotal),
                emoji: "📊",
                color: "#f59e0b",
                delay: 80,
              },
              {
                label: "Today",
                value: formatINR(todayTotal),
                emoji: "🗓️",
                color: "#10b981",
                delay: 130,
              },
              {
                label: "Transactions",
                value: txnCount,
                emoji: "🔢",
                color: "#3b82f6",
                delay: 180,
              },
              {
                label: "Daily Avg",
                value: formatINR(avgPerDay),
                emoji: "📈",
                color: "#a855f7",
                delay: 230,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="summary-card exp-animate p-4"
                style={{ animationDelay: `${s.delay}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{s.emoji}</span>
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: s.color }}
                  />
                </div>
                <p
                  className="text-lg font-bold tabular-nums exp-heading"
                  style={{
                    color: s.color,
                    fontFamily: "var(--font-sora), sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p className="exp-muted text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ══ MAIN GRID ══════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            {/* Left — transactions */}
            <div className="space-y-4">
              {/* Search + filter */}
              <div
                className="glass-panel exp-animate p-4"
                style={{ animationDelay: "270ms" }}
              >
                {/* Search */}
                <div className="relative mb-3">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 exp-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search transactions…"
                    className="exp-input w-full pl-10 pr-4 py-2.5 text-sm"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 exp-scroll">
                  <button
                    onClick={() => setFilter("ALL")}
                    className={`filter-tab ${filter === "ALL" ? "filter-tab-active" : ""}`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        setFilter(filter === c.value ? "ALL" : c.value)
                      }
                      className={`filter-tab ${filter === c.value ? "filter-tab-active" : ""}`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction list */}
              <div
                className="glass-panel exp-animate"
                style={{ animationDelay: "310ms" }}
              >
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <h2
                    className="exp-heading text-sm font-bold"
                    style={{ fontFamily: "var(--font-sora), sans-serif" }}
                  >
                    Transactions
                  </h2>
                  <span className="exp-muted text-xs">
                    {filtered.length} entries
                  </span>
                </div>

                <div className="px-3 pb-3 space-y-1 max-h-[520px] overflow-y-auto exp-scroll">
                  {filtered.length > 0 ? (
                    filtered.map((e) => (
                      <TxnRow key={e.id} expense={e} onDelete={deleteExpense} />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="empty-bounce text-4xl mb-3">🌵</div>
                      <p className="exp-subtext text-sm font-semibold">
                        No transactions found
                      </p>
                      <p className="exp-muted text-xs mt-1">
                        Try a different filter or add your first expense
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — charts + breakdown */}
            <div className="space-y-4">
              {/* Donut chart */}
              <div
                className="glass-panel exp-animate p-5"
                style={{ animationDelay: "350ms" }}
              >
                <h2
                  className="exp-heading text-sm font-bold mb-4"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  Spending by Category
                </h2>
                <DonutChart expenses={expenses} />
              </div>

              {/* Bar breakdown */}
              <div
                className="glass-panel exp-animate p-5"
                style={{ animationDelay: "400ms" }}
              >
                <h2
                  className="exp-heading text-sm font-bold mb-4"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  Category Breakdown
                </h2>
                <CategoryBar expenses={expenses} />
              </div>

              {/* Payment method summary */}
              <div
                className="glass-panel exp-animate p-5"
                style={{ animationDelay: "450ms" }}
              >
                <h2
                  className="exp-heading text-sm font-bold mb-4"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  Payment Methods
                </h2>
                <div className="space-y-2">
                  {PAY_METHODS.map((p) => {
                    const total = expenses
                      .filter((e) => e.paymentMethod === p.value)
                      .reduce((s, e) => s + e.amount, 0);
                    if (!total) return null;
                    const pct = (total / (monthTotal || 1)) * 100;
                    return (
                      <div key={p.value} className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">
                          {p.emoji}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="exp-label text-xs">{p.label}</span>
                            <span className="exp-value text-xs font-bold tabular-nums">
                              {formatINR(total)}
                            </span>
                          </div>
                          <div className="exp-bar-track h-1.5 w-full rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: "var(--exp-accent)",
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile FAB ── */}
        <button
          onClick={() => setShowModal(true)}
          className="exp-fab fixed bottom-6 right-6 z-40 flex sm:hidden h-14 w-14 items-center justify-center rounded-full"
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

        {/* ── Add Expense Modal ── */}
        {showModal && (
          <AddExpenseModal
            onClose={() => setShowModal(false)}
            onAdd={addExpense}
          />
        )}
      </div>
    </>
  );
}
