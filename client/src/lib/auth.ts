import type { User } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { clearDevUser, getDevUser, subscribeDevUser, type DevUser } from './dev-auth';
import { supabaseClient } from './supabase-client';

const AUTH_REDIRECT_KEY = 'architecture-auth-redirect';

type AuthSnapshot = {
  isLoading: boolean;
  supabaseUser: User | null;
  devUser: DevUser | null;
};

type AuthState = {
  isLoading: boolean;
  user: User | null;
};

const listeners = new Set<() => void>();

let authState: AuthState = {
  isLoading: Boolean(supabaseClient),
  user: null,
};
let authInitialized = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function setAuthState(nextState: Partial<AuthState>) {
  authState = {
    ...authState,
    ...nextState,
  };
  emit();
}

function initAuthStore() {
  if (authInitialized) {
    return;
  }

  authInitialized = true;

  if (!supabaseClient) {
    authState = { isLoading: false, user: null };
    return;
  }

  void supabaseClient.auth.getSession().then(({ data, error }) => {
    setAuthState({
      isLoading: false,
      user: error ? null : (data.session?.user ?? null),
    });
  });

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    setAuthState({
      isLoading: false,
      user: session?.user ?? null,
    });
  });
}

function subscribe(onStoreChange: () => void) {
  initAuthStore();
  listeners.add(onStoreChange);

  const unsubscribeDev = subscribeDevUser(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    unsubscribeDev();
  };
}

function getSnapshot(): AuthSnapshot {
  initAuthStore();
  return {
    isLoading: authState.isLoading,
    supabaseUser: authState.user,
    devUser: getDevUser(),
  };
}

function getServerSnapshot(): AuthSnapshot {
  return {
    isLoading: false,
    supabaseUser: null,
    devUser: null,
  };
}

export function getPostLoginRedirect() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
}

export function setPostLoginRedirect(target: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, target);
}

export function consumePostLoginRedirect() {
  if (typeof window === 'undefined') {
    return null;
  }

  const target = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  if (target) {
    window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  }
  return target;
}

export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const source = snapshot.supabaseUser ? 'supabase' : snapshot.devUser ? 'dev' : null;
  const userId = snapshot.supabaseUser?.id ?? snapshot.devUser?.id ?? null;
  const email = snapshot.supabaseUser?.email ?? null;
  const displayName =
    snapshot.supabaseUser?.user_metadata?.full_name ??
    snapshot.supabaseUser?.user_metadata?.name ??
    email ??
    snapshot.devUser?.name ??
    null;

  return {
    isLoading: snapshot.isLoading,
    isAuthenticated: Boolean(source && userId),
    source,
    userId,
    email,
    displayName,
    supabaseUser: snapshot.supabaseUser,
    devUser: snapshot.devUser,
  } as const;
}

export async function getTeacherAuthHeaders() {
  if (supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    const accessToken = data.session?.access_token;
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      } satisfies Record<string, string>;
    }
  }

  const devUser = getDevUser();
  if (!devUser) {
    return {} as Record<string, string>;
  }

  return {
    'x-dev-teacher-id': devUser.id,
    'x-dev-teacher-name': devUser.name,
  } satisfies Record<string, string>;
}

export async function signInKakao(target?: string) {
  if (!supabaseClient) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  }

  if (target) {
    setPostLoginRedirect(target);
  }

  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  clearDevUser();
  consumePostLoginRedirect();
}
