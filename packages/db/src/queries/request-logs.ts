import { desc, eq } from 'drizzle-orm';
import { getDb } from '../client';
import { type NewRequestLog, type RequestLog, requestLogs } from '../schema/request-logs';

// the api writes as the system rather than on behalf of a dashboard request, so there is no owner to match on
export async function insertRequestLog(values: NewRequestLog): Promise<void> {
  await getDb().insert(requestLogs).values(values);
}

// capped rather than paginated, so a busy account sees its newest and nothing older, matching emails
const LIST_LIMIT = 100;

export type ListRequestLogs = {
  userId: string;
  limit?: number;
};

// the owner is part of the match, so a request another account made is never listed here
export async function listRequestLogsForUser({
  userId,
  limit = LIST_LIMIT,
}: ListRequestLogs): Promise<RequestLog[]> {
  return getDb()
    .select()
    .from(requestLogs)
    .where(eq(requestLogs.userId, userId))
    .orderBy(desc(requestLogs.createdAt))
    .limit(limit);
}
