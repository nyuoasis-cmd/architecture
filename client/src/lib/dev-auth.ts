import { useSyncExternalStore } from 'react';

const KEY = 'architecture-dev-user-v1';

export type DevUser = {
  id: string;
  name: string;
};

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedUser: DevUser | null = null;

function emit() {
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

function parse(raw: string | null): DevUser | null {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as DevUser;
    if (!value.id || !value.name) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function getDevUser(): DevUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(KEY);
  if (raw === cachedRaw) {
    return cachedUser;
  }
  cachedRaw = raw;
  cachedUser = parse(raw);
  return cachedUser;
}

export function setDevUser(user: DevUser) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(KEY, JSON.stringify(user));
  emit();
}

export function clearDevUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(KEY);
  emit();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === KEY) {
        emit();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(onStoreChange);
      window.removeEventListener('storage', handleStorage);
    };
  }

  return () => {
    listeners.delete(onStoreChange);
  };
}

export const subscribeDevUser = subscribe;

export function useDevUser() {
  return useSyncExternalStore(subscribe, getDevUser, () => null);
}
