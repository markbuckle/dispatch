import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import { getDb } from '../client';

export type PageRequest = { limit: number; after?: string; before?: string };

export type Page<T> = { rows: T[]; hasMore: boolean };

// every list pages the same way: newest first on created_at, with the id breaking ties
type PageableTable = PgTable & { id: AnyPgColumn; userId: AnyPgColumn; createdAt: AnyPgColumn };

export class UnknownCursorError extends Error {
  constructor() {
    super('The cursor does not match a row in this account');
    this.name = 'UnknownCursorError';
  }
}

function cursorOf(page: PageRequest): string | undefined {
  return page.after ?? page.before;
}

// compared inside Postgres, because a JS Date drops the microseconds and would skip rows sharing the cursor's millisecond
export function pageCursor(
  table: PageableTable,
  userId: string,
  page: PageRequest,
): SQL | undefined {
  const cursor = cursorOf(page);
  if (cursor === undefined) return undefined;

  // owner-scoped, so another account's id cannot be used to find where that account's rows fall
  const position = sql`(select ${table.createdAt}, ${table.id} from ${table} where ${table.id} = ${cursor} and ${table.userId} = ${userId})`;

  return page.after === undefined
    ? sql`(${table.createdAt}, ${table.id}) > ${position}`
    : sql`(${table.createdAt}, ${table.id}) < ${position}`;
}

// a before page walks up toward newer rows, and trimPage turns it back so every page reads newest first
export function pageOrder(table: PageableTable, page: PageRequest): SQL[] {
  return page.before === undefined
    ? [desc(table.createdAt), desc(table.id)]
    : [asc(table.createdAt), asc(table.id)];
}

// one past the limit, so has_more is answered by a row that exists rather than guessed from a full page
export function pageLimit(page: PageRequest): number {
  return page.limit + 1;
}

export function trimPage<T>(rows: T[], page: PageRequest): Page<T> {
  const kept = rows.slice(0, page.limit);

  return {
    rows: page.before === undefined ? kept : kept.reverse(),
    hasMore: rows.length > page.limit,
  };
}

// an unknown cursor matches nothing, and an empty page would tell the caller it had reached the end
export async function settlePage<T>(
  table: PageableTable,
  userId: string,
  page: PageRequest,
  rows: T[],
): Promise<Page<T>> {
  const cursor = cursorOf(page);
  if (rows.length === 0 && cursor !== undefined) {
    const [match] = await getDb()
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, cursor), eq(table.userId, userId)));
    if (!match) throw new UnknownCursorError();
  }

  return trimPage(rows, page);
}
