import { requireUserId } from '../supabase/require-user-id';
import { isFeatureEnabledFor } from './evaluate';

export const COMPATIBILITY_CHECKER = 'compatibility-checker';
export const WEBHOOKS = 'webhooks';
export const HERO_VIDEO = 'hero-video';

// Landing page visitors are signed out and anonymous, so their flags are read for one fixed id: a site-wide switch, not a rollout
const LANDING_VISITOR = 'landing-page';

// a signed out visitor has no flags to read, and a gate is never the right thing to fail a page on
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const userId = await requireUserId();
    return await isFeatureEnabledFor(key, userId);
  } catch {
    return false;
  }
}

export async function isFeatureEnabledForVisitors(key: string): Promise<boolean> {
  return isFeatureEnabledFor(key, LANDING_VISITOR);
}
