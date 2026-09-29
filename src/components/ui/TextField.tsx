import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export function TextField({ label, error, hint, className, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        {...props}
        className={cn(
          "w-full rounded-md border bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30",
          "focus:outline-none focus:ring-2 focus:ring-jeopardy-gold",
          error ? "border-red-400" : "border-white/15",
          className,
        )}
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : hint ? <p className="text-xs text-white/40">{hint}</p> : null}
    </div>
  );
}
