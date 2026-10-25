import { SessionGame } from "@/components/game/SessionGame";

export default async function SessionBoardPage({ params }: PageProps<"/quizzes/[id]/host/[sessionId]/board">) {
  const { id, sessionId } = await params;
  return <SessionGame key={sessionId} quizId={id} sessionId={sessionId} />;
}
