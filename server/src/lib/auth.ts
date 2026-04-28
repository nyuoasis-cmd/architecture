import type { Request } from 'express';
import { env } from '../env';
import { getSupabaseAdminClient } from './supabase';

export type AuthUser = {
  id: string;
  source: 'dev-header' | 'supabase';
  label?: string;
};

export function getBearerToken(req: Request): string | null {
  const header = req.get('authorization');
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export async function getRequestUser(req: Request): Promise<AuthUser | null> {
  const token = getBearerToken(req);
  if (token) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    return {
      id: data.user.id,
      source: 'supabase',
      label: data.user.email ?? undefined,
    };
  }

  if (env.NODE_ENV !== 'development') {
    return null;
  }

  const devTeacherId = req.get('x-dev-teacher-id');
  if (!devTeacherId) {
    return null;
  }

  return {
    id: devTeacherId,
    source: 'dev-header',
    label: req.get('x-dev-teacher-name') ?? undefined,
  };
}
