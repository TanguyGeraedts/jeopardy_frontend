"use client";

import { useState } from "react";
import { toApiError } from "@/lib/api/client";
import { validateCategoryName } from "@/lib/validation/quiz";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import type { Category } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { TextField } from "@/components/ui/TextField";

/** Category title with inline rename and delete. */
export function CategoryHeader({ category }: { category: Category }) {
  const editor = useQuizEditor();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startEditing() {
    setName(category.name);
    setFieldError(null);
    setFormError(null);
    setEditing(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateCategoryName(name);
    setFieldError(invalid);
    if (invalid) return;

    setBusy(true);
    try {
      await editor.renameCategory(category.id, name.trim());
      setEditing(false);
    } catch (e) {
      const error = toApiError(e);
      if (error.fieldErrors.name) setFieldError(error.fieldErrors.name);
      else setFormError(error.message); // e.g. 409 duplicate category name
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} noValidate className="space-y-3 rounded-lg border border-white/15 bg-white/5 p-3">
        <TextField label="Category name" value={name} onChange={(e) => setName(e.target.value)} error={fieldError} autoFocus />
        {formError && <Alert>{formError}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" loading={busy}>
            Save
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="rounded-lg bg-jeopardy-board px-3 py-3 text-center text-sm font-bold uppercase tracking-wide">
        {category.name}
      </h3>
      <div className="flex items-start justify-center gap-1">
        <Button size="sm" variant="ghost" onClick={startEditing}>
          Rename
        </Button>
        <ConfirmDelete
          prompt={`Delete "${category.name}" and its ${category.questions.length} question(s)?`}
          onConfirm={() => editor.removeCategory(category.id)}
        />
      </div>
    </div>
  );
}
