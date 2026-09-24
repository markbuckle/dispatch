import { logger, type SnsMessage, verifySnsMessage } from '@dispatch/core';
import { inngest, sesNotificationReceived } from '@dispatch/core/inngest';
import { Hono } from 'hono';
import { z } from 'zod';

export const sns = new Hono();

// only the fields the signature covers and the route acts on; SNS sends more and it is not needed here
const snsEnvelopeSchema = z.object({
  Type: z.enum(['Notification', 'SubscriptionConfirmation', 'UnsubscribeConfirmation']),
  MessageId: z.string().min(1),
  TopicArn: z.string().min(1),
  Message: z.string(),
  Timestamp: z.string().min(1),
  Signature: z.string().min(1),
  SignatureVersion: z.string().min(1),
  SigningCertURL: z.string().min(1),
  Subject: z.string().optional(),
  Token: z.string().optional(),
  SubscribeURL: z.string().optional(),
});

const sesNotificationSchema = z.object({
  eventType: z.string().min(1),
  mail: z.object({ messageId: z.string().min(1) }),
});

// no api key: SNS has none to send, so the signature is the only thing that authenticates a caller
sns.post('/ses', async (context) => {
  // the raw body, because the signature covers the bytes and a reserialize would move them
  const raw = await context.req.text();

  let envelope: SnsMessage;
  try {
    envelope = snsEnvelopeSchema.parse(JSON.parse(raw));
  } catch {
    logger.warn('sns message rejected', { reason: 'the body was not an SNS envelope' });
    return context.json({ message: 'Forbidden' }, 403);
  }

  const expectedTopicArn = process.env.SES_EVENTS_TOPIC_ARN;
  if (!expectedTopicArn) {
    // without the arn there is nothing to check the message against, so nothing can be accepted
    logger.error('sns message rejected', { reason: 'SES_EVENTS_TOPIC_ARN is not set' });
    return context.json({ message: 'Forbidden' }, 403);
  }

  const verified = await verifySnsMessage({ message: envelope, expectedTopicArn });
  if (!verified.ok) {
    logger.warn('sns message rejected', { reason: verified.reason, messageId: envelope.MessageId });
    return context.json({ message: 'Forbidden' }, 403);
  }

  const message = verified.message;

  if (message.Type === 'SubscriptionConfirmation') {
    // visiting the url is the only thing that activates the subscription
    if (message.SubscribeURL) await fetch(message.SubscribeURL);
    logger.info('sns subscription confirmed', { topicArn: message.TopicArn });

    return context.json({ status: 'confirmed' });
  }

  if (message.Type === 'UnsubscribeConfirmation') {
    logger.warn('sns subscription removed', { topicArn: message.TopicArn });

    return context.json({ status: 'noted' });
  }

  let body: unknown;
  try {
    body = JSON.parse(message.Message);
  } catch {
    body = undefined;
  }

  const parsed = sesNotificationSchema.safeParse(body);
  if (!parsed.success) {
    // a verified message we cannot read is SES's shape changing, and retrying it would not help
    logger.warn('sns notification ignored', { messageId: message.MessageId });

    return context.json({ status: 'ignored' });
  }

  await inngest.send(
    sesNotificationReceived.create(
      {
        snsMessageId: message.MessageId,
        publishedAt: message.Timestamp,
        notification: parsed.data,
      },
      // SNS redelivers on any doubt, and the envelope id is stable across those attempts
      { id: `ses-${message.MessageId}` },
    ),
  );

  // 200 now, because SNS retries anything slow or non-2xx and the work belongs to a job
  return context.json({ status: 'queued' });
});
