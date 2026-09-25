'use server';

import { getUsageSummary, type UsageSummary } from '@dispatch/db';
import { requireUserId } from '../../../../lib/supabase/require-user-id';

export async function getUsage(): Promise<UsageSummary> {
  return getUsageSummary(await requireUserId());
}
