"use client";

import { useState } from "react";
import { toApiError } from "@/lib/api/client";
import { validateCategoryName } from "@/lib/validation/quiz";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

/** "+ Add category" that expands into a one-field form. */
export function AddCategory() {
  const editor = useQuizEditor();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setName("");
    setFieldError(null);
    setFormError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateCategoryName(name);
    setFieldError(invalid);
    if (invalid) return;

    setBusy(true);
    try {
      await editor.addCategory(name.trim());
      close();
    } catch (e) {
      const error = toApiError(e);
      if (error.fieldErrors.name) setFieldError(error.fieldErrors.name);
      else setFormError(error.message); // e.g. 409 duplicate category name
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-full min-h-16 w-full items-center justify-center rounded-lg border-2 border-dashed border-white/25 px-3 text-sm font-semibold text-white/60 transition hover:border-jeopardy-gold hover:text-jeopardy-gold"
      >
        + Add category
      </button>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-lg border border-white/15 bg-white/5 p-3">
      <TextField label="Category name" value={name} onChange={(e) => setName(e.target.value)} error={fieldError} autoFocus />
      {formError && <Alert>{formError}</Alert>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={busy}>
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={close}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
