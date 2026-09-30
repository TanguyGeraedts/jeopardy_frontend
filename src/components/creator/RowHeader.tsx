"use client";

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
    <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-1">
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
        className="min-h-10 w-20 min-w-0 rounded border border-transparent bg-transparent px-1 text-center font-extrabold text-jeopardy-gold hover:border-white/30 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
      />
      <button
        type="button"
        aria-label={`Remove ${points} point row`}
        onClick={onRemove}
        className="h-11 w-8 shrink-0 text-white/50 transition hover:text-red-300"
      >
        ✕
      </button>
    </div>
  );
}
