import { EmptyState } from '../empty-state';

export default function EmailsPage() {
  return (
    <EmptyState
      title="No email sent yet"
      body="The send pipeline hasn't shipped. Sent email will land here once POST /v1/emails goes live."
    />
  );
}
