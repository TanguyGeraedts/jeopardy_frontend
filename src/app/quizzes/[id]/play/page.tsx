import Link from "next/link";

// Placeholder so the Play button has somewhere to go. Replace with the real game.
export default async function PlayPage({ params }: PageProps<"/quizzes/[id]/play">) {
  const { id } = await params;
  return (
    <div className="space-y-3 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Playing is coming soon</h1>
      <p className="text-white/50">The game itself hasn&apos;t been built yet.</p>
      <Link href={`/quizzes/${id}`} className="inline-block text-sm text-jeopardy-gold hover:underline">
        &lsaquo; Back to the quiz
      </Link>
    </div>
  );
}
