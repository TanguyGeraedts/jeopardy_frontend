import { cn } from "@/lib/cn";

/** Shared look for text inputs, textareas and selects. */
export const fieldClass = (hasError: boolean, extra?: string) =>
  cn(
    "w-full rounded-md border bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30",
    "focus:outline-none focus:ring-2 focus:ring-jeopardy-gold",
    hasError ? "border-red-400" : "border-white/15",
    extra,
  );
