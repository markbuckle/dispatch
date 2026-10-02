import type { Email } from '@dispatch/db';
import { pillTones } from '../status-tone';
import { emailStatusLabel, emailStatusTone } from './email-status';

export function EmailStatusPill({ status }: { status: Email['status'] }) {
  return (
    <span
      className={`inline-flex h-pill w-max items-center whitespace-nowrap rounded-sm px-2.5 text-pill ${pillTones[emailStatusTone(status)]}`}
    >
      {emailStatusLabel(status)}
    </span>
  );
}
