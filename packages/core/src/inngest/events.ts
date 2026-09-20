import { eventType } from 'inngest';
import { z } from 'zod';

export const emailSendQueued = eventType('email/send.queued', {
  schema: z.object({ emailId: z.uuid() }),
});
