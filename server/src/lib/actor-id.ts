import type { Request } from 'express';

import { getParticipantTokenFromRequest, verifyParticipantToken } from './participant-token';

/**
 * 호출 통제의 «누구» — 학생 한 명을 가리키는 키.
 *
 * 🚨 IP 로 재면 안 된다. 학교는 교실 전체가 공인 IP 하나로 나가기 때문에,
 *    IP 를 학생 키로 쓰면 첫 학생이 한도를 쓰는 순간 반 전체가 429 를 맞는다.
 *    (2026-08-10 «내 차례» 봉인 가드 점검에서 잡은 결함 — 같은 실수를 다른 라우트가 반복하지 않게 여기로 모았다.)
 *
 * 토큰이 없는 경우(라이브러리 자습 등)만 IP 로 떨어진다. 이때는 교실 공유 IP 로 뭉칠 수 있으므로
 * `ip:` 접두사를 붙여 «참여자 키가 아니다» 를 호출부에서 구분할 수 있게 남긴다 —
 * 호출부는 이 접두사를 보고 «한 명»이 아니라 «여럿일 수 있는 통»에 맞는 한도를 골라야 한다.
 */
export function resolveActorId(
  req: Pick<Request, 'ip' | 'socket' | 'get'>,
  // 🚨 검증 함수를 인자로 받는 이유는 오직 하나 — 이 «키를 어떻게 만드는가» 를 서명 비밀 없이
  //    검사할 수 있게 하기 위해서다. 비밀은 CI 에 없고, 없다고 검사를 건너뛰면
  //    「교실 전체가 한 명으로 묶이는」 회귀를 아무도 못 잡는다.
  verify: (token: string) => { participant_id: string } | null = verifyParticipantToken,
): string {
  const token = getParticipantTokenFromRequest(req as Request);
  const payload = token ? verify(token) : null;
  if (payload?.participant_id) {
    return `pt:${payload.participant_id}`;
  }
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

/** 이 키가 «학생 한 명»인가, «여럿이 뭉쳐 있을 수 있는 통»인가. */
export function isParticipantKey(actorId: string): boolean {
  return actorId.startsWith('pt:');
}
