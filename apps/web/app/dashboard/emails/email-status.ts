import type { EmailStatus } from '@dispatch/db';

export type EmailStatusTone = 'success' | 'warning' | 'danger';

// labels and tones are fixed in foundations/vocabulary.md, so they are never paraphrased here
const statuses: Record<EmailStatus, { label: string; tone: EmailStatusTone }> = {
  queued: { label: 'Queued', tone: 'warning' },
  sent: { label: 'Sent', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  delivered: { label: 'Delivered', tone: 'success' },
  bounced: { label: 'Bounced', tone: 'danger' },
  complained: { label: 'Complained', tone: 'danger' },
  // vocabulary.md calls a temporary rejection Deferred, whatever SES names the event
  delivery_delayed: { label: 'Deferred', tone: 'warning' },
};

export function emailStatusLabel(status: EmailStatus): string {
  return statuses[status].label;
}

export function emailStatusTone(status: EmailStatus): EmailStatusTone {
  return statuses[status].tone;
}
