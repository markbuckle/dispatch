import { EmptyState } from '../empty-state';

export default function WebhooksPage() {
  return (
    <EmptyState
      title="No webhooks yet"
      body="Webhook signing and retries haven't shipped. You'll configure an endpoint here once they do."
    />
  );
}
