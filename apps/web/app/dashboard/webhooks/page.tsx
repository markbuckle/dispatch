import type { Metadata } from 'next';
import { isFeatureEnabled, WEBHOOKS } from '../../../lib/flags/is-feature-enabled';
import { EmptyState } from '../empty-state';
import { listWebhooks } from './actions';
import { CreateWebhookDialog } from './create-webhook-dialog';
import { WebhooksDisabled } from './webhooks-disabled';
import { WebhooksTable } from './webhooks-table';

export const metadata: Metadata = {
  title: 'Webhooks - Dispatch',
};

export default async function WebhooksPage() {
  if (!(await isFeatureEnabled(WEBHOOKS))) return <WebhooksDisabled />;

  const webhooks = await listWebhooks();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-h1 text-text-primary">Webhooks</h1>
        <CreateWebhookDialog />
      </header>
      {webhooks.length > 0 ? (
        <WebhooksTable webhooks={webhooks} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="No endpoints yet"
            body="Dispatch POSTs to your endpoint when an email is delivered, bounces, or is marked as spam."
          />
        </div>
      )}
    </div>
  );
}
