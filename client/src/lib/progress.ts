import { useSyncExternalStore } from 'react';
import { getQasByChapterId } from '../data/qa-stubs';

const KEY = 'architecture-progress-v1';
const WRITE_DELAY_MS = 600;

export type ProgressEntry = {
  read: boolean;
  quizScore?: number;
  updatedAt: number;
};

export type ProgressMap = Record<string, ProgressEntry>;

let cache: ProgressMap | null = null;
let writeTimer: number | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): ProgressMap {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function ensureCache(): ProgressMap {
  if (cache) {
    return cache;
  }

  if (typeof window === 'undefined') {
    cache = {};
    return cache;
  }

  cache = parse(window.localStorage.getItem(KEY));
  return cache;
}

function flushWrite() {
  if (typeof window === 'undefined' || !cache) {
    return;
  }

  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

function scheduleWrite() {
  if (typeof window === 'undefined') {
    return;
  }

  if (writeTimer) {
    window.clearTimeout(writeTimer);
  }

  writeTimer = window.setTimeout(() => {
    flushWrite();
    writeTimer = null;
  }, WRITE_DELAY_MS);
}

function emit() {
  listeners.forEach((listener) => listener());
}

function updateProgress(qaId: string, updater: (current?: ProgressEntry) => ProgressEntry) {
  const next = { ...ensureCache() };
  next[qaId] = updater(next[qaId]);
  cache = next;
  scheduleWrite();
  emit();
}

export function getProgress(qaId: string): ProgressEntry | undefined {
  return ensureCache()[qaId];
}

export function getAllProgress(): ProgressMap {
  return ensureCache();
}

function readDevUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem('architecture-dev-user-v1');
    if (!raw) {
      return null;
    }
    const value = JSON.parse(raw) as { id?: string };
    return value?.id ?? null;
  } catch {
    return null;
  }
}

async function syncProgressRemote(qaId: string, payload: { readAt?: string; quizScore?: number }) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const devId = readDevUserId();
    if (import.meta.env.DEV && !devId) {
      return;
    }
    if (devId && import.meta.env.DEV) {
      headers['x-dev-teacher-id'] = devId;
    }
    await fetch('/api/progress', {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        qa_id: qaId,
        read_at: payload.readAt,
        quiz_score: payload.quizScore,
      }),
    });
  } catch {
    // local cache 유지, 다음 호출에서 재시도
  }
}

export function markRead(qaId: string) {
  updateProgress(qaId, (current) => ({
    read: true,
    quizScore: current?.quizScore,
    updatedAt: Date.now(),
  }));
  void syncProgressRemote(qaId, { readAt: new Date().toISOString() });
}

export function setQuizScore(qaId: string, score: number) {
  updateProgress(qaId, (current) => ({
    read: current?.read ?? true,
    quizScore: score,
    updatedAt: Date.now(),
  }));
  void syncProgressRemote(qaId, { quizScore: score });
}

export function getChapterProgress(chapterId: number): { done: number; total: number } {
  const qas = getQasByChapterId(chapterId);
  const progress = ensureCache();
  const done = qas.filter((qa) => {
    const entry = progress[qa.id];
    if (!entry) {
      return false;
    }

    return entry.quizScore !== undefined ? entry.quizScore >= 2 : entry.read;
  }).length;

  return { done, total: qas.length };
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== KEY) {
        return;
      }

      cache = parse(event.newValue);
      emit();
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

export function useProgressMap(): ProgressMap {
  return useSyncExternalStore(subscribe, getAllProgress, () => ({}));
}
