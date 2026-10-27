"use client";

import { CaretLeft, CaretRight, FilmStrip, Image as ImageIcon, SpeakerHigh, TextT, Trash, X } from "@phosphor-icons/react";
import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { HTTP_URL, validateQuestion, type QuestionFormValues } from "@/lib/validation/quiz";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import { ANSWER_TYPES, type AnswerType, type Category, type Question, type QuestionRequest } from "@/types";
import { ClueMedia } from "@/components/game/ClueMedia";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/fieldStyles";

/** Typing pauses this long before the question is saved. */
const AUTOSAVE_MS = 700;

/**
 * "Sound only" (AUDIO) stays hidden for new questions: it needs a direct file link, hard to get until uploads exist.
 * A question that already is AUDIO keeps the option so the panel shows its real type.
 */
const mediaOptions = (current: AnswerType): readonly AnswerType[] => ANSWER_TYPES.filter((type) => type !== "AUDIO" || current === "AUDIO");

const MEDIA: Record<AnswerType, { label: string; icon: ReactNode }> = {
  TEXT: { label: "Text only", icon: <TextT weight="bold" aria-hidden /> },
  IMAGE: { label: "Image", icon: <ImageIcon weight="bold" aria-hidden /> },
  VIDEO: { label: "Video", icon: <FilmStrip weight="bold" aria-hidden /> },
  AUDIO: { label: "Sound", icon: <SpeakerHigh weight="bold" aria-hidden /> },
};

const URL_FIELD: Record<Exclude<AnswerType, "TEXT">, { label: string; placeholder: string }> = {
  IMAGE: { label: "Image link", placeholder: "https://…/photo.jpg" },
  VIDEO: { label: "YouTube link or video file", placeholder: "https://www.youtube.com/watch?v=…" },
  AUDIO: { label: "Audio or video file link (not YouTube)", placeholder: "https://…/song.mp3" },
};

const MISSING: Record<string, string> = { questionText: "a question", answerText: "an answer", mediaUrl: "a media link", points: "a point value" };

export interface QuestionPanelHandle {
  /**
   * Called before the panel closes or switches tile. Saves anything pending; if what's typed can't be saved, asks
   * "keep editing or discard". Resolves true when it's fine to leave.
   */
  requestLeave: () => Promise<boolean>;
}

interface QuestionPanelProps {
  category: Category;
  /** The saved question, or undefined for an empty slot (it is created by the first save). */
  question?: Question;
  /** The slot's points when it's empty. */
  points: number;
  /** The board's row values, offered as quick picks. */
  rows: readonly number[];
  onSaved: (question: Question) => void;
  onDelete: (categoryId: string, question: Question) => void;
  onClose: () => void;
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
}

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

const toValues = (question: Question | undefined, points: number): QuestionFormValues => ({
  points: String(question?.points ?? points),
  questionText: question?.questionText ?? "",
  answerText: question?.answerText ?? "",
  answerType: question?.answerType ?? "TEXT",
  mediaUrl: question?.mediaUrl ?? "",
});

const toRequest = (values: QuestionFormValues, dailyDouble: boolean): QuestionRequest => ({
  points: Number(values.points),
  questionText: values.questionText.trim(),
  answerText: values.answerText.trim(),
  answerType: values.answerType,
  mediaUrl: values.answerType === "TEXT" ? null : values.mediaUrl.trim(),
  dailyDouble,
});

/**
 * Edits one board slot, saving as you type. Mount with a key per opened slot (not per question id: the first save
 * gives a new question its id, and the panel must not reset then).
 */
