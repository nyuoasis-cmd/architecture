import { Link } from 'react-router-dom';
import type { ChapterStub, QaStub } from '../../data/qa-stubs';
import { getProgress, useProgressMap } from '../../lib/progress';

type GuidePanelProps = {
  chapter: ChapterStub;
  currentQa: QaStub;
  chapterQas: QaStub[];
  mode: 'self' | 'session';
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
};

type ProgressState = 'done' | 'current' | 'todo';

function getProgressState(currentQaId: string, qaId: string): ProgressState {
  if (qaId === currentQaId) {
    return 'current';
  }

  const progress = getProgress(qaId);
  if (progress && (progress.read || (progress.quizScore ?? 0) >= 2)) {
    return 'done';
  }

  return 'todo';
}

function getBadgeStyle(state: ProgressState) {
  if (state === 'done') {
    return {
      background: 'var(--color-success)',
      color: '#fff',
    };
  }

  if (state === 'current') {
    return {
      background: 'var(--color-accent)',
      color: '#fff',
    };
  }

  return {
    background: '#f5f5f4',
    color: 'var(--color-text-muted)',
  };
}

export default function GuidePanel({
  chapter,
  currentQa,
  chapterQas,
  mode,
  activeScenarioId,
  onScenarioChange,
}: GuidePanelProps) {
  useProgressMap();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-[var(--color-border)] p-3">
        <div className="mb-2 flex items-center gap-2">
          <span>{chapter.emoji}</span>
          <span className="truncate text-xs font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
            {chapter.id}장 · {chapter.title}
          </span>
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[10px]"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 10%, white)',
              color: 'var(--color-accent)',
            }}
          >
            {chapter.category}
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between gap-1">
          {chapterQas.map((qa) => {
            const state = getProgressState(currentQa.id, qa.id);
            const badge = getBadgeStyle(state);
            const route = `/library/${chapter.id}/${qa.id}`;
            const badgeText = state === 'done' ? '✓' : String(qa.order);

            return (
              <Link key={qa.id} className="guide-progress-button" to={route}>
                <span
                  className="guide-progress-badge"
                  style={{ background: badge.background, color: badge.color }}
                >
                  {badgeText}
                </span>
                <span
                  className="guide-progress-bar"
                  style={{ background: badge.background }}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex justify-between text-[10px]">
          <span style={{ color: 'var(--color-text-muted)' }}>단계를 눌러 이동</span>
          <span className="font-mono" style={{ color: 'var(--color-text-faint)' }}>
            {currentQa.order}/{chapterQas.length}
          </span>
        </div>
      </div>

      <div className="scrollbar-hide flex-1 space-y-3 overflow-y-auto p-3">
        <h3 className="text-sm font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
          {currentQa.title}
        </h3>

        <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-body)', lineHeight: 1.8 }}>
          {currentQa.body}
        </div>

        <div className="flex flex-wrap gap-1">
          {currentQa.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded px-1.5 py-0.5 text-[10px]"
              style={{ background: '#f5f5f4', color: 'var(--color-text-muted)' }}
            >
              {keyword}
            </span>
          ))}
        </div>

        <div>
          <p
            className="mb-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-faint)' }}
          >
            ▶ 옆 화면에 시연하기
          </p>
          {currentQa.demoQaId ? (
            <div className="space-y-1.5">
              {[
                ['launch', '01', '카톡 실행 — 프로세스 만들어지기'],
                ['multi', '02', '같은 앱 두 번 — 프로세스 2개'],
                ['cpu', '03', 'CPU가 일하는 모습'],
                ['kill', '04', '앱 종료 — 프로세스 사라지기'],
              ].map(([scenarioId, number, label]) => (
                <button
                  key={scenarioId}
                  className={`demo-launcher ${activeScenarioId === scenarioId ? 'active' : ''}`}
                  onClick={() => onScenarioChange(scenarioId)}
                  type="button"
                >
                  <span>
                    <span
                      className="mr-1.5 font-mono text-[11px]"
                      style={{
                        color:
                          activeScenarioId === scenarioId ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}
                    >
                      {number}
                    </span>
                    {label}
                  </span>
                  <span className="arrow">▶</span>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="rounded-lg border border-[var(--color-border)] p-3 text-xs"
              style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
            >
              이 문항의 시연은 콘텐츠 PR에서 연결됩니다.
            </div>
          )}
        </div>

        <div
          className="rounded-lg border border-[var(--color-border)] p-2.5"
          style={{ background: 'var(--color-surface-alt)' }}
        >
          <p
            className="mb-1 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-faint)' }}
          >
            ✅ 체크포인트
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-body)' }}>
            {currentQa.checkpoint}
          </p>
          <button
            className="mt-2 rounded-md px-2.5 py-1 text-[11px]"
            style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
            type="button"
          >
            확인 완료
          </button>
        </div>
      </div>

      <div className="flex flex-shrink-0 gap-2 border-t border-[var(--color-border)] p-3">
        {mode === 'self' ? (
          <>
            {currentQa.order > 1 ? (
              <Link
                className="btn-ghost-sm flex flex-1 items-center justify-center"
                to={`/library/${chapter.id}/${chapterQas[currentQa.order - 2]?.id ?? currentQa.id}`}
              >
                ← 이전
              </Link>
            ) : (
              <button className="btn-ghost-sm flex-1" disabled type="button">
                ← 이전
              </button>
            )}

            {currentQa.order < chapterQas.length ? (
              <Link
                className="btn-primary-sm flex flex-1 items-center justify-center"
                to={`/library/${chapter.id}/${chapterQas[currentQa.order]?.id ?? currentQa.id}`}
              >
                다음 →
              </Link>
            ) : (
              <button className="btn-primary-sm flex-1" disabled type="button">
                다음 →
              </button>
            )}
          </>
        ) : (
          <button className="btn-ghost-sm flex-1" disabled type="button">
            세션 학습은 PR #6에서 연결됩니다
          </button>
        )}
      </div>
    </div>
  );
}
