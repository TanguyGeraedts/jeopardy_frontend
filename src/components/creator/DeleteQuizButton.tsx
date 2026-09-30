"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteQuiz } from "@/lib/api/quizzes";
import { toApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

/** Two-step delete (no modal needed). Goes back to the quiz list on success. */
export function DeleteQuizButton({ quizId, quizName }: { quizId: string; quizName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteQuiz(quizId);
      router.push("/creator");
    } catch (e) {
      setError(toApiError(e).message);
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="secondary" onClick={() => setConfirming(true)}>
        Delete
      </Button>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <p className="text-sm text-white/70">Delete &quot;{quizName}&quot;? This cannot be undone.</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" disabled={busy} onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button variant="danger" loading={busy} onClick={handleDelete}>
          Yes, delete
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
