import { EmptyState } from '../empty-state';

export default function DomainsPage() {
  return (
    <EmptyState
      title="No domains yet"
      body="Domain verification hasn't shipped. You'll add a domain and check its SPF and DKIM records here."
    />
  );
}
