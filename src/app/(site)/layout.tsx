import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

// The website: creator, host pages, sign-in. Everything with the nav bar.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
