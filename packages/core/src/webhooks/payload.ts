import type { EmailEvent } from '@dispatch/db';

// derived from the column, so a new event type cannot exist in the database and not here
export type WebhookEventType = EmailEvent['type'];

export type WebhookPayloadInput = {
  type: WebhookEventType;
  occurredAt: Date;
  emailId: string;
  from: string;
  to: string[];
  subject: string;
};

export type WebhookPayload = {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
  };
};

// snake_case and an email. prefix, because a receiver written against Resend's shape should not need editing
export function buildWebhookPayload({
  type,
  occurredAt,
  emailId,
  from,
  to,
  subject,
}: WebhookPayloadInput): WebhookPayload {
  return {
    type: `email.${type}`,
    created_at: occurredAt.toISOString(),
    data: { email_id: emailId, from, to, subject },
  };
}
