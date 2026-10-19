import { useId, type SelectHTMLAttributes } from "react";
import { fieldClass } from "./fieldStyles";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly string[];
  /** Text shown per option value. Missing = the value itself. */
  optionLabels?: Readonly<Record<string, string>>;
  error?: string | null;
}

export function SelectField({ label, options, optionLabels, error, className, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <select id={id} aria-invalid={!!error} {...props} className={fieldClass(!!error, className)}>
        {options.map((o) => (
          <option key={o} value={o} className="text-black">
            {optionLabels?.[o] ?? o}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
