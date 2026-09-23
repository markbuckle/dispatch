import { index, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { emailEventType } from './email-events';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const webhooks = pgTable(
  'webhooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    // an endpoint subscribes to a subset, so a bounce handler is not woken by every delivery
    events: emailEventType('events').array().notNull(),
    // stored as issued, unlike an api key hash, because signing has to reproduce the secret itself
    signingSecret: text('signing_secret').notNull(),
    // disabling keeps the delivery history that a delete would take with it
    disabledAt: timestamp('disabled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('webhooks_user_id_idx').on(table.userId)],
).enableRLS();

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
