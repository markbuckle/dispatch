import { and, arrayContains, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from '../client';
import { type NewWebhook, type Webhook, webhooks } from '../schema/webhooks';

// the signing secret is left out, so listing a page of endpoints never carries every secret across the wire
export type WebhookSummary = Pick<Webhook, 'id' | 'url' | 'events' | 'disabledAt' | 'createdAt'>;

// named once, so the secret cannot reappear in a select that drifted from this list
const summaryColumns = {
  id: webhooks.id,
  url: webhooks.url,
  events: webhooks.events,
  disabledAt: webhooks.disabledAt,
  createdAt: webhooks.createdAt,
};

export async function listWebhooksForUser(userId: string): Promise<WebhookSummary[]> {
  return getDb()
    .select(summaryColumns)
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
    .select(summaryColumns)
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

// the caller generated the secret it passed in, so the row never has to carry it back out
export async function insertWebhook(values: NewWebhook): Promise<WebhookSummary> {
  const [webhook] = await getDb().insert(webhooks).values(values).returning(summaryColumns);
  if (!webhook) throw new Error(`Insert returned no row for ${values.url}`);

  return webhook;
}

export type WebhookEndpoint = Pick<Webhook, 'id' | 'url'>;

// the fan-out job runs as the system, so it matches on the event owner rather than on a request's user
export async function listWebhooksForEventType(
  userId: string,
  eventType: Webhook['events'][number],
): Promise<WebhookEndpoint[]> {
  return getDb()
    .select({ id: webhooks.id, url: webhooks.url })
    .from(webhooks)
    .where(
      and(
        eq(webhooks.userId, userId),
        isNull(webhooks.disabledAt),
        arrayContains(webhooks.events, [eventType]),
      ),
    );
}

export async function deleteWebhookForUser(id: string, userId: string): Promise<boolean> {
  const deleted = await getDb()
    .delete(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.userId, userId)))
    .returning({ id: webhooks.id });

  return deleted.length > 0;
}
