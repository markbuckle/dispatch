import {
  advanceEmailStatus,
  findEmailByProviderMessageId,
  insertEmailEventOnce,
} from '@dispatch/db';
import { NonRetriableError } from 'inngest';
import { buildWebhookPayload, type WebhookEventType } from '../webhooks/payload';
import { inngest } from './client';
import { emailEventRecorded, sesNotificationReceived } from './events';

// only the four the configuration set subscribes to; anything else SES adds later is ignored rather than guessed at
const EVENT_TYPES: Record<string, WebhookEventType> = {
  Delivery: 'delivered',
  Bounce: 'bounced',
  Complaint: 'complained',
  DeliveryDelay: 'delivery_delayed',
};

export const recordSesEvent = inngest.createFunction(
  { id: 'record-ses-event', triggers: [sesNotificationReceived] },
  async ({ event, step }) => {
    const { snsMessageId, publishedAt, notification } = event.data;

    const type = EVENT_TYPES[notification.eventType];
    if (!type) return { skipped: notification.eventType };

    const email = await step.run('load-email', async () => {
      const row = await findEmailByProviderMessageId(notification.mail.messageId);
      // SES notifies about every send from the account, including ones this database never wrote
      if (!row) {
        throw new NonRetriableError(`No email row for SES message ${notification.mail.messageId}`);
      }

      return {
        id: row.id,
        userId: row.userId,
        from: row.from,
        to: row.to,
        subject: row.subject,
      };
    });

    const recorded = await step.run('record-event', async () => {
      // SNS published it, which is the closest thing to an event time that every type carries
      const occurredAt = new Date(publishedAt);
      const row = await insertEmailEventOnce({
        emailId: email.id,
        userId: email.userId,
        type,
        occurredAt,
        providerEventId: snsMessageId,
        payload: buildWebhookPayload({
          type,
          occurredAt,
          emailId: email.id,
          from: email.from,
          to: email.to,
          subject: email.subject,
        }),
      });

      // a redelivered notification finds its own id already stored, which is the whole point of storing it
      if (!row) return undefined;

      // every event type is also a status, and the query refuses it if the row is already further along
      await advanceEmailStatus(email.id, type);

      return { id: row.id };
    });

    if (!recorded) return { duplicate: snsMessageId };

    await step.sendEvent(
      'announce-event',
      emailEventRecorded.create({ emailEventId: recorded.id }, { id: `event-${recorded.id}` }),
    );

    return { recorded: recorded.id };
  },
);
