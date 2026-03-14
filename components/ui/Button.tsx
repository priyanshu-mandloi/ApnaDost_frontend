"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-dm transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
  };

  // Variant styles — use inline style for complex gradients/shadows
  const variantClasses = {
    primary:
      "text-navy-950 font-semibold hover:-translate-y-0.5 active:translate-y-0",
    secondary:
      "bg-navy-700 border border-white/10 text-white hover:bg-navy-600 hover:border-white/20",
    ghost:
      "bg-transparent text-[#8ba3c7] hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10",
    danger: "border text-[#fb7185] hover:bg-[rgba(244,63,94,0.2)]",
    outline: "bg-transparent border text-saffron-400 hover:bg-saffron-500/10",
  };

  const variantInlineStyle: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
    },
    secondary: {},
    ghost: {},
    danger: {
      background: "rgba(244,63,94,0.1)",
      borderColor: "rgba(244,63,94,0.3)",
    },
    outline: {
      borderColor: "rgba(245,158,11,0.4)",
    },
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={variantInlineStyle[variant]}
      className={cn(
        base,
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {loading ? (
        <Loader2
          className="animate-spin-custom"
          size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
        />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
}
