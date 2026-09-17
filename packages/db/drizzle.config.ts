import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// the web app is the only runtime that connects, so its env file is the one source of the url
const envFile = '../../apps/web/.env.local';
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema',
  out: './migrations',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
