import type { Metadata } from "next";
import { Domine, Geist, Geist_Mono, League_Gothic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { jeopardyClerkAppearance } from "@/lib/clerk-appearance";
import { ToastProvider } from "@/providers/ToastProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// The show's type: ultra-compressed values/categories, and a sturdy serif for clues that survives stream compression.
const leagueGothic = League_Gothic({ variable: "--font-league-gothic", subsets: ["latin"] });
const domine = Domine({ variable: "--font-domine", subsets: ["latin"], weight: ["600", "700"] });

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
        </ClerkProvider>
      </body>
    </html>
  );
}
