"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-semibold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985]";

  const variants = {
    primary:
      "border border-transparent bg-[var(--amber)] text-white shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 hover:bg-[var(--amber2)] hover:shadow-violet-500/30",
    ghost:
      "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:-translate-y-0.5 hover:border-[var(--border2)] hover:text-[var(--text)]",
    outline:
      "border border-[var(--amber)] bg-transparent text-[var(--amber)] hover:bg-[var(--amber-d)]",
    danger:
      "border border-rose-400/20 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-[12px]",
    md: "px-5 py-3 text-[13.5px]",
    lg: "px-6 py-3.5 text-[15px]",
  };

  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-200 hover:opacity-100" />
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : icon && iconPosition === "left" ? (
        <span className="relative z-10 flex-shrink-0">{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
      {!loading && icon && iconPosition === "right" ? (
        <span className="relative z-10 flex-shrink-0">{icon}</span>
      ) : null}
    </button>
  );
}
