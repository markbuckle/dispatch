import { eventType } from 'inngest';
import { z } from 'zod';

export const emailSendQueued = eventType('email/send.queued', {
  schema: z.object({ emailId: z.uuid() }),
});

export const emailEventRecorded = eventType('email/event.recorded', {
  schema: z.object({ emailEventId: z.uuid() }),
});

export const webhookDeliveryQueued = eventType('webhook/delivery.queued', {
  schema: z.object({ deliveryId: z.uuid() }),
});

export const sesNotificationReceived = eventType('ses/notification.received', {
  schema: z.object({
    // the SNS envelope id, which is what makes a redelivered notification recognisable
    snsMessageId: z.string().min(1),
    publishedAt: z.string().min(1),
    notification: z.object({
      eventType: z.string().min(1),
      mail: z.object({ messageId: z.string().min(1) }),
    }),
  }),
});
