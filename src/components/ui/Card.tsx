import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** A quiet desk-navy panel: no border, no shadow. Structure comes from spacing and the step from the page colour. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("rounded-lg bg-desk p-5", className)} />;
}
