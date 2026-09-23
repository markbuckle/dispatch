import { findEmailEvent, insertDelivery, listWebhooksForEventType } from '@dispatch/db';
import { NonRetriableError } from 'inngest';
import { generateMessageId } from '../webhooks/sign';
import { inngest } from './client';
import { emailEventRecorded, webhookDeliveryQueued } from './events';

export const fanOutWebhookEvent = inngest.createFunction(
  { id: 'fan-out-webhook-event', triggers: [emailEventRecorded] },
  async ({ event, step }) => {
    const recorded = await step.run('load-event', async () => {
      const row = await findEmailEvent(event.data.emailEventId);
      // no number of retries makes a missing row appear
      if (!row) throw new NonRetriableError(`No email event row for ${event.data.emailEventId}`);

      // the payload was built and stored when the event was recorded, so every endpoint is sent the same bytes
      return {
        userId: row.userId,
        type: row.type,
        payload: row.payload,
      };
    });

    const endpoints = await step.run('load-endpoints', () =>
      listWebhooksForEventType(recorded.userId, recorded.type),
    );

    // an account with no endpoint subscribed to this type is the ordinary case, not a failure
    if (endpoints.length === 0) return { queued: 0 };

    const deliveries = [];
    for (const endpoint of endpoints) {
      // one step per endpoint, so a retry does not insert a second row for an endpoint already queued
      const row = await step.run(`queue-${endpoint.id}`, async () => {
        const inserted = await insertDelivery({
          webhookId: endpoint.id,
          messageId: generateMessageId(),
          eventType: recorded.type,
          payload: recorded.payload,
          status: 'pending',
        });

        return { id: inserted.id };
      });
      deliveries.push(row);
    }

    await step.sendEvent(
      'send-delivery-events',
      deliveries.map((delivery) =>
        // the row id doubles as the dedup key, so a replayed fan-out cannot queue the same row twice
        webhookDeliveryQueued.create(
          { deliveryId: delivery.id },
          { id: `delivery-${delivery.id}` },
        ),
      ),
    );

    return { queued: deliveries.length };
  },
);
