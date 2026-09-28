import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypassSecret && baseURL) {
      const origin = new URL(baseURL).origin;
      // same origin only, because the header on the browser's Supabase calls would fail their CORS preflight
      await context.route(
        (url) => url.origin === origin,
        (route) =>
          route.continue({
            headers: { ...route.request().headers(), 'x-vercel-protection-bypass': bypassSecret },
          }),
      );
    }
    await use(context);
  },
});
