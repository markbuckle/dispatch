import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type ApiKey, apiKeys, type NewApiKey } from '../schema/api-keys';

// the hash never leaves the database, and the raw key exists only in the response that creates it
export type ApiKeySummary = Pick<
  ApiKey,
  'id' | 'name' | 'keyPrefix' | 'permission' | 'createdAt' | 'lastUsedAt' | 'revokedAt'
>;

export async function listApiKeysForUser(userId: string): Promise<ApiKeySummary[]> {
  return getDb()
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      permission: apiKeys.permission,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
}

export type AuthenticatedApiKey = Pick<ApiKey, 'id' | 'userId' | 'permission'>;

// one round trip authenticates and records the use; a revoked key matches nothing and reads as unknown
export async function authenticateApiKey(
  hashedKey: string,
): Promise<AuthenticatedApiKey | undefined> {
  const [key] = await getDb()
    .update(apiKeys)
    .set({ lastUsedAt: sql`now()` })
    .where(and(eq(apiKeys.hashedKey, hashedKey), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id, userId: apiKeys.userId, permission: apiKeys.permission });

  return key;
}

export async function insertApiKey(values: NewApiKey): Promise<void> {
  await getDb().insert(apiKeys).values(values);
}

// the owner is part of the match, so a guessed id from another account revokes nothing
export async function revokeApiKeyForUser(id: string, userId: string): Promise<boolean> {
  const revoked = await getDb()
    .update(apiKeys)
    .set({ revokedAt: sql`now()` })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .returning({ id: apiKeys.id });

  return revoked.length > 0;
}
