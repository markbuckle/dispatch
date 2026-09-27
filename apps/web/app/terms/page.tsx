import type { Metadata } from 'next';
import { LegalSection, LegalShell, legalList, legalText } from '../legal-shell';

export const metadata: Metadata = {
  title: 'Terms of Service - Dispatch',
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="27 September 2026">
      <LegalSection heading="What this is">
        <p className={legalText}>
          Dispatch is a portfolio project that demonstrates an email API. It is not a commercial
          service, there is no paid plan, and there is no service level agreement. It can be taken
          offline at any time without notice.
        </p>
      </LegalSection>

      <LegalSection heading="Using it">
        <ul className={legalList}>
          <li>
            Send only to people who asked to hear from you, and only from domains you control.
          </li>
          <li>
            Send nothing unlawful, and nothing AWS&apos;s acceptable use policy prohibits. AWS
            carries the mail, so its rules apply to your sends alongside these.
          </li>
          <li>
            Requests are limited to 10 per 10 seconds per API key. Over that limit the api returns{' '}
            <span className="font-mono text-mono">429</span> with a{' '}
            <span className="font-mono text-mono">Retry-After</span> header.
          </li>
          <li>Keep your API keys secret. Anything sent with your key counts as sent by you.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Your content">
        <p className={legalText}>
          The templates and email bodies you write stay yours. Dispatch stores them and sends them
          to run the service, and does nothing else with them.
        </p>
      </LegalSection>

      <LegalSection heading="No warranty">
        <p className={legalText}>
          Dispatch is provided as is, with no warranty of any kind. It may lose a queued email,
          report a status late, or stop working. Do not use it for anything you cannot afford to
          have fail.
        </p>
      </LegalSection>

      <LegalSection heading="Ending it">
        <p className={legalText}>
          Delete your account whenever you like, from the Danger zone on your profile. Your account
          may also be removed, along with the whole service, without notice.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p className={legalText}>
          These terms can change. The date at the top is when they last did.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
