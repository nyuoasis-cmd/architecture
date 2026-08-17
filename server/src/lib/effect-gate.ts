// EffectGate — architecture 의 외부 비가역/유료 부작용을 QA run 에서 default-deny no-op.
// 포팅 원본: sprint/server/src/lib/effect-gate.ts (real-flow-qa 확장, architecture 적응).
//
// architecture 의 외부 부작용(실측 — sprint 와 다름):
//   · sprint 에 있던 emit:activity-record(youthschool 공유 테이블) / upload:sketch(Storage) 는 architecture 에 없음.
//   · 외부 비가역/유료 효과 = Anthropic 호출 (lab-ai.ts · vibe-my-turn.ts). 챗봇(chat-service)은
//     2026-08-17 체험 재구조화로 철거됐다 — AI 보조는 체험(실습실 ai▸ 목소리) 안에 산다.
// 자기 테이블 mutation(sessions/participants/progress/chats)은 부작용이 아니라
// QA 격리·태깅(qaTagFields)으로 다룬다.
//
// 가치: Layer A 크롤러는 QA teacher 토큰으로 돌기 때문에, 크롤 중 채팅 트리거 시 QA 컨텍스트가
//   설정됨 → 이 게이트가 Anthropic 호출을 default-deny no-op → 크롤이 실 토큰/비용을 태우지 않음.
//   실학생 anon 채팅엔 QA 헤더가 없어 컨텍스트 미설정 → 정상 호출(회귀 0).

import { getQaContext } from './qa-context';

export type EffectName = 'external:chat-llm';

// 비어있음 = QA run 에서 등록된 모든 부작용을 default-deny. (안전 입증된 효과만 allowlist 추가)
const QA_ALLOWLIST: ReadonlySet<EffectName> = new Set<EffectName>();

export interface QaBlocked { readonly __qaBlocked: true; }
export function isQaBlocked(value: unknown): value is QaBlocked {
  return !!value && typeof value === 'object' && (value as QaBlocked).__qaBlocked === true;
}

// 차단 이벤트 in-memory 로그 — qa-diagnostics 가 QA 엔드포인트로 회수.
interface GateBlock { runId: string; effect: EffectName; at: string; browserId: string | null; }
const blockLog: GateBlock[] = [];
const MAX_BLOCK_LOG = 5000; // 메모리 가드(장기 실행 방지)

export function getEffectGateBlocks(runId?: string, browserId?: string): GateBlock[] {
  let view = runId ? blockLog.filter((b) => b.runId === runId) : [...blockLog];
  if (browserId !== undefined) {
    view = view.filter((b) => b.browserId === browserId);
  }
  return view;
}
export function clearEffectGateBlocks(runId?: string): void {
  if (!runId) { blockLog.length = 0; return; }
  for (let i = blockLog.length - 1; i >= 0; i--) {
    if (blockLog[i].runId === runId) blockLog.splice(i, 1);
  }
}

/**
 * QA run 이고 부작용이 allowlist 에 없으면 실행을 건너뛰고 QaBlocked 반환(no-op).
 * 그 외(비-QA, 또는 allowlisted)는 run() 을 그대로 실행 — 비-QA 회귀 0.
 */
export async function guardEffect<T>(name: EffectName, run: () => Promise<T>): Promise<T | QaBlocked> {
  const ctx = getQaContext();
  if (ctx && !QA_ALLOWLIST.has(name)) {
    if (blockLog.length < MAX_BLOCK_LOG) {
      blockLog.push({ runId: ctx.runId, effect: name, at: new Date().toISOString(), browserId: ctx.browserId ?? null });
    }
    console.warn(`[EffectGate] QA run ${ctx.runId}: '${name}' default-deny no-op`);
    return { __qaBlocked: true };
  }
  return run();
}
