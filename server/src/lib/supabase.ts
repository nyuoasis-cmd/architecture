import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';

let client: SupabaseClient | null | undefined;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  client = url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

  return client;
}
