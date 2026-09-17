import { serve } from '@hono/node-server';
import { app } from './app';

// apps/web's next dev already holds 3000
serve({ fetch: app.fetch, port: 3001 });
