import type { Metadata } from "next";
import { ContactLink, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Who runs Jeopardy and how to reach them.",
};

export default function LegalNoticePage() {
  return (
    <LegalPage current="/legal" title="Legal notice" intro={<p>Who runs this site and how to reach them.</p>}>
      <LegalSection id="operator" title="Operator">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-chalk/60">Name</dt>
          <dd>{LEGAL.operatorName}</dd>
          <dt className="text-chalk/60">Status</dt>
          <dd>Private individual, non-commercial project</dd>
          <dt className="text-chalk/60">Country</dt>
          <dd>{LEGAL.country}</dd>
          <dt className="text-chalk/60">Email</dt>
          <dd>
            <ContactLink />
          </dd>
        </dl>
      </LegalSection>

      <LegalSection id="hosting" title="Hosting">
        <p>
          {LEGAL.hosting.name}, {LEGAL.hosting.address}.
        </p>
      </LegalSection>

      <LegalSection id="trademark" title="Trademark">
        <p>&ldquo;Jeopardy!&rdquo; is a trademark of its owner. This project is not affiliated with or endorsed by the TV show.</p>
      </LegalSection>
    </LegalPage>
  );
}
