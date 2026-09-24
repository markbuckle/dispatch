import {
  deliverWebhook,
  fanOutWebhookEvent,
  inngest,
  recordSesEvent,
  sendEmail,
} from '@dispatch/core/inngest';
import { Hono } from 'hono';
import { serve } from 'inngest/hono';
import { emails } from './emails';
import { requestLogger } from './request-logger';
import { sns } from './sns';

export const app = new Hono();

// first, so it wraps every route including the ones registered below it
app.use('*', requestLogger);

app.get('/health', (context) => context.json({ status: 'ok' }));

app.route('/v1/emails', emails);

// SES event notifications, authenticated by their SNS signature rather than by an api key
app.route('/sns', sns);

// GET introspects, POST invokes, PUT registers the functions with the Inngest server
app.on(
  ['GET', 'POST', 'PUT'],
  '/api/inngest',
  serve({
    client: inngest,
    functions: [sendEmail, fanOutWebhookEvent, deliverWebhook, recordSesEvent],
  }),
);
