import { deliverWebhook, fanOutWebhookEvent, inngest, sendEmail } from '@dispatch/core/inngest';
import { Hono } from 'hono';
import { serve } from 'inngest/hono';
import { emails } from './emails';

export const app = new Hono();

app.get('/health', (context) => context.json({ status: 'ok' }));

app.route('/v1/emails', emails);

// GET introspects, POST invokes, PUT registers the functions with the Inngest server
app.on(
  ['GET', 'POST', 'PUT'],
  '/api/inngest',
  serve({ client: inngest, functions: [sendEmail, fanOutWebhookEvent, deliverWebhook] }),
);
