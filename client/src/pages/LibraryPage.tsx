import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CHAPTERS } from '../data/qa-stubs';
import { getChapterProgress, useProgressMap } from '../lib/progress';
import { getSession, SessionClientError, type SessionDetail } from '../lib/session-client';

export default function LibraryPage() {
  useProgressMap();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const isPreviewMode = Boolean(sessionId);
  const [previewSession, setPreviewSession] = useState<SessionDetail | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPreviewSession(null);
      setSessionError(null);
      return;
    }

    let cancelled = false;
    setSessionError(null);

    getSession(sessionId, { teacher: true })
      .then((session) => {
        if (!cancelled) {
          setPreviewSession(session);
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setSessionError(
            caught instanceof SessionClientError
              ? caught.message
              : caught instanceof Error
                ? caught.message
                : '세션 정보를 불러오지 못했습니다.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const allowedChapterIds = previewSession?.chapter_ids;
  const chaptersToShow =
    isPreviewMode && allowedChapterIds
      ? CHAPTERS.filter((chapter) => allowedChapterIds.includes(chapter.id))
      : CHAPTERS;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
      {isPreviewMode ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex min-h-9 items-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            to="/teacher"
          >
            ← 내 세션 관리
          </Link>
          {previewSession ? (
            <span className="text-xs text-stone-500">
              시연 세션 · {previewSession.name} · 코드 {previewSession.code}
            </span>
          ) : null}
        </div>
      ) : null}

      <h1 className="mb-6 text-2xl font-medium">{isPreviewMode ? '수업 시연 — 챕터 선택' : '라이브러리'}</h1>
      <p className="mb-8 text-stone-600">
        {isPreviewMode
          ? '시연을 시작할 챕터를 선택하세요. 세션에 포함된 챕터만 보입니다.'
          : '10개 챕터, 71개 Q&A.'}
      </p>

      {sessionError ? (
        <div className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{sessionError}</div>
      ) : null}

      {isPreviewMode && !previewSession && !sessionError ? (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-sm text-stone-500">
          세션 정보를 불러오는 중입니다.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chaptersToShow.map((chapter) => {
          const progress = getChapterProgress(chapter.id);
          const linkTarget =
            isPreviewMode && sessionId
              ? `/learn/${sessionId}?role=teacher&qa=${chapter.firstQaId}`
              : `/library/${chapter.id}/${chapter.firstQaId}`;

          return (
            <Link
              key={chapter.id}
              className="rounded-xl border border-[var(--color-border)] bg-white p-5 transition hover:border-stone-400"
              to={linkTarget}
            >
              <div className="mb-1 text-xs text-stone-500">{`Chapter ${chapter.id}`}</div>
              <div className="mb-2 font-medium">
                {chapter.emoji} {chapter.title}
              </div>
              <div className="text-xs text-stone-500">Q&amp;A {chapter.qaCount}개</div>
              <div className="mt-3 text-xs text-stone-400">
                진도 {progress.done}/{progress.total}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
