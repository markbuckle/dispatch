import type { WebhookSummary } from '@dispatch/db';

export type EmailEventType = WebhookSummary['events'][number];

// the words are fixed in foundations/vocabulary.md, which calls a temporary rejection Deferred
export const eventLabels: Record<EmailEventType, string> = {
  sent: 'Sent',
  delivered: 'Delivered',
  bounced: 'Bounced',
  complained: 'Complained',
  delivery_delayed: 'Deferred',
};
