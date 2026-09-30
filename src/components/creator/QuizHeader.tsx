"use client";

import { useState } from "react";
import { updateQuiz } from "@/lib/api/quizzes";
import { toApiError } from "@/lib/api/client";
import { validateQuizName } from "@/lib/validation/quiz";
import type { Quiz } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

interface QuizHeaderProps {
    quiz: Quiz;
    onUpdated: (quiz: Quiz) => void;
}

export function QuizHeader({ quiz, onUpdated }: QuizHeaderProps) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(quiz.name);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    function startEditing() {
        setName(quiz.name);
        setFieldError(null);
        setFormError(null);
        setEditing(true);
    }

    async function save(event: React.FormEvent) {
        event.preventDefault();
        setFormError(null);

        const invalid = validateQuizName(name);
        setFieldError(invalid);
        if (invalid) return;

        setBusy(true);
        try {
            onUpdated(await updateQuiz(quiz.id, { name: name.trim() }));
            setEditing(false);
        } catch (e) {
            const error = toApiError(e);
            if (error.fieldErrors.name) setFieldError(error.fieldErrors.name);
            else setFormError(error.message);
        } finally {
            setBusy(false);
        }
    }

    if (!editing) {
        return (
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold">{quiz.name}</h1>
                    <Button variant="ghost" onClick={startEditing}>
                        Rename
                    </Button>
                </div>
                <p className="text-xs text-white/40">{quiz.id}</p>
            </div>
        );
    }

    return (
        <form onSubmit={save} className="w-full max-w-md space-y-3" noValidate>
            <TextField label="Quiz name" value={name} onChange={(e) => setName(e.target.value)} error={fieldError} autoFocus />
            {formError && <Alert>{formError}</Alert>}
            <div className="flex gap-2">
                <Button type="submit" loading={busy}>
                    Save
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}