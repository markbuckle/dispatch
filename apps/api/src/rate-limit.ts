import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createMiddleware } from 'hono/factory';
import type { AuthVariables } from './authenticate';

// a burst of 10 and one a second sustained, near what Resend allows and short enough to demonstrate
const LIMIT = 10;
const WINDOW = '10 s';

let limiter: Ratelimit | undefined;

// built on first request, so importing the app never requires Upstash credentials
function getLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      // sliding, because two adjacent fixed windows would let double the limit through in a moment
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: 'dispatch:send',
    });
  }
  return limiter;
}

export const rateLimit = createMiddleware<{ Variables: AuthVariables }>(async (context, next) => {
  // per key rather than per account, so one noisy integration cannot starve the others
  const { success, limit, remaining, reset } = await getLimiter().limit(context.get('apiKeyId'));

  context.header('X-RateLimit-Limit', String(limit));
  context.header('X-RateLimit-Remaining', String(remaining));
  context.header('X-RateLimit-Reset', String(Math.ceil(reset / 1000)));

  if (!success) {
    // rounded up and never zero, because retrying on the exact reset is still inside the window
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    context.header('Retry-After', String(retryAfter));

    return context.json({ message: 'Too many requests. Slow down.' }, 429);
  }

  await next();
});
