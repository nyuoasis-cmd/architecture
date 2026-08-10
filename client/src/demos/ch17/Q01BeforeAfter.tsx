import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 1문 시연 — «고치기 전 상태를 안 재 두면» 무슨 일이 생기는지 그대로 겪게 한다.
// 🔑 학생이 «전 상태 기록»을 건너뛰면, 나중에 비교하려는 순간 비교할 것이 기억밖에 없다는 걸 화면이 보여 준다.

const AFTER = { fails: 1, of: 10, note: '고친 뒤 10번 시험 → 1번 헛돎' };

export default function Q01BeforeAfter(_props: DemoComponentProps) {
  const [recorded, setRecorded] = useState<null | boolean>(null);
  const [fixed, setFixed] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          대출 버튼이 가끔 헛돕니다. 이제 AI에게 고쳐 달라고 할 참이에요.{' '}
          <b className="font-semibold text-[var(--color-text-primary)]">고치기 전에 무엇을 하시겠어요?</b>
        </p>
      </div>

      {recorded === null && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setRecorded(true)}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          >
            📋 30초 써서 지금 상태를 재 둔다
          </button>
          <button
            type="button"
            onClick={() => setRecorded(false)}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[12.5px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
          >
            ⚡ 바로 고치러 간다
          </button>
        </div>
      )}

      {recorded !== null && (
        <div className="space-y-2">
          <div
            className={`rounded-xl border px-3.5 py-3 ${
              recorded ? 'border-emerald-300 bg-emerald-50' : 'border-[var(--color-border)] bg-white'
            }`}
          >
            <p className="text-[12px] font-semibold text-[var(--color-text-muted)]">고치기 전 기록</p>
            {recorded ? (
              <p className="mt-1 text-[12.5px] text-[var(--color-text-primary)]">
                «같은 잣대로 10번 빌려 봤다 → 3번 헛돎» <span className="text-[var(--color-text-muted)]">(3/10)</span>
              </p>
            ) : (
              <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)]">비어 있음 — 기억뿐</p>
            )}
          </div>

          {!fixed ? (
            <button
              type="button"
              onClick={() => setFixed(true)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
            >
              🔧 AI에게 고쳐 달라고 하고, 같은 잣대로 10번 다시 재기
            </button>
          ) : (
            <>
              <div className="rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-3">
                <p className="text-[12px] font-semibold text-[var(--color-text-muted)]">고친 뒤 기록</p>
                <p className="mt-1 text-[12.5px] text-[var(--color-text-primary)]">
                  «{AFTER.note}» <span className="text-[var(--color-text-muted)]">({AFTER.fails}/{AFTER.of})</span>
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
                {recorded ? (
                  <>
                    <p>
                      <b className="font-semibold">3/10 → 1/10. 좋아졌다고 말할 수 있습니다.</b> 같은 잣대로 잰 두 숫자가
                      있으니까요.
                    </p>
                    <p>
                      다만 한 가지는 아직 못 합니다 — «완전히 고쳐졌다»는 말이요. 1/10은 여전히 열 번에 한 번 헛돈다는
                      뜻이고, 그건 30명 교실에서 세 명입니다. 숫자가 있으면 이런 판단도 할 수 있습니다.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <b className="font-semibold">고친 뒤 1/10. 그런데 좋아진 건가요?</b> 비교할 것이 없습니다. 전에
                      몇 번 헛돌았는지는 이제 «기억»에만 있고, 기억은 늘 후하게 편집됩니다.
                    </p>
                    <p>
                      더 나쁜 경우도 있어요. 원래 0/10이었는데 내가 고치면서 1/10으로 <b className="font-semibold">나빠진
                      것</b>일 수도 있습니다. 기록이 없으면 이 둘을 구분할 방법이 아예 없습니다.
                    </p>
                    <p>
                      비용은 30초였습니다. 되돌려서 «재 두는» 쪽도 눌러 보세요.
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setRecorded(null);
                  setFixed(false);
                }}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-input)]"
              >
                ↩ 처음부터 다시 해 보기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
