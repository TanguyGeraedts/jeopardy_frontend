import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

// Gold is the one main action on a screen; everything else stays quiet.
const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold text-studio-night hover:brightness-110",
  secondary: "bg-white/[0.08] text-chalk hover:bg-white/[0.14]",
  ghost: "text-chalk/70 hover:text-chalk hover:bg-white/[0.08]",
  danger: "bg-buzzer-red text-white hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-2.5 py-1 text-xs",
};

/** Class names for anything that should look like a button (see LinkButton). */
export function buttonStyles({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button {...props} disabled={disabled || loading} className={buttonStyles({ variant, size, className })}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
