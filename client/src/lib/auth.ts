import type { User } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { clearDevUser, getDevUser, subscribeDevUser, type DevUser } from './dev-auth';
import { supabaseClient } from './supabase-client';

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

let cachedSnapshot: AuthSnapshot = {
  isLoading: false,
  supabaseUser: null,
  devUser: null,
};
let lastIsLoading: boolean | undefined;
let lastUser: User | null | undefined;
let lastDevUser: DevUser | null | undefined;

function getSnapshot(): AuthSnapshot {
  initAuthStore();
  const il = authState.isLoading;
  const u = authState.user;
  const du = getDevUser();
  if (il !== lastIsLoading || u !== lastUser || du !== lastDevUser) {
    lastIsLoading = il;
    lastUser = u;
    lastDevUser = du;
    cachedSnapshot = { isLoading: il, supabaseUser: u, devUser: du };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): AuthSnapshot {
  return {
    isLoading: false,
    supabaseUser: null,
    devUser: null,
  };
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

export async function signOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  clearDevUser();

  if (typeof window !== 'undefined') {
    window.location.assign('/');
  }
}
