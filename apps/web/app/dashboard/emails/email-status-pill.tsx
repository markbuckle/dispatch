import type { Email } from '@dispatch/db';

// labels and tones are fixed in foundations/vocabulary.md, so they are never paraphrased here
const pills: Record<Email['status'], { label: string; tone: string }> = {
  queued: { label: 'Queued', tone: 'bg-warning-bg text-warning-fg' },
  // neutral, because success belongs to Delivered and handing off to SES is not confirmation
  sent: { label: 'Sent', tone: 'bg-neutral-bg text-neutral-fg' },
  failed: { label: 'Failed', tone: 'bg-danger-bg text-danger-fg' },
  delivered: { label: 'Delivered', tone: 'bg-success-bg text-success-fg' },
  bounced: { label: 'Bounced', tone: 'bg-danger-bg text-danger-fg' },
  complained: { label: 'Complained', tone: 'bg-danger-bg text-danger-fg' },
  // vocabulary.md calls a temporary rejection Deferred, whatever SES names the event
  delivery_delayed: { label: 'Deferred', tone: 'bg-warning-bg text-warning-fg' },
};

export function EmailStatusPill({ status }: { status: Email['status'] }) {
  const { label, tone } = pills[status];

  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${tone}`}
    >
      {label}
    </span>
  );
}
