// 하네스 심화 트랙(/harness/*) 제출 슬롯 클라이언트(3-B+3-C). 모듈 3(AC 자동저장)·모듈 6(졸업
// 제출) 공용. 서버가 참가자 쿠키(arch_pt, credentials:'include'로 자동 첨부)를 익명
// owner-token보다 우선 신원으로 사용한다(3-C) — 세션 미참가 시엔 owner-token으로 폴백.
// 익명 토큰 발급 패턴 출처: data-class client/src/lib/clientId.ts.
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

// "조회 실패"와 "제출 없음(null)"을 구분해야 함 — 구분하지 않으면 일시적 네트워크 실패를
// "신규"로 오인해 기존 저장분을 빈 값으로 덮어쓸 위험이 있다(codex 3-B 리뷰 지적).
export type FetchSubmissionResult =
  | { status: 'ok'; submission: ModuleSubmission | null }
  | { status: 'error' };

export async function fetchModuleSubmission(moduleId: string): Promise<FetchSubmissionResult> {
  try {
    const res = await fetch(`/api/harness/submissions/${moduleId}`, {
      credentials: 'include',
      headers: { [OWNER_TOKEN_HEADER]: getOwnerToken() },
    });
    if (!res.ok) {
      return { status: 'error' };
    }
    const body: unknown = await res.json();
    return { status: 'ok', submission: body as ModuleSubmission | null };
  } catch {
    return { status: 'error' };
  }
}

// moduleId별 저장 요청을 호출 순서대로 직렬화한다 — 그렇지 않으면(예: 모듈3 STEP 이탈 시
// unmount flush 요청과 재방문 후 새 디바운스 저장 요청이 동시에 in-flight 상태가 됐을 때)
// 네트워크 재정렬로 더 최신 요청의 응답이 먼저 도착해도 나중에 도착한 오래된 요청이 마지막에
// 서버에 반영돼 최신 내용을 덮어쓸 수 있다(codex 3-B 2차 리뷰 지적). 직렬화하면 다음 요청은
// 이전 요청의 응답을 받은 뒤에만 전송되므로 동시 in-flight 자체가 발생하지 않는다.
const saveChains = new Map<string, Promise<unknown>>();

export async function saveModuleSubmission(moduleId: string, content: object): Promise<boolean> {
  const prior = saveChains.get(moduleId) ?? Promise.resolve();
  const run = prior.catch(() => {}).then(async () => {
    try {
      const res = await fetch(`/api/harness/submissions/${moduleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', [OWNER_TOKEN_HEADER]: getOwnerToken() },
        body: JSON.stringify({ content }),
      });
      return res.ok;
    } catch {
      return false;
    }
  });
  saveChains.set(moduleId, run);
  return run;
}
