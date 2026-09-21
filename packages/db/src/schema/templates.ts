import { sql } from 'drizzle-orm';
import { index, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const templates = pgTable(
  'templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    // a template exists to produce an html body, so unlike emails it cannot be text only
    html: text('html').notNull(),
    text: text('text'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Drizzle moves this on every update, so an edit query cannot forget to
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  // names are not unique, matching api_keys, because a template is addressed by id
  (table) => [index('templates_user_id_idx').on(table.userId)],
).enableRLS();

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
