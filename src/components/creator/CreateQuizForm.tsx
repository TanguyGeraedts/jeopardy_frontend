"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/lib/api/quizzes";
import { toApiError } from "@/lib/api/client";
import { validateQuizName } from "@/lib/validation/quiz";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

export function CreateQuizForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ title: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const invalid = validateQuizName(name);
    setFieldError(invalid);
    if (invalid) return;

    setBusy(true);
    try {
      const quiz = await createQuiz({ name: name.trim() });
      router.push(`/creator/quizzes/${quiz.id}`);
    } catch (e) {
      const error = toApiError(e);
      if (error.fieldErrors.name) setFieldError(error.fieldErrors.name);
      else setFormError({ title: error.title, message: error.message });
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <h2 className="text-lg font-bold">New quiz</h2>
        <TextField
          label="Quiz name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldError}
          placeholder="e.g. Friday pub quiz"
        />
        {formError && <Alert title={formError.title}>{formError.message}</Alert>}
        <Button type="submit" loading={busy}>
          Create quiz
        </Button>
      </form>
    </Card>
  );
}
