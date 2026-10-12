import { z } from 'zod';

// Resend's numbers, so a client written against its pagination works here unchanged
export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 100;

const limitError = `Use a whole number from 1 to ${MAX_LIST_LIMIT} for limit.`;
const cursorError = 'Use the id of an item on the current page for after or before.';

export const listQuerySchema = z
  .object({
    limit: z.coerce
      .number({ error: limitError })
      .int({ error: limitError })
      .min(1, { error: limitError })
      .max(MAX_LIST_LIMIT, { error: limitError })
      .default(DEFAULT_LIST_LIMIT),
    after: z.uuid({ error: cursorError }).optional(),
    before: z.uuid({ error: cursorError }).optional(),
  })
  .refine((query) => query.after === undefined || query.before === undefined, {
    error: 'Pass after or before, not both.',
  });

export type ListQuery = z.infer<typeof listQuerySchema>;

const listEnvelope = z.object({
  object: z.literal('list'),
  has_more: z.boolean(),
});

export type ApiList<T> = z.infer<typeof listEnvelope> & { data: T[] };

export function apiListSchema<T extends z.ZodType>(item: T) {
  return listEnvelope.extend({ data: z.array(item) });
}

export function toApiList<T>(data: T[], hasMore: boolean): ApiList<T> {
  return { object: 'list', has_more: hasMore, data };
}
