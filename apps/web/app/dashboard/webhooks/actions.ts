'use server';

import { generateSigningSecret } from '@dispatch/core';
import {
  deleteWebhookForUser,
  emailEventType,
  insertWebhook,
  listWebhooksForUser,
  revealSigningSecretForUser,
  type WebhookSummary,
} from '@dispatch/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUserId } from '../../../lib/supabase/require-user-id';

const WEBHOOKS_PATH = '/dashboard/webhooks';

const createWebhookSchema = z.object({
  url: z
    .url('Enter a full URL, including https://')
    // http would put the payload and its signature on the wire in clear text
    .refine((value) => value.startsWith('https://'), 'Use an https URL.'),
  events: z.array(z.enum(emailEventType.enumValues)).min(1, 'Choose at least one event to send.'),
});

export type CreateWebhookInput = z.input<typeof createWebhookSchema>;

export type CreateWebhookResult = { status: 'created' } | { status: 'rejected'; message: string };

export type RevealWebhookSecretResult =
  | { status: 'revealed'; secret: string }
  | { status: 'rejected'; message: string };

export type DeleteWebhookResult = { status: 'deleted' } | { status: 'rejected'; message: string };

export async function listWebhooks(): Promise<WebhookSummary[]> {
  return listWebhooksForUser(await requireUserId());
}

export async function createWebhook(input: CreateWebhookInput): Promise<CreateWebhookResult> {
  const userId = await requireUserId();
  const parsed = createWebhookSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'rejected', message: parsed.error.issues[0]?.message ?? 'Check the form.' };
  }

  await insertWebhook({
    userId,
    url: parsed.data.url,
    events: parsed.data.events,
    signingSecret: generateSigningSecret(),
  });
  revalidatePath(WEBHOOKS_PATH);

  // the secret is not returned, because unlike an api key it stays readable from its own action
  return { status: 'created' };
}

// its own action, so the secret reaches the browser on request rather than in every page payload
export async function revealWebhookSecret(id: string): Promise<RevealWebhookSecretResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) {
    return { status: 'rejected', message: 'That endpoint no longer exists.' };
  }

  const secret = await revealSigningSecretForUser(parsed.data, userId);
  if (!secret) {
    return { status: 'rejected', message: 'That endpoint no longer exists.' };
  }

  return { status: 'revealed', secret };
}

export async function deleteWebhook(id: string): Promise<DeleteWebhookResult> {
  const userId = await requireUserId();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) {
    return { status: 'rejected', message: 'That endpoint no longer exists.' };
  }

  if (!(await deleteWebhookForUser(parsed.data, userId))) {
    return { status: 'rejected', message: 'That endpoint was deleted already.' };
  }
  revalidatePath(WEBHOOKS_PATH);

  return { status: 'deleted' };
}
