// QA 컨텍스트 — 요청 라이프사이클 동안 "이 요청은 QA run의 일부"임을 전파.
// AsyncLocalStorage 사용 → 라우트의 insert/update 함수가 시그니처 변경 없이 컨텍스트를 읽어
// qa_run_id/created_by_qa 를 동반 기록하고, EffectGate 가 QA run 을 식별한다.
// 포팅 원본: sprint/server/src/lib/qa-context.ts (real-flow-qa 확장, architecture 적응).

import { AsyncLocalStorage } from 'node:async_hooks';

export interface QaContext {
  /** 정리·집계의 키. teacher 토큰 발급 또는 QA 세션 스코프에서 파생. */
  runId: string;
  /** 진단용: 컨텍스트 출처. 'auth'=인증 QA 계정(teacher), 'session'=QA 세션 스코프 상속(anon 학생). */
  source: 'auth' | 'session';
  role?: 'teacher';
  accountId?: string;
  /** per-browser 진단 추적. X-QA-Browser-Id 헤더로 전파(thirty-browser spec idx 1..30). */
  browserId?: string;
}

const storage = new AsyncLocalStorage<QaContext>();

/** ctx 를 설정하고 fn(보통 Express next()) 을 그 컨텍스트 안에서 실행. */
export function runWithQaContext<T>(ctx: QaContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/** 현재 요청이 QA run 이면 컨텍스트, 아니면 undefined. */
export function getQaContext(): QaContext | undefined {
  return storage.getStore();
}

/** 현재 요청이 QA run 인가(태깅·게이트·로그 스킵 판정용). */
export function isQaRun(): boolean {
  return storage.getStore() !== undefined;
}

/**
 * QA run 이면 insert/upsert row 에 spread 할 태깅 필드, 아니면 빈 객체.
 * 라우트 insert 가 `{ ...row, ...qaTagFields() }` 로 호출 — 시그니처 무변경.
 * 비-QA 요청에선 `{}` 라 기존 동작 무영향(회귀 0).
 */
export function qaTagFields(): { qa_run_id: string; created_by_qa: true } | Record<string, never> {
  const ctx = storage.getStore();
  if (!ctx) return {};
  return { qa_run_id: ctx.runId, created_by_qa: true };
}

/** 현재 요청의 X-QA-Browser-Id 값(architecture_qa_audit_log INSERT, blockLog 진단에 사용). */
export function getQaBrowserId(): string | null {
  return storage.getStore()?.browserId ?? null;
}
