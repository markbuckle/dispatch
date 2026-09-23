import {
  index,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { emails } from './emails';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const emailEventType = pgEnum('email_event_type', [
  'sent',
  'delivered',
  'bounced',
  'complained',
  'delivery_delayed',
]);

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const emailEvents = pgTable(
  'email_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    emailId: uuid('email_id')
      .notNull()
      .references(() => emails.id, { onDelete: 'cascade' }),
    // denormalized off the email so Phase 11 can aggregate an account without joining every row
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    type: emailEventType('type').notNull(),
    // when SES says it happened, which is not when we received it and not the order we received it in
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    payload: jsonb('payload').notNull(),
    // null for anything we raise ourselves, because only a provider notification carries one
    providerEventId: text('provider_event_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // SNS redelivers on any doubt about the first attempt, so the provider's id is what stops a double insert
    uniqueIndex('email_events_provider_event_id_idx').on(table.providerEventId),
    index('email_events_email_id_idx').on(table.emailId),
    // the shape every Phase 11 metric reads: one account, over a window
    index('email_events_user_id_occurred_at_idx').on(table.userId, table.occurredAt),
  ],
).enableRLS();

export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;
