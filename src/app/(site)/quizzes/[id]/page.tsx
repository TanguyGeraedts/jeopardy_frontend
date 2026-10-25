import { QuizOverview } from "@/components/quiz/QuizOverview";

export default async function QuizOverviewPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id } = await params;
  // key resets the hooks' state when navigating between quizzes
  return <QuizOverview key={id} quizId={id} />;
}
