// 하네스 심화 트랙 — 모듈 공용 키트.
// 모듈 4(Module4Workbench)에서 검증된 부품(개념 앵커 · ▶실행 게이팅 · 친절카드+원본로그 · 이해체크 ·
// 스텝 프레임)을 데이터 주도(data-driven)로 일반화해 모듈 1·2·3·5·6이 그대로 복제한다.
// 라이브 학습 콘텐츠(10챕터·qa-stubs·세션)는 건드리지 않는다. 공유 데모 키트(_shared)만 재사용.
//
// 새내기(학생 UX) 리서치 반영(run 6afd)을 처음부터 내장:
//   F1 개념 앵커(ConceptAnchor, 상시+지금여기)·F2 ▶실행 게이팅(GatedReveal)·
//   F3 그럴듯한 오답·F4 정답 해설 축약+더보기. 각 모듈은 도입/정리 화면을 반드시 포함한다.
import { useState, type ReactNode } from 'react';
import { Hero, StateChips, type Tone } from '../demos/_shared';

// ── 타입 ────────────────────────────────────────────────────────────────────
export type AnchorPhase = { key: string; dot: string; ko: string; hint: string };

export type PlaybackStep = {
  id: string;
  nav: string; // 스텝 스위처 라벨
  phase: string; // 차시/구간 구분(스위처 상단 표시)
  anchorKey: string; // 이 스텝이 속한 개념 앵커 phase key
  eyebrow: string;
  title: string;
  summary: string; // 화면 안내
  instruction?: string; // 시키기 지시문(각본 고정)
  runLabel: string; // ▶실행 버튼 라벨
  runHint?: string; // 실행 전 안내(시키기 없는 스텝용)
  resultTitle: string; // 친절 카드 제목
  chips: string[]; // 친절 카드 요점
  chipDesc: string;
  rawLog: string; // 원본 로그(각본 재생)
  logLabel?: string; // 원본 로그 헤더(기본 '원본 로그')
};

export type CheckData = {
  eyebrow: string;
  intro?: string; // 이해 체크 상단 안내(기본 문구 override)
  question: string;
  options: string[];
  correctIdx: number;
  explanationShort: string; // F4: 핵심 1줄
  explanationMore: string; // F4: '왜? 더 보기' 토글 본문
};

