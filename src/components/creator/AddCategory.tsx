"use client";

import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { toApiError } from "@/lib/api/client";
import { validateCategoryName } from "@/lib/validation/quiz";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import { fieldClass } from "@/components/ui/fieldStyles";

/** The board's last column header: "+ Category", which turns into a name field. Enter adds, Esc cancels. */
export function AddCategory() {
  const editor = useQuizEditor();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setName("");
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const invalid = validateCategoryName(name);
    setError(invalid);
    if (invalid) return;

    setBusy(true);
    try {
      await editor.addCategory(name.trim());
      close();
    } catch (e) {
      const apiError = toApiError(e);
      setError(apiError.fieldErrors.name ?? apiError.message); // e.g. 409 duplicate category name
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-24 w-full items-center justify-center gap-1.5 rounded-sm bg-board-blue/20 font-display text-2xl uppercase tracking-wide text-chalk/60 transition hover:bg-board-blue/40 hover:text-chalk"
      >
        <Plus weight="bold" aria-hidden />
        Category
      </button>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-24 flex-col justify-center gap-1.5 rounded-sm bg-board-blue/40 p-2">
      <input
        autoFocus
        aria-label="New category name"
        value={name}
        disabled={busy}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        onBlur={() => name.trim() === "" && close()}
        placeholder="Category name"
        className={fieldClass(!!error)}
      />
      {error ? <p className="text-xs text-buzzer-red">{error}</p> : <p className="text-xs text-chalk/50">Enter to add, Esc to cancel</p>}
    </form>
  );
}
