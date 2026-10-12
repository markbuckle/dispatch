import { senderDomain } from '@dispatch/core';
import { emailFiltersQuerySchema, toApiEmail, toApiEmailSummary } from '@dispatch/core/api';
import { emailRangeStart } from '@dispatch/core/email-ranges';
import { emailSendQueued, inngest } from '@dispatch/core/inngest';
import {
  findEmailForUser,
  hasVerifiedDomainForUser,
  insertEmail,
  listEmailsForUser,
  markEmailFailed,
} from '@dispatch/db';
import { Hono } from 'hono';
import { z } from 'zod';
import { type AuthVariables, authenticate } from './authenticate';
import { rateLimit } from './rate-limit';
import { firstIssue, parseId, respondWithPage } from './reads';

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

// limited after authenticating, so an unauthenticated caller cannot spend a key's budget
emails.post('/', authenticate('send'), rateLimit, async (context) => {
  const body = await context.req.json().catch(() => undefined);
  if (body === undefined) {
    return context.json({ message: 'Send a JSON body.' }, 400);
  }

  const parsed = sendEmailSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Check the request body.';
    return context.json({ message }, 400);
  }

  const userId = context.get('userId');
  const domain = senderDomain(parsed.data.from);
  // SES signs for any identity the sending user may use and knows nothing of accounts, so ownership is checked here or nowhere
  if (!(await hasVerifiedDomainForUser(domain, userId))) {
    return context.json({ message: `Verify ${domain} under Domains before sending from it.` }, 403);
  }

  const email = await insertEmail({
    userId,
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

emails.get('/', authenticate('read'), rateLimit, async (context) => {
  const filters = emailFiltersQuerySchema.safeParse(context.req.query());
  if (!filters.success) {
    return context.json({ message: firstIssue(filters.error) }, 400);
  }

  const { status, range } = filters.data;
  // no range means no time limit, where the dashboard defaults to 15 days, so paging through history is never cut short
  const since = range === undefined ? undefined : emailRangeStart(range, Date.now());
  const userId = context.get('userId');

  return respondWithPage(
    context,
    (page) => listEmailsForUser(userId, { status, since }, page),
    toApiEmailSummary,
  );
});

emails.get('/:id', authenticate('read'), rateLimit, async (context) => {
  const id = parseId(context.req.param('id'));
  const email = id === undefined ? undefined : await findEmailForUser(id, context.get('userId'));
  if (!email) {
    return context.json({ message: 'There is no email with that id.' }, 404);
  }

  return context.json(toApiEmail(email));
});
