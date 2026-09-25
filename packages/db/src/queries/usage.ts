import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { emails } from '../schema/emails';
import { requestLogs } from '../schema/request-logs';

export type UsageSummary = {
  requestsToday: number;
  requestsThisMonth: number;
  emailsThisMonth: number;
};

// truncated in UTC, matching how metrics groups its days, so a total never shifts under whoever reads it
const startOfToday = sql`date_trunc('day', now() at time zone 'UTC')`;
const startOfMonth = sql`date_trunc('month', now() at time zone 'UTC')`;

const count = sql<number>`count(*)::int`;

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const [requests] = await getDb()
    .select({
      today: sql<number>`count(*) filter (where ${requestLogs.createdAt} >= ${startOfToday})::int`,
      month: sql<number>`count(*) filter (where ${requestLogs.createdAt} >= ${startOfMonth})::int`,
    })
    .from(requestLogs)
    .where(eq(requestLogs.userId, userId));

  const [sends] = await getDb()
    .select({ count })
    .from(emails)
    .where(and(eq(emails.userId, userId), gte(emails.createdAt, startOfMonth)));

  return {
    requestsToday: requests?.today ?? 0,
    requestsThisMonth: requests?.month ?? 0,
    emailsThisMonth: sends?.count ?? 0,
  };
}
