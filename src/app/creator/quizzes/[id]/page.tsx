import { QuizDetail } from "@/components/creator/QuizDetail";

export default async function QuizPage({ params }: PageProps<"/creator/quizzes/[id]">) {
  const { id } = await params;
  // key resets the hook's state when navigating between quizzes
  return <QuizDetail key={id} quizId={id} />;
}
