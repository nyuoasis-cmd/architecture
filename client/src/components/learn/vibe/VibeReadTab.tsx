import type { QaStub } from '../../../data/qa-stubs';
import type { VibeIncident } from '../../../data/vibe-stubs';

type VibeReadTabProps = {
  qa: QaStub;
  incident?: VibeIncident;
  onDone?: () => void;
  doneLabel?: string;
};

/** 본문 탭 — 이론 5문단 + ⚡실제로 있었던 일 + 체크포인트. PC 기본, 읽기 폭 660px. */
export default function VibeReadTab({ qa, incident, onDone, doneLabel }: VibeReadTabProps) {
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

      {incident ? (
        <aside className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-[10px] font-bold tracking-wider text-rose-600">
            ⚡ 실제로 있었던 일 · {incident.period}
          </p>
          <h4 className="mt-1.5 text-[14.5px] font-semibold text-[var(--color-text-primary)]">{incident.title}</h4>
          <p className="mt-1 text-[13px] leading-[1.85] text-rose-900">{incident.body}</p>
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
