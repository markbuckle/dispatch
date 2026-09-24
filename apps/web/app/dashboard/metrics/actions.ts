'use server';

import {
  type EmailEventDayCount,
  type EmailEventTotal,
  getEmailEventCounts,
  getEmailEventTotals,
} from '@dispatch/db';
import { requireUserId } from '../../../lib/supabase/require-user-id';

// fixed for now; a window selector is a follow-up rather than part of the baseline page.
// not exported, because a "use server" module may only export async functions
const METRICS_DAYS = 30;

export type Metrics = {
  days: number;
  totals: EmailEventTotal[];
  daily: EmailEventDayCount[];
};

export async function getMetrics(): Promise<Metrics> {
  const userId = await requireUserId();
  const [totals, daily] = await Promise.all([
    getEmailEventTotals({ userId, days: METRICS_DAYS }),
    getEmailEventCounts({ userId, days: METRICS_DAYS }),
  ]);

  return { days: METRICS_DAYS, totals, daily };
}
