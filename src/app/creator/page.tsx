import { CreateQuizForm } from "@/components/creator/CreateQuizForm";
import { OpenQuizForm } from "@/components/creator/OpenQuizForm";

export default function CreatorPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">Quiz creator</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CreateQuizForm />
        <OpenQuizForm />
      </div>
    </div>
  );
}
