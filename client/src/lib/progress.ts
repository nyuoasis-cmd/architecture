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

// 서버 동기화는 «신원이 있는» 학생만 할 수 있다(참여자 토큰 또는 로그인).
// 라이브러리 자습처럼 신원이 없는 열람은 401 이 돌아오는데, 참여자 쿠키가 httpOnly 라
// 클라이언트가 미리 알 방법이 없다. 그래서 «한 번 거절당하면 그 브라우징 동안은 더 부르지 않는다».
// 🔑 진도 자체는 localStorage 에 계속 남는다 — 꺼지는 것은 서버 동기화뿐이다.
let remoteSyncDisabled = false;

/** 세션에 참여해 신원이 생겼을 때 다시 켠다(참여 전 열람에서 꺼졌을 수 있다). */
export function enableProgressSync() {
  remoteSyncDisabled = false;
}

async function syncProgressRemote(
  qaId: string,
  payload: { readAt?: string; quizScore?: number; labMissionIndex?: number; labEarnedIndex?: number },
) {
  if (import.meta.env.DEV) {
    return;
  }
  if (remoteSyncDisabled) {
    return;
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const response = await fetch('/api/progress', {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        qa_id: qaId,
        read_at: payload.readAt,
        quiz_score: payload.quizScore,
        lab_mission_index: payload.labMissionIndex,
        lab_earned_index: payload.labEarnedIndex,
      }),
    });
    if (response.status === 401 || response.status === 403) {
      // 신원이 없는 열람 — 매 문마다 401 을 쌓지 않는다.
      remoteSyncDisabled = true;
    }
  } catch {
    // local cache 유지, 다음 호출에서 재시도
  }
}

/**
 * 실습실 미션 자리를 서버에 보고한다 (2026-08-16 신입샘 t1 — 교사 화면이 이걸 읽는다).
 *
 * 🚨 **값이 달라졌을 때만** 부른다. 셸이 상태를 갱신할 때마다 부르면 학생 한 명이 90분에
 *    수백 번을 보낸다 — 25명이면 수업 중 쓸데없는 트래픽이 그만큼 된다.
 * 🔑 미션은 90분에 7번 움직인다. 그래서 실제 호출은 학생당 최대 7번이다.
 * 🚨 실패해도 **아무것도 안 한다.** 이건 교사 화면의 «보기»용 값이고, 학생 실습은 이것과
 *    무관하게 굴러가야 한다 — 진도 보고가 학생을 막는 자리가 되면 안 된다.
 */
let lastLabReport: { qaId: string; at: number } | null = null;

export function reportLabMission(qaId: string, missionIndex: number, earnedIndex: number) {
  if (lastLabReport && lastLabReport.qaId === qaId && lastLabReport.at === missionIndex) {
    return;
  }
  lastLabReport = { qaId, at: missionIndex };
  void syncProgressRemote(qaId, { labMissionIndex: missionIndex, labEarnedIndex: earnedIndex });
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
