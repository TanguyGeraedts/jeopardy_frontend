"use client";

import { Trash } from "@phosphor-icons/react";
import { useRef, useState } from "react";

interface RowHeaderProps {
  points: number;
  /** Resolves true when the row was re-valued. On false the field goes back to the current value. */
  onChange: (to: number) => Promise<boolean>;
  onRemove: () => void;
}

/** Left-hand cell of a board row: the point value, edited in place (digits only, no spinner). The bin removes the row. */
export function RowHeader({ points, onChange, onRemove }: RowHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const cancelled = useRef(false);

  async function commit() {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (draft === null) return;
    if (draft !== "") await onChange(Number(draft));
    setDraft(null);
  }

  return (
    <div className="group flex flex-col items-center justify-center gap-1 rounded-sm bg-desk px-1 py-2">
      <input
        inputMode="numeric"
        aria-label={`Points for the ${points} row`}
        value={draft ?? String(points)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelled.current = true;
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className="w-full min-w-0 rounded border border-transparent bg-transparent text-center font-display text-4xl leading-none text-gold tabular-nums hover:border-white/20 focus:border-chalk/60 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`Remove the ${points} row and its questions`}
        title="Remove row"
        onClick={onRemove}
        className="grid size-7 place-items-center rounded text-chalk/35 transition hover:bg-white/[0.08] hover:text-buzzer-red focus-visible:text-buzzer-red group-hover:text-chalk/60"
      >
        <Trash weight="bold" aria-hidden />
      </button>
    </div>
  );
}
