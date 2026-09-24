import type { EmailEventType } from '../event-labels';

// the descriptions belong to the create dialog, unlike the labels, which the metrics cards share
export const eventOptions: { value: EmailEventType; description: string }[] = [
  { value: 'sent', description: 'Handed to the provider for delivery.' },
  { value: 'delivered', description: 'Confirmed at the destination.' },
  { value: 'bounced', description: 'Permanently rejected.' },
  { value: 'complained', description: 'The recipient marked it as spam.' },
  { value: 'delivery_delayed', description: 'Temporarily rejected. Dispatch retries.' },
];
