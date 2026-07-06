// 하네스 심화 트랙 — 모듈 4(TDD) 작업대 격리 프루프 페이지.
// 라우트: /harness-preview/module4  (학생/교사 흐름과 분리된 프리뷰. showcase 라우트 패턴 미러)
// 목적: architecture 데모 엔진(_shared 키트) 위에 "시키기→각본 결과→이해 체크" 6-STEP 파이프라인이
//       라이브 콘텐츠 무오염으로 재생되는지 검증. 세션/제출/서버채점은 다음 슬라이스.
import { useState } from 'react';
import { getTone } from '../demos/_shared';
import { MODULE4_STEPS, StepView, UnderstandingCheck } from './Module4Workbench';

const TONE = getTone(3);

// 스텝 스위처 항목: 5개 재생 스텝 + 이해 체크.
const NAV = [
  ...MODULE4_STEPS.map((s) => ({ nav: s.nav, phase: s.phase })),
  { nav: 'STEP 6 · 이해 체크', phase: '2차시 — 전체 초록 & Refactor' },
];

export default function HarnessModule4Page() {
  const [idx, setIdx] = useState(0);
  const isCheck = idx === MODULE4_STEPS.length;
  const total = NAV.length;

  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-4 py-6">
      {/* 프리뷰 배너 */}
      <div
        className="rounded-xl border px-3 py-2 text-[12px]"
        style={{ borderColor: TONE.accentBorder, background: TONE.accentSoft, color: 'var(--color-text-body)' }}
      >
        🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 4(TDD) 작업대. 라이브 학습 콘텐츠와 분리된 검증용 화면입니다.
        각본형(정해진 결과 재생)이라 실제 AI를 호출하지 않습니다.
      </div>

      {/* 스텝 스위처 */}
      <nav className="flex flex-col gap-1.5">
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {NAV[idx].phase}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {NAV.map((item, i) => {
            const active = i === idx;
            return (
              <button
                key={item.nav}
                type="button"
                onClick={() => setIdx(i)}
                className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition"
                style={{
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                  color: active ? TONE.accent : 'var(--color-text-body)',
                }}
              >
                {item.nav}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 본문 */}
      {isCheck ? <UnderstandingCheck /> : <StepView step={MODULE4_STEPS[idx]} />}

      {/* 이전/다음 */}
      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => setIdx((v) => Math.max(0, v - 1))}
          className="rounded-xl border px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
          style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)', color: 'var(--color-text-primary)' }}
        >
          ← 이전
        </button>
        <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          {idx + 1} / {total}
        </span>
        <button
          type="button"
          disabled={idx === total - 1}
          onClick={() => setIdx((v) => Math.min(total - 1, v + 1))}
          className="rounded-xl border px-4 py-2 text-[13px] font-semibold transition disabled:opacity-40"
          style={{ borderColor: TONE.accent, background: TONE.accentSoft, color: TONE.accent }}
        >
          다음 →
        </button>
      </div>
    </main>
  );
}
