/**
 * 실습실 ↔ 서버.
 *
 * 🚨 **학생당 횟수 한도가 없다**(2026-08-15 jery). 그래서 「남은 횟수」도 세지 않고 보여 주지 않는다 —
 *    수업 도중 「횟수를 다 썼습니다」를 만나는 것이, 학생이 AI 를 몇 번 더 부르는 것보다 나쁘다.
 *
 * 🚨 그래도 막힌 이유는 뭉치지 않는다. 남은 둘은 학생이 할 일이 다르다:
 *    「지금 붐빈다」(몇 초 뒤 다시)와 「고장」(선생님께 알린다).
 */

export type LabFailure =
  | { kind: 'rate'; retryAfterSeconds: number }
  | { kind: 'unavailable'; reason: string }
  | { kind: 'failed' };

export type LabApiResult<T> = { ok: true; data: T } | { ok: false; failure: LabFailure };

type Envelope = { error?: string; reason?: string; retryAfterSeconds?: number };

async function post<T>(path: string, body: unknown): Promise<LabApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // 🔑 네트워크가 끊긴 것도 «고장»이다.
    return { ok: false, failure: { kind: 'failed' } };
  }

  const payload = (await response.json().catch(() => null)) as (Envelope & T) | null;

  if (response.ok && payload) return { ok: true, data: payload as T };

  const failure: LabFailure =
    response.status === 429
      ? { kind: 'rate', retryAfterSeconds: payload?.retryAfterSeconds ?? 30 }
      : response.status === 503
        ? { kind: 'unavailable', reason: payload?.reason ?? 'unknown' }
        : { kind: 'failed' };

  return { ok: false, failure };
}

export type LabReview = { good: string; issues: { where: string; why: string }[] };

export function labReview(draft: string) {
  return post<{ review: LabReview }>('/api/lab/review', { draft });
}

export function labVerify(rules: string) {
  return post<{ outputs: string[] }>('/api/lab/verify', { rules });
}

export function labAsk(question: string) {
  return post<{ answer: string }>('/api/lab/ask', { question });
}

/**
 * AI 목소리 2단 — 로컬이 못 알아들은 자유 문장 해석 (SDD 결정 6).
 * 🚨 suggestedCommand 는 제안이다. 받는 쪽은 절대 대신 실행하지 않는다 — 표시까지만.
 */
export function labVoice(payload: { text: string; missionGoal: string; nextCommand: string }) {
  return post<{ reply: string[]; suggestedCommand: string | null }>('/api/lab/voice', payload);
}

/** 체험 산출물 한 장을 계보에 쌓는다(SDD 결정 15). 'rules' 는 제출 경로가 따로 쌓는다. */
export function labSaveArtifact(kind: string, content: string) {
  return post<{ revision: number }>('/api/lab/artifact', { kind, content });
}

/**
 * 막힌 이유를 학생이 읽을 문장으로. 🚨 **다음에 무엇을 할지**까지 적는다 —
 *    「실패했습니다」만 쓰면 학생은 그저 다시 누른다.
 */
export function failureLines(failure: LabFailure): { text: string; tone: 'bad' | 'warn' | 'dim' }[] {
  switch (failure.kind) {
    case 'rate':
      return [
        { text: `지금 다른 친구들이 몰려 있습니다. ${failure.retryAfterSeconds}초 뒤에 다시 해 주세요.`, tone: 'warn' },
        { text: '  여러분 잘못이 아니고, 쓸 수 있는 횟수가 줄어들지도 않습니다.', tone: 'dim' },
      ];
    case 'unavailable':
      return [
        { text: '지금은 AI 를 부를 수 없습니다 — 실시간 호출 실패.', tone: 'bad' },
        { text: '  선생님께 알려 주세요. 여러분 잘못이 아닙니다.', tone: 'dim' },
      ];
    default:
      return [
        { text: '실시간 호출 실패 — 잠시 뒤 다시 해 주세요.', tone: 'bad' },
        { text: '  이건 우리 쪽 문제입니다. 몇 번이고 다시 시도해도 됩니다.', tone: 'dim' },
      ];
  }
}

export type LabVerdictRow = { name: string; ok: boolean; reason?: string };
export type LabVerdict = { outputs: string[]; rows: LabVerdictRow[]; passed: number; total: number };

export function labSubmit(qaId: string, rules: string) {
  return post<{ revision: number; verdict: LabVerdict }>('/api/lab/submit', { qaId, rules });
}

/**
 * 내가 낸 마지막 판. 🔑 화면이 열릴 때 읽어 «이어서 고치기»를 가능하게 한다 —
 *    탭을 닫았다 와도, 다른 기기에서 열어도 낸 것이 남아 있어야 한다.
 */
export async function labLatestSubmission(
  qaId: string,
): Promise<{ revision: number; rules: string; verdict: LabVerdict | null } | null> {
  try {
    const response = await fetch(`/api/lab/submission?qaId=${encodeURIComponent(qaId)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { submission?: { revision: number; rules: string; verdict: LabVerdict | null } | null };
    return payload.submission ?? null;
  } catch {
    return null;
  }
}
