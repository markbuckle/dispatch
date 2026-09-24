import { logger } from '@dispatch/core';
import { insertRequestLog } from '@dispatch/db';
import type { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

// both are set by authenticate, and stay unset for a request that never got that far
type LoggedVariables = {
  userId?: string;
  apiKeyId?: string;
};

// nothing here is a request anyone made: the platform polls and probes these paths itself
function isInternal(method: string, path: string): boolean {
  // Inngest re-syncs every few seconds, and on startup probes framework paths this app never serves
  return (method === 'GET' && path === '/health') || path.startsWith('/api/inngest');
}

async function record(
  context: Context<{ Variables: LoggedVariables }>,
  status: number,
  durationMs: number,
): Promise<void> {
  try {
    await insertRequestLog({
      userId: context.get('userId') ?? null,
      apiKeyId: context.get('apiKeyId') ?? null,
      method: context.req.method,
      path: context.req.path,
      status,
      durationMs,
    });
  } catch (error) {
    // the caller's request already succeeded or failed on its own merits, and this must not change that
    logger.error('could not record request log', {
      path: context.req.path,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

export const requestLogger = createMiddleware<{ Variables: LoggedVariables }>(
  async (context, next) => {
    if (isInternal(context.req.method, context.req.path)) return next();

    const startedAt = Date.now();
    // a handler that throws never reaches the assignment below, and Hono answers those with a 500
    let status = 500;
    try {
      await next();
      // reading context.res before a response exists fabricates a 404, so it is only read once one does
      status = context.finalized ? context.res.status : 500;
    } finally {
      // not awaited: nothing waits on a log row, and awaiting adds a round trip to every response
      void record(context, status, Date.now() - startedAt);
    }
  },
);
