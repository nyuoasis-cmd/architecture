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

    getSession(sessionId)
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
  const isStudentMode = Boolean(previewSession?.viewer);
  const headerTitle = isPreviewMode
    ? isStudentMode
      ? '챕터 라이브러리'
      : '수업 시연 — 챕터 선택'
    : '라이브러리';
  const headerDescription = isPreviewMode
    ? isStudentMode
      ? '오늘 수업에서 열린 챕터예요. 들어가고 싶은 챕터를 골라주세요.'
      : '시연을 시작할 챕터를 선택하세요. 세션에 포함된 챕터만 보입니다.'
    : '10개 챕터, 71개 Q&A.';

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
      {isPreviewMode && !isStudentMode ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex min-h-9 items-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            to="/teacher"
          >
            ← 내 세션 관리
          </Link>
          {sessionId ? (
            <Link
              className="inline-flex min-h-9 items-center rounded-xl bg-stone-950 px-3 text-sm font-medium text-white hover:bg-stone-800"
              to={`/teacher/session/${sessionId}`}
            >
              수업 세션 페이지 →
            </Link>
          ) : null}
          {previewSession ? (
            <span className="text-xs text-stone-500">
              시연 세션 · {previewSession.name} · 코드 {previewSession.code}
            </span>
          ) : null}
        </div>
      ) : null}

      {isStudentMode && previewSession ? (
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 text-sm text-stone-700">
          <span className="font-medium text-stone-900">{previewSession.viewer?.nickname}</span>님,{' '}
          <span className="font-medium">{previewSession.name}</span> 수업에 참여 중이에요.
        </div>
      ) : null}

      <h1 className="mb-6 text-2xl font-medium">{headerTitle}</h1>
      <p className="mb-8 text-stone-600">{headerDescription}</p>

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
              ? isStudentMode
                ? `/learn/${sessionId}?qa=${chapter.firstQaId}`
                : `/learn/${sessionId}?role=teacher&qa=${chapter.firstQaId}`
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
