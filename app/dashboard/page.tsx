"use client";

import * as THREE from "three";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  OrbitControls,
  Stars,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { expenseApi } from "@/lib/expenseApi";
import { fileApi } from "@/lib/fileApi";
import { passwordApi } from "@/lib/passwordApi";
import { taskApi } from "@/lib/taskApi";

// ─── Types ──────────────────────────────────────────────────────────────────
interface StatsState {
  taskPending: number;
  taskDone: number;
  taskUrgent: number;
  expenseMonth: string;
  expenseTxn: number;
  passwordCount: number | string;
  fileCount: number;
  fileStorage: string;
  loading: boolean;
}

function CompanionOrb({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.003;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
  });

  const primaryColor = isDark ? "#f59e0b" : "#d97706";
  const secondaryColor = isDark ? "#10b981" : "#059669";

  return (
    <>
      {isDark && (
        <Stars
          radius={80}
          depth={30}
          count={600}
          factor={2}
          saturation={0}
          fade
          speed={0.6}
        />
      )}

      <ambientLight intensity={isDark ? 0.3 : 0.8} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={isDark ? 1.2 : 1.5}
        color={primaryColor}
      />
      <directionalLight
        position={[-5, -3, -2]}
        intensity={0.4}
        color={secondaryColor}
      />
      <pointLight
        position={[0, 0, 3]}
        intensity={isDark ? 1.5 : 1.0}
        color={primaryColor}
        distance={8}
      />

      {/* Outer ring */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={ringRef} scale={[1.6, 1.6, 0.04]}>
          <torusGeometry args={[1, 0.04, 16, 80]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Inner secondary ring — tilted */}
      <Float speed={2.0} rotationIntensity={0.6} floatIntensity={0.4}>
        <mesh
          rotation={[Math.PI / 3, 0, Math.PI / 6]}
          scale={[1.25, 1.25, 0.04]}
        >
          <torusGeometry args={[1, 0.025, 12, 60]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>

      {/* Main orb — icosahedron with distortion */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.85, 4]} />
          <MeshDistortMaterial
            color={isDark ? "#1a2540" : "#e8f0fe"}
            emissive={primaryColor}
            emissiveIntensity={isDark ? 0.15 : 0.08}
            distort={0.25}
            speed={1.8}
            roughness={0.1}
            metalness={0.9}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Small orbiting sphere */}
      <OrbitingSphere
        color={secondaryColor}
        radius={1.4}
        speed={1.2}
        size={0.12}
      />
      <OrbitingSphere
        color={primaryColor}
        radius={1.7}
        speed={0.7}
        size={0.08}
        offset={Math.PI}
      />
    </>
  );
}

