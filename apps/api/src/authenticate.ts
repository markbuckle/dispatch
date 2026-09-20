import { hashApiKey } from '@dispatch/core';
import { type AuthenticatedApiKey, authenticateApiKey } from '@dispatch/db';
import { createMiddleware } from 'hono/factory';

export type AuthVariables = { userId: string; apiKeyId: string };

// exhaustive, so a permission added later fails the build here instead of silently sending
const CAN_SEND: Record<AuthenticatedApiKey['permission'], boolean> = {
  full_access: true,
  sending_access: true,
};

const BEARER = 'Bearer ';

export const authenticate = createMiddleware<{ Variables: AuthVariables }>(
  async (context, next) => {
    const header = context.req.header('Authorization');
    if (!header?.startsWith(BEARER)) {
      return context.json({ message: 'Provide an API key as "Authorization: Bearer <key>".' }, 401);
    }

    const key = await authenticateApiKey(hashApiKey(header.slice(BEARER.length).trim()));
    // a revoked key matches nothing, so it answers the same as an unknown one and admits to neither
    if (!key) {
      return context.json({ message: 'That API key is not valid.' }, 401);
    }

    if (!CAN_SEND[key.permission]) {
      return context.json({ message: 'That API key cannot send email.' }, 403);
    }

    context.set('userId', key.userId);
    context.set('apiKeyId', key.id);
    await next();
  },
);
