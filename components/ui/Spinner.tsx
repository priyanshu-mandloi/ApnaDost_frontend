"use client";

import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn("rounded-full animate-spin-custom", sizes[size], className)}
      style={{
        border: "2px solid rgba(255,255,255,0.15)",
        borderTopColor: "#f59e0b",
      }}
    />
  );
}

export function PageSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ minHeight: "60vh" }}
    >
      <div className="relative">
        {/* Outer ring */}
        <div
          className="w-16 h-16 rounded-full animate-spin-custom"
          style={{
            border: "3px solid rgba(255,255,255,0.05)",
            borderTopColor: "#f59e0b",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            border: "2px solid rgba(255,255,255,0.05)",
            borderBottomColor: "rgba(251,191,36,0.5)",
            animation: "spin 0.8s linear infinite reverse",
          }}
        />
      </div>
      <p
        className="text-sm font-dm animate-pulse-soft"
        style={{ color: "#4d6b8a" }}
      >
        Loading...
      </p>
    </div>
  );
}
