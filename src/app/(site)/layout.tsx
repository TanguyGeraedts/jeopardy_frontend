import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { LegalFooter } from "@/components/legal/LegalFooter";

// The website: creator, host pages, sign-in. Everything with the nav bar.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {/* A page can ask for the full width (the quiz editor's board + side panel) with a data-wide element. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 has-[[data-wide]]:max-w-[112rem]">{children}</main>
      <LegalFooter />
    </>
  );
}
