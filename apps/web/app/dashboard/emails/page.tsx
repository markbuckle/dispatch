import { emailStatus } from '@dispatch/db';
import type { Metadata } from 'next';
import { EmptyState } from '../empty-state';
import { listEmails } from './actions';
import { emailFiltersSchema } from './email-filters';
import { EmailsView } from './emails-view';

export const metadata: Metadata = {
  title: 'Emails - Dispatch',
};

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = emailFiltersSchema.parse(await searchParams);
  const { emails, hasAnyEmail } = await listEmails(filters);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-h1 text-text-primary">Emails</h1>
      </header>
      {hasAnyEmail ? (
        <EmailsView
          emails={emails}
          now={Date.now()}
          status={filters.status}
          range={filters.range}
          statuses={emailStatus.enumValues}
        />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No email sent yet"
            body="Send one with POST /v1/emails and it lands here."
          />
        </div>
      )}
    </div>
  );
}
