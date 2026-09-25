import {
  index,
  integer,
  pgSchema,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { apiKeys } from './api-keys';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const requestLogs = pgTable(
  'request_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // null when a request never authenticated, and set null on deletion so a log outlives the account
    userId: uuid('user_id').references(() => authUsers.id, { onDelete: 'set null' }),
    // set null rather than cascade, because revoking a key should not erase what it did
    apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
    method: text('method').notNull(),
    path: text('path').notNull(),
    status: smallint('status').notNull(),
    durationMs: integer('duration_ms').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // the shape the dashboard reads: one account, newest first
  (table) => [index('request_logs_user_id_created_at_idx').on(table.userId, table.createdAt)],
).enableRLS();

export type RequestLog = typeof requestLogs.$inferSelect;
export type NewRequestLog = typeof requestLogs.$inferInsert;
