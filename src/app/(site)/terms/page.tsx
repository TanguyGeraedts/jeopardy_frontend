import type { Metadata } from "next";
import { ContactLink, LegalList, LegalPage, LegalSection, TextLink } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for building, publishing and hosting quizzes.",
};

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of use"
      intro={<p>Jeopardy is a free tool for building quiz boards and hosting them live. Using it means you accept these terms.</p>}
    >
      <LegalSection id="service" title="The service">
        <p>
          Jeopardy is run by {LEGAL.operatorName}, a private individual in {LEGAL.country}, as a free, non-commercial project. Nothing is ever charged, so there are no fees and nothing to refund.
          With an account you can build quizzes, publish them for others and host games. Players join with a room code and
          don&apos;t need an account.
        </p>
      </LegalSection>

      <LegalSection id="account" title="Your account">
        <p>
          You need to be at least {LEGAL.minimumAccountAge} to create an account. Keep your sign-in details to yourself; you
          are responsible for what happens under your account. You can delete it at any time from the account menu.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Your quizzes">
        <p>
          Quizzes you make stay yours. By saving one, you allow the operator to store it and show it to you, and, once you
          publish it, to show it to everyone on Discover with your name as the author. Unpublishing or deleting a quiz ends
          that.
        </p>
        <p>Only add questions and media you are allowed to use. Don&apos;t publish quizzes that:</p>
        <LegalList>
          <li>are hateful, harassing, sexual or violent, or break the law;</li>
          <li>contain someone else&apos;s personal details;</li>
          <li>use material that infringes someone else&apos;s copyright.</li>
        </LegalList>
        <p>
          Found a quiz that breaks these rules? Email <ContactLink /> with a link to it. The operator can unpublish or delete
          quizzes that break these terms, and close accounts that keep doing so.
        </p>
      </LegalSection>

      <LegalSection id="games" title="Hosting and playing">
        <p>
          Hosts decide who plays and can adjust scores. Players should pick a display name that isn&apos;t offensive and
          doesn&apos;t pretend to be someone else. Don&apos;t automate buzzes, flood the service with requests, or try to get
          into games or accounts that aren&apos;t yours.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="Availability">
        <p>
          The service is provided as it is, without guarantees. It may be interrupted, changed or stopped at any time. Keep
          your own copy of anything you can&apos;t afford to lose.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <p>
          Because the service is free, the operator is not liable for damage caused by using it or by it being unavailable,
          as far as the law allows. This doesn&apos;t limit liability for intent or gross negligence, or any rights you have
          under mandatory consumer law.
        </p>
      </LegalSection>

      <LegalSection id="ownership" title="Ownership">
        <p>
          The site&apos;s own design and code belong to the operator. &ldquo;Jeopardy!&rdquo; is a trademark of its owner;
          this project is not affiliated with or endorsed by the TV show.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy">
        <p>
          How your data is handled is set out in the <TextLink href="/privacy">privacy notice</TextLink>.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Changes and applicable law">
        <p>
          These terms may change; the version on this page applies from the date at the top. Belgian law applies. If you live
          in another EU country, you keep the protection of that country&apos;s mandatory consumer law.
        </p>
        <p>
          Questions about these terms: <ContactLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
