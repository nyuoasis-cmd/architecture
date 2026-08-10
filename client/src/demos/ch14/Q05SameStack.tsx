import { useState } from 'react';
import type { DemoComponentProps } from '../types';

// 14장 5문 시연 — 앱을 다섯 개 만드는 동안 «재료를 통일한 쪽»과 «매번 바꾼 쪽»의 저금 차이를 나란히 본다.
// 🔑 통일의 이득은 «빨라진다»가 아니라 «배운 게 안 사라진다»이고,
//    대가(약점이 전부에 똑같이 퍼짐)도 함께 보여야 정직한 비교다.

type Step = {
  app: string;
  learned: string;
  reusedIfSame: string;
  costIfSwitch: string;
};

const STEPS: Step[] = [
  {
    app: '1번째 앱 · 급식 투표',
    learned: '화면에 목록 그리는 법',
    reusedIfSame: '아직 저금이 없어요 — 첫 앱은 두 쪽이 같습니다',
    costIfSwitch: '아직 저금이 없어요 — 첫 앱은 두 쪽이 같습니다',
  },
  {
    app: '2번째 앱 · 독서 기록장',
    learned: '입력한 것을 저장하는 법',
    reusedIfSame: '1번 앱의 목록 그리기를 그대로 씀',
    costIfSwitch: '목록 그리기를 처음부터 다시 배움',
  },
  {
    app: '3번째 앱 · 모둠 편성기',
    learned: '오류 메시지 읽는 요령',
    reusedIfSame: '낯익은 오류라 5분 만에 해결',
    costIfSwitch: '처음 보는 오류 메시지 — 하루를 씀',
  },
  {
    app: '4번째 앱 · 학급 설문',
    learned: '부탁문에 재료를 못 박는 한 줄',
    reusedIfSame: '지난 앱의 조각을 떼어 붙임',
    costIfSwitch: '떼어 올 조각이 안 맞아 새로 만듦',
  },
  {
    app: '5번째 앱 · 자리 배치도',
    learned: '남에게 설명할 수 있게 됨',
    reusedIfSame: '뼈대가 같아 시작 시간이 거의 0',
    costIfSwitch: '다섯 번째인데도 첫 앱과 비슷한 속도',
  },
];

export default function Q05SameStack(_props: DemoComponentProps) {
  const [step, setStep] = useState(0);
  const [showCost, setShowCost] = useState(false);

  const done = STEPS.slice(0, step);
  // 통일한 쪽: 배운 것이 계속 쌓인다. 바꾼 쪽: 직전 앱 것만 남고 나머지는 리셋.
  const kept = done.map((s) => s.learned);
  const reset = done.length > 0 ? [done[done.length - 1].learned] : [];
  const current = step > 0 ? STEPS[step - 1] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
          disabled={step >= STEPS.length}
          className="rounded-lg bg-[var(--color-text-primary)] px-3.5 py-2 text-[13px] font-bold text-white disabled:opacity-40"
        >
          앱 하나 더 만들기
        </button>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setShowCost(false);
          }}
          className="rounded-lg border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-bold text-[var(--color-text-body)]"
        >
          처음부터
        </button>
        <span className="text-[12px] tabular-nums text-[var(--color-text-faint)]">
          만든 앱 {step} / {STEPS.length}
        </span>
      </div>

      {current && (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-[12.5px] shadow-sm">
          <b className="font-semibold text-[var(--color-text-primary)]">{current.app}</b>
          <span className="ml-2 text-[var(--color-text-muted)]">이번에 배운 것 — {current.learned}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 px-4 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-emerald-800">
            같은 재료를 계속 쓴 쪽 · 저금 {kept.length}
          </p>
          {kept.length === 0 ? (
            <p className="text-[12.5px] text-[var(--color-text-muted)]">아직 아무것도 안 만들었어요.</p>
          ) : (
            <div className="space-y-1.5">
              {kept.map((k, i) => (
                <div key={k} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[12.5px] text-emerald-900">
                  {i + 1}. {k}
                </div>
              ))}
            </div>
          )}
          {current && step > 1 && (
            <p className="mt-3 text-[11.5px] leading-[1.7] text-emerald-800">→ {current.reusedIfSame}</p>
          )}
        </div>

        <div className="rounded-xl border border-rose-300 bg-rose-50/40 px-4 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-wider text-rose-700">
            앱마다 재료를 바꾼 쪽 · 저금 {reset.length}
          </p>
          {reset.length === 0 ? (
            <p className="text-[12.5px] text-[var(--color-text-muted)]">아직 아무것도 안 만들었어요.</p>
          ) : (
            <>
              <div className="space-y-1.5">
                {reset.map((k) => (
                  <div key={k} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[12.5px] text-rose-900">
                    1. {k}
                  </div>
                ))}
              </div>
              {kept.length > 1 && (
                <div className="mt-1.5 space-y-1.5">
                  {kept.slice(0, -1).map((k) => (
                    <div
                      key={k}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-[12.5px] text-rose-400 line-through"
                    >
                      {k}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {current && step > 1 && (
            <p className="mt-3 text-[11.5px] leading-[1.7] text-rose-800">→ {current.costIfSwitch}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-[12.5px] leading-[1.8] text-[var(--color-text-muted)]">
        {step === 0 ? (
          <>«앱 하나 더 만들기»를 눌러 보세요. 두 쪽 모두 같은 것을 배우지만, 남는 양이 달라집니다.</>
        ) : step < STEPS.length ? (
          <>
            지금까지 배운 양은 두 쪽이 똑같습니다 — 다른 건 <b className="font-semibold">남아 있는 양</b>뿐입니다.
          </>
        ) : (
          <>
            다섯 개를 만든 뒤, 배운 총량은 같은데 손에 남은 것은 5 대 1입니다. 그래서 새 앱마다 부탁문에 이 한 줄을
            붙입니다 — <b className="font-semibold">«지난번 앱과 같은 방식으로 만들어 줘.»</b>
          </>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowCost((v) => !v)}
          className="rounded-lg border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-bold text-[var(--color-text-body)]"
        >
          {showCost ? '대가 접기' : '그럼 통일은 공짜인가? 눌러서 대가 보기'}
        </button>
        {showCost && (
          <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-[1.8] text-amber-900">
            공짜가 아닙니다. 재료의 <b className="font-semibold">약점도 똑같이 퍼집니다</b> — 한 곳에서 문제가 나면 같은 재료로
            만든 앱을 전부 확인해야 합니다. 티처메이트가 앱 스무 개를 같은 재료로 만든 것도 이 대가를 알고 고른
            선택입니다. 좋은 선택은 대가가 없는 선택이 아니라, <b className="font-semibold">대가를 알고 고른 선택</b>입니다.
          </div>
        )}
      </div>
    </div>
  );
}
