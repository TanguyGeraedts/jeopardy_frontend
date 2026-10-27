import type { Metadata } from "next";
import { ContactLink, LegalList, LegalPage, LegalSection, TextLink } from "@/components/legal/LegalPage";
import { CookieSettingsButton } from "@/components/legal/ConsentBanner";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Every cookie and piece of browser storage Jeopardy uses, and why.",
};

interface StorageRow {
  name: string;
  setBy: string;
  purpose: string;
  kept: string;
}

const ESSENTIAL: StorageRow[] = [
  {
    name: "__session, __client_uat (names may end in a short suffix)",
    setBy: "Clerk, on this site",
    purpose: "Keeps you signed in after you log in.",
    kept: "Until you sign out or your session expires",
  },
  {
    name: "__client",
    setBy: "Clerk, on its sign-in domain",
    purpose: "Remembers your sign-in session so you stay logged in across visits.",
    kept: "Until you sign out or your session expires",
  },
  {
    name: "jeopardy:player-token:<game> (session storage)",
    setBy: "This site",
    purpose: "Your buzzer's pass for a game, so a reload doesn't throw you out.",
    kept: "Until you close the tab",
  },
  {
    name: "jeopardy.rows.<quiz> (local storage)",
    setBy: "This site",
    purpose: "The point rows you set up for a board in the quiz editor.",
    kept: "Until you clear site data or delete the quiz",
  },
  {
    name: "jeopardy.consent.external-media (local storage)",
    setBy: "This site",
    purpose: "Remembers whether you allowed or blocked external media, so you are only asked once.",
    kept: "Until you clear site data",
  },
];

function StorageTable({ rows }: { rows: StorageRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-desk">
      <table className="w-full border-collapse text-left text-sm leading-snug">
        <thead className="sr-only sm:not-sr-only">
          <tr className="border-b-2 border-studio-night text-[13px] text-chalk/70">
            <th scope="col" className="px-4 py-3 font-medium">Name</th>
            <th scope="col" className="px-4 py-3 font-medium">Purpose</th>
            <th scope="col" className="px-4 py-3 font-medium">Kept for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="flex flex-col gap-2 border-b-2 border-studio-night px-4 py-4 last:border-b-0 sm:table-row sm:px-0 sm:py-0">
              <th scope="row" className="align-top font-normal sm:w-[36%] sm:px-4 sm:py-4">
                <code className="block break-all font-mono text-[13px] text-chalk">{row.name}</code>
                <span className="mt-1 block text-chalk/70">{row.setBy}</span>
              </th>
              <td className="align-top text-chalk/85 sm:px-4 sm:py-4">{row.purpose}</td>
              <td className="align-top text-chalk/85 sm:w-[26%] sm:px-4 sm:py-4">
                <span className="text-chalk/70 sm:hidden">Kept for </span>
                {row.kept}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <LegalPage
      current="/cookies"
      title="Cookie policy"
      intro={
        <p>
          Jeopardy only stores what it needs to work. There are no analytics, advertising or tracking cookies, on this site
          or from anyone else.
        </p>
      }
    >
      <LegalSection id="essential" title="Strictly necessary">
        <p>
          These make sign-in and the game work, so the law (the ePrivacy rules, as applied in {LEGAL.country}) doesn&apos;t
          require your consent for them. Blocking them in your browser stops sign-in or the buzzer from working.
        </p>
        <StorageTable rows={ESSENTIAL} />
      </LegalSection>

      <LegalSection id="external-media" title="External media, only if you allow it">
        <p>
          Quiz makers can add YouTube videos and images, videos or sounds hosted on other sites. Loading these shares your IP
          address with that site, and YouTube may store data in your browser once a video plays. So they don&apos;t load
          until you agree:
        </p>
        <LegalList>
          <li>
            <strong>Allow</strong> loads external media everywhere on the site from then on.
          </li>
          <li>
            <strong>Block</strong> shows a placeholder instead, with a button to load a single clue&apos;s media just once.
          </li>
        </LegalList>
        <p>
          YouTube videos use its privacy-enhanced mode (youtube-nocookie.com). What Google or another site does with your data
          is covered by their own privacy policy.
        </p>
      </LegalSection>

      <LegalSection id="change" title="Changing your choice">
        <p>
          You can change your choice at any time with{" "}
          <CookieSettingsButton className="font-medium text-chalk underline decoration-chalk/40 underline-offset-[3px] hover:decoration-chalk" />{" "}
          at the bottom of every page, or by clearing this site&apos;s data in your browser. Withdrawing consent doesn&apos;t
          affect media that was already loaded.
        </p>
        <p>
          See the <TextLink href="/privacy">privacy notice</TextLink> for everything else about your data, or email{" "}
          <ContactLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
