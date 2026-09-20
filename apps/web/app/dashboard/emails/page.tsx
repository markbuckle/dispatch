import { EmptyState } from '../empty-state';
import { listEmails } from './actions';
import { EmailsTable } from './emails-table';

export default async function EmailsPage() {
  const emails = await listEmails();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-h1 text-text-primary">Emails</h1>
      </header>
      {emails.length > 0 ? (
        <EmailsTable emails={emails} />
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
