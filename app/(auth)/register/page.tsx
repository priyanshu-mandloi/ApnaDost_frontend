"use client";

import { authApi, saveToken } from "@/lib/apiRequest";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* ── Eye icons ── */
const EyeOff = () => (
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
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);
const EyeOn = () => (
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
);
const Spinner = () => (
  <svg className="animate-spin-custom h-4 w-4" fill="none" viewBox="0 0 24 24">
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
);

function decodeEmailFromToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? payload.email ?? "";
  } catch {
    return "";
  }
}

/* ── Password strength ── */
type Strength = { label: string; color: string; pct: string } | null;

function usePasswordStrength(pw: string): Strength {
  if (!pw) return null;
  if (pw.length < 6) return { label: "Weak", color: "#ef4444", pct: "33%" };
  if (pw.length < 10) return { label: "Fair", color: "#f59e0b", pct: "66%" };
  return { label: "Strong", color: "#10b981", pct: "100%" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { updateUser } = useAuth();
  const strength = usePasswordStrength(password);
  const passwordsMatch = !confirmPassword || confirmPassword === password;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { token } = await authApi.register(email, password);
      saveToken(token);
      updateUser({ email: decodeEmailFromToken(token) || email });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed. Try a different email.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-bg noise-overlay relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ fontFamily: "var(--font-dm), system-ui, sans-serif" }}
    >
      {/* Decorative orbs */}
      <div
        className="orb"
        style={{
          width: "500px",
          height: "500px",
          background: "var(--auth-orb-1)",
          top: "-100px",
          right: "-150px",
        }}
      />
      <div
        className="orb"
        style={{
          width: "350px",
          height: "350px",
          background: "var(--auth-orb-2)",
          bottom: "-60px",
          left: "-80px",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">
        {/* ── Brand ── */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center select-none">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: "var(--auth-logo-bg)",
              boxShadow: "0 0 0 1px var(--auth-logo-ring)",
            }}
          >
            <svg
              className="h-7 w-7"
              style={{ color: "var(--auth-btn-bg)" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              color: "var(--auth-heading)",
            }}
          >
            ApnaDost
          </h1>
          <p className="text-sm" style={{ color: "var(--auth-subtext)" }}>
            Your personal companion
          </p>
        </div>

        {/* ── Glass card ── */}
        <div className="glass-card p-8">
          {/* Header */}
          <div className="mb-6">
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                color: "var(--auth-heading)",
              }}
            >
              Create account
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--auth-subtext)" }}
            >
              Join ApnaDost and get started today
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--auth-label-color)" }}
              >
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--auth-label-color)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--auth-input-placeholder)" }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>

              {/* Password strength bar */}
              {strength && (
                <div className="mt-2.5 space-y-1">
                  <div
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: "var(--auth-input-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: strength.pct,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <p
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "var(--auth-subtext)" }}
                  >
                    Strength:{" "}
                    <span
                      className="font-medium"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="reg-confirm"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--auth-label-color)" }}
              >
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{
                  borderColor: confirmPassword
                    ? passwordsMatch
                      ? "rgba(16,185,129,0.5)"
                      : "rgba(239,68,68,0.5)"
                    : undefined,
                }}
              />
              {confirmPassword && !passwordsMatch && (
                <p
                  className="mt-1.5 flex items-center gap-1 text-xs"
                  style={{ color: "#f87171" }}
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords don&apos;t match
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p
                  className="mt-1.5 flex items-center gap-1 text-xs"
                  style={{ color: "#10b981" }}
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 7.293a1 1 0 00-1.414 0L9 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-1 w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                background: "var(--auth-btn-bg)",
                color: "var(--auth-btn-text)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--auth-btn-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--auth-btn-bg)")
              }
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider + sign in link */}
          <div className="mt-6 flex items-center gap-3">
            <span
              className="h-px flex-1"
              style={{ background: "var(--auth-input-border)" }}
            />
            <span className="text-xs" style={{ color: "var(--auth-subtext)" }}>
              or
            </span>
            <span
              className="h-px flex-1"
              style={{ background: "var(--auth-input-border)" }}
            />
          </div>

          <p
            className="mt-4 text-center text-sm"
            style={{ color: "var(--auth-subtext)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "var(--auth-link)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--auth-link-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--auth-link)")
              }
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p
          className="mt-5 text-center text-xs"
          style={{ color: "var(--auth-subtext)", opacity: 0.6 }}
        >
          By creating an account, you agree to our{" "}
          <span
            className="underline underline-offset-2 cursor-pointer"
            style={{ color: "var(--auth-link)" }}
          >
            Terms
          </span>{" "}
          &amp;{" "}
          <span
            className="underline underline-offset-2 cursor-pointer"
            style={{ color: "var(--auth-link)" }}
          >
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
