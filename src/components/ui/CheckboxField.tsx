import { useId, type InputHTMLAttributes } from "react";

export function CheckboxField({ label, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
      <input id={id} type="checkbox" {...props} className="size-4 accent-jeopardy-gold" />
      {label}
    </label>
  );
}
