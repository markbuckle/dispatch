import { and, eq, gte, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { type EmailEvent, emailEvents } from '../schema/email-events';

export type MetricsWindow = {
  userId: string;
  days: number;
};

export type EmailEventTotal = {
  type: EmailEvent['type'];
  count: number;
};

export type EmailEventDayCount = EmailEventTotal & {
  day: string;
};

// the (user_id, occurred_at) index exists for this comparison, so the window is the first thing applied
function withinWindow(userId: string, days: number) {
  return and(
    eq(emailEvents.userId, userId),
    gte(emailEvents.occurredAt, sql`now() - (${days} * interval '1 day')`),
  );
}

// grouped in UTC and returned as a string, so a day never shifts under whoever reads it back
const day = sql<string>`to_char(date_trunc('day', ${emailEvents.occurredAt} at time zone 'UTC'), 'YYYY-MM-DD')`;

export async function getEmailEventCounts({
  userId,
  days,
}: MetricsWindow): Promise<EmailEventDayCount[]> {
  return getDb()
    .select({ day, type: emailEvents.type, count: sql<number>`count(*)::int` })
    .from(emailEvents)
    .where(withinWindow(userId, days))
    .groupBy(day, emailEvents.type)
    .orderBy(day);
}

// the same window without the day grouping, because the cards show one number each
export async function getEmailEventTotals({
  userId,
  days,
}: MetricsWindow): Promise<EmailEventTotal[]> {
  return getDb()
    .select({ type: emailEvents.type, count: sql<number>`count(*)::int` })
    .from(emailEvents)
    .where(withinWindow(userId, days))
    .groupBy(emailEvents.type);
}
