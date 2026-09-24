'use server';

import { listRequestLogsForUser, type RequestLog } from '@dispatch/db';
import { requireUserId } from '../../../lib/supabase/require-user-id';

export async function listLogs(): Promise<RequestLog[]> {
  return listRequestLogsForUser({ userId: await requireUserId() });
}
