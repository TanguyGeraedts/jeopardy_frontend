import type { Viewport } from "next";
import { PlayerGame } from "@/components/play/PlayerGame";

// Phone browser chrome in the studio colour, and the page may draw under a notch (safe-area padding keeps text clear).
export const viewport: Viewport = { themeColor: "#060b2e", viewportFit: "cover" };

export default async function PlayPage({ params }: PageProps<"/play/[gameSessionId]">) {
  const { gameSessionId } = await params;
  // Public on purpose (no RequireAuth): players come from the lobby and don't have a Jeopardy login.
  return <PlayerGame key={gameSessionId} gameSessionId={gameSessionId} />;
}
