import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminEnv } from './env';

// this key bypasses RLS entirely, so import it only from a 'use server' file, never from anything the browser reaches
export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  // stateless: it authenticates as the service role per call and has no session to persist or refresh
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
