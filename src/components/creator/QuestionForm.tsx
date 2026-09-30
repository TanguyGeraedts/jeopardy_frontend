"use client";

import { useState, type ReactNode } from "react";
import { toApiError } from "@/lib/api/client";
import { validateQuestion, type QuestionFormValues } from "@/lib/validation/quiz";
import { ANSWER_TYPES, type AnswerType, type QuestionRequest } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

interface QuestionFormProps {
  /** Starting values (edit: the existing question; add: suggested points). */
  initial: {
    points: number;
    questionText?: string;
    answerText?: string;
    answerType?: AnswerType;
    mediaUrl?: string | null;
    dailyDouble?: boolean;
  };
  submitLabel: string;
  /** Points already used by the other questions in this category (instant duplicate check). */
  takenPoints?: readonly number[];
  /** Extra buttons on the right of the action row (e.g. Delete). */
  extraActions?: ReactNode;
  /** Should throw on failure (ApiError); the form shows it. */
  onSubmit: (body: QuestionRequest) => Promise<void>;
  onCancel: () => void;
}

/** Shared by "add question" and "edit question". */
export function QuestionForm({ initial, submitLabel, takenPoints, extraActions, onSubmit, onCancel }: QuestionFormProps) {
  const [values, setValues] = useState<QuestionFormValues>({
    points: String(initial.points),
    questionText: initial.questionText ?? "",
    answerText: initial.answerText ?? "",
    answerType: initial.answerType ?? "TEXT",
    mediaUrl: initial.mediaUrl ?? "",
  });
  const [dailyDouble, setDailyDouble] = useState(initial.dailyDouble ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found = validateQuestion(values);
    if (!found.points && takenPoints?.includes(Number(values.points))) {
      found.points = `${values.points} points is already used in this category`;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await onSubmit({
        points: Number(values.points),
        questionText: values.questionText.trim(),
        answerText: values.answerText.trim(),
        answerType: values.answerType,
        mediaUrl: values.answerType === "TEXT" ? null : values.mediaUrl.trim(),
        dailyDouble,
      });
    } catch (e) {
      const error = toApiError(e);
      if (Object.keys(error.fieldErrors).length > 0) setErrors(error.fieldErrors);
      else setFormError(error.message); // e.g. 409 "points already used in this category"
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <TextField
        label="Points"
        type="number"
        min={1}
        value={values.points}
        onChange={(e) => set("points", e.target.value)}
        error={errors.points}
      />
      <TextAreaField label="Question" value={values.questionText} onChange={(e) => set("questionText", e.target.value)} error={errors.questionText} />
      <TextField label="Answer" value={values.answerText} onChange={(e) => set("answerText", e.target.value)} error={errors.answerText} />
      <SelectField
        label="Answer type"
        options={ANSWER_TYPES}
        value={values.answerType}
        onChange={(e) => set("answerType", e.target.value as AnswerType)}
        error={errors.answerType}
      />
      {values.answerType !== "TEXT" && (
        <TextField
          label={`${values.answerType === "IMAGE" ? "Image" : "Video"} URL`}
          value={values.mediaUrl}
          onChange={(e) => set("mediaUrl", e.target.value)}
          error={errors.mediaUrl}
          placeholder="https://..."
        />
      )}
      <CheckboxField label="Daily double" checked={dailyDouble} onChange={(e) => setDailyDouble(e.target.checked)} />

      {formError && <Alert>{formError}</Alert>}

      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          <Button type="submit" size="sm" loading={busy}>
            {submitLabel}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
        </div>
        {extraActions}
      </div>
    </form>
  );
}
