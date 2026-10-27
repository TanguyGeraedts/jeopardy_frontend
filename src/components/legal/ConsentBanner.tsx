"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { onReopenConsentSettings, reopenConsentSettings, setMediaConsent, useMediaConsent } from "@/lib/consent";

/**
 * Asks once whether external media (YouTube, linked images and sounds) may load. Allow and Block are the same size and
 * weight on purpose: refusing is as easy as accepting. It doesn't block the page; until a choice is made, media stays off.
 */
export function ConsentBanner() {
  const consent = useMediaConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => onReopenConsentSettings(() => setReopened(true)), []);

  if (consent === "unknown" || (consent !== null && !reopened)) return null;

  const choose = (choice: "allowed" | "blocked") => {
    setMediaConsent(choice);
    setReopened(false);
  };

  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-white/15 bg-desk p-4 text-sm text-chalk shadow-2xl sm:flex-row sm:items-center sm:gap-5"
    >
      <div className="flex flex-1 flex-col gap-1">
        <h2 id="consent-title" className="font-semibold">
          External media
        </h2>
        <p className="leading-snug text-chalk/85">
          Some quizzes show YouTube videos or images and sounds from other sites. Loading them shares your IP address with
          those sites. There are no tracking or advertising cookies.{" "}
          <Link href="/cookies" className="font-medium underline decoration-chalk/50 underline-offset-[3px] hover:decoration-chalk">
            Cookie policy
          </Link>
        </p>
        {consent !== null && <p className="text-chalk/85">Currently: {consent === "allowed" ? "allowed" : "blocked"}.</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => choose("blocked")}>
          Block
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => choose("allowed")}>
          Allow
        </Button>
      </div>
    </section>
  );
}

/** The footer link that brings the banner back so a choice can be changed. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={reopenConsentSettings} className={className}>
      Cookie settings
    </button>
  );
}
