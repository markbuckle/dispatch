import type { DeliverySummary } from '@dispatch/db';
import type { ReactNode } from 'react';
import { formatRelative, formatUtc } from '../../format-time';
import { DeliveryStatusPill } from '../delivery-status-pill';
import { eventLabels } from '../events';
import { ReplayDeliveryButton } from './replay-delivery-button';

export function DeliveriesTable({ deliveries }: { deliveries: DeliverySummary[] }) {
  const now = Date.now();

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      <table className="w-full border-collapse text-body">
        <thead className="bg-subtle">
          <tr>
            <Th>Event</Th>
            <Th>Status</Th>
            <Th>Attempts</Th>
            <Th>Last response</Th>
            <Th>Created</Th>
            <th className="h-header-row px-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => (
            <tr
              key={delivery.id}
              className="dispatch-transition border-b border-border-subtle last:border-b-0 hover:bg-surface"
            >
              <td className="h-row px-5 align-middle text-text-primary">
                {eventLabels[delivery.eventType]}
              </td>
              <td className="h-row px-5 align-middle">
                <DeliveryStatusPill status={delivery.status} />
              </td>
              <td className="h-row px-5 align-middle text-text-secondary">
                {delivery.attemptCount}
              </td>
              <td className="h-row px-5 align-middle text-text-secondary">
                {delivery.lastResponseStatus ?? (
                  // a refused connection or a timeout never produced a status code to show
                  <span className="text-text-muted" title={delivery.lastError ?? undefined}>
                    {delivery.lastError ? 'No response' : '-'}
                  </span>
                )}
              </td>
              <td className="h-row px-5 align-middle text-text-muted">
                <time
                  dateTime={delivery.createdAt.toISOString()}
                  title={formatUtc(delivery.createdAt)}
                >
                  {formatRelative(delivery.createdAt, now)}
                </time>
              </td>
              <td className="h-row px-5 align-middle">
                {delivery.status === 'failed' && <ReplayDeliveryButton id={delivery.id} />}
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
