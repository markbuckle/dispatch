'use server';

import { generateApiKey } from '@dispatch/core';
import {
  type ApiKeySummary,
  apiKeyPermission,
  insertApiKey,
  listApiKeysForUser,
  revokeApiKeyForUser,
} from '@dispatch/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';

const KEYS_PATH = '/dashboard/api-keys';

const createApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name for this key.')
    .max(40, 'Use 40 characters or fewer.'),
  permission: z.enum(apiKeyPermission.enumValues, { error: 'Choose what this key can do.' }),
});

export type CreateApiKeyInput = z.input<typeof createApiKeySchema>;

export type CreateApiKeyResult =
  | { status: 'created'; key: string }
  | { status: 'rejected'; message: string };

export type RevokeApiKeyResult = { status: 'revoked' } | { status: 'rejected'; message: string };

export async function listApiKeys(): Promise<ApiKeySummary[]> {
  return listApiKeysForUser(await requireUserId());
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const userId = await requireUserId();
  const parsed = createApiKeySchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  // a test key would behave exactly like a live one until the send pipeline exists
  const { key, keyPrefix, hashedKey } = generateApiKey('live');
  await insertApiKey({
    userId,
    name: parsed.data.name,
    permission: parsed.data.permission,
    keyPrefix,
    hashedKey,
  });
  revalidatePath(KEYS_PATH);

  // the one response that carries the raw key; the row keeps only its hash
  return { status: 'created', key };
}

export async function revokeApiKey(id: string): Promise<RevokeApiKeyResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) {
    return { status: 'rejected', message: 'That key no longer exists.' };
  }

  if (!(await revokeApiKeyForUser(parsed.data, userId))) {
    return { status: 'rejected', message: 'That key was revoked already.' };
  }
  revalidatePath(KEYS_PATH);

  return { status: 'revoked' };
}
