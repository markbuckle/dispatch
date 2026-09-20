'use server';

import { type Email, type EmailSummary, findEmailForUser, listEmailsForUser } from '@dispatch/db';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';

export async function listEmails(): Promise<EmailSummary[]> {
  return listEmailsForUser(await requireUserId());
}

export async function getEmail(id: string): Promise<Email | undefined> {
  // Postgres rejects a malformed uuid rather than returning nothing, so the id is checked first
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return undefined;

  return findEmailForUser(parsed.data, await requireUserId());
}
