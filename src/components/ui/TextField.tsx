import { useId, type InputHTMLAttributes } from "react";
import { fieldClass } from "./fieldStyles";

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
      <input id={id} aria-invalid={!!error} {...props} className={fieldClass(!!error, className)} />
      {error ? <p className="text-xs text-red-300">{error}</p> : hint ? <p className="text-xs text-white/40">{hint}</p> : null}
    </div>
  );
}
