import { CreateQuizForm } from "@/components/creator/CreateQuizForm";
import { QuizList } from "@/components/creator/QuizList";

export default function CreatorPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-extrabold">Quiz creator</h1>
                <p className="mt-1 text-white/50">Build a Jeopardy-style board: categories across, point values down.</p>
            </div>

            <div className="max-w-md">
                <CreateQuizForm />
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">My quizzes</h2>
                <QuizList />
            </section>
        </div>
    );
}