import { toApiTemplate, toApiTemplateSummary } from '@dispatch/core/api';
import { findTemplateForUser, listTemplatePageForUser } from '@dispatch/db';
import { Hono } from 'hono';
import { type AuthVariables, authenticate } from './authenticate';
import { rateLimit } from './rate-limit';
import { parseId, respondWithPage } from './reads';

export const templates = new Hono<{ Variables: AuthVariables }>();

templates.get('/', authenticate('read'), rateLimit, async (context) => {
  const userId = context.get('userId');

  return respondWithPage(
    context,
    (page) => listTemplatePageForUser(userId, page),
    toApiTemplateSummary,
  );
});

templates.get('/:id', authenticate('read'), rateLimit, async (context) => {
  const id = parseId(context.req.param('id'));
  const template =
    id === undefined ? undefined : await findTemplateForUser(id, context.get('userId'));
  if (!template) {
    return context.json({ message: 'There is no template with that id.' }, 404);
  }

  return context.json(toApiTemplate(template));
});
