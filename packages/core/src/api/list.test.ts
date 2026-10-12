import { describe, expect, it } from 'vitest';
import { listQuerySchema, toApiList } from './list';

const ID = '8f14e45f-ceea-467a-9f1a-7b0d1e3a4c52';

describe('listQuerySchema', () => {
  it('defaults to 20 items with no cursor', () => {
    expect(listQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it('reads limit from a query string', () => {
    expect(listQuerySchema.parse({ limit: '100', after: ID })).toEqual({ limit: 100, after: ID });
  });

  it.each(['0', '101', '1.5', 'abc', ''])('refuses a limit of %j', (limit) => {
    expect(listQuerySchema.safeParse({ limit }).success).toBe(false);
  });

  it('refuses a cursor that is not an id', () => {
    expect(listQuerySchema.safeParse({ after: 'last' }).success).toBe(false);
  });

  it('refuses after and before together', () => {
    const parsed = listQuerySchema.safeParse({ after: ID, before: ID });

    expect(parsed.error?.issues[0]?.message).toBe('Pass after or before, not both.');
  });
});

describe('toApiList', () => {
  it('wraps a page in the envelope Resend uses', () => {
    expect(toApiList([1, 2], true)).toEqual({ object: 'list', has_more: true, data: [1, 2] });
  });
});
