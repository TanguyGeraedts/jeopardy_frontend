import { CreateQuizForm } from "@/components/creator/CreateQuizForm";
import { QuizList } from "@/components/creator/QuizList";

export default function CreatorPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="font-display text-6xl tracking-wide">My quizzes</h1>
                <p className="mt-1 text-chalk/60">Build a board: categories across, point values down.</p>
            </div>

            <div className="max-w-md">
                <CreateQuizForm />
            </div>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Your boards</h2>
                <QuizList />
            </section>
        </div>
    );
}