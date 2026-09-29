import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  error: "border-red-400/40 bg-red-500/10 text-red-200",
  info: "border-sky-400/40 bg-sky-500/10 text-sky-200",
};

export function Alert({ tone = "error", title, children }: { tone?: keyof typeof tones; title?: string; children?: ReactNode }) {
  return (
    <div role="alert" className={cn("rounded-md border px-4 py-3 text-sm", tones[tone])}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <p className={title ? "mt-0.5 opacity-90" : undefined}>{children}</p>}
    </div>
  );
}
