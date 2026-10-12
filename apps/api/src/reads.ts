import { type ListQuery, listQuerySchema, toApiList } from '@dispatch/core/api';
import { type Page, UnknownCursorError } from '@dispatch/db';
import type { Context } from 'hono';
import { z } from 'zod';

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check the query string.';
}

// one path for every list route, so each validates, pages and refuses a stale cursor the same way
export async function respondWithPage<Row, Item>(
  context: Context,
  load: (page: ListQuery) => Promise<Page<Row>>,
  serialize: (row: Row) => Item,
): Promise<Response> {
  const page = listQuerySchema.safeParse(context.req.query());
  if (!page.success) {
    return context.json({ message: firstIssue(page.error) }, 400);
  }

  try {
    const { rows, hasMore } = await load(page.data);
    return context.json(toApiList(rows.map(serialize), hasMore));
  } catch (error) {
    if (error instanceof UnknownCursorError) {
      return context.json(
        {
          message:
            'That cursor does not match an item in this list. Start again without after or before.',
        },
        400,
      );
    }
    throw error;
  }
}

// Postgres rejects a malformed uuid rather than matching nothing, so one is answered as missing before it reaches a query
export function parseId(value: string): string | undefined {
  const parsed = z.uuid().safeParse(value);
  return parsed.success ? parsed.data : undefined;
}
