import type { DeliverySummary } from '@dispatch/db';

// Delivered here means the request reached your server, not that the email reached an inbox
const pills: Record<DeliverySummary['status'], { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'bg-warning-bg text-warning-fg' },
  succeeded: { label: 'Delivered', tone: 'bg-success-bg text-success-fg' },
  failed: { label: 'Failed', tone: 'bg-danger-bg text-danger-fg' },
};

export function DeliveryStatusPill({ status }: { status: DeliverySummary['status'] }) {
  const { label, tone } = pills[status];

  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${tone}`}
    >
      {label}
    </span>
  );
}
