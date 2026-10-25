import { HostScreen } from "@/components/lobby/HostScreen";

export default async function HostPage({ params }: PageProps<"/quizzes/[id]/host">) {
  const { id } = await params;
  // key resets the hooks' state when navigating between quizzes
  return <HostScreen key={id} quizId={id} />;
}
