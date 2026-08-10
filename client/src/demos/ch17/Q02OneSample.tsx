import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 17장 2문 시연 — 진짜 성공률이 «80%»로 고정된 기능을 여러 번 재 본다.
// 🔑 학생은 진짜 값을 알고 시작한다. 그런데도 한 번 재기(10회 묶음)의 결과는 60%~100% 사이에서 튄다.
//    «측정이 흔들린다»를 말로 설명하는 대신, 정답을 알면서 직접 흔들리는 걸 보게 하는 게 요점이다.

const TRUE_RATE = 0.8;
const BATCH = 10;

export default function Q02OneSample(_props: DemoComponentProps) {
  const [runs, setRuns] = useState<number[]>([]);

  const measure = () => {
    let ok = 0;
    for (let i = 0; i < BATCH; i += 1) if (Math.random() < TRUE_RATE) ok += 1;
    setRuns((prev) => [...prev, ok]);
  };

  const total = runs.reduce((a, b) => a + b, 0);
  const overall = runs.length ? Math.round((total / (runs.length * BATCH)) * 100) : 0;
  const min = runs.length ? Math.min(...runs) : 0;
  const max = runs.length ? Math.max(...runs) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
        <p className="text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
          이 기능의 <b className="font-semibold text-[var(--color-text-primary)]">진짜 성공률은 80%</b>입니다. 우리만
          알고 있어요. 이제 «10번 시험해 보기»를 눌러 재 봅시다. 몇 %가 나올까요?
        </p>
      </div>

      <button
        type="button"
        onClick={measure}
        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
      >
        🎲 10번 시험해 보기 {runs.length > 0 && `(${runs.length}번째 측정)`}
      </button>

      {runs.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {runs.map((r, i) => (
              <span
                key={i}
                className={`rounded-md border px-2 py-1 text-[12px] tabular-nums ${
                  r * 10 >= 90 || r * 10 <= 70
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)]'
                }`}
              >
                {i + 1}회차 {r * 10}%
              </span>
            ))}
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            지금까지 {runs.length}번 측정 · 가장 낮은 값 {min * 10}% · 가장 높은 값 {max * 10}% · 전부 합치면{' '}
            <b className="font-semibold text-[var(--color-text-primary)] tabular-nums">{overall}%</b>
          </p>
        </div>
      )}

      {runs.length >= 3 && (
        <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
          <p>
            진짜 값은 80%로 <b className="font-semibold">한 번도 바뀌지 않았습니다.</b> 그런데 측정값은{' '}
            {min * 10}%에서 {max * 10}% 사이를 오갔어요. 코드를 고친 적도, 부탁문을 바꾼 적도 없습니다.
          </p>
          <p>
            여기서 첫 번째 측정만 보고 «{runs[0] * 10}%짜리 기능»이라고 적었다면, 그건 실력이 아니라{' '}
            <b className="font-semibold">그 한 번의 결과</b>를 적은 것입니다. 그리고 다음에 다른 값이 나오면 «내가 뭘
            망쳤지?»를 찾아 헤매게 됩니다 — 아무도 아무것도 안 했는데요.
          </p>
          <p>
            그래서 말하는 법을 바꿉니다. «{runs[0] * 10}%다» 대신 «{runs.length}번 재 봤고 {min * 10}~{max * 10}%
            사이였다». 재는 횟수를 함께 적지 않은 숫자는 나중에 아무도 해석할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