function OrbitingSphere({
  color,
  radius,
  speed,
  size,
  offset = 0,
}: {
  color: string;
  radius: number;
  speed: number;
  size: number;
  offset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.7) * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  accentVar,
  stats,
  badge,
  delay,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  accentVar: string; // CSS variable name, e.g. "--accent-amber"
  stats?: { label: string; value: string | number }[];
  badge?: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="group animate-slide-up block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="feature-card relative h-full overflow-hidden p-5 cursor-pointer"
        style={{
          minHeight: "180px",
          ["--card-accent" as string]: `var(${accentVar})`,
        }}
      >
        {/* Hover glow */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `var(${accentVar})`, opacity: 0 }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between">
          <div
            className="feature-icon flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-transform duration-300 group-hover:scale-110"
            style={{ fontSize: "1.35rem" }}
          >
            {icon}
          </div>
          {badge && (
            <span className="feature-badge rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider">
              {badge}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="mt-3.5">
          <h3
            className="feature-title text-sm font-bold tracking-tight"
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            {title}
          </h3>
          <p className="feature-desc mt-1 text-xs leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="feature-stats mt-4 flex items-center gap-4 border-t pt-3">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="feature-stat-value text-sm font-bold tabular-nums"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="feature-stat-label mt-0.5 text-[10px]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Arrow */}
        <div className="feature-arrow absolute bottom-4 right-4 flex h-7 w-7 items-center justify-center rounded-full border opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="stat-pill flex items-center gap-2 rounded-2xl px-4 py-2">
      <span className="text-base">{icon}</span>
      <span
        className="stat-value text-sm font-bold tabular-nums"
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        {value}
      </span>
      <span className="stat-label text-xs">{label}</span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState("--:-- --");
  const [date, setDate] = useState("Loading…");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clock-card hidden sm:block rounded-2xl px-5 py-3 text-right">
      <p
        className="clock-time text-2xl font-bold tabular-nums"
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        {time}
      </p>
      <p className="clock-date mt-0.5 text-[11px]">{date}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: "Late night grind", emoji: "🌙" };
  if (h < 12) return { text: "Good morning", emoji: "🌅" };
  if (h < 17) return { text: "Good afternoon", emoji: "☀️" };
  if (h < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

export default function DashboardPage() {
  const greeting = getGreeting();

  // Detect dark mode
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const [stats, setStats] = useState<StatsState>({
    taskPending: 0,
    taskDone: 0,
    taskUrgent: 0,
    expenseMonth: "₹0",
    expenseTxn: 0,
    passwordCount: "—",
    fileCount: 0,
    fileStorage: "0 B",
    loading: true,
  });

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    Promise.allSettled([
      taskApi.getToday(),
      expenseApi.getMonthlySummary(month, year),
      passwordApi.getCount(),
      fileApi.getStats(),
    ]).then(([tasks, expenses, passwords, files]) => {
      setStats((prev) => ({
        ...prev,
        ...(tasks.status === "fulfilled"
          ? {
              taskPending: tasks.value.filter((x) => x.status === "PENDING")
                .length,
              taskDone: tasks.value.filter((x) => x.status === "COMPLETED")
                .length,
              taskUrgent: tasks.value.filter(
                (x) => x.priority === 3 && x.status !== "COMPLETED",
              ).length,
            }
          : {}),
        ...(expenses.status === "fulfilled"
          ? {
              expenseMonth: expenses.value.totalFormatted ?? "₹0",
              expenseTxn: expenses.value.totalTransactions ?? 0,
            }
          : {}),
        ...(passwords.status === "fulfilled"
          ? { passwordCount: passwords.value }
          : {}),
        ...(files.status === "fulfilled"
          ? {
              fileCount: files.value.totalFiles,
              fileStorage: files.value.totalFormatted,
            }
          : {}),
        loading: false,
      }));
    });
  }, []);

  const features = [
    {
      href: "/tasks",
      icon: "📋",
      title: "Task Planner",
      description:
        "Daily tasks with priorities, time-based reminders & AI motivational nudges.",
      accentVar: "--accent-amber",
      badge: stats.taskUrgent ? `${stats.taskUrgent} urgent` : undefined,
      stats: stats.loading
        ? undefined
        : [
            { label: "pending", value: stats.taskPending },
            { label: "done today", value: stats.taskDone },
          ],
      delay: 80,
    },
    {
      href: "/expenses",
      icon: "💸",
      title: "Expense Tracker",
      description:
        "Track every rupee in ₹. Filter by category, payment method & monthly summaries.",
      accentVar: "--accent-emerald",
      stats: stats.loading
        ? undefined
        : [
            { label: "this month", value: stats.expenseMonth },
            { label: "transactions", value: stats.expenseTxn },
          ],
      delay: 150,
    },
    {
      href: "/passwords",
      icon: "🔐",
      title: "Password Vault",
      description:
        "AES-256 GCM encrypted credentials. Reveal only on demand, zero-knowledge design.",
      accentVar: "--accent-rose",
      badge: "AES-256",
      stats: stats.loading
        ? undefined
        : [{ label: "saved", value: stats.passwordCount }],
      delay: 220,
    },
    {
      href: "/files",
      icon: "📁",
      title: "File Storage",
      description:
        "Upload PDFs, images, videos & docs. Organized, fast, accessible from anywhere.",
      accentVar: "--accent-blue",
      stats: stats.loading
        ? undefined
        : [
            { label: "files", value: stats.fileCount },
            { label: "used", value: stats.fileStorage },
          ],
      delay: 290,
    },
    {
      href: "/files",
      icon: "🤖",
      title: "PDF Chat (AI)",
      description:
        "Upload any PDF and have a real conversation with it. Powered by Groq — blazing fast.",
      accentVar: "--accent-purple",
      badge: "Groq AI",
      delay: 360,
    },
    {
      href: "/tasks",
      icon: "🔔",
      title: "Smart Alerts",
      description:
        "Push notifications for tasks, 8 AM morning briefings & 9 PM nightly reviews.",
      accentVar: "--accent-orange",
      badge: "Live",
      delay: 430,
    },
  ];

  const quickActions = [
    { label: "➕ New Task", href: "/tasks" },
    { label: "💸 Log Expense", href: "/expenses" },
    { label: "🔐 Save Password", href: "/passwords" },
    { label: "📤 Upload File", href: "/files" },
  ];

  return (
    <>
      {/* Scoped CSS for dual-theme cards/components */}
      <style>{`
        /* ── Accent palette ── */
        :root {
          --accent-amber:   rgba(245,158,11,1);
          --accent-emerald: rgba(16,185,129,1);
          --accent-rose:    rgba(244,63,94,1);
          --accent-blue:    rgba(59,130,246,1);
          --accent-purple:  rgba(168,85,247,1);
          --accent-orange:  rgba(249,115,22,1);
        }

        /* ── Dashboard page background ── */
        .dash-root {
          background: var(--background);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Feature cards ── */
        .feature-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1.15rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--card-accent) 40%, transparent);
          box-shadow: 0 12px 40px color-mix(in srgb, var(--card-accent) 12%, transparent),
                      0 2px 8px rgba(0,0,0,0.12);
        }
        .dark .feature-card {
          background: rgba(20,28,50,0.7);
          border-color: rgba(255,255,255,0.07);
        }
        .dark .feature-card:hover { background: rgba(24,34,60,0.85); }

        .feature-icon {
          background: color-mix(in srgb, var(--card-accent) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--card-accent) 30%, transparent);
        }
        .feature-badge {
          background: color-mix(in srgb, var(--card-accent) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--card-accent) 35%, transparent);
          color: var(--card-accent);
        }
        .feature-title   { color: var(--foreground); }
        .feature-desc    { color: var(--muted-foreground); }
        .feature-stats   { border-color: var(--border); }
        .feature-stat-value { color: var(--card-accent); }
        .feature-stat-label { color: var(--muted-foreground); }
        .feature-arrow {
          background: color-mix(in srgb, var(--card-accent) 14%, transparent);
          border-color: color-mix(in srgb, var(--card-accent) 30%, transparent);
          color: var(--card-accent);
        }

        /* ── Stat pills ── */
        .stat-pill {
          background: var(--card);
          border: 1px solid var(--border);
          backdrop-filter: blur(12px);
          transition: background 0.2s;
        }
        .dark .stat-pill {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
        }
        .stat-value { color: var(--primary); }
        .stat-label { color: var(--muted-foreground); }

        /* ── Clock card ── */
        .clock-card {
          background: var(--card);
          border: 1px solid var(--border);
          backdrop-filter: blur(16px);
        }
        .dark .clock-card {
          background: rgba(20,28,50,0.7);
          border-color: rgba(255,255,255,0.07);
        }
        .clock-time { color: var(--foreground); }
        .clock-date { color: var(--muted-foreground); }

        /* ── Section heading ── */
        .dash-heading   { color: var(--foreground); }
        .dash-subtext   { color: var(--muted-foreground); }
        .dash-greeting  { color: var(--muted-foreground); }
        .section-label  { color: var(--muted-foreground); }

        /* ── Quick action pills ── */
        .quick-action {
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--muted-foreground);
          border-radius: 1rem;
          transition: all 0.18s;
          backdrop-filter: blur(12px);
        }
        .dark .quick-action {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.07);
        }
        .quick-action:hover {
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          border-color: color-mix(in srgb, var(--primary) 35%, transparent);
          color: var(--primary);
        }

        /* ── 3D canvas wrapper ── */
        .orb-canvas-wrap {
          position: relative;
          height: 260px;
          width: 100%;
          border-radius: 1.5rem;
          overflow: hidden;
          background: var(--card);
          border: 1px solid var(--border);
        }
        .dark .orb-canvas-wrap {
          background: rgba(10,14,28,0.85);
          border-color: rgba(255,255,255,0.06);
        }
        .orb-label {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted-foreground);
          pointer-events: none;
          opacity: 0.7;
        }

        /* ── Footer ── */
        .dash-footer-border { border-top: 1px solid var(--border); }
        .dash-footer-text   { color: var(--muted-foreground); }

        /* ── Grid bg overlay ── */
        .grid-overlay {
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.35;
        }
        .dark .grid-overlay { opacity: 0.07; }

        /* ── Slide-up animation ── */
        @keyframes dash-slide-up {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .animate-slide-up {
          opacity: 0;
          animation: dash-slide-up 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes dash-fade-in {
          from { opacity:0; } to { opacity:1; }
        }
        .animate-fade-in { animation: dash-fade-in 0.6s ease forwards; }

        /* ── About banner ── */
        .about-banner {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          backdrop-filter: blur(20px);
        }
        .dark .about-banner {
          background: rgba(20,28,50,0.65);
          border-color: rgba(255,255,255,0.07);
        }
        .about-banner-accent {
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--primary) 15%, transparent),
            color-mix(in srgb, #10b981 10%, transparent));
          border-radius: 1rem;
        }

        /* ── Pulse dot ── */
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
      `}</style>

      <div className="dash-root">
        {/* Grid overlay */}
        <div className="pointer-events-none fixed inset-0 grid-overlay" />

        {/* Decorative orbs */}
        <div
          className="pointer-events-none fixed"
          style={{
            width: "650px",
            height: "650px",
            background: isDark
              ? "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)",
            top: "-180px",
            right: "-180px",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
        <div
          className="pointer-events-none fixed"
          style={{
            width: "500px",
            height: "500px",
            background: isDark
              ? "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
            bottom: "-80px",
            left: "-120px",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />

        <div className="h-[64px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div
              className="animate-slide-up flex flex-col justify-center"
              style={{ animationDelay: "40ms" }}
            >
              <p className="dash-greeting text-sm">
                {greeting.emoji} {greeting.text}
              </p>
              <h1
                className="dash-heading mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-sora), sans-serif" }}
              >
                Your Dashboard
              </h1>
              <p className="dash-subtext mt-2 max-w-sm text-sm leading-relaxed">
                ApnaDost — one place for tasks, money, passwords & files. Your
                digital life, simplified.
              </p>

              {/* Live clock — mobile only here */}
              <div className="mt-4 sm:hidden">
                <LiveClock />
              </div>

              {/* Stat pills */}
              {!stats.loading && (
                <div
                  className="mt-6 flex flex-wrap gap-2 animate-fade-in"
                  style={{ animationDelay: "350ms" }}
                >
                  <StatPill
                    icon="📋"
                    value={stats.taskPending}
                    label="tasks pending"
                  />
                  <StatPill
                    icon="💸"
                    value={stats.expenseMonth}
                    label="spent this month"
                  />
                  <StatPill
                    icon="🔐"
                    value={stats.passwordCount}
                    label="passwords"
                  />
                  <StatPill
                    icon="📁"
                    value={stats.fileCount}
                    label="files stored"
                  />
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-6">
                <p className="section-label mb-2.5 text-[10px] uppercase tracking-[0.18em]">
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((a) => (
                    <Link
                      key={a.href + a.label}
                      href={a.href}
                      className="quick-action px-4 py-2 text-xs font-medium"
                      style={{ fontFamily: "var(--font-sora), sans-serif" }}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — 3D orb + clock */}
            <div
              className="flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: "120ms" }}
            >
              <div className="hidden sm:block">
                <LiveClock />
              </div>

              {/* 3D Canvas */}
              <div className="orb-canvas-wrap flex-1">
                <Canvas
                  camera={{ position: [0, 0, 4.5], fov: 42 }}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: "transparent" }}
                >
                  <CompanionOrb isDark={isDark} />
                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI * 0.65}
                    minPolarAngle={Math.PI * 0.35}
                  />
                </Canvas>
                <span
                  className="orb-label"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  companion orb · drag to explore
                </span>
              </div>
            </div>
          </div>

          <div
            className="about-banner mb-8 p-5 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="about-banner-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
                🌟
              </div>
              <div>
                <h2
                  className="dash-heading text-sm font-bold"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  What is ApnaDost?
                </h2>
                <p className="dash-subtext mt-0.5 text-xs leading-relaxed max-w-2xl">
                  <strong style={{ color: "var(--primary)" }}>ApnaDost</strong>{" "}
                  (अपना दोस्त — "Your Own Friend") is your unified personal
                  productivity hub built for the modern Indian lifestyle. Manage
                  tasks, track every rupee, protect credentials with
                  military-grade encryption, store any file, and chat with PDFs
                  using Groq AI — all from one beautifully crafted space. No
                  subscriptions for core features. Your data, your control.
                </p>
              </div>
              <div className="ml-auto hidden shrink-0 flex-col items-end gap-1 sm:flex">
                <div className="flex items-center gap-1.5">
                  <div className="pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="dash-subtext text-[11px]">
                    All systems live
                  </span>
                </div>
                <span className="dash-subtext text-[10px] opacity-60">
                  v2.0 · Groq AI enabled
                </span>
              </div>
            </div>
          </div>

          <p
            className="section-label mb-3 text-[10px] uppercase tracking-[0.18em] animate-slide-up"
            style={{ animationDelay: "250ms" }}
          >
            Features
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.href + f.title} {...f} />
            ))}
          </div>

          <div
            className="mt-12 dash-footer-border pt-6 flex items-center justify-between animate-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <p className="dash-footer-text text-xs">
              ApnaDost — Your personal companion
            </p>
            <div className="flex items-center gap-1.5">
              <div className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="dash-footer-text text-xs">
                All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
