import type { Metadata } from "next";
import { Geist, Geist_Mono, League_Gothic } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { jeopardyClerkAppearance } from "@/lib/clerk-appearance";
import { ToastProvider } from "@/providers/ToastProvider";
import { ConsentBanner } from "@/components/legal/ConsentBanner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// The show's type: ultra-compressed values/categories, and a sturdy serif for clues that survives stream compression.
const leagueGothic = League_Gothic({ variable: "--font-league-gothic", subsets: ["latin"] });
// Domine comes from the @fontsource/domine package, not next/font/google: Google serves it from "/l/font?kit=…&…" URLs,
// which Turbopack can't resolve, so the CI build failed whenever Google handed out those.
const domine = localFont({
  variable: "--font-domine",
  src: [
    { path: "../../node_modules/@fontsource/domine/files/domine-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/domine/files/domine-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Jeopardy",
  description: "Build Jeopardy boards, find other people's, and host them live for your group.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${leagueGothic.variable} ${domine.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" appearance={jeopardyClerkAppearance}>
          {/* The nav bar is in (site)/layout.tsx; the (stage) pages (phone buzzer, game board) have none. */}
          <ToastProvider>{children}</ToastProvider>
          {/* On every page, including the stage: the board is where clue media actually plays. */}
          <ConsentBanner />
        </ClerkProvider>
      </body>
    </html>
  );
}
