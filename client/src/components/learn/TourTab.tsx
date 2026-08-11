import { useEffect, useState } from 'react';
import type { VibeTourMission } from '../../data/vibe-stubs';

type TourTabProps = {
  qaId: string;
  missions: VibeTourMission[];
};

const BADGE_STYLE: Record<string, string> = {
  daily: 'bg-indigo-50 text-indigo-600',
  self: 'bg-sky-50 text-sky-700',
  live: 'bg-emerald-50 text-emerald-700',
  archive: 'bg-amber-100 text-amber-800',
};

/**
 * 견학 탭 — 입문자 사다리(매일 쓰는 앱 → 방금 이 앱 → 진짜 서비스).
 * 미션은 «미션 제시 → 다녀오기/눌러보기 → 관찰 한 줄 제출 → 피드백» 구조.
 */
export default function TourTab({ qaId, missions }: TourTabProps) {
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setObservations({});
    setDone({});
    setOpened({});
  }, [qaId]);

  const doneCount = missions.filter((mission) => done[mission.id]).length;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-5 py-7">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] leading-relaxed text-[var(--color-text-body)]">
          오늘 배운 것을 <b className="font-semibold text-[var(--color-text-primary)]">진짜에서</b> 확인합니다. 다녀와서 본
          것을 한 줄로 적으면 완료.
        </p>
        <span
          className={`shrink-0 rounded-full px-3 py-1 font-mono text-[12px] ${
            doneCount >= missions.length && missions.length > 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-primary)]'
          }`}
        >
          완료 {doneCount}/{missions.length}
        </span>
      </div>

      {missions.map((mission) => {
        const isDone = Boolean(done[mission.id]);
        return (
          <section
            key={mission.id}
            className={`rounded-2xl border px-5 py-4 ${
              isDone ? 'border-emerald-100 bg-emerald-50/40' : 'border-[var(--color-border)] bg-white'
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${BADGE_STYLE[mission.kind]}`}>
                {mission.badge}
              </span>
              <h4 className="text-[14px] font-semibold text-[var(--color-text-primary)]">{mission.title}</h4>
            </div>
            <p className="text-[13px] leading-[1.8] text-[var(--color-text-body)]">{mission.description}</p>

            {mission.steps ? (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-[var(--color-text-body)]">
                {mission.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            ) : null}

            {mission.reveals ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {mission.reveals.map((reveal) => {
                  const key = `${mission.id}:${reveal.label}`;
                  const isOpen = Boolean(opened[key]);
                  return (
                    <button
                      key={key}
                      className={`rounded-full border px-3.5 py-1.5 text-left text-[12.5px] font-medium transition ${
                        isOpen
                          ? 'border-transparent bg-[#C9E0D4] font-semibold text-[#2d4a3e]'
                          : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
                      }`}
                      onClick={() => setOpened((prev) => ({ ...prev, [key]: true }))}
                      type="button"
                    >
                      {isOpen ? reveal.answer : reveal.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {mission.link ? (
              <a
                className="mt-3 inline-block rounded-lg bg-[var(--color-btn-primary)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--color-btn-primary-hover)]"
                href={mission.link.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {mission.link.label} ↗
              </a>
            ) : null}

            <div className="mt-3 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:bg-[var(--color-bg-subtle)]"
                disabled={isDone}
                onChange={(event) =>
                  setObservations((prev) => ({ ...prev, [mission.id]: event.target.value }))
                }
                placeholder={mission.observationPlaceholder}
                type="text"
                value={observations[mission.id] ?? ''}
              />
              <button
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-3.5 text-[12.5px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)] disabled:opacity-40"
                disabled={isDone || (observations[mission.id] ?? '').trim().length < 2}
                onClick={() => setDone((prev) => ({ ...prev, [mission.id]: true }))}
                type="button"
              >
                제출
              </button>
            </div>

            {isDone ? (
              <p className="mt-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] leading-[1.8] text-emerald-900">
                ✓ {mission.feedback}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
