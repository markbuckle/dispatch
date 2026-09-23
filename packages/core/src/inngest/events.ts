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
