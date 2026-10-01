import type { Email } from '@dispatch/db';
import { type EmailStatusTone, emailStatusLabel, emailStatusTone } from './email-status';

const tones: Record<EmailStatusTone, string> = {
  success: 'bg-success-bg text-success-fg',
  warning: 'bg-warning-bg text-warning-fg',
  danger: 'bg-danger-bg text-danger-fg',
};

export function EmailStatusPill({ status }: { status: Email['status'] }) {
  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${tones[emailStatusTone(status)]}`}
    >
      {emailStatusLabel(status)}
    </span>
  );
}
