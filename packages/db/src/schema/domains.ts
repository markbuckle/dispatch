import {
  index,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Supabase owns auth.users, so this declares only enough of it to hang a foreign key on
const authSchema = pgSchema('auth');

// unexported because drizzle-kit generates CREATE TABLE for every exported table, and this one already exists
const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const domainStatus = pgEnum('domain_status', [
  'not_started',
  'pending',
  'verified',
  'failed',
  'temporary_failure',
]);

// Supabase serves public tables over REST with the browser's key; Drizzle connects as owner and bypasses RLS
export const domains = pgTable(
  'domains',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    status: domainStatus('status').notNull(),
    dkimTokens: text('dkim_tokens').array().notNull(),
    // the CNAME target varies by region, so it is stored rather than assumed to be dkim.amazonses.com
    dkimHostedZone: text('dkim_hosted_zone').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (table) => [
    // SES holds one identity per name per region across the whole account, so two users cannot share one
    uniqueIndex('domains_name_idx').on(table.name),
    index('domains_user_id_idx').on(table.userId),
  ],
).enableRLS();

export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
