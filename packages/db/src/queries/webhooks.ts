import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { type NewWebhook, type Webhook, webhooks } from '../schema/webhooks';

// the signing secret is left out, so listing a page of endpoints never carries every secret across the wire
export type WebhookSummary = Pick<Webhook, 'id' | 'url' | 'events' | 'disabledAt' | 'createdAt'>;

export async function listWebhooksForUser(userId: string): Promise<WebhookSummary[]> {
  return getDb()
    .select({
      id: webhooks.id,
      url: webhooks.url,
      events: webhooks.events,
      disabledAt: webhooks.disabledAt,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .where(eq(webhooks.userId, userId))
    .orderBy(desc(webhooks.createdAt));
}

// the owner is part of the match, so a guessed id from another account finds nothing
export async function findWebhookForUser(
  id: string,
  userId: string,
): Promise<WebhookSummary | undefined> {
  const [webhook] = await getDb()
    .select({
      id: webhooks.id,
      url: webhooks.url,
      events: webhooks.events,
      disabledAt: webhooks.disabledAt,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, userId)));

  return webhook;
}

// a separate read, so the secret reaches the dashboard only when someone asks to see that one endpoint
export async function revealSigningSecretForUser(
  id: string,
  userId: string,
): Promise<string | undefined> {
  const [webhook] = await getDb()
    .select({ signingSecret: webhooks.signingSecret })
    .from(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, userId)));

  return webhook?.signingSecret;
}

export async function insertWebhook(values: NewWebhook): Promise<Webhook> {
  const [webhook] = await getDb().insert(webhooks).values(values).returning();
  if (!webhook) throw new Error(`Insert returned no row for ${values.url}`);

  return webhook;
}

export async function deleteWebhookForUser(id: string, userId: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, userId)))
    .returning({ id: webhooks.id });

  return deleted.length > 0;
}
