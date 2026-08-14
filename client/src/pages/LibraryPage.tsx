import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CHAPTERS, getQasByChapterId, type Chapter } from '../data/qa-stubs';
import { getChapterProgress, useProgressMap } from '../lib/progress';
import { getSession, SessionClientError, type SessionDetail } from '../lib/session-client';

type FilterId = 'all' | 'inProgress';

/**
 * 색인 — 「무엇을 배울지」 고르는 자리.
 *
 * 🔑 학습 화면은 **한 장에 집중**하는 자리라 좌측에 전 장을 세우지 않는다. 넓게 훑는 일은 여기서 한다
 *    (승인 목업 learn-3col-restore-v1.html S0). 그래서 검색·진도·이어하기가 여기 붙는다.
 * 🚨 문항 수도 장 수도 손으로 적지 않는다 — 등록부에서 센다(qaCountCopy.test.ts 가 손으로 적은 숫자를 막는다).
 */
export default function LibraryPage() {
  const progressMap = useProgressMap();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const isPreviewMode = Boolean(sessionId);
  const [previewSession, setPreviewSession] = useState<SessionDetail | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');

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
                : '수업 정보를 불러오지 못했습니다.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const allowedChapterIds = previewSession?.chapter_ids;
  const openChapters = useMemo(
    () =>
      isPreviewMode && allowedChapterIds
        ? CHAPTERS.filter((chapter) => allowedChapterIds.includes(chapter.id))
        : CHAPTERS,
    [allowedChapterIds, isPreviewMode],
  );

  const isStudentMode = Boolean(previewSession?.viewer);

  // 🔑 검색은 장 제목뿐 아니라 **문항 제목·묶음**까지 본다. 학생이 기억하는 것은
  //    «몇 장»이 아니라 «캐시 얘기 나왔던 거»라서, 장 제목만 뒤지면 대부분 0건이 된다.
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return openChapters;
    }
    return openChapters.filter((chapter) => {
      const haystack = [
        `${chapter.lessonNo}강`,
        chapter.title,
        chapter.category,
        ...getQasByChapterId(chapter.id).map((qa) => `${qa.title} ${qa.keywords.join(' ')}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [openChapters, query]);

  const progressOf = (chapter: Chapter) => getChapterProgress(chapter.id);
  const inProgressChapters = useMemo(
    () =>
      openChapters.filter((chapter) => {
        const progress = progressOf(chapter);
        return progress.done > 0 && progress.done < progress.total;
      }),
    // progressMap 이 바뀌면 다시 센다 — localStorage 진도는 이 화면 밖에서도 움직인다.
    [openChapters, progressMap],
  );

  const chaptersToShow = filter === 'inProgress' ? matches.filter((chapter) => inProgressChapters.includes(chapter)) : matches;

  // 「이어서 하기」 = 진도가 시작됐지만 안 끝난 장 중 가장 앞선 것 + 아직 안 끝낸 첫 문항.
  const resumeChapter = inProgressChapters[0];
  const resumeQa = resumeChapter
    ? getQasByChapterId(resumeChapter.id).find((qa) => {
        const entry = progressMap[qa.id];
        if (!entry) {
          return true;
        }
        return entry.quizScore !== undefined ? entry.quizScore < 2 : !entry.read;
      })
    : undefined;

  const hrefFor = (chapter: Chapter, qaId: string) =>
    isPreviewMode && sessionId
      ? `/learn/${sessionId}?qa=${qaId}${isStudentMode ? '' : '&role=teacher'}`
      : `/library/${chapter.id}/${qaId}`;

  const headerTitle = isPreviewMode
    ? isStudentMode
      ? '챕터 라이브러리'
      : // 🔑 교사 수업 현황 화면의 버튼과 같은 말을 쓴다 — 「시연」은 «학생에게 보여 주기»로도
        //    «내가 미리 보기»로도 읽혀 신입 교사가 순서에서 멈춘 낱말이다(2026-08-11 QA t2).
        '학생 화면 미리 보기 — 챕터 선택'
    : '라이브러리';
  const headerDescription = isPreviewMode
    ? isStudentMode
      ? '오늘 수업에서 열린 챕터예요. 들어가고 싶은 챕터를 골라주세요.'
      : '학생이 보게 될 화면을 미리 열어 봅니다. 이 수업에 담긴 챕터만 보입니다.'
    : `${CHAPTERS.length}개 챕터, ${CHAPTERS.reduce((sum, chapter) => sum + chapter.qaCount, 0)}개 Q&A.`;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 py-10">
      {isPreviewMode && !isStudentMode ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex min-h-9 items-center rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            to="/teacher"
          >
            ← 내 수업
          </Link>
          {sessionId ? (
            <Link
              className="inline-flex min-h-9 items-center rounded-xl bg-stone-950 px-3 text-sm font-medium text-white hover:bg-stone-800"
              to={`/teacher/session/${sessionId}`}
            >
              수업 현황 →
            </Link>
          ) : null}
          {previewSession ? (
            <span className="text-xs text-stone-500">
              미리 보기 · {previewSession.name} · 코드 {previewSession.code}
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
          수업 정보를 불러오는 중입니다.
        </div>
      ) : null}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">장·문항 검색</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">🔍</span>
          <input
            className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="찾는 내용을 적어보세요 — 캐시, 데이터베이스, 배포…"
            type="search"
            value={query}
          />
        </label>

        <div className="flex gap-1.5">
          <FilterChip active={filter === 'all'} label={`전체 ${openChapters.length}`} onClick={() => setFilter('all')} />
          <FilterChip
            active={filter === 'inProgress'}
            disabled={inProgressChapters.length === 0}
            label={`이어하기 ${inProgressChapters.length}`}
            onClick={() => setFilter('inProgress')}
          />
        </div>
      </div>

      {resumeChapter && resumeQa && filter === 'all' && !query ? (
        <Link
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-5 py-4 transition hover:brightness-[0.98]"
          to={hrefFor(resumeChapter, resumeQa.id)}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">이어서 하기</p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              {resumeChapter.emoji} {resumeChapter.lessonNo}강 · {resumeChapter.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-stone-600">
              {resumeQa.order}번 · {resumeQa.title}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-[var(--color-accent)]">이어서 하기 →</span>
        </Link>
      ) : null}

      {chaptersToShow.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-stone-500">
          {query ? `«${query.trim()}»로 찾은 장이 없어요. 다른 낱말로 찾아보세요.` : '보여 줄 장이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chaptersToShow.map((chapter) => {
            const progress = progressOf(chapter);
            const isCurrent = resumeChapter?.id === chapter.id;
            const ratio = progress.total > 0 ? progress.done / progress.total : 0;

            return (
              <Link
                key={chapter.id}
                className={`rounded-xl border bg-white p-5 transition hover:border-stone-400 ${
                  isCurrent ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'
                }`}
                to={hrefFor(chapter, chapter.firstQaId)}
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs text-stone-500">
                  <span>{chapter.lessonNo}강</span>
                  {isCurrent ? (
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                      보는 중
                    </span>
                  ) : null}
                </div>
                <div className="mb-2 font-medium">
                  {chapter.emoji} {chapter.title}
                </div>
                <div className="text-xs text-stone-500">{chapter.category}</div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-stone-100">
                  <span
                    className="block h-full rounded-full bg-[var(--color-success)]"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-stone-400">
                  진도 {progress.done}/{progress.total}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

function FilterChip({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-11 whitespace-nowrap rounded-xl border px-3.5 text-sm font-medium transition disabled:opacity-40 ${
        active
          ? 'border-stone-950 bg-stone-950 text-white'
          : 'border-[var(--color-border)] bg-white text-stone-700 hover:bg-stone-50'
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
