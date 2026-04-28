import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ClientEnv = ImportMeta & {
  env: Record<string, string | undefined>;
};

const clientEnv = import.meta as ClientEnv;
const supabaseUrl = clientEnv.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = clientEnv.env?.VITE_SUPABASE_ANON_KEY;

export const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
