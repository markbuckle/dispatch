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

export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const apiKeyPermission = pgEnum('api_key_permission', ['full_access', 'sending_access']);

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    hashedKey: text('hashed_key').notNull(),
    // a key is revealed once, so the prefix is all the dashboard has to identify it by later
    keyPrefix: text('key_prefix').notNull(),
    permission: apiKeyPermission('permission').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    // hard deleting would lose the audit trail of what the key sent while it was live
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    // every authenticated request looks a key up by this hash
    uniqueIndex('api_keys_hashed_key_idx').on(table.hashedKey),
    index('api_keys_user_id_idx').on(table.userId),
  ],
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
