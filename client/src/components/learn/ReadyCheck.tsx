import { useState } from 'react';

/**
 * 준비 점검 — 수업 입장 직후 1화면 (SDD 결정 19). 목차 밖이다 — «0강»을 세우지 않는다.
 *
 * 점검 4가지: 브라우저 · 한글 입력 · 새 탭 열림 · 외부 링크 도달.
 * 🚨 앱이 수업을 막지 않는다 — 건너뛰기가 항상 있고, «안 열려요»도 실패가 아니라 관측이다
 *    (외부 링크가 막힌 교실은 견학이 스냅샷으로 진행된다 — 그걸 미리 아는 게 이 화면의 값어치다).
 * 🔑 한 수업(sessionId)당 한 번만 뜬다 — localStorage 로 기억한다.
 */
export function readyCheckSeen(sessionId: string): boolean {
  try {
    return localStorage.getItem(`ready-check:${sessionId}`) === '1';
  } catch {
    return true; // 저장이 안 되는 브라우저에서 매번 뜨게 두지 않는다.
  }
}

export default function ReadyCheck({ sessionId, onDone }: { sessionId: string; onDone: () => void }) {
  const [korean, setKorean] = useState('');
  const [tabOpened, setTabOpened] = useState(false);
  const [linkResult, setLinkResult] = useState<'none' | 'ok' | 'blocked'>('none');

  const koreanOk = /[가-힣]{2,}/.test(korean);

  const finish = () => {
    try {
      localStorage.setItem(`ready-check:${sessionId}`, '1');
    } catch {
      /* 저장 실패는 치명이 아니다 — 다음에 한 번 더 뜰 뿐이다. */
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <section className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-xl">
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">수업 준비 점검 — 1분이면 돼요</h2>
        <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
          이 수업에는 직접 쳐 보고, 새 탭으로 견학 가는 시간이 있어요. 내 자리가 준비됐는지만 봐요.
        </p>

        <ol className="mt-4 space-y-3">
          <li className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-[13.5px]">
            <b>1. 브라우저</b> — 이 화면이 보이면 통과예요. ✓
          </li>

          <li className={`rounded-xl border px-4 py-3 text-[13.5px] ${koreanOk ? 'border-emerald-200 bg-emerald-50/50' : 'border-[var(--color-border)]'}`}>
            <b>2. 한글 입력</b> — 아래 칸에 <b>가나다</b> 를 쳐 보세요. {koreanOk ? '✓' : ''}
            <input
              aria-label="한글 입력 점검"
              className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              onChange={(event) => setKorean(event.target.value)}
              placeholder="가나다"
              value={korean}
            />
          </li>

          <li className={`rounded-xl border px-4 py-3 text-[13.5px] ${tabOpened ? 'border-emerald-200 bg-emerald-50/50' : 'border-[var(--color-border)]'}`}>
            <b>3. 새 탭</b> — 견학은 새 탭으로 열려요. {tabOpened ? '✓' : ''}
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                className="rounded-lg bg-[var(--color-text-primary)] px-3 py-1.5 text-[12.5px] font-bold text-white"
                href="/"
                rel="noopener noreferrer"
                target="_blank"
              >
                새 탭 열어 보기 ↗
              </a>
              <button
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] font-semibold"
                onClick={() => setTabOpened(true)}
                type="button"
              >
                열렸어요
              </button>
            </div>
          </li>

          <li className={`rounded-xl border px-4 py-3 text-[13.5px] ${linkResult !== 'none' ? 'border-emerald-200 bg-emerald-50/50' : 'border-[var(--color-border)]'}`}>
            <b>4. 외부 링크</b> — 학교 밖 페이지에 갈 수 있는지 봐요. {linkResult !== 'none' ? '✓ 확인했어요' : ''}
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                className="rounded-lg bg-[var(--color-text-primary)] px-3 py-1.5 text-[12.5px] font-bold text-white"
                href="https://www.google.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                바깥 페이지 열어 보기 ↗
              </a>
              <button
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] font-semibold"
                onClick={() => setLinkResult('ok')}
                type="button"
              >
                열렸어요
              </button>
              <button
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-[12.5px] font-semibold"
                onClick={() => setLinkResult('blocked')}
                type="button"
              >
                안 열려요
              </button>
            </div>
            {linkResult === 'blocked' ? (
              <p className="mt-2 text-[12.5px] leading-[1.7] text-[var(--color-text-body)]">
                괜찮아요 — 이 교실에서는 견학이 <b>스냅샷</b>(담아 둔 화면)으로 진행돼요. 수업은 그대로 할
                수 있어요. 선생님께 「바깥 링크가 안 열려요」라고 한 번 알려 주면 좋아요.
              </p>
            ) : null}
          </li>
        </ol>

        <div className="mt-5 flex items-center gap-3">
          <button
            className="rounded-[10px] bg-[var(--color-btn-primary)] px-5 py-2.5 text-[14px] font-bold text-white"
            onClick={finish}
            type="button"
          >
            수업 시작
          </button>
          {/* 🚨 앱이 수업을 막지 않는다 — 점검을 다 안 해도 언제든 들어갈 수 있다. */}
          <button
            className="text-[12.5px] text-[var(--color-text-muted)] underline"
            onClick={finish}
            type="button"
          >
            건너뛰기
          </button>
        </div>
      </section>
    </div>
  );
}
