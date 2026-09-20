import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { CopyButton } from '../../copy-button';
import { formatUtc } from '../../format-time';
import { getEmail } from '../actions';
import { EmailHtml } from '../email-html';
import { EmailStatusPill } from '../email-status-pill';

export default async function EmailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = await getEmail(id);
  if (!email) notFound();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/emails"
          className="dispatch-transition w-max rounded-xs text-meta text-text-secondary outline-none hover:text-text-primary focus-visible:shadow-focus"
        >
          Emails
        </Link>
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-display text-h1 text-text-primary">{email.subject}</h1>
          <EmailStatusPill status={email.status} />
        </header>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-lg border border-border-default p-5">
        <Field label="From">{email.from}</Field>
        <Field label="To">{email.to.join(', ')}</Field>
        <Field label="Created">
          <time dateTime={email.createdAt.toISOString()}>{formatUtc(email.createdAt)}</time>
        </Field>
        <Field label="Sent">
          {email.sentAt ? (
            <time dateTime={email.sentAt.toISOString()}>{formatUtc(email.sentAt)}</time>
          ) : (
            <span className="text-text-muted">Not yet</span>
          )}
        </Field>
        {email.providerMessageId && (
          <Field label="Message id">
            <span className="flex items-center gap-2">
              <span className="truncate font-mono text-mono">{email.providerMessageId}</span>
              <CopyButton value={email.providerMessageId} label="message id" />
            </span>
          </Field>
        )}
        {email.error && (
          <Field label="Error">
            <span className="text-danger-fg">{email.error}</span>
          </Field>
        )}
      </dl>

      {email.html && <EmailHtml html={email.html} />}

      {email.text && (
        <section className="flex flex-col gap-3">
          <h2 className="text-meta font-medium text-text-secondary">Text</h2>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border-default bg-subtle p-4 font-mono text-mono text-text-secondary">
            {email.text}
          </pre>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="text-meta text-text-secondary">{label}</dt>
      <dd className="min-w-0 text-body text-text-primary">{children}</dd>
    </div>
  );
}
