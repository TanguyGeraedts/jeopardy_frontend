import type { Metadata } from "next";
import { ContactLink, LegalList, LegalPage, LegalSection, TextLink } from "@/components/legal/LegalPage";
import { DataLedger, type LedgerRow } from "@/components/legal/DataLedger";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What data Jeopardy handles, why, and for how long.",
};

const LEDGER: LedgerRow[] = [
  {
    what: "Your account",
    detail: "Email address, name or username and profile picture. If you sign in with Google or Discord, these come from that account.",
    why: "To let you sign in and keep your quizzes yours.",
    basis: "Needed to provide the service you asked for (GDPR art. 6(1)(b))",
    kept: "Until you delete your account",
  },
  {
    what: "Your quizzes",
    detail: "Titles, categories, questions, answers, media links and topics. Published quizzes show your name as the author.",
    why: "To save your boards, and to list the ones you publish in Discover.",
    basis: "Needed to provide the service (art. 6(1)(b))",
    kept: "Until you delete them or your account",
  },
  {
    what: "Game data",
    detail: "Players' display names from the lobby, teams, scores and buzzes.",
    why: "To run a live game and show the final scoreboard.",
    basis: "Needed to provide the service (art. 6(1)(b))",
    kept: `${LEGAL.gameRetentionDays} days after the game`,
  },
  {
    what: "Cookies and browser storage",
    detail:
      "Sign-in cookies from Clerk, a player token in session storage so a buzzer survives a reload, and your board's point rows in local storage.",
    why: "To keep you signed in, keep players in the game, and remember how you set up a board.",
    basis: "Strictly necessary or set up by you, so no consent is needed",
    kept: "Until you sign out, close the tab or clear site data",
  },
  {
    what: "Connection data",
    detail: "IP address, browser type, the page requested and the time, written to the server's access logs.",
    why: "To keep the service secure and to investigate abuse or errors.",
    basis: "Legitimate interest in a secure service (art. 6(1)(f))",
    kept: `${LEGAL.accessLogRetentionDays} days`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy notice"
      intro={
        <p>
          Jeopardy needs an account to build quizzes and a display name to play. There is no tracking, no analytics and no
          advertising.
        </p>
      }
    >
      <LegalSection id="data" title="What we handle and why">
        <DataLedger rows={LEDGER} />
        <p>
          Nothing else is collected. Fonts are served from this site&apos;s own server, and there are no tracking or
          advertising cookies, so there is nothing to accept.
        </p>
      </LegalSection>

      <LegalSection id="controller" title="Who is responsible">
        <p>
          The data controller is {LEGAL.operatorName}, a private individual based in {LEGAL.country}. For any question
          about your data, email <ContactLink />.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Who else sees your data">
        <LegalList>
          <li>
            <strong>Everyone</strong> can see quizzes you publish, with your name as the author. Unpublished quizzes are
            only visible to you.
          </li>
          <li>
            <strong>Players in your game</strong> see each other&apos;s display names, teams and scores.
          </li>
          <li>
            <strong>{LEGAL.auth.name}</strong> handles sign-in and stores your account details in {LEGAL.auth.location}
            , under a data processing agreement that includes the EU Standard Contractual Clauses. See{" "}
            <TextLink href={LEGAL.auth.privacyUrl}>Clerk&apos;s privacy policy</TextLink>.
          </li>
          <li>
            <strong>{LEGAL.hosting.name}</strong> hosts the servers and database in {LEGAL.hosting.locations}, under a data
            processing agreement (GDPR art. 28).
          </li>
        </LegalList>
        <p>Your data is never sold, shared with advertisers or used for profiling, and no decisions are made about you automatically.</p>
      </LegalSection>

      <LegalSection id="media" title="Videos, images and sounds in quizzes">
        <p>
          Quiz makers can add media by linking to it. When a clue with media opens, your browser loads it straight from the
          site it is hosted on, which then sees your IP address.
        </p>
        <LegalList>
          <li>
            <strong>YouTube videos</strong> load through YouTube&apos;s privacy-enhanced mode (youtube-nocookie.com). Google
            receives your IP address when the player loads and may store data in your browser once the video plays. Google is
            responsible for that under its own privacy policy.
          </li>
          <li>
            <strong>Images and sound files</strong> come from whatever site the quiz maker linked to, and that site&apos;s own
            policy applies.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="sign-in" title="Signing in with Google or Discord">
        <p>
          If you choose to sign in with Google or Discord, that service tells Clerk who you are and shares your name, email
          address and profile picture. Their own privacy policies cover what they do on their side.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>Under the GDPR you can ask to:</p>
        <LegalList>
          <li>see the data held about you, and get a copy of it;</li>
          <li>correct it, or have it deleted;</li>
          <li>limit how it is used, or object to its use for security logging.</li>
        </LegalList>
        <p>
          You can do most of this yourself. Edit your name and email in the account menu, delete quizzes from{" "}
          <TextLink href="/creator">My quizzes</TextLink>, and delete your account from the account menu, which also
          deletes your quizzes. For anything else, email <ContactLink />. You get an answer within one month.
        </p>
        <p>
          If you think your data is being mishandled, you can complain to the {LEGAL.authority.name},{" "}
          {LEGAL.authority.address}, <TextLink href={LEGAL.authority.url}>dataprotectionauthority.be</TextLink>, or to the
          authority in the EU country where you live.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          You need to be at least {LEGAL.minimumAccountAge} to create an account. Anyone can play with a room code, without an
          account. Younger players should use a nickname rather than their real name.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this notice">
        <p>
          If what Jeopardy collects changes, this page is updated and the date at the top changes with it. See also the{" "}
          <TextLink href="/terms">terms of use</TextLink>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
