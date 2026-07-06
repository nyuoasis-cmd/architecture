// 하네스 심화 트랙(/harness/*) 제출 슬롯 클라이언트(3-B). 모듈 3(AC 자동저장)·모듈 6(졸업 제출) 공용.
// /harness/*는 로그인·세션 참가 없는 오픈 프리뷰라 익명 브라우저 토큰(서명 없음, 3-C에서 실제
// 세션/참가자 모델로 교체 예정)으로 식별한다. 패턴 출처: data-class client/src/lib/clientId.ts.
const OWNER_TOKEN_STORAGE_KEY = 'harness-owner-id';
const OWNER_TOKEN_HEADER = 'X-Harness-Owner-Token';

export function getOwnerToken(): string {
  const saved = window.localStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
  if (saved && saved.length >= 16) {
    return saved;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(OWNER_TOKEN_STORAGE_KEY, created);
  return created;
}

export type ModuleSubmission = { content: unknown; updatedAt: string };

export async function fetchModuleSubmission(moduleId: string): Promise<ModuleSubmission | null> {
  try {
    const res = await fetch(`/api/harness/submissions/${moduleId}`, {
      headers: { [OWNER_TOKEN_HEADER]: getOwnerToken() },
    });
    if (!res.ok) {
      return null;
    }
    const body: unknown = await res.json();
    return body as ModuleSubmission | null;
  } catch {
    return null;
  }
}

export async function saveModuleSubmission(moduleId: string, content: object): Promise<boolean> {
  try {
    const res = await fetch(`/api/harness/submissions/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', [OWNER_TOKEN_HEADER]: getOwnerToken() },
      body: JSON.stringify({ content }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
