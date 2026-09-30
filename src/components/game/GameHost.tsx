"use client";

import Link from "next/link";
import { useCallback, useReducer } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { currentBuzz, DEMO_TEAMS, gameReducer, initialGame } from "@/lib/game-state";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import type { GameTeam, Quiz } from "@/types";
import { ClueView } from "./ClueView";
import { GameBoard } from "./GameBoard";
import { Scoreboard } from "./Scoreboard";

/**
 * The screen the host shares: board (or the open clue) on top, teams and scores along the bottom.
 * `teams` is the seam for the lobby: pass the joined teams here (1-4 players each). Until then it uses demo teams.
 */
export function GameHost({ quizId, teams = DEMO_TEAMS }: { quizId: string; teams?: GameTeam[] }) {
  const { state } = useQuiz(quizId);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  return <Game quiz={state.quiz} teams={teams} />;
}

function Game({ quiz, teams }: { quiz: Quiz; teams: GameTeam[] }) {
  const [game, dispatch] = useReducer(gameReducer, teams, initialGame);
  const { active } = game;
  const activeCategory = active && quiz.categories.find((c) => c.id === active.categoryId);
  const answering = active && currentBuzz(active);

  // Buzzes from the lobby go through here too: dispatch({ type: "buzz", playerId, at: <server timestamp ms> }).
  const buzz = useCallback((playerId: string) => dispatch({ type: "buzz", playerId, at: Date.now() }), []);

  return (
    // Full screen on purpose: it covers the site header so the shared view is just the game.
    <div className="fixed inset-0 z-40 flex flex-col gap-3 bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="truncate text-xl font-extrabold text-jeopardy-gold">{quiz.name}</h1>
        <Link href={`/quizzes/${quiz.id}`} className="text-sm text-white/50 hover:text-white">
          Exit game
        </Link>
      </div>

      <div className="min-h-0 flex-1">
        {active && activeCategory ? (
          <ClueView
            key={active.question.id}
            category={activeCategory}
            clue={active}
            teams={game.teams}
            onBuzz={buzz}
            onReveal={() => dispatch({ type: "reveal" })}
            onClose={() => dispatch({ type: "close" })}
          />
        ) : (
          <GameBoard quiz={quiz} usedQuestionIds={game.usedQuestionIds} onPick={(categoryId, question) => dispatch({ type: "open", categoryId, question })} />
        )}
      </div>

      <Scoreboard
        teams={game.teams}
        scores={game.scores}
        clue={
          active ? {
            answeringTeamId: answering?.teamId,
            lockedTeamIds: active.lockedTeamIds,
            hasBuzzes: active.buzzes.length > 0,
            onCorrect: (teamId) => dispatch({ type: "correct", teamId }),
            onWrong: (teamId) => dispatch({ type: "wrong", teamId }),
          } : undefined
        }
      />
    </div>
  );
}
