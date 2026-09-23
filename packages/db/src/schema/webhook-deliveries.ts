import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { emailEventType } from './email-events';
import { webhooks } from './webhooks';

export const webhookDeliveryStatus = pgEnum('webhook_delivery_status', [
  'pending',
  'succeeded',
  'failed',
]);

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const webhookDeliveries = pgTable(
  'webhook_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    webhookId: uuid('webhook_id')
      .notNull()
      .references(() => webhooks.id, { onDelete: 'cascade' }),
    // the webhook-id header, set once here and resent by every retry, because it is how a receiver dedupes
    messageId: text('message_id').notNull(),
    eventType: emailEventType('event_type').notNull(),
    // the exact body that was signed, so a retry resends bytes rather than serializing again
    payload: jsonb('payload').notNull(),
    status: webhookDeliveryStatus('status').notNull(),
    attemptCount: integer('attempt_count').notNull().default(0),
    // null when the attempt never got a response, which is a timeout rather than a refusal
    lastResponseStatus: integer('last_response_status'),
    lastError: text('last_error'),
    // null once no attempt is owed, so the retry job reads a due time rather than recomputing backoff
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Drizzle moves this on every update, so recording an attempt cannot forget to
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [index('webhook_deliveries_webhook_id_idx').on(table.webhookId)],
).enableRLS();

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
