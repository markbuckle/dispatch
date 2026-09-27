import type { Metadata } from 'next';
import { LegalSection, LegalShell, legalList, legalText } from '../legal-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy - Dispatch',
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="27 September 2026">
      <LegalSection heading="What this is">
        <p className={legalText}>
          Dispatch is a portfolio project that demonstrates an email API. It is not a commercial
          service. It does send real email through AWS SES, so what you put into it is real data in
          real systems.
        </p>
      </LegalSection>

      <LegalSection heading="What Dispatch stores">
        <ul className={legalList}>
          <li>
            Your email address, and a display name if you set one. Supabase handles passwords and
            Dispatch never receives one. Signing in with Google or GitHub passes on the email
            address of that account.
          </li>
          <li>The domains you add, and the DKIM tokens AWS issues for them.</li>
          <li>
            API keys as a hash and a short prefix. The key itself is shown once, at creation, and is
            never stored.
          </li>
          <li>Templates: the name, the subject, and both bodies you write.</li>
          <li>
            Emails you send: the sender, the recipients, the subject, the html and text bodies, the
            status, and the delivery events AWS reports back.
          </li>
          <li>
            Webhook endpoints: the url, its signing secret, and every delivery attempt with the
            status code it returned.
          </li>
          <li>
            A record of every request your API keys make: the method, path, status code, duration,
            and time.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who else processes it">
        <ul className={legalList}>
          <li>Supabase: accounts, sign in, and the Postgres database all of the above lives in.</li>
          <li>
            AWS SES and SNS: sending the mail, holding your verified domains, and reporting
            deliveries and bounces.
          </li>
          <li>Vercel: hosting.</li>
          <li>Upstash: Redis, holding rate limit counters and nothing else.</li>
          <li>Inngest: runs the send and webhook jobs, so a queued email passes through it.</li>
          <li>
            PostHog: feature flags. Flags are resolved on the server against definitions downloaded
            in advance, so no page view or event about you is sent.
          </li>
          <li>
            Resend: sends the confirmation and password reset email, until Dispatch&apos;s own
            sending pipeline takes that over.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p className={legalText}>
          Supabase&apos;s session cookies, which keep you signed in. Nothing else. There is no
          analytics script on any page.
        </p>
      </LegalSection>

      <LegalSection heading="How long it is kept">
        <p className={legalText}>
          Until you delete your account. There is no retention window on sent email or request logs
          yet.
        </p>
      </LegalSection>

      <LegalSection heading="Deleting your account">
        <p className={legalText}>
          The Danger zone on your profile removes your domains, keys, templates, emails, and
          webhooks. Two things it does not remove. Your request logs stay, with the account detached
          from them. Any domain you verified stays registered as an identity in Dispatch&apos;s AWS
          account until it is removed by hand.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
