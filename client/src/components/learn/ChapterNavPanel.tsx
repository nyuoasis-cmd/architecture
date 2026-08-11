import { Link } from 'react-router-dom';
import type { ChapterStub, QaStub } from '../../data/qa-stubs';
import { getCategoryMeaning } from '../../data/category-meanings';
import { useProgressMap } from '../../lib/progress';

type ChapterNavPanelProps = {
  chapter: ChapterStub;
  currentQa: QaStub;
  /** 이 장의 문항만. 🚨 세션에 담긴 전체 문항을 여기 세우지 않는다 — §아래 주석 참조. */
  chapterQas: QaStub[];
  /** 학생이 이동할 수 있는 장 목록(자습=전체, 세션=그 수업에 담긴 장). */
  availableChapters: ChapterStub[];
  progressMapOverride?: Record<string, { read: boolean; quizScore?: number }>;
  /** 「전체 장 목록」으로 돌아가는 곳. */
  libraryHref: string;
  onSelectQa: (qaId: string) => void;
  onSelectChapter: (chapterId: number) => void;
};

/**
 * 좌측 컬럼 — «지금 어느 장의 몇 번째인가»와 «어디로 갈 수 있는가».
 *
 * 🚨 여기에는 **이 장의 문항만** 세운다. 전체 장을 다 늘어놓으면 «지금 뭘 하고 있는지»가
 *    묻힌다(승인 목업 learn-3col-restore-v1.html S0). 고르는 일은 색인(LibraryPage)에서,
 *    배우는 일은 이 화면에서 — 대신 위의 「← 전체 장 목록」과 아래의 「← 이전 장 / 다음 장 →」로
 *    이동은 두 번의 클릭 안에 끝난다.
 */
export default function ChapterNavPanel({
  chapter,
  currentQa,
  chapterQas,
  availableChapters,
  progressMapOverride,
  libraryHref,
  onSelectQa,
  onSelectChapter,
}: ChapterNavPanelProps) {
  const localProgressMap = useProgressMap();
  const progressMap = progressMapOverride ?? localProgressMap;
  const categoryMeaning = getCategoryMeaning(chapter.category);

  const chapterIndex = availableChapters.findIndex((item) => item.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? availableChapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 ? availableChapters[chapterIndex + 1] : undefined;

  const isDone = (qaId: string) => {
    const entry = progressMap[qaId];
    if (!entry) {
      return false;
    }
    return entry.quizScore !== undefined ? entry.quizScore >= 2 : entry.read;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-shrink-0 border-b border-[var(--color-border)] px-3 py-3">
        <Link
          className="mb-3 inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          to={libraryHref}
        >
          ← 전체 장 목록
        </Link>

        <div className="flex items-start gap-2">
          <span className="text-[15px] leading-none">{chapter.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)]">{chapter.id}장</p>
            <h2
              className="mt-0.5 text-[14px] font-semibold leading-[1.4] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {chapter.title}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
            {chapter.category}
          </span>
        </div>

        {/*
          🔑 배지의 뜻 한 줄은 **화면에 반드시 남아 있어야 한다**. 사전(category-meanings.ts)만
             살고 화면에서 사라지면 학생은 설명 없는 낱말을 계속 본다 — 계약 ⑤ 가 이 자리를 본다.
        */}
        {categoryMeaning ? (
          <p className="mt-2 text-[11px] leading-[1.6] text-[var(--color-text-faint)]">{categoryMeaning}</p>
        ) : null}
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-faint)]">
            이 장의 문항
          </p>
          <span className="font-mono text-[11px] text-[var(--color-text-faint)]">
            {currentQa.order}/{chapterQas.length}
          </span>
        </div>

        <ul className="space-y-1">
          {chapterQas.map((item) => {
            const isCurrent = item.id === currentQa.id;
            const done = isDone(item.id);

            return (
              <li key={item.id}>
                <button
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                    isCurrent
                      ? 'bg-[var(--color-accent-soft)]'
                      : 'hover:bg-[var(--color-bg-input)]'
                  }`}
                  onClick={() => onSelectQa(item.id)}
                  type="button"
                >
                  <span
                    className={`mt-[1px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-[var(--color-accent)] text-white'
                        : done
                          ? 'bg-[var(--color-success)] text-white'
                          : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {done && !isCurrent ? '✓' : item.order}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[12.5px] leading-[1.5] ${
                      isCurrent
                        ? 'font-semibold text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-body)]'
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {nextChapter ? (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-faint)]">다음 장</p>
            <button
              className="mt-1 text-left text-[12px] font-medium leading-[1.5] text-[var(--color-text-primary)] hover:underline"
              onClick={() => onSelectChapter(nextChapter.id)}
              type="button"
            >
              {nextChapter.emoji} {nextChapter.id}장 · {nextChapter.title}
            </button>
          </div>
        ) : null}
      </div>

      {/*
        🔑 장 사이 이동은 여기서 끝난다 — 좌측에 전 장을 세우지 않는 대신 이 두 버튼을 둔다.
           세션에서는 «그 수업에 담긴 장»만 이웃이 된다(학생이 안 열린 장으로 새지 않게).
      */}
      <div className="flex flex-shrink-0 gap-2 border-t border-[var(--color-border)] p-3">
        {previousChapter ? (
          <button
            className="btn-ghost-sm flex flex-1 items-center justify-center"
            onClick={() => onSelectChapter(previousChapter.id)}
            type="button"
          >
            ← {previousChapter.id}장
          </button>
        ) : (
          <button className="btn-ghost-sm flex-1" disabled type="button">
            ← 이전 장
          </button>
        )}

        {nextChapter ? (
          <button
            className="btn-primary-sm flex flex-1 items-center justify-center"
            onClick={() => onSelectChapter(nextChapter.id)}
            type="button"
          >
            {nextChapter.id}장 →
          </button>
        ) : (
          <button className="btn-primary-sm flex-1" disabled type="button">
            다음 장 →
          </button>
        )}
      </div>
    </div>
  );
}
