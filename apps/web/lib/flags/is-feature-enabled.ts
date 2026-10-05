import { requireUserId } from '../supabase/require-user-id';
import { isFeatureEnabledFor } from './evaluate';

export const COMPATIBILITY_CHECKER = 'compatibility-checker';

// a signed out visitor has no flags to read, and a gate is never the right thing to fail a page on
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const userId = await requireUserId();
    return await isFeatureEnabledFor(key, userId);
  } catch {
    return false;
  }
}
