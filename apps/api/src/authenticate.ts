import { hashApiKey } from '@dispatch/core';
import { type AuthenticatedApiKey, authenticateApiKey } from '@dispatch/db';
import { createMiddleware } from 'hono/factory';

export type AuthVariables = { userId: string; apiKeyId: string };

type Capability = 'send' | 'read';

// exhaustive, so a permission added later fails the build here instead of silently granting anything
const GRANTS: Record<AuthenticatedApiKey['permission'], Record<Capability, boolean>> = {
  // the only permission that reads, so anything reading a user's email data can also send as them
  full_access: { send: true, read: true },
  // the dashboard promises this key sends and does nothing else
  sending_access: { send: true, read: false },
};

const REFUSALS: Record<Capability, string> = {
  send: 'That API key cannot send email.',
  read: 'That API key can only send email. Reading needs a full access key.',
};

const BEARER = 'Bearer ';

export function authenticate(capability: Capability) {
  return createMiddleware<{ Variables: AuthVariables }>(async (context, next) => {
    const header = context.req.header('Authorization');
    if (!header?.startsWith(BEARER)) {
      return context.json({ message: 'Provide an API key as "Authorization: Bearer <key>".' }, 401);
    }

    const key = await authenticateApiKey(hashApiKey(header.slice(BEARER.length).trim()));
    // a revoked key matches nothing, so it answers the same as an unknown one and admits to neither
    if (!key) {
      return context.json({ message: 'That API key is not valid.' }, 401);
    }

    if (!GRANTS[key.permission][capability]) {
      return context.json({ message: REFUSALS[capability] }, 403);
    }

    context.set('userId', key.userId);
    context.set('apiKeyId', key.id);
    await next();
  });
}
