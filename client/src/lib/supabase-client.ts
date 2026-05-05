import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Cookies from 'js-cookie';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const cookieDomain = window.location.hostname.includes('teachermate.co.kr')
  ? '.teachermate.co.kr'
  : undefined;

const cookieStorage = {
  getItem: (key: string) => Cookies.get(key) ?? null,
  setItem: (key: string, value: string) => {
    Cookies.set(key, value, {
      domain: cookieDomain,
      secure: window.location.protocol === 'https:',
      sameSite: 'lax' as const,
      expires: 365,
    });
  },
  removeItem: (key: string) => {
    Cookies.remove(key, { domain: cookieDomain });
  },
};

export const supabaseClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: cookieStorage,
          storageKey: 'sb-auth-token',
        },
      })
    : null;
