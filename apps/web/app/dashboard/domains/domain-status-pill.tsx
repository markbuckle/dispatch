import type { Domain } from '@dispatch/db';

// labels and tones are fixed in foundations/vocabulary.md, so they are never paraphrased here
const pills: Record<Domain['status'], { label: string; tone: string }> = {
  not_started: { label: 'Not started', tone: 'bg-neutral-bg text-neutral-fg' },
  pending: { label: 'Pending', tone: 'bg-warning-bg text-warning-fg' },
  verified: { label: 'Verified', tone: 'bg-success-bg text-success-fg' },
  temporary_failure: { label: 'Temporary failure', tone: 'bg-warning-bg text-warning-fg' },
  failed: { label: 'Failed', tone: 'bg-danger-bg text-danger-fg' },
};

export function DomainStatusPill({ status }: { status: Domain['status'] }) {
  const { label, tone } = pills[status];

  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${tone}`}
    >
      {label}
    </span>
  );
}
