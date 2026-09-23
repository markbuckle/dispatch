import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isFeatureEnabled, WEBHOOKS } from '../../../../lib/flags/is-feature-enabled';
import { EmptyState } from '../../empty-state';
import { getWebhook, listDeliveries } from '../actions';
import { eventLabels } from '../events';
import { DeliveriesTable } from './deliveries-table';

export default async function WebhookPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isFeatureEnabled(WEBHOOKS))) notFound();

  const { id } = await params;
  const webhook = await getWebhook(id);
  if (!webhook) notFound();

  const deliveries = await listDeliveries(webhook.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard/webhooks"
          className="dispatch-transition w-max rounded-xs text-meta text-text-secondary outline-none hover:text-text-primary focus-visible:shadow-focus"
        >
          Webhooks
        </Link>
        <header className="flex flex-col gap-1.5">
          <h1 className="font-display text-h1 break-all text-text-primary">{webhook.url}</h1>
          <p className="text-body text-text-secondary">
            {webhook.events.map((event) => eventLabels[event]).join(', ')}
          </p>
        </header>
      </div>

      {deliveries.length > 0 ? (
        <DeliveriesTable deliveries={deliveries} />
      ) : (
        <div className="rounded-lg border border-border-default">
          <EmptyState
            title="Nothing sent yet"
            body="Every attempt Dispatch makes against this endpoint shows up here, with the status code it got back."
          />
        </div>
      )}
    </div>
  );
}
