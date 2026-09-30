"use client";

import { useRef, useState } from "react";
import { CATEGORY_NAME_MAX } from "@/lib/validation/quiz";
import type { Category } from "@/types";

interface CategoryHeaderProps {
  category: Category;
  /** Resolves true when saved. On false the input goes back to the current name. */
  onRename: (categoryId: string, name: string) => Promise<boolean>;
  onRemove: (category: Category) => void;
}

/** Column title on the board: edit in place (Enter/blur saves, Esc cancels), ✕ deletes. */
export function CategoryHeader({ category, onRename, onRemove }: CategoryHeaderProps) {
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const cancelled = useRef(false);

  async function commit() {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (draft === null) return;
    const name = draft.trim();
    if (name !== category.name) await onRename(category.id, name);
    setDraft(null);
  }

  return (
    <div className="flex min-h-16 items-center gap-1 rounded-lg bg-jeopardy-board p-1.5">
      <input
        aria-label="Category name"
        value={draft ?? category.name}
        maxLength={CATEGORY_NAME_MAX}
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
        className="min-h-10 w-full min-w-0 rounded border border-transparent bg-transparent px-2 text-center text-sm font-bold hover:border-white/40 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
      />
      <button
        type="button"
        aria-label={`Delete category ${category.name}`}
        onClick={() => onRemove(category)}
        className="h-11 w-8 shrink-0 text-white/70 transition hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
