import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { getDb } from '../client';
import {
  type NewWebhookDelivery,
  type WebhookDelivery,
  webhookDeliveries,
} from '../schema/webhook-deliveries';
import { webhooks } from '../schema/webhooks';

// the fan-out job runs as the system rather than on behalf of a request, so there is no owner to match on
export async function insertDelivery(values: NewWebhookDelivery): Promise<WebhookDelivery> {
  const [delivery] = await getDb().insert(webhookDeliveries).values(values).returning();
  if (!delivery) throw new Error(`Insert returned no row for ${values.messageId}`);

  return delivery;
}

export type DeliveryForSending = {
  id: string;
  messageId: string;
  payload: unknown;
  status: WebhookDelivery['status'];
  attemptCount: number;
  url: string;
  signingSecret: string;
};

// the endpoint is joined in because an attempt needs the url and the secret as well as the row
export async function findDelivery(id: string): Promise<DeliveryForSending | undefined> {
  const [delivery] = await getDb()
    .select({
      id: webhookDeliveries.id,
      messageId: webhookDeliveries.messageId,
      payload: webhookDeliveries.payload,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      url: webhooks.url,
      signingSecret: webhooks.signingSecret,
    })
    .from(webhookDeliveries)
    .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
    .where(eq(webhookDeliveries.id, id));

  return delivery;
}

export type DeliveryAttempt = {
  status: WebhookDelivery['status'];
  responseStatus?: number;
  error?: string;
  nextAttemptAt?: Date;
};

// the count moves in SQL rather than from a read, so two attempts cannot settle on the same number
export async function recordDeliveryAttempt(id: string, attempt: DeliveryAttempt): Promise<void> {
  await getDb()
    .update(webhookDeliveries)
    .set({
      status: attempt.status,
      attemptCount: sql`${webhookDeliveries.attemptCount} + 1`,
      lastResponseStatus: attempt.responseStatus ?? null,
      lastError: attempt.error ?? null,
      nextAttemptAt: attempt.nextAttemptAt ?? null,
    })
    .where(eq(webhookDeliveries.id, id));
}

// the payload is left out, so opening the log never carries every body it has ever sent across the wire
export type DeliverySummary = Pick<
  WebhookDelivery,
  'id' | 'eventType' | 'status' | 'attemptCount' | 'lastResponseStatus' | 'lastError' | 'createdAt'
>;

// capped rather than paginated, matching the emails list
const LIST_LIMIT = 100;

// the owner is matched through the endpoint, so a guessed id from another account lists nothing
export async function listDeliveriesForWebhook(
  webhookId: string,
  userId: string,
): Promise<DeliverySummary[]> {
  return getDb()
    .select({
      id: webhookDeliveries.id,
      eventType: webhookDeliveries.eventType,
      status: webhookDeliveries.status,
      attemptCount: webhookDeliveries.attemptCount,
      lastResponseStatus: webhookDeliveries.lastResponseStatus,
      lastError: webhookDeliveries.lastError,
      createdAt: webhookDeliveries.createdAt,
    })
    .from(webhookDeliveries)
    .innerJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
    .where(and(eq(webhookDeliveries.webhookId, webhookId), eq(webhooks.userId, userId)))
    .orderBy(desc(webhookDeliveries.createdAt))
    .limit(LIST_LIMIT);
}

export type RequeuedDelivery = Pick<WebhookDelivery, 'id' | 'webhookId' | 'attemptCount'>;

// only a failed row requeues, so a replay cannot restart a delivery that is still working through its attempts
export async function requeueDeliveryForUser(
  id: string,
  userId: string,
): Promise<RequeuedDelivery | undefined> {
  const [delivery] = await getDb()
    .update(webhookDeliveries)
    .set({ status: 'pending', nextAttemptAt: null, lastError: null })
    .where(
      and(
        eq(webhookDeliveries.id, id),
        eq(webhookDeliveries.status, 'failed'),
        inArray(
          webhookDeliveries.webhookId,
          getDb().select({ id: webhooks.id }).from(webhooks).where(eq(webhooks.userId, userId)),
        ),
      ),
    )
    .returning({
      id: webhookDeliveries.id,
      webhookId: webhookDeliveries.webhookId,
      attemptCount: webhookDeliveries.attemptCount,
    });

  return delivery;
}
