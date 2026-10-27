import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { LEGAL } from "@/lib/legal";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <SignUp />
      <p className="max-w-sm text-center text-xs leading-relaxed text-chalk/60">
        By creating an account you accept the{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-chalk">terms</Link> and confirm you&apos;re at
        least {LEGAL.minimumAccountAge}. See the <Link href="/privacy" className="underline underline-offset-2 hover:text-chalk">privacy notice</Link>{" "}
        for how your data is handled.
      </p>
    </div>
  );
}
