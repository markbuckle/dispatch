import { existsSync } from 'node:fs';
import path from 'node:path';
import { serve } from '@hono/node-server';

// local only, because a deployed api takes its env from the platform
const envFile = path.join(import.meta.dirname, '../.env.local');
if (existsSync(envFile)) process.loadEnvFile(envFile);

// imported dynamically so the env above is set before the Inngest client reads it at module scope
const { app } = await import('./app');

// apps/web's next dev already holds 3000
serve({ fetch: app.fetch, port: 3001 });
