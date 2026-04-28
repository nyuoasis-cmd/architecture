import { Link, useNavigate } from 'react-router-dom';
import type { ChapterStub, QaStub } from '../../data/qa-stubs';
import { useProgressMap } from '../../lib/progress';

type GuidePanelProps = {
  chapter: ChapterStub;
  currentQa: QaStub;
  chapterQas: QaStub[];
  mode: 'self' | 'session';
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
};

export default function GuidePanel({
  chapter,
  currentQa,
  chapterQas,
  mode,
  activeScenarioId,
  onScenarioChange,
}: GuidePanelProps) {
  const progressMap = useProgressMap();
  const navigate = useNavigate();
  const currentQaId = currentQa.id;
  const stepQaIds = chapterQas.map((qa) => qa.id);

  const navigateTo = (qaId: string) => {
    const qa = chapterQas.find((item) => item.id === qaId);
    if (!qa) {
      return;
    }

    navigate(`/library/${chapter.id}/${qa.id}`);
  };

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
          {stepQaIds.map((qaId, idx) => {
            const stepNumber = idx + 1;
            const entry = progressMap[qaId];
            const isCurrent = qaId === currentQaId;
            const isDone = entry?.quizScore !== undefined && entry.quizScore >= 2;

            const bgColor = isDone
              ? 'var(--color-success)'
              : isCurrent
                ? 'var(--color-accent)'
                : 'var(--color-bg-input)';

            const textColor = isCurrent || isDone ? '#fff' : 'var(--color-text-muted)';
            const dotText = isDone ? '✓' : String(stepNumber);
            const barColor = isDone
              ? 'var(--color-success)'
              : isCurrent
                ? 'var(--color-accent)'
                : 'var(--color-bg-input)';

            return (
              <button
                key={qaId}
                onClick={() => navigateTo(qaId)}
                className="flex-1 flex flex-col items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                type="button"
              >
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-semibold"
                  style={{ background: bgColor, color: textColor }}
                >
                  {dotText}
                </span>
                <span
                  className="block w-full h-1 rounded-full"
                  style={{ background: barColor }}
                />
              </button>
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
