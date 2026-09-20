import type { Email } from '@dispatch/db';

// labels and tones are fixed in foundations/vocabulary.md, so they are never paraphrased here
const pills: Record<Email['status'], { label: string; tone: string }> = {
  queued: { label: 'Queued', tone: 'bg-warning-bg text-warning-fg' },
  // neutral, because success belongs to Delivered and nothing confirms that until webhooks land
  sent: { label: 'Sent', tone: 'bg-neutral-bg text-neutral-fg' },
  failed: { label: 'Failed', tone: 'bg-danger-bg text-danger-fg' },
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
