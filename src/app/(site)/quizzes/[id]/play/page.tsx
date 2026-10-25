import { GameHost } from "@/components/game/GameHost";

export default async function PlayPage({ params }: PageProps<"/quizzes/[id]/play">) {
  const { id } = await params;
  // TODO(lobby): create the lobby here, then pass the joined teams: <GameHost teams={...} />
  return <GameHost key={id} quizId={id} />;
}
