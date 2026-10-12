import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { emails } from '../schema/emails';
import { pageCursor, pageLimit, trimPage } from './pagination';

const USER_ID = '0b6c3f7e-2d4a-4e8b-9f1c-5a7d3e2b1c90';
const CURSOR = '8f14e45f-ceea-467a-9f1a-7b0d1e3a4c52';

function render(condition: ReturnType<typeof pageCursor>) {
  if (!condition) throw new Error('expected a cursor condition');
  return new PgDialect().sqlToQuery(condition);
}

describe('trimPage', () => {
  it('fetches one row past the limit', () => {
    expect(pageLimit({ limit: 20 })).toBe(21);
  });

  it('reports more when the extra row came back, and drops it', () => {
    const page = trimPage([1, 2, 3, 4], { limit: 3 });

    expect(page).toEqual({ rows: [1, 2, 3], hasMore: true });
  });

  it('reports no more when the last page is exactly full', () => {
    const page = trimPage([1, 2, 3], { limit: 3 });

    expect(page).toEqual({ rows: [1, 2, 3], hasMore: false });
  });

  it('reports no more on a short page', () => {
    expect(trimPage([1], { limit: 3 })).toEqual({ rows: [1], hasMore: false });
  });

  it('turns a before page back to newest first, keeping the rows nearest the cursor', () => {
    // a before query reads oldest first upward from the cursor, so 1 sits right above it
    const page = trimPage([1, 2, 3, 4], { limit: 3, before: CURSOR });

    expect(page).toEqual({ rows: [3, 2, 1], hasMore: true });
  });
});

describe('pageCursor', () => {
  it('adds nothing to the first page', () => {
    expect(pageCursor(emails, USER_ID, { limit: 20 })).toBeUndefined();
  });

  it('compares against the cursor row inside Postgres, so no timestamp passes through JS', () => {
    const { sql, params } = render(pageCursor(emails, USER_ID, { limit: 20, after: CURSOR }));

    expect(sql).toBe(
      '("emails"."created_at", "emails"."id") < (select "emails"."created_at", "emails"."id" from "emails" where "emails"."id" = $1 and "emails"."user_id" = $2)',
    );
    expect(params).toEqual([CURSOR, USER_ID]);
  });

  it('walks toward newer rows for before', () => {
    const { sql } = render(pageCursor(emails, USER_ID, { limit: 20, before: CURSOR }));

    expect(sql.startsWith('("emails"."created_at", "emails"."id") > (select')).toBe(true);
  });
});
