import { redirect } from "next/navigation";

// Only the creator exists for now. Gameplay/lobby will get their own routes later.
export default function Home() {
  redirect("/creator");
}
