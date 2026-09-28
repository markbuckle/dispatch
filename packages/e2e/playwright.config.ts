import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';
import { sessionPath } from './src/paths';

const webEnvFile = new URL('../../apps/web/.env.local', import.meta.url);
// locally the suite borrows web's own Supabase credentials; CI passes them as secrets instead
if (existsSync(webEnvFile)) process.loadEnvFile(webEnvFile);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  // no retries, so a flaky test fails loudly instead of passing on its second attempt
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: 'auth.setup.ts', teardown: 'teardown' },
    { name: 'teardown', testMatch: 'auth.teardown.ts' },
    { name: 'signed out', testMatch: 'signed-out/*.spec.ts' },
    {
      name: 'signed in',
      testMatch: 'signed-in/*.spec.ts',
      dependencies: ['setup'],
      use: { storageState: sessionPath },
    },
  ],
});
