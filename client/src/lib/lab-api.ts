/**
 * 실습실 ↔ 서버. 🚨 **남은 횟수는 서버가 말하는 것만 믿는다** — 화면이 자기 상한을 세면
 *    채점 로그와 똑같은 이유로 위조된다(클라이언트가 들고 있는 숫자는 근거가 아니다).
 *
 * 🚨 막힌 이유를 뭉치지 않는다. 「돈 천장」·「내 횟수 소진」·「너무 자주」·「고장」은 조치가 전부 다르고,
 *    학생이 다음에 할 행동도 다르다. 하나로 뭉치면 다시 누르기만 반복한다.
 */

export type LabRemaining = { mission: number; ask: number; perStudent: boolean };

export type LabFailure =
  | { kind: 'budget' }
  | { kind: 'quota'; which: 'mission' | 'ask' }
  | { kind: 'rate'; retryAfterSeconds: number }
  | { kind: 'unavailable'; reason: string }
  | { kind: 'failed' };

export type LabApiResult<T> =
  | { ok: true; data: T; remaining: LabRemaining }
  | { ok: false; failure: LabFailure; remaining: LabRemaining | null };

type Envelope = {
  error?: string;
  kind?: 'mission' | 'ask';
  reason?: string;
  retryAfterSeconds?: number;
  remaining?: LabRemaining;
};

async function post<T>(path: string, body: unknown): Promise<LabApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // 🔑 네트워크가 끊긴 것도 «고장»이다. 학생 횟수는 서버가 이미 환불했거나 애초에 안 썼다.
    return { ok: false, failure: { kind: 'failed' }, remaining: null };
  }

  const payload = (await response.json().catch(() => null)) as (Envelope & T) | null;
  const remaining = payload?.remaining ?? null;

  if (response.ok && payload) {
    return { ok: true, data: payload as T, remaining: remaining ?? { mission: 0, ask: 0, perStudent: true } };
  }

  const failure: LabFailure =
    response.status === 402
      ? { kind: 'budget' }
      : response.status === 409
        ? { kind: 'quota', which: payload?.kind ?? 'mission' }
        : response.status === 429
          ? { kind: 'rate', retryAfterSeconds: payload?.retryAfterSeconds ?? 30 }
          : response.status === 503
            ? { kind: 'unavailable', reason: payload?.reason ?? 'unknown' }
            : { kind: 'failed' };

  return { ok: false, failure, remaining };
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

export async function labQuota(): Promise<LabRemaining | null> {
  try {
    const response = await fetch('/api/lab/quota');
    if (!response.ok) return null;
    const payload = (await response.json()) as { remaining?: LabRemaining };
    return payload.remaining ?? null;
  } catch {
    return null;
  }
}

/**
 * 막힌 이유를 학생이 읽을 문장으로. 🚨 **다음에 무엇을 할지**까지 적는다 —
 *    「실패했습니다」만 쓰면 학생은 그저 다시 누른다.
 */
export function failureLines(failure: LabFailure): { text: string; tone: 'bad' | 'warn' | 'dim' }[] {
  switch (failure.kind) {
    case 'budget':
      return [
        // 🚨 「오늘은」이라 쓰면 안 된다 — 장부는 **월** 단위(UTC)라 내일도 막혀 있다.
        { text: '이번 달 이 실습실의 AI 예산을 다 썼습니다.', tone: 'bad' },
        { text: '  선생님께 알려 주세요. 다시 눌러도 열리지 않습니다.', tone: 'dim' },
      ];
    case 'quota':
      return failure.which === 'ask'
        ? [
            { text: '질문할 수 있는 횟수를 다 썼습니다.', tone: 'warn' },
            { text: '  미션 횟수는 따로 남아 있습니다 — claude review 는 아직 쓸 수 있어요.', tone: 'dim' },
          ]
        : [
            { text: '미션에 쓸 수 있는 AI 횟수를 다 썼습니다.', tone: 'warn' },
            { text: '  지금까지 쓴 규칙 문서는 그대로 남아 있습니다. 손으로 더 고쳐 보세요.', tone: 'dim' },
          ];
    case 'rate':
      return [
        { text: `너무 빨리 여러 번 눌렀습니다. ${failure.retryAfterSeconds}초 뒤에 다시 해 주세요.`, tone: 'warn' },
        { text: '  횟수는 안 닳았습니다.', tone: 'dim' },
      ];
    case 'unavailable':
      return [
        { text: '지금은 AI 를 부를 수 없습니다 — 실시간 호출 실패.', tone: 'bad' },
        { text: '  선생님께 알려 주세요. 여러분 잘못이 아니고, 횟수도 안 닳았습니다.', tone: 'dim' },
      ];
    default:
      return [
        { text: '실시간 호출 실패 — 잠시 뒤 다시 해 주세요.', tone: 'bad' },
        { text: '  이건 우리 쪽 문제라 횟수를 돌려드렸습니다.', tone: 'dim' },
      ];
  }
}
