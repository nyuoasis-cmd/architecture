import type { QaStub } from '../../data/qa-stubs';
import type { VibeIncident } from '../../data/vibe-stubs';

type ReadTabProps = {
  qa: QaStub;
  incident?: VibeIncident;
  onDone?: () => void;
  doneLabel?: string;
};

/** 본문 탭 — 이론 5문단 + ⚡실제로 있었던 일 + 체크포인트. PC 기본, 읽기 폭 660px. */
export default function ReadTab({ qa, incident, onDone, doneLabel }: ReadTabProps) {
  return (
    <div className="mx-auto w-full max-w-[660px] px-5 py-7">
      <div className="mb-5 flex flex-wrap gap-1.5">
        {qa.keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded bg-[var(--color-bg-input)] px-2.5 py-0.5 text-[11px] text-[var(--color-text-muted)]"
          >
            {keyword}
          </span>
        ))}
      </div>

      <div className="space-y-4 text-[14.5px] leading-[1.9] text-[var(--color-text-body)]">
        {qa.body.split(/\n\n+/).map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      {/*
        🚨 **날짜를 적지 않는다**(2026-08-19 jery). 전에는 「⚡ 실제로 있었던 일 · 2026년 7월」이었다 —
           언제 일어났는지는 배울 것과 무관한데, 그러면서 사고를 «오래된 옛날 일»로 읽히게 만들었다.
        🔑 대신 라벨 두 줄을 본문 **위**에 둔다. 학생이 서사를 읽기 전에 «무슨 개념이었나 ·
           화면에서 무엇이 잘못 보였나»를 먼저 집는다 — 본문 아래로 내리면 다 읽은 뒤에야 만나고,
           그때는 이미 «무슨 얘기였지»가 돼 있다.
        🚨 두 줄은 없을 수 있다(105건을 강 묶음으로 채우는 중) — 없으면 그 줄만 빠지고
           나머지는 그대로 선다. 없는 칸을 「—」로 채우지 않는다.
      */}
      {incident ? (
        <aside className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-[10px] font-bold tracking-wider text-rose-600">⚡ 실제로 있었던 일</p>
          <h4 className="mt-1.5 text-[14.5px] font-semibold text-[var(--color-text-primary)]">{incident.title}</h4>

          {incident.cause || incident.symptom ? (
            <dl className="mt-3 space-y-1.5 rounded-lg border border-rose-200 bg-white/70 px-3.5 py-2.5">
              {incident.symptom ? (
                <div className="flex gap-2 text-[12.5px] leading-[1.75]">
                  <dt className="flex-none font-bold text-rose-700">작동 오류</dt>
                  <dd className="m-0 text-[var(--color-text-body)]">{incident.symptom}</dd>
                </div>
              ) : null}
              {incident.cause ? (
                <div className="flex gap-2 text-[12.5px] leading-[1.75]">
                  <dt className="flex-none font-bold text-rose-700">원인</dt>
                  <dd className="m-0 text-[var(--color-text-body)]">{incident.cause}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <p className="mt-2.5 text-[13px] leading-[1.85] text-rose-900">{incident.body}</p>
        </aside>
      ) : null}

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-faint)]">✅ 체크포인트</p>
        <p className="mt-1 text-[13px] text-[var(--color-text-body)]">{qa.checkpoint}</p>
      </div>

      {onDone ? (
        <div className="mt-5 flex justify-end">
          <button
            className="rounded-[10px] bg-[var(--color-btn-primary)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-btn-primary-hover)]"
            onClick={onDone}
            type="button"
          >
            {doneLabel ?? '다음 →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
