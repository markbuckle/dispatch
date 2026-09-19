import { EmptyState } from '../empty-state';
import { listDomains } from './actions';
import { AddDomainDialog } from './add-domain-dialog';
import { DomainsTable } from './domains-table';

export default async function DomainsPage() {
  const domains = await listDomains();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-h1 text-text-primary">Domains</h1>
        <AddDomainDialog />
      </header>
      {domains.length > 0 ? (
        <DomainsTable domains={domains} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No domains yet"
            body="Add a domain to get the 3 DKIM records that verify it."
          />
        </div>
      )}
    </div>
  );
}
