// forces a flag without touching PostHog, which is how local dev and a reproduction of production state both work
export function flagOverride(
  key: string,
  raw: string | undefined = process.env.POSTHOG_FLAG_OVERRIDES,
): boolean | undefined {
  if (!raw) return undefined;

  for (const entry of raw.split(',')) {
    const [name, setting] = entry.split('=');
    if (name?.trim() !== key) continue;

    const value = setting?.trim().toLowerCase();
    if (value === 'on') return true;
    if (value === 'off') return false;
  }

  return undefined;
}
