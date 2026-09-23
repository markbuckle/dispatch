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

export const eventOptions: { value: EmailEventType; description: string }[] = [
  { value: 'sent', description: 'Handed to the provider for delivery.' },
  { value: 'delivered', description: 'Confirmed at the destination.' },
  { value: 'bounced', description: 'Permanently rejected.' },
  { value: 'complained', description: 'The recipient marked it as spam.' },
  { value: 'delivery_delayed', description: 'Temporarily rejected. Dispatch retries.' },
];
