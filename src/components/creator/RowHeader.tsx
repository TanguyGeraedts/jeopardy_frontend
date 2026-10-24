"use client";

import { X } from "@phosphor-icons/react";
import { useRef, useState } from "react";

interface RowHeaderProps {
  points: number;
  /** Resolves true when the row was re-valued. On false the input goes back to the current value. */
  onChange: (to: number) => Promise<boolean>;
  onRemove: () => void;
}

/** Left-hand cell of a board row: edit the point value in place, ✕ removes the row and its questions. */
export function RowHeader({ points, onChange, onRemove }: RowHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const cancelled = useRef(false);

  async function commit() {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (draft === null) return;
    await onChange(Number(draft));
    setDraft(null);
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-desk p-1">
      <input
        type="number"
        min={1}
        inputMode="numeric"
        aria-label="Points for this row"
        value={draft ?? String(points)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelled.current = true;
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className="min-h-10 w-20 min-w-0 rounded border border-transparent bg-transparent px-1 text-center font-display text-3xl text-gold hover:border-white/30 focus:border-chalk/60 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`Remove ${points} point row`}
        onClick={onRemove}
        className="grid h-11 w-8 shrink-0 place-items-center text-chalk/50 transition hover:text-buzzer-red"
      >
        <X weight="bold" aria-hidden />
      </button>
    </div>
  );
}
