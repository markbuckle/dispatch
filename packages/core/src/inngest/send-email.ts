import { findEmail, insertEmailEvent, markEmailFailed, markEmailSent } from '@dispatch/db';
import { NonRetriableError } from 'inngest';
import { createTransport } from '../email/transport';
import { buildWebhookPayload } from '../webhooks/payload';
import { inngest } from './client';
import { emailEventRecorded, emailSendQueued } from './events';

export const sendEmail = inngest.createFunction(
  { id: 'send-email', triggers: [emailSendQueued] },
  async ({ event, step }) => {
    const email = await step.run('load-email', async () => {
      const row = await findEmail(event.data.emailId);
      // no number of retries makes a missing row appear
      if (!row) throw new NonRetriableError(`No email row for ${event.data.emailId}`);

      // step output is json, so returning the row would type its timestamps as Date when they come back strings
      return {
        id: row.id,
        userId: row.userId,
        status: row.status,
        params: {
          from: row.from,
          to: row.to,
          subject: row.subject,
          html: row.html ?? undefined,
          text: row.text ?? undefined,
        },
      };
    });

    // a duplicate event past Inngest's own dedup window would otherwise send a second real email
    if (email.status !== 'queued') return { skipped: email.status };

    let providerMessageId: string;
    try {
      const sent = await step.run('send', () => createTransport().send(email.params));
      providerMessageId = sent.providerMessageId;
    } catch (error) {
      // reached only once the send step has exhausted its retries
      const message = error instanceof Error ? error.message : String(error);
      await step.run('record-failure', () => markEmailFailed(email.id, message));
      throw error;
    }

    await step.run('record-sent', () => markEmailSent(email.id, providerMessageId));

    const recorded = await step.run('record-event', async () => {
      const occurredAt = new Date();
      const row = await insertEmailEvent({
        emailId: email.id,
        userId: email.userId,
        type: 'sent',
        occurredAt,
        payload: buildWebhookPayload({
          type: 'sent',
          occurredAt,
          emailId: email.id,
          from: email.params.from,
          to: email.params.to,
          subject: email.params.subject,
        }),
      });

      return { id: row.id };
    });

    await step.sendEvent(
      'announce-event',
      // the event row id doubles as the dedup key, so a retried step cannot fan out twice
      emailEventRecorded.create({ emailEventId: recorded.id }, { id: `event-${recorded.id}` }),
    );

    return { providerMessageId };
  },
);
