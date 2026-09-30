import { useId, type TextareaHTMLAttributes } from "react";
import { fieldClass } from "./fieldStyles";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
}

export function TextAreaField({ label, error, className, ...props }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <textarea id={id} rows={3} aria-invalid={!!error} {...props} className={fieldClass(!!error, className)} />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
