import { toApiDomain, toApiDomainSummary } from '@dispatch/core/api';
import { findDomainForUser, listDomainPageForUser } from '@dispatch/db';
import { Hono } from 'hono';
import { type AuthVariables, authenticate } from './authenticate';
import { rateLimit } from './rate-limit';
import { parseId, respondWithPage } from './reads';

export const domains = new Hono<{ Variables: AuthVariables }>();

domains.get('/', authenticate('read'), rateLimit, async (context) => {
  const userId = context.get('userId');

  return respondWithPage(
    context,
    (page) => listDomainPageForUser(userId, page),
    toApiDomainSummary,
  );
});

domains.get('/:id', authenticate('read'), rateLimit, async (context) => {
  const id = parseId(context.req.param('id'));
  const domain = id === undefined ? undefined : await findDomainForUser(id, context.get('userId'));
  if (!domain) {
    return context.json({ message: 'There is no domain with that id.' }, 404);
  }

  return context.json(toApiDomain(domain));
});
