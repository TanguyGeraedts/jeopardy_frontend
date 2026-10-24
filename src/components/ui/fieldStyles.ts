import { cn } from "@/lib/cn";

/** Shared look for text inputs, textareas and selects: a step darker than the panel they sit on. */
export const fieldClass = (hasError: boolean, extra?: string) =>
  cn(
    "w-full rounded-md border bg-studio-night px-3 py-2 text-sm text-chalk placeholder:text-chalk/35",
    "focus:border-chalk/50 focus:outline-none focus-visible:outline-none",
    hasError ? "border-buzzer-red" : "border-white/12",
    extra,
  );
