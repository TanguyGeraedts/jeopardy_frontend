import { PlayerGame } from "@/components/play/PlayerGame";

export default async function PlayPage({ params }: PageProps<"/play/[gameSessionId]">) {
  const { gameSessionId } = await params;
  // Public on purpose (no RequireAuth): players come from the lobby and don't have a Jeopardy login.
  return <PlayerGame key={gameSessionId} gameSessionId={gameSessionId} />;
}
