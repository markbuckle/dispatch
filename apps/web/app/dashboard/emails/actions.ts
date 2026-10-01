'use server';

import {
  type Email,
  type EmailSummary,
  findEmailForUser,
  hasAnyEmailForUser,
  listEmailsForUser,
} from '@dispatch/db';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';
import { dateRanges } from './date-ranges';
import { type EmailFilters, emailFiltersSchema } from './email-filters';

const DAY_MS = 86_400_000;

export async function listEmails(
  filters: EmailFilters,
): Promise<{ emails: EmailSummary[]; hasAnyEmail: boolean }> {
  // a server action is a public endpoint, so the filters are checked again whoever called it
  const { status, range } = emailFiltersSchema.parse(filters);
  const userId = await requireUserId();
  const since = new Date(Date.now() - dateRanges[range].days * DAY_MS);

  const emails = await listEmailsForUser(userId, { status, since });
  const hasAnyEmail = emails.length > 0 || (await hasAnyEmailForUser(userId));

  return { emails, hasAnyEmail };
}

export async function getEmail(id: string): Promise<Email | undefined> {
  // Postgres rejects a malformed uuid rather than returning nothing, so the id is checked first
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return undefined;

  return findEmailForUser(parsed.data, await requireUserId());
}
