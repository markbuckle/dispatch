import { PostHog } from 'posthog-node';
import { flagOverride } from './overrides';

// PostHog bills one definitions fetch as ten flag requests, so the 30 second default spends most of the free tier per instance
const POLLING_INTERVAL = 300_000;

let client: PostHog | undefined;

// Next imports route modules to collect build metadata without invoking them, so this cannot run at module scope
function getClient(): PostHog | undefined {
  if (client) return client;

  const projectApiKey = process.env.POSTHOG_PROJECT_API_KEY;
  const secretKey = process.env.POSTHOG_SECRET_API_KEY;
  const host = process.env.POSTHOG_HOST;
  if (!projectApiKey || !secretKey || !host) return undefined;

  client = new PostHog(projectApiKey, {
    host,
    // local evaluation needs this, and without it every check would leave the process
    secretKey,
    featureFlagsPollingInterval: POLLING_INTERVAL,
  });

  return client;
}

// every failure resolves to off, so a PostHog outage can never reveal a feature that is still being built
export async function isFeatureEnabledFor(key: string, distinctId: string): Promise<boolean> {
  const override = flagOverride(key);
  if (override !== undefined) return override;

  const posthog = getClient();
  if (!posthog) return false;

  try {
    const flags = await posthog.evaluateFlags(distinctId, {
      flagKeys: [key],
      // without this an unresolved flag falls back to a blocking /flags call, turning an outage into a slow render
      onlyEvaluateLocally: true,
    });

    // a variant string or an absent flag are both "not a boolean yes", and this gate only opens on a yes
    return flags.getFlag(key) === true;
  } catch {
    return false;
  }
}
