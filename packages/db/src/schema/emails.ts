import { index, pgEnum, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const emailStatus = pgEnum('email_status', [
  'queued',
  'sent',
  'failed',
  'delivered',
  'bounced',
  'complained',
  'delivery_delayed',
]);

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const emails = pgTable(
  'emails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    // from and to are reserved words, so the columns are spelled out while the properties match Transport
    to: text('to_addresses').array().notNull(),
    from: text('from_address').notNull(),
    subject: text('subject').notNull(),
    // an email is html, plain text, or both, so neither column can be required on its own
    html: text('html'),
    text: text('text'),
    // denormalized latest event; email_events is the record, and a late sent cannot undo delivered
    status: emailStatus('status').notNull(),
    providerMessageId: text('provider_message_id'),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
  },
  (table) => [index('emails_user_id_idx').on(table.userId)],
).enableRLS();

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
