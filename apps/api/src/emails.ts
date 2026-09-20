import { emailSendQueued, inngest } from '@dispatch/core/inngest';
import { insertEmail, markEmailFailed } from '@dispatch/db';
import { Hono } from 'hono';
import { z } from 'zod';
import { type AuthVariables, authenticate } from './authenticate';

// SES accepts at most 50 recipients on a single send
const MAX_RECIPIENTS = 50;

const address = z.email({ error: 'Enter a valid email address.' });

const sendEmailSchema = z
  .object({
    // v1 takes a bare address; SES would also accept "Dispatch <dispatch@mail.dispatchit.ca>"
    from: address,
    to: z.preprocess(
      (value) => (Array.isArray(value) ? value : [value]),
      z
        .array(address)
        .min(1, { error: 'Name at least one recipient.' })
        .max(MAX_RECIPIENTS, {
          error: `Name at most ${MAX_RECIPIENTS} recipients.`,
        }),
    ),
    subject: z.string().trim().min(1, 'Enter a subject.'),
    html: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
  })
  .refine((value) => value.html !== undefined || value.text !== undefined, {
    error: 'Provide an html body, a text body, or both.',
  });

export const emails = new Hono<{ Variables: AuthVariables }>();

emails.post('/', authenticate, async (context) => {
  const body = await context.req.json().catch(() => undefined);
  if (body === undefined) {
    return context.json({ message: 'Send a JSON body.' }, 400);
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Check the request body.';
    return context.json({ message }, 400);
  }

  const email = await insertEmail({
    userId: context.get('userId'),
    ...parsed.data,
    status: 'queued',
  });

  try {
    await inngest.send(emailSendQueued.create({ emailId: email.id }, { id: `email-${email.id}` }));
  } catch (error) {
    // a queued row nothing was told about would sit untouched forever, so it says so instead
    const reason = error instanceof Error ? error.message : String(error);
    await markEmailFailed(email.id, `Could not queue the send: ${reason}`);

    return context.json({ message: 'Could not queue the email. Try again.' }, 500);
  }

  return context.json({ id: email.id, status: 'queued' }, 202);
});
