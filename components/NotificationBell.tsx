"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { type Notification, notificationApi } from "@/lib/taskApi";
import { playSoundForNotification } from "@/lib/soundManager";

const TYPE_ICON: Record<string, string> = {
  TASK_REMINDER: "⏰",
  TASK_OVERDUE: "❗",
  MOTIVATIONAL: "💪",
  EXPENSE_ALERT: "💸",
  SYSTEM: "🔔",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // ✅ Stable fetch function — useCallback prevents stale closures in interval
  const fetchData = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationApi.getLatest(),
        notificationApi.getUnreadCount(),
      ]);

      // Play sound only when a new notification arrives (skip on first load)
      if (prevCountRef.current !== 0 && count > prevCountRef.current) {
        const newest = notifs[0];
        if (newest) {
          playSoundForNotification(
            newest.type,
            newest.type === "TASK_REMINDER" ? 3 : undefined,
          );
        }
      }
      prevCountRef.current = count;

      // ✅ Wrap setState calls in startTransition to satisfy the ESLint rule
      // about calling setState synchronously inside effects
      startTransition(() => {
        setNotifications(notifs);
        setUnreadCount(count);
      });
    } catch {
      // Network errors silently ignored
    }
  }, []);

  // ✅ useEffect only sets up the subscription (interval) — not calling setState directly
  useEffect(() => {
    // Kick off first fetch
    fetchData();
    // Poll every 30s
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationApi.markRead(id);
    fetchData();
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    fetchData();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationApi.delete(id);
    fetchData();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-navy-800/40 text-[#8ba3c7] transition-all hover:border-saffron-500/30 hover:text-saffron-400"
        aria-label="Notifications"
      >
        {/* ✅ Fixed: h-5 w-5 — h-4.5 is not a valid Tailwind class */}
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
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-700 text-white animate-bounce-in"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 animate-scale-in">
          <div className="glass-card overflow-hidden shadow-glass-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-sora text-sm font-600 text-[#f0f4ff]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-[9px] font-700 text-rose-400">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-saffron-400 hover:text-saffron-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl">🔔</div>
                  <p className="mt-2 text-xs text-[#4d6b8a]">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-[10px] text-[#4d6b8a]">
                    Task reminders will appear here
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    className={`group flex gap-3 border-b border-white/5 px-4 py-3 transition-all hover:bg-navy-700/30 ${
                      !n.isRead
                        ? "cursor-pointer bg-saffron-500/5"
                        : "cursor-default"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-base">
                      {TYPE_ICON[n.type] ?? "🔔"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className={`truncate text-xs font-500 ${
                            !n.isRead ? "text-[#f0f4ff]" : "text-[#8ba3c7]"
                          }`}
                        >
                          {n.title}
                        </p>
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 text-[#4d6b8a] hover:text-rose-400 transition-all"
                          aria-label="Delete notification"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs text-[#4d6b8a]">
                        {n.message}
                      </p>

                      <p className="mt-1 text-[10px] text-[#4d6b8a]">
                        {formatDistanceToNow(parseISO(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    {!n.isRead && (
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-400 animate-pulse-soft" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/5 px-4 py-2.5 text-center">
                <p className="text-[10px] text-[#4d6b8a]">
                  Showing latest {notifications.length} · Auto-refreshes every
                  30s
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
