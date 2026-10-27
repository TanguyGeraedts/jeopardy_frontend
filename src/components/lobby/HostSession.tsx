"use client";

import { useRouter } from "next/navigation";
import { useHostableQuiz } from "@/hooks/useHostableQuiz";
import { deleteGameSession } from "@/lib/api/sessions";
import { LEGAL } from "@/lib/legal";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink } from "@/components/ui/BackLink";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { AdminMenu } from "./AdminMenu";

/** The admin page of one game session. Everything comes from the URL, so a refresh (or a bookmark) lands back here. */
export function HostSession({ quizId, sessionId }: { quizId: string; sessionId: string }) {
  const router = useRouter();
  const state = useHostableQuiz(quizId);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { quiz } = state;

  return (
    <div className="space-y-6">
      <BackLink href={`/quizzes/${quiz.id}`}>Back to quiz</BackLink>
      <AdminMenu quizId={quiz.id} quizName={quiz.name} sessionId={sessionId} />
      {/* The privacy notice points players here: their names otherwise stay for the retention period. */}
      <section aria-labelledby="delete-game-title" className="flex flex-wrap items-start justify-between gap-4 border-t border-white/10 pt-6">
        <div className="max-w-xl space-y-1">
          <h2 id="delete-game-title" className="text-sm font-semibold text-chalk">Delete this game</h2>
          <p className="text-sm text-chalk/70">
            Removes the players&apos; names, teams and scores now. Otherwise they are deleted automatically after{" "}
            {LEGAL.gameRetentionDays} days. The quiz itself stays.
          </p>
        </div>
        <ConfirmDelete
          label="Delete game"
          prompt="Delete this game and everyone's names and scores? This cannot be undone."
          onConfirm={async () => {
            await deleteGameSession(sessionId);
            router.push(`/quizzes/${quiz.id}`);
          }}
        />
      </section>
    </div>
  );
}
