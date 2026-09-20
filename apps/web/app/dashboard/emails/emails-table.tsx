import type { EmailSummary } from '@dispatch/db';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatRelative, formatUtc } from '../format-time';
import { EmailStatusPill } from './email-status-pill';

function formatRecipients(to: string[]): string {
  const [first, ...rest] = to;
  if (!first) return '';

  return rest.length > 0 ? `${first} +${rest.length}` : first;
}

export function EmailsTable({ emails }: { emails: EmailSummary[] }) {
  const now = Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>To</Th>
            <Th>Subject</Th>
            <Th>Status</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr
              key={email.id}
              className="dispatch-transition relative border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td className="h-row px-5 align-middle text-text-primary">
                {formatRecipients(email.to)}
              </td>
              <td className="h-row px-5 align-middle text-text-primary">
                {/* stretched over the row, so the whole row is the target and this stays a real link */}
                <Link
                  href={`/dashboard/emails/${email.id}`}
                  className="rounded-xs text-text-primary outline-none after:absolute after:inset-0 focus-visible:shadow-focus"
                >
                  {email.subject}
                </Link>
              </td>
              <td className="h-row px-5 align-middle">
                <EmailStatusPill status={email.status} />
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                <time dateTime={email.createdAt.toISOString()} title={formatUtc(email.createdAt)}>
                  {formatRelative(email.createdAt, now)}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="h-header-row whitespace-nowrap px-5 text-left text-meta font-medium text-text-secondary"
    >
      {children}
    </th>
  );
}
