import { HostSession } from "@/components/lobby/HostSession";

export default async function HostSessionPage({ params }: PageProps<"/quizzes/[id]/host/[sessionId]">) {
  const { id, sessionId } = await params;
  // key resets the hooks' state when navigating between quizzes/sessions
  return <HostSession key={`${id}:${sessionId}`} quizId={id} sessionId={sessionId} />;
}