// ── F1: 개념 앵커 (상시 노출 + '지금 여기') ─────────────────────────────────
// active = 현재 phase key | '' (도입 등, 아무것도 안 켜짐) | 'done' (완주)
export function ConceptAnchor({
  phases,
  active,
  headline,
  doneNote,
  tone,
}: {
  phases: AnchorPhase[];
  active: string | 'done';
  headline: ReactNode;
  doneNote: string;
  tone: Tone;
}) {
  const isDone = active === 'done';
  return (
    <section
      className="rounded-2xl border p-3"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
    >
      <p className="m-0 mb-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {headline}
      </p>
      <div className="flex items-stretch gap-1.5">
        {phases.map((p, i) => {
          const isActive = active === p.key;
          const on = isActive || isDone;
          return (
            <div key={p.key} className="flex flex-1 items-center gap-1.5">
              <div
                className="flex-1 rounded-xl border px-2.5 py-2 text-center transition"
                style={{
                  borderColor: isActive ? tone.accent : 'var(--color-border)',
                  background: isActive ? tone.accentSoft : 'var(--demo-card-bg-alt)',
                  opacity: on ? 1 : 0.55,
                }}
              >
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: isActive ? tone.accent : 'var(--color-text-primary)' }}
                >
                  {p.dot} {p.ko}
                  {isActive ? <span className="ml-1 text-[10px]">← 지금 여기</span> : null}
                </div>
                <div className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                  {p.hint}
                </div>
              </div>
              {i < phases.length - 1 ? (
                <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {isDone ? (
        <p className="m-0 mt-2 text-[11px]" style={{ color: tone.accent }}>
          {doneNote}
        </p>
      ) : null}
    </section>
  );
}

// ── 원본 로그 터미널 블록 (다줄 각본 덤프 전용 pre) ──────────────────────────
export function TerminalBlock({ text, label = '원본 로그' }: { text: string; label?: string }) {
  return (
    <section
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-log-bg-navy)', color: 'var(--demo-log-fg)' }}
    >
      <p className="m-0 mb-1.5 text-[11px]" style={{ color: 'var(--demo-log-time-neutral)' }}>
        {label}
      </p>
      <pre className="m-0 overflow-x-auto whitespace-pre font-mono text-[11px] leading-[1.7]">{text}</pre>
    </section>
  );
}

// ── 시키기 카드 (각본 고정 지시문) ───────────────────────────────────────────
export function InstructionCard({ text, tone }: { text: string; tone: Tone }) {
  return (
    <section className="rounded-2xl border p-4" style={{ borderColor: tone.accentBorder, background: tone.accentSoft }}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: tone.accent, color: '#fff' }}>
          시키기
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          AI에게 보내는 지시 — 아래 ▶실행을 누르면 결과가 재생돼요
        </span>
      </div>
      <p className="m-0 font-mono text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-primary)' }}>
        {text}
      </p>
    </section>
  );
}

// ── F2: ▶실행 게이팅 프리미티브 ─────────────────────────────────────────────
// 눌러야 children(각본 결과)이 재생된다(능동감). 스텝 전환 시 초기화는 상위 key로 강제.
export function GatedReveal({
  runLabel,
  runHint,
  tone,
  note = '각본형 — 정해진 결과가 재생돼요(실제 AI 호출 없음).',
  children,
}: {
  runLabel: string;
  runHint?: string;
  tone: Tone;
  note?: string;
  children: ReactNode;
}) {
  const [ran, setRan] = useState(false);
  if (ran) return <>{children}</>;
  return (
    <section
      className="rounded-2xl border border-dashed p-4 text-center"
      style={{ borderColor: tone.accentBorder, background: 'var(--demo-card-bg-alt)' }}
    >
      {runHint ? (
        <p className="m-0 mb-2 text-[12px] leading-[1.6]" style={{ color: 'var(--color-text-body)' }}>
          {runHint}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => setRan(true)}
        className="rounded-xl border px-5 py-2.5 text-[14px] font-semibold transition"
        style={{ borderColor: tone.accent, background: tone.accentSoft, color: tone.accent }}
      >
        {runLabel}
      </button>
      <p className="m-0 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {note}
      </p>
    </section>
  );
}

// ── 각본 재생 스텝 뷰 (시키기 → ▶실행 → 친절카드 + 원본로그) ────────────────
export function PlaybackStepView({ step, tone }: { step: PlaybackStep; tone: Tone }) {
  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow={step.eyebrow} title={step.title} summary={step.summary} tone={tone} summaryTone="stone" />
      {step.instruction ? <InstructionCard text={step.instruction} tone={tone} /> : null}
      <GatedReveal runLabel={step.runLabel} runHint={step.runHint} tone={tone}>
        <StateChips title={step.resultTitle} items={step.chips} tone={tone} description={step.chipDesc} />
        <TerminalBlock text={step.rawLog} label={step.logLabel} />
      </GatedReveal>
    </div>
  );
}

// ── 이해 체크 (인터랙티브·재시도 허용) ───────────────────────────────────────
export function UnderstandingCheck({ check, tone }: { check: CheckData; tone: Tone }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const isCorrect = picked === check.correctIdx;
  const marks = ['①', '②', '③', '④', '⑤', '⑥'];

  return (
    <div className="flex flex-col gap-3">
      <Hero
        eyebrow={check.eyebrow}
        title="이해 체크"
        summary={check.intro ?? '마지막으로 한 문제만 확인하고 마칠게요. (틀려도 감점 없어요. 다시 풀면 돼요.)'}
        tone={tone}
        summaryTone="stone"
      />
      <section className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}>
        <p className="m-0 text-[14px] font-semibold leading-[1.6]" style={{ color: 'var(--color-text-primary)' }}>
          {check.question}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {check.options.map((opt, idx) => {
            const chosen = picked === idx;
            const revealCorrect = picked !== null && idx === check.correctIdx;
            const revealWrong = chosen && idx !== check.correctIdx;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setPicked(idx);
                  setShowWhy(false);
                }}
                className="rounded-xl border px-3 py-2 text-left text-[13px] leading-[1.5] transition"
                style={{
                  borderColor: revealCorrect ? tone.accent : revealWrong ? 'var(--color-danger, #dc2626)' : 'var(--color-border)',
                  background: revealCorrect ? tone.accentSoft : 'var(--demo-card-bg-alt)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <span className="mr-1.5 font-semibold" style={{ color: tone.accent }}>
                  {marks[idx]}
                </span>
                {opt}
                {revealCorrect ? <span className="ml-2">✅</span> : null}
                {revealWrong ? <span className="ml-2">❌</span> : null}
              </button>
            );
          })}
        </div>
        {picked !== null ? (
          <div
            className="mt-3 rounded-xl border p-3 text-[12px] leading-[1.7]"
            style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg-alt)', color: 'var(--color-text-body)' }}
          >
            <strong style={{ color: isCorrect ? tone.accent : 'var(--color-text-primary)' }}>
              {isCorrect ? '정답이에요! ' : '다시 볼까요. '}
            </strong>
            {check.explanationShort}
            <button type="button" onClick={() => setShowWhy((v) => !v)} className="ml-1 underline" style={{ color: tone.accent }}>
              {showWhy ? '접기' : '왜? 더 보기'}
            </button>
            {showWhy ? <div className="mt-1.5">{check.explanationMore}</div> : null}
            {!isCorrect ? <div className="mt-1.5 opacity-80">↩ 다른 보기를 눌러 다시 풀 수 있어요.</div> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

// ── 스텝 프레임 (프리뷰 배너 + 스텝 스위처 + 앵커 + 본문 + 이전/다음) ────────
// 각 모듈 페이지는 nav 목록과 renderAnchor/renderBody 두 콜백만 넘기면 된다.
export type NavItem = { label: string; phase: string };

export function WorkbenchFrame({
  banner,
  tone,
  nav,
  renderAnchor,
  renderBody,
}: {
  banner: ReactNode;
  tone: Tone;
  nav: NavItem[];
  renderAnchor: (idx: number) => ReactNode;
  renderBody: (idx: number) => ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const total = nav.length;

  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-4 py-6">
      <div
        className="rounded-xl border px-3 py-2 text-[12px]"
        style={{ borderColor: tone.accentBorder, background: tone.accentSoft, color: 'var(--color-text-body)' }}
      >
        {banner}
      </div>

      <nav className="flex flex-col gap-1.5">
        <p className="m-0 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {nav[idx].phase}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {nav.map((item, i) => {
            const active = i === idx;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setIdx(i)}
                className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition"
                style={{
                  borderColor: active ? tone.accent : 'var(--color-border)',
                  background: active ? tone.accentSoft : 'var(--demo-card-bg-alt)',
                  color: active ? tone.accent : 'var(--color-text-body)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {renderAnchor(idx)}

      {/* key={idx}로 스텝 전환 시 ▶실행/폼 내부 상태 초기화(F2). 크로스 스텝 상태는 페이지가 소유. */}
      <div key={idx}>{renderBody(idx)}</div>

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
          style={{ borderColor: tone.accent, background: tone.accentSoft, color: tone.accent }}
        >
          다음 →
        </button>
      </div>
    </main>
  );
}
