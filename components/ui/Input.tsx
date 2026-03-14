"use client";

import { cn } from "@/utils/cn";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-xs font-dm font-medium mb-1.5"
            style={{
              color: "#8ba3c7",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#4d6b8a" }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            style={{
              background: "rgba(10, 22, 40, 0.8)",
              color: "#f0f4ff",
              borderColor: error
                ? "rgba(244,63,94,0.5)"
                : focused
                  ? "rgba(245,158,11,0.5)"
                  : "rgba(255,255,255,0.08)",
              boxShadow: error
                ? "0 0 0 3px rgba(244,63,94,0.1)"
                : focused
                  ? "0 0 0 3px rgba(245,158,11,0.1)"
                  : "none",
            }}
            className={cn(
              "w-full py-3 text-sm font-dm outline-none transition-all duration-200 rounded-xl border",
              leftIcon ? "pl-10 pr-4" : "px-4",
              rightIcon ? "pr-11" : "",
              className,
            )}
          />

          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "#4d6b8a" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8ba3c7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4d6b8a")}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {error && (
          <p
            className="mt-1.5 text-xs font-dm flex items-center gap-1"
            style={{ color: "#fb7185" }}
          >
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs font-dm" style={{ color: "#4d6b8a" }}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