export const QuestionPanel = forwardRef<QuestionPanelHandle, QuestionPanelProps>(function QuestionPanel(
  { category, question, points, rows, onSaved, onDelete, onClose, onPrevious, onNext },
  ref,
) {
  const editor = useQuizEditor();
  const [values, setValues] = useState(() => toValues(question, points));
  const [dailyDouble, setDailyDouble] = useState(question?.dailyDouble ?? false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [confirmLeave, setConfirmLeave] = useState<((leave: boolean) => void) | null>(null);

  // What the backend has: the question's id (none until a new one is first saved) and the JSON of what was saved.
  // Equal to what's typed = nothing to save. The ref copy is for the save queue, which must see a new id at once.
  const [saved, setSaved] = useState(() => ({ id: question?.id, json: JSON.stringify(toRequest(toValues(question, points), question?.dailyDouble ?? false)) }));
  const savedRef = useRef(saved);
  // Saves run one after another, so a new question is never created twice.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const request = toRequest(values, dailyDouble);
  const json = JSON.stringify(request);
  const dirty = json !== saved.json;

  const takenPoints = category.questions.filter((q) => q.id !== saved.id).map((q) => q.points);
  const errors = validateQuestion(values);
  if (!errors.points && takenPoints.includes(Number(values.points))) errors.points = `${values.points} is already used in ${category.name}`;
  // Empty required fields, for "needs a question and an answer". Wrong (not empty) values show at the field instead.
  const missing = (["points", "questionText", "answerText", "mediaUrl"] as const).filter((key) => errors[key] && values[key].trim() === "");
  const valid = Object.keys(errors).length === 0;

  /** Resolves false when the backend refused or couldn't be reached. */
  const save = useCallback(
    (body: QuestionRequest): Promise<boolean> => {
      const run = queue.current.then(async () => {
        const bodyJson = JSON.stringify(body);
        if (bodyJson === savedRef.current.json) return true;
        setStatus({ kind: "saving" });
        try {
          const id = savedRef.current.id;
          const result = id ? await editor.updateQuestion(category.id, id, body) : await editor.addQuestion(category.id, body);
          savedRef.current = { id: result.id, json: bodyJson };
          setSaved(savedRef.current);
          setStatus({ kind: "saved" });
          onSaved(result);
          return true;
        } catch (e) {
          setStatus({ kind: "error", message: errorMessage(e) });
          return false;
        }
      });
      queue.current = run;
      return run;
    },
    [editor, category.id, onSaved],
  );

  // Autosave: a moment after the last change, if what's typed is a complete question.
  useEffect(() => {
    if (!dirty || !valid) return;
    const timer = setTimeout(() => void save(request), AUTOSAVE_MS);
    return () => clearTimeout(timer);
    // `request` is rebuilt every render; `json` is its stable stand-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [json, dirty, valid, save]);

  useImperativeHandle(
    ref,
    () => ({
      async requestLeave() {
        if (!dirty) return true;
        // Complete: save it now (no waiting for the autosave pause). Only a failed save makes us ask.
        if (valid && (await save(request))) return true;
        return new Promise<boolean>((resolve) =>
          setConfirmLeave(() => (leave: boolean) => {
            setConfirmLeave(null);
            resolve(leave);
          }),
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [json, dirty, valid, save],
  );

  const set = <K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) => setValues((v) => ({ ...v, [key]: value }));
  const showError = (key: keyof QuestionFormValues) => (values[key].trim() !== "" ? errors[key] : undefined);
  const mediaUrl = values.mediaUrl.trim();
  const savedQuestion = saved.id ? category.questions.find((q) => q.id === saved.id) : undefined;

  return (
    <div
      className="flex h-full flex-col bg-desk"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl uppercase leading-tight tracking-wide">
            {category.name} <span className="text-gold">{values.points || "?"}</span>
          </p>
          <SaveStatus status={status} dirty={dirty} valid={valid} missing={missing} isNew={!saved.id} />
        </div>
        <IconButton label="Previous tile" disabled={!onPrevious} onClick={() => onPrevious?.()}>
          <CaretLeft weight="bold" />
        </IconButton>
        <IconButton label="Next tile" disabled={!onNext} onClick={() => onNext?.()}>
          <CaretRight weight="bold" />
        </IconButton>
        <IconButton label="Close" onClick={onClose}>
          <X weight="bold" />
        </IconButton>
      </header>

      {confirmLeave && (
        <div role="alertdialog" aria-label="Unsaved question" className="space-y-3 border-b border-gold/40 bg-gold/10 px-5 py-4">
          <p className="text-sm">
            {status.kind === "error" && valid
              ? `This question couldn't be saved: ${status.message}`
              : `This question isn't saved: it still needs ${missing.length > 0 ? missing.map((m) => MISSING[m]).join(" and ") : "a fix (see the fields below)"}.`}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => confirmLeave(false)}>
              Keep editing
            </Button>
            <Button size="sm" variant="ghost" onClick={() => confirmLeave(true)}>
              Discard changes
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <Field label="Points" error={values.points.trim() === "" ? undefined : errors.points}>
          <div className="flex flex-wrap items-center gap-1.5">
            {rows.map((row) => {
              const taken = takenPoints.includes(row);
              const on = values.points === String(row);
              return (
                <button
                  key={row}
                  type="button"
                  aria-pressed={on}
                  disabled={taken}
                  title={taken ? `Already used in ${category.name}` : undefined}
                  onClick={() => set("points", String(row))}
                  className={cn(
                    "min-w-14 rounded-md px-3 py-1.5 font-display text-2xl leading-none tabular-nums transition disabled:cursor-not-allowed disabled:opacity-30",
                    on ? "bg-gold text-studio-night" : "bg-board-blue text-gold enabled:hover:brightness-125",
                  )}
                >
                  {row}
                </button>
              );
            })}
            <input
              aria-label="Custom points"
              inputMode="numeric"
              value={rows.includes(Number(values.points)) ? "" : values.points}
              onChange={(e) => set("points", e.target.value.replace(/\D/g, ""))}
              placeholder="Other"
              className={fieldClass(false, "w-24 py-1.5 text-center")}
            />
          </div>
        </Field>

        {/* The clue as players will see it: the board's blue and the show's serif. */}
        <Field label="Clue" error={showError("questionText")}>
          <textarea
            aria-label="Clue"
            value={values.questionText}
            onChange={(e) => set("questionText", e.target.value)}
            rows={4}
            placeholder="This city is home to the Eiffel Tower"
            className="block w-full resize-y rounded-md border border-transparent bg-board-blue px-4 py-4 text-center font-serif text-xl font-bold uppercase leading-snug text-chalk placeholder:text-chalk/55 focus:border-chalk/50"
          />
        </Field>

        <Field label="Answer" error={showError("answerText")}>
          <input aria-label="Answer" value={values.answerText} onChange={(e) => set("answerText", e.target.value)} placeholder="What is Paris?" className={fieldClass(false, "py-2.5 text-base")} />
        </Field>

        <Field label="Media" error={showError("mediaUrl")}>
          <div role="radiogroup" aria-label="Media" className="flex rounded-lg bg-studio-night p-1">
            {mediaOptions(question?.answerType ?? "TEXT").map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={values.answerType === type}
                onClick={() => set("answerType", type)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm transition",
                  values.answerType === type ? "bg-white/[0.12] font-semibold text-chalk" : "text-chalk/55 hover:text-chalk",
                )}
              >
                {MEDIA[type].icon}
                {MEDIA[type].label}
              </button>
            ))}
          </div>
          {values.answerType !== "TEXT" && (
            <div className="mt-2 space-y-2">
              <input
                aria-label={URL_FIELD[values.answerType].label}
                value={values.mediaUrl}
                onChange={(e) => set("mediaUrl", e.target.value)}
                placeholder={URL_FIELD[values.answerType].placeholder}
                className={fieldClass(!!showError("mediaUrl"))}
              />
              {/* Exactly what the board will show, so a broken link is caught here and not mid-game. */}
              {HTTP_URL.test(mediaUrl) && (
                <div className="flex h-48 justify-center rounded-md bg-black/30 p-2">
                  <ClueMedia key={mediaUrl} type={values.answerType} url={mediaUrl} label="Preview" />
                </div>
              )}
            </div>
          )}
        </Field>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-studio-night/60 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold">Daily double</span>
            <span className="block text-xs text-chalk/50">The team that picks it bets on the answer.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={dailyDouble}
            onClick={() => setDailyDouble((d) => !d)}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition", dailyDouble ? "bg-gold" : "bg-white/20")}
          >
            <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform", dailyDouble && "translate-x-5 bg-studio-night")} />
          </button>
        </label>
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-3">
        {savedQuestion ? (
          <Button size="sm" variant="ghost" className="text-buzzer-red hover:text-buzzer-red" onClick={() => onDelete(category.id, savedQuestion)}>
            <Trash weight="bold" aria-hidden />
            Delete question
          </Button>
        ) : (
          <span />
        )}
        {onNext && (
          <Button size="sm" variant="secondary" onClick={onNext}>
            Next tile
            <CaretRight weight="bold" aria-hidden />
          </Button>
        )}
      </footer>
    </div>
  );
});

function SaveStatus({ status, dirty, valid, missing, isNew }: { status: Status; dirty: boolean; valid: boolean; missing: string[]; isNew: boolean }) {
  let text: string;
  let tone = "text-chalk/50";
  if (status.kind === "error") {
    text = `Not saved: ${status.message}`;
    tone = "text-buzzer-red";
  } else if (status.kind === "saving" || (dirty && valid)) {
    text = "Saving…";
  } else if (dirty) {
    text = missing.length > 0 ? `Not saved yet: needs ${missing.map((m) => MISSING[m]).join(" and ")}` : "Not saved yet: check the fields below";
    tone = "text-gold/80";
  } else if (isNew) {
    text = "Empty tile: write a clue and its answer";
  } else {
    text = "All changes saved";
  }
  return (
    <p aria-live="polite" className={cn("truncate text-xs", tone)}>
      {text}
    </p>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="space-y-1.5">
      <p id={labelId} className="text-sm font-medium text-chalk/70">{label}</p>
      {children}
      {error && <p className="text-xs text-buzzer-red">{error}</p>}
    </div>
  );
}

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-md text-lg text-chalk/70 transition enabled:hover:bg-white/[0.08] enabled:hover:text-chalk disabled:opacity-30"
    >
      {children}
    </button>
  );
}
