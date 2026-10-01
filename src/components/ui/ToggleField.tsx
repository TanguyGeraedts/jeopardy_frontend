import { useId } from "react";
import { cn } from "@/lib/cn";

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** An on/off switch with a label and optional explanation. */
export function ToggleField({ label, description, checked, onChange, disabled }: ToggleFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-white/80">
          {label}
        </label>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-jeopardy-gold disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-jeopardy-gold" : "bg-white/20",
        )}
      >
        <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5 bg-jeopardy-navy")} />
      </button>
    </div>
  );
}
