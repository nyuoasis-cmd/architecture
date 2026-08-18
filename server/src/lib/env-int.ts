/**
 * env 정수 읽기 — AI 상한·동시성 값을 «무배포» 로 조정하기 위한 공용 부품.
 *
 * 🚨 코드 상수로만 두면 상향에 배포가 필요해서, 수업 당일 막혔을 때 손쓸 수가 없다.
 * 🚨 `allowZero` 가 없으면 «0 을 넣어 끄는» 조정이 조용히 무시된다 — 0 은 «양수 아님»이라
 *    기본값으로 되돌아가기 때문이다. 0 이 정상 설정값인 자리(창 폭·쿨타임 따위)에 필요하다.
 *
 * 🔑 원래는 vibe-my-turn.ts 안에 살았다. 「내 차례」 서버가 철거되면서(2026-08-18) 이리로 옮겼다 —
 *    실습실(lab-ai.ts)이 이 함수에 매달려 있어서, 남길 것을 없앨 것 안에 두면 안 된다.
 */
export function envInt(key: string, fallback: number, allowZero = false): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  const floor = allowZero ? 0 : 1;
  return Number.isFinite(n) && n >= floor ? Math.floor(n) : fallback;
}
