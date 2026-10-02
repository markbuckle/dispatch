import type { Domain } from '@dispatch/db';
import { pillTones, type StatusTone } from '../status-tone';

// labels and tones are fixed in foundations/vocabulary.md, so they are never paraphrased here
const statuses: Record<Domain['status'], { label: string; tone: StatusTone }> = {
  not_started: { label: 'Not started', tone: 'neutral' },
  pending: { label: 'Pending', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  temporary_failure: { label: 'Temporary failure', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
};

export function domainStatusTone(status: Domain['status']): StatusTone {
  return statuses[status].tone;
}

export function DomainStatusPill({ status }: { status: Domain['status'] }) {
  const { label, tone } = statuses[status];

  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${pillTones[tone]}`}
    >
      {label}
    </span>
  );
}
