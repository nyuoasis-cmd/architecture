import { Link } from 'react-router-dom';
import { CHAPTERS } from '../data/qa-stubs';
import { getChapterProgress, useProgressMap } from '../lib/progress';

export default function LibraryPage() {
  useProgressMap();

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
      <h1 className="mb-6 text-2xl font-medium">기술노트 아카데미 라이브러리</h1>
      <p className="mb-8 text-[var(--color-text-body)]">10개 챕터, 71개 Q&amp;A.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((chapter) => {
          const progress = getChapterProgress(chapter.id);

          return (
            <Link
              key={chapter.id}
              className="rounded-xl border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--color-text-quaternary)]"
              to={`/library/${chapter.id}/${chapter.firstQaId}`}
            >
              <div className="mb-1 text-xs text-[var(--color-text-muted)]">{`Chapter ${chapter.id}`}</div>
              <div className="mb-2 font-medium">
                {chapter.emoji} {chapter.title}
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">Q&amp;A {chapter.qaCount}개</div>
              <div className="mt-3 text-xs text-[var(--color-text-quaternary)]">
                진도 {progress.done}/{progress.total}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
