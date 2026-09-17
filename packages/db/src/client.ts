import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/api-keys';

function createDb(url: string) {
  // Supabase's transaction pooler routes each query to any backend, so prepared statements can't persist
  return drizzle(postgres(url, { prepare: false }), { schema });
}

export type Db = ReturnType<typeof createDb>;

let db: Db | undefined;

// Next imports server modules at build time without env vars, so connecting has to wait for first use
export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('Missing required env var: DATABASE_URL');
    db = createDb(url);
  }
  return db;
}
