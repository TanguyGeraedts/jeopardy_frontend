"use client";

import { Trash } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { CATEGORY_NAME_MAX } from "@/lib/validation/quiz";
import type { Category } from "@/types";

interface CategoryHeaderProps {
  category: Category;
  /** Resolves true when saved. On false the field goes back to the current name. */
  onRename: (categoryId: string, name: string) => Promise<boolean>;
  onRemove: (category: Category) => void;
}

/** Column title on the board, in the show's type: edit in place (Enter/blur saves, Esc cancels); the bin deletes it. */
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
    <div className="group relative flex min-h-24 items-center rounded-sm bg-board-blue px-2 py-2">
      <textarea
        aria-label="Category name"
        // Short names on one line so they sit in the middle of the tile, like the show.
        rows={(draft ?? category.name).length > 14 ? 2 : 1}
        value={draft ?? category.name}
        maxLength={CATEGORY_NAME_MAX}
        onChange={(e) => setDraft(e.target.value.replace(/\n/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            cancelled.current = true;
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
        className="w-full resize-none overflow-hidden rounded border border-transparent bg-transparent text-center font-display text-[1.6rem] uppercase leading-[1.05] tracking-wide hover:border-white/30 focus:border-chalk/70 focus:outline-none"
      />
      <button
        type="button"
        aria-label={`Delete category ${category.name}`}
        title="Delete category"
        onClick={() => onRemove(category)}
        className="absolute right-1 top-1 grid size-7 place-items-center rounded text-chalk/25 transition hover:bg-white/[0.12] hover:text-buzzer-red focus-visible:text-chalk group-hover:text-chalk/60"
      >
        <Trash weight="bold" aria-hidden />
      </button>
    </div>
  );
}
