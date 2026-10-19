"use client";

import { useState, type ReactNode } from "react";
import { toApiError } from "@/lib/api/client";
import { HTTP_URL, validateQuestion, type QuestionFormValues } from "@/lib/validation/quiz";
import { ANSWER_TYPES, type AnswerType, type QuestionRequest } from "@/types";
import { ClueMedia } from "@/components/game/ClueMedia";
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

/** The backend calls it answerType, but the media is shown with the question on the board. */
/**
 * "Sound only" (AUDIO) is hidden for now: it needs a direct file link, which is hard to get until uploads exist.
 * The board and backend already support it; to turn it back on, offer ANSWER_TYPES again.
 * A question that is already AUDIO keeps the option so the form still shows its real type.
 */
const mediaOptions = (current: AnswerType): readonly AnswerType[] =>
  ANSWER_TYPES.filter((type) => type !== "AUDIO" || current === "AUDIO");

const MEDIA_LABELS: Record<AnswerType, string> = {
  TEXT: "None (text only)",
  IMAGE: "Image",
  VIDEO: "Video (YouTube or file)",
  AUDIO: "Sound only (audio or video file)",
};

const URL_FIELD: Record<Exclude<AnswerType, "TEXT">, { label: string; placeholder: string }> = {
  IMAGE: { label: "Image URL", placeholder: "https://…/photo.jpg" },
  VIDEO: { label: "YouTube link or video file URL", placeholder: "https://www.youtube.com/watch?v=…" },
  AUDIO: { label: "Audio or video file URL (not YouTube)", placeholder: "https://…/song.mp3" },
};

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
        label="Question media"
        options={mediaOptions(initial.answerType ?? "TEXT")}
        optionLabels={MEDIA_LABELS}
        value={values.answerType}
        onChange={(e) => set("answerType", e.target.value as AnswerType)}
        error={errors.answerType}
      />
      {values.answerType !== "TEXT" && (
        <>
          <TextField
            label={URL_FIELD[values.answerType].label}
            value={values.mediaUrl}
            onChange={(e) => set("mediaUrl", e.target.value)}
            error={errors.mediaUrl}
            placeholder={URL_FIELD[values.answerType].placeholder}
          />
          {/* Exactly what the board will show, so a broken link is caught here and not mid-game. */}
          {HTTP_URL.test(values.mediaUrl.trim()) && (
            <div className="flex h-48 justify-center rounded-md bg-black/30 p-2">
              <ClueMedia key={values.mediaUrl.trim()} type={values.answerType} url={values.mediaUrl.trim()} label="Preview" />
            </div>
          )}
        </>
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
