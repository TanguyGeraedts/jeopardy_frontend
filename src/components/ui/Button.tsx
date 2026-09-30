import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-jeopardy-gold text-jeopardy-navy hover:brightness-110",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "text-white/70 hover:text-white hover:bg-white/10",
  danger: "bg-red-500 text-white hover:bg-red-400",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-2.5 py-1 text-xs",
};

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
