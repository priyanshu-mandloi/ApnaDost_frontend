"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { FC } from "react";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import NotificationBell from "@/components/NotificationBell";
import { removeToken } from "@/lib/apiRequest";
import { useAuth } from "@/context/AuthContext";

type NavItem = { href: string; label: string; emoji: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/tasks", label: "Tasks", emoji: "📋" },
  { href: "/expenses", label: "Expenses", emoji: "💸" },
  { href: "/passwords", label: "Passwords", emoji: "🔐" },
  { href: "/files", label: "Files", emoji: "📁" },
];

const Navbar: FC = () => {
  const { currentUser, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = !!currentUser;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    updateUser(null);
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        /* ════ TOKENS ════ */
        :root {
          --nav-glass-scrolled:    rgba(255,255,255,0.82);
          --nav-glass-border:      rgba(200,190,230,0.30);
          --nav-glass-shadow:      0 4px 24px rgba(80,60,180,0.08), 0 1px 4px rgba(0,0,0,0.05);
          --nav-text:              oklch(0.18 0.02 255);
          --nav-muted:             oklch(0.55 0.010 255);
          --nav-active-bg:         rgba(217,119,6,0.10);
          --nav-active-color:      #d97706;
          --nav-hover-bg:          rgba(0,0,0,0.04);
          --nav-mobile-bg:         rgba(255,255,255,0.97);
          --nav-mobile-border:     rgba(200,190,230,0.28);
          --nav-btn-border:        rgba(200,190,230,0.40);
          --nav-btn-bg:            transparent;
          --nav-btn-color:         oklch(0.48 0.01 255);
          --nav-btn-danger-hover:  rgba(239,68,68,0.08);
          --nav-menu-bg:           rgba(0,0,0,0.05);
          --nav-menu-border:       rgba(0,0,0,0.10);
          --nav-menu-color:        oklch(0.48 0.01 255);
          --nav-indicator:         #d97706;
          --nav-logo-ring:         rgba(217,119,6,0.30);
          --nav-logo-from:         rgba(217,119,6,0.18);
          --nav-logo-to:           rgba(180,83,9,0.08);
          --nav-brand:             oklch(0.18 0.02 255);
          --nav-brand-sub:         oklch(0.55 0.010 255);
          --nav-divider:           rgba(200,190,230,0.28);
        }
        .dark {
          --nav-glass-scrolled:    rgba(6,14,26,0.84);
          --nav-glass-border:      rgba(255,255,255,0.06);
          --nav-glass-shadow:      0 4px 24px rgba(0,0,0,0.38), 0 1px 4px rgba(0,0,0,0.28);
          --nav-text:              #f0f4ff;
          --nav-muted:             #4d6b8a;
          --nav-active-bg:         rgba(245,158,11,0.10);
          --nav-active-color:      #f59e0b;
          --nav-hover-bg:          rgba(255,255,255,0.05);
          --nav-mobile-bg:         rgba(6,14,26,0.98);
          --nav-mobile-border:     rgba(255,255,255,0.06);
          --nav-btn-border:        rgba(255,255,255,0.09);
          --nav-btn-bg:            rgba(255,255,255,0.04);
          --nav-btn-color:         #8ba3c7;
          --nav-btn-danger-hover:  rgba(239,68,68,0.10);
          --nav-menu-bg:           rgba(255,255,255,0.05);
          --nav-menu-border:       rgba(255,255,255,0.10);
          --nav-menu-color:        #8ba3c7;
          --nav-indicator:         #f59e0b;
          --nav-logo-ring:         rgba(245,158,11,0.28);
          --nav-logo-from:         rgba(245,158,11,0.18);
          --nav-logo-to:           rgba(217,119,6,0.08);
          --nav-brand:             #f0f4ff;
          --nav-brand-sub:         #4d6b8a;
          --nav-divider:           rgba(255,255,255,0.07);
        }

        /* scrolled glass */
        .nav-scrolled {
          background: var(--nav-glass-scrolled);
          border-bottom: 1px solid var(--nav-glass-border);
          box-shadow: var(--nav-glass-shadow);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        /* desktop nav link */
        .nav-link {
          position: relative; display: inline-flex; align-items: center;
          padding: 0.4rem 0.85rem; border-radius: 0.875rem;
          font-size: 0.8125rem; font-weight: 500;
          color: var(--nav-muted);
          transition: color 0.15s, background 0.15s;
          font-family: var(--font-dm), system-ui, sans-serif;
        }
        .nav-link:hover { color: var(--nav-text); background: var(--nav-hover-bg); }
        .nav-link-active { color: var(--nav-active-color) !important; background: var(--nav-active-bg) !important; }
        .nav-dot {
          position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
          width: 1rem; height: 2px; border-radius: 9999px;
          background: var(--nav-indicator);
        }

        /* ghost button (sign out / sign in) */
        .nav-ghost-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.875rem; border-radius: 0.875rem;
          border: 1px solid var(--nav-btn-border);
          background: var(--nav-btn-bg);
          color: var(--nav-btn-color);
          font-size: 0.75rem; font-weight: 500;
          transition: all 0.18s;
        }
        .nav-ghost-btn:hover {
          background: var(--nav-btn-danger-hover);
          border-color: rgba(239,68,68,0.30);
          color: #f87171;
        }
        /* sign-in ghost — no danger on hover */
        .nav-ghost-btn-neutral:hover {
          background: var(--nav-hover-bg) !important;
          border-color: var(--nav-btn-border) !important;
          color: var(--nav-text) !important;
        }

        /* primary CTA (Get Started) */
        .nav-cta-btn {
          display: inline-flex; align-items: center;
          padding: 0.4rem 1rem; border-radius: 0.875rem;
          font-size: 0.75rem; font-weight: 700;
          background: var(--nav-active-color); color: #fff;
          font-family: var(--font-sora), sans-serif;
          box-shadow: 0 3px 12px color-mix(in srgb, var(--nav-active-color) 28%, transparent);
          transition: opacity 0.15s;
        }
        .nav-cta-btn:hover { opacity: 0.86; }

        /* hamburger button — only appears on mobile (<md) */
.nav-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}
        .nav-menu-btn:hover { color: var(--nav-text); }

        /* mobile drawer */
        .nav-mobile-panel {
          background: var(--nav-mobile-bg);
          border-top: 1px solid var(--nav-mobile-border);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
        }
        .nav-mobile-wrap {
          overflow: hidden;
          transition: max-height 0.34s cubic-bezier(0.22,1,0.36,1), opacity 0.26s ease;
        }
        .nav-mobile-open  { max-height: 600px; opacity: 1; }
        .nav-mobile-close { max-height: 0;     opacity: 0; }

        /* mobile nav link */
        .nav-mobile-link {
          display: flex; align-items: center; gap: 0.875rem;
          border-radius: 0.875rem; padding: 0.75rem 1rem;
          font-size: 0.875rem; font-weight: 500;
          color: var(--nav-muted);
          transition: color 0.15s, background 0.15s;
          font-family: var(--font-dm), system-ui, sans-serif;
        }
        .nav-mobile-link:hover { color: var(--nav-text); background: var(--nav-hover-bg); }
        .nav-mobile-link-active {
          color: var(--nav-active-color) !important;
          background: var(--nav-active-bg) !important;
          font-weight: 600;
        }

        /* mobile divider */
        .nav-divider { background: var(--nav-divider); }

        /* brand colours */
        .nav-brand     { color: var(--nav-brand); }
        .nav-brand-sub { color: var(--nav-brand-sub); }
      `}</style>

      <header
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${scrolled ? "nav-scrolled" : "bg-transparent"}`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          {/* ── Logo / Brand ── */}
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="flex items-center gap-2.5"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--nav-logo-from), var(--nav-logo-to))",
                boxShadow: "0 0 0 1px var(--nav-logo-ring)",
              }}
            >
              😊
            </div>
            <div className="hidden sm:block">
              <p
                className="nav-brand text-sm font-bold leading-tight"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                ApnaDost
              </p>
              <p className="nav-brand-sub text-[10px] leading-tight">
                Personal Companion
              </p>
            </div>
          </Link>

          {isLoggedIn && (
            <ul className="hidden items-center gap-0.5 md:flex">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive(item.href) ? "nav-link-active" : ""}`}
                  >
                    {item.label}
                    {isActive(item.href) && <span className="nav-dot" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — always visible */}
            <ModeToggle />

            {/* ── LOGGED IN ── */}
            {isLoggedIn && (
              <>
                {/* Notification bell — always visible when logged in */}
                <NotificationBell />

                {/* Sign out — desktop only (hidden on mobile, shown in drawer) */}
                <button
                  onClick={handleLogout}
                  className="nav-ghost-btn hidden md:inline-flex"
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
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Sign out
                </button>

                <button
                  onClick={() => setIsOpen((p) => !p)}
                  className="nav-menu-btn md:!hidden"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  {isOpen ? <X size={17} /> : <Menu size={17} />}
                </button>
              </>
            )}

            {/* ── GUEST (not logged in) ── */}
            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="nav-ghost-btn nav-ghost-btn-neutral"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  Sign in
                </Link>
                <Link href="/register" className="nav-cta-btn">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
        {isLoggedIn && (
          <div
            className={`nav-mobile-wrap md:hidden ${isOpen ? "nav-mobile-open" : "nav-mobile-close"}`}
          >
            <div className="nav-mobile-panel px-5 pb-6 pt-3">
              {/* All nav links with emoji icons */}
              <ul className="flex flex-col gap-1 mb-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`nav-mobile-link ${isActive(item.href) ? "nav-mobile-link-active" : ""}`}
                    >
                      {/* Emoji icon bubble */}
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                        style={{
                          background: isActive(item.href)
                            ? "var(--nav-active-bg)"
                            : "var(--nav-hover-bg)",
                        }}
                      >
                        {item.emoji}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {/* Active indicator dot */}
                      {isActive(item.href) && (
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: "var(--nav-active-color)" }}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="nav-divider h-px mb-4" />

              {/* Bottom row: notification bell + sign out */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <span className="nav-brand-sub text-xs">Notifications</span>
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="nav-ghost-btn"
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
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
