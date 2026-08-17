import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QrFullscreenModal from '../components/common/QrFullscreenModal';
import { StudentExitGuard } from '../components/StudentExitGuard';
import ChapterNavPanel from '../components/learn/ChapterNavPanel';
import ContentPanel from '../components/learn/ContentPanel';
import ReadyCheck, { readyCheckSeen } from '../components/learn/ReadyCheck';
import { CHAPTERS, getChapterById, getQaById, getQasByChapterId, type QaStub } from '../data/qa-stubs';
import { getDemoByQaId } from '../data/demos';
import { markRead } from '../lib/progress';
import { endSession, getSession, patchProgress, SessionClientError } from '../lib/session-client';
import { clearSessionTokenHint } from '../lib/session-token';
import { useLearnStore } from '../store/learn-store';
import { useSessionStore } from '../store/session-store';

const MOBILE_LABELS = {
  nav: '문항',
  content: '콘텐츠',
} as const;

type LearnPageProps = {
  mode: 'self' | 'session';
};

/**
 * 학습 화면 — **2컬럼 하나뿐이다**(문항 목록 280 · 콘텐츠).
 *
 * 🚨 형판을 둘로 가르지 않는다. 2026-08-11 까지는 «이 장에 extras 가 있는가»로 두 형판을
 *    갈랐는데, 견학이 107/107 문항에 붙자 조건이 17/17 장을 참으로 만들어 **한쪽 형판이
 *    도달 불가 죽은 코드**가 됐다 — 좌측 문항 목록 컬럼이 통째로 안 그려졌고,
 *    «문제가 생기면 그 장 데이터만 되돌리면 된다»던 롤백 장치도 같이 무력화됐다.
 *    데이터의 많고 적음은 **탭의 개수**로만 나타난다(ContentPanel). 화면 종류는 안 바꾼다.
 * 🔑 2026-08-17 체험 재구조화: 가운데 AI 챗봇 컬럼(320px)을 철거했다 — AI 보조는 체험 탭
 *    안(터미널 ai▸ 목소리)에 산다. 좌측 챗봇 컬럼을 되살리지 말 것(learnLayoutContract).
 */
function LearnLayout(props: {
  mode: 'self' | 'session';
  chapter: NonNullable<ReturnType<typeof getChapterById>>;
  chapterQas: QaStub[];
  qa: QaStub;
  demo: ReturnType<typeof getDemoByQaId>;
  allSessionQas?: QaStub[];
  availableChapters: typeof CHAPTERS;
  progressMapOverride?: Record<string, { read: boolean; quizScore?: number }>;
  sessionId?: string;
  sessionCode?: string;
  isTeacherPreview?: boolean;
  onScore?: (score: number) => void;
  libraryHref: string;
  makeQaHref: (qaId: string) => string;
}) {
  const navigate = useNavigate();
  const mobileTab = useLearnStore((state) => state.mobileTab);
  const scenarioId = useLearnStore((state) => state.scenarioId);
  const setMobileTab = useLearnStore((state) => state.setMobileTab);
  const setScenarioId = useLearnStore((state) => state.setScenarioId);
  const goToQa = (qaId: string) => {
    navigate(props.makeQaHref(qaId));
    // 🔑 모바일에서 목록으로 골랐으면 바로 읽을 것을 보여 준다 — 고른 뒤 한 번 더 누르게 하지 않는다.
    setMobileTab('content');
  };

  return (
    /*
      🚨 화면 높이를 «100dvh − 헤더»로 손수 빼지 않는다. 공용 네비(<teachermate-nav>)는 CDN 에서
         오는 웹 컴포넌트라 높이가 고정이 아니다 — 실측 103px 인데 코드는 56 을 빼고 있었고,
         그만큼 아래가 잘려 **좌측의 「이전 장 / 다음 장」 버튼과 챗봇 입력칸이 화면 밖으로 나갔다.**
         (3컬럼이 죽어 있던 동안 아무도 못 봤다. 되살리는 김에 같이 고친다.)
      🔑 대신 app-shell 의 세로 flex 에서 **남은 높이를 그대로 받는다**(flex-1 + min-h-0).
         헤더가 커지든 작아지든, 네비가 아예 안 뜨든(학생 세션 라우트) 알아서 맞는다.
    */
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="flex flex-shrink-0 border-b border-[var(--color-border)] bg-white lg:hidden">
        {(Object.keys(MOBILE_LABELS) as Array<keyof typeof MOBILE_LABELS>).map((tab) => (
          <button
            key={tab}
            className={`mtab flex-1 py-2.5 text-sm font-medium ${mobileTab === tab ? 'is-active' : ''}`}
            onClick={() => setMobileTab(tab)}
            type="button"
          >
            {MOBILE_LABELS[tab]}
          </button>
        ))}
      </nav>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden">
        <aside
          className={`${mobileTab === 'nav' ? 'flex' : 'hidden'} w-full flex-col border-r border-[var(--color-border)] lg:flex lg:w-[280px] lg:min-w-[260px] lg:flex-shrink-0`}
        >
          <ChapterNavPanel
            availableChapters={props.availableChapters}
            chapter={props.chapter}
            chapterQas={props.chapterQas}
            currentQa={props.qa}
            libraryHref={props.libraryHref}
            onSelectChapter={(chapterId) => {
              const target = props.availableChapters.find((item) => item.id === chapterId);
              if (target) {
                goToQa(target.firstQaId);
              }
            }}
            onSelectQa={goToQa}
            progressMapOverride={props.progressMapOverride}
          />
        </aside>

        <section className={`${mobileTab === 'content' ? 'flex' : 'hidden'} w-full min-w-0 flex-1 flex-col lg:flex`}>
          <ContentPanel
            availableQaIds={props.allSessionQas?.map((item) => item.id) ?? [props.qa.id]}
            chapter={props.chapter}
            demo={props.demo}
            onScenarioChange={setScenarioId}
            qa={props.qa}
            quizProps={props.onScore ? { onScore: props.onScore } : undefined}
            scenarioId={scenarioId}
            sessionCode={props.sessionCode}
            sessionId={props.sessionId}
            teacherPanel={props.mode === 'session' && Boolean(props.sessionId)}
          />
        </section>
      </div>
    </div>
  );
}

export default function LearnPage({ mode }: LearnPageProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const resetForQa = useLearnStore((state) => state.resetForQa);
  const currentSession = useSessionStore((state) => state.currentSession);
  const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
  const viewerProgress = useSessionStore((state) => state.viewerProgress);
  const updateViewerProgress = useSessionStore((state) => state.updateViewerProgress);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    mode === 'session' ? 'loading' : 'idle',
  );
  // 준비 점검(SDD 결정 19) — 학생이 이 수업에 처음 들어왔을 때 한 번. 교사 시연에는 안 띄운다.
  const [readyCheckOpen, setReadyCheckOpen] = useState(
    () => mode === 'session' && Boolean(params.sessionId) && !readyCheckSeen(params.sessionId ?? ''),
  );
  const [sessionError, setSessionError] = useState<{ status?: number; message: string } | null>(null);

  const isTeacherPreview = mode === 'session' && searchParams.get('role') === 'teacher';
  const sessionId = params.sessionId;
  const chapterId = Number(params.chapterId);
  const qaId = params.qaId ?? '';

  let chapter = getChapterById(chapterId);
  let qa = getQaById(qaId);
  let chapterQas = chapter ? getQasByChapterId(chapter.id) : [];
  let sessionQas: QaStub[] = [];
  let sessionChapters: typeof CHAPTERS = [];

  if (mode === 'session' && currentSession && currentSession.id === params.sessionId) {
    sessionChapters = currentSession.chapter_ids
      .map((selectedChapterId) => CHAPTERS.find((item) => item.id === selectedChapterId))
      .filter((item): item is (typeof CHAPTERS)[number] => Boolean(item));
    sessionQas = currentSession.chapter_ids.flatMap((selectedChapterId) => getQasByChapterId(selectedChapterId));

    const sessionQaId = searchParams.get('qa') ?? sessionQas[0]?.id ?? '';
    const resolvedQa = sessionQas.find((item) => item.id === sessionQaId) ?? sessionQas[0];
    if (resolvedQa) {
      qa = resolvedQa;
      chapter = getChapterById(resolvedQa.chapterId);
      chapterQas = chapter ? getQasByChapterId(chapter.id) : [];
    }
  }

  const demo = qa ? getDemoByQaId(qa.id) : undefined;

  useEffect(() => {
    if (!qa) {
      return;
    }

    const hashId = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    const hashMatches = !!hashId && demo?.scenarios.some((s) => s.id === hashId);
    resetForQa(qa.id, hashMatches ? hashId : (demo?.scenarios[0]?.id ?? 'launch'));
  }, [demo?.scenarios, qa, resetForQa]);

  useEffect(() => {
    if (mode === 'self' && qa) {
      markRead(qa.id);
    }
  }, [mode, qa]);

  useEffect(() => {
    if (mode !== 'session' || !params.sessionId) {
      return;
    }

    let cancelled = false;
    setSessionStatus('loading');
    setSessionError(null);

    getSession(params.sessionId)
      .then((session) => {
        if (!cancelled) {
          setCurrentSession(session);
          setSessionStatus('ready');
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          if (caught instanceof SessionClientError && caught.status === 401 && !isTeacherPreview) {
            clearSessionTokenHint();
          }

          setSessionError({
            status: caught instanceof SessionClientError ? caught.status : undefined,
            message: caught instanceof Error ? caught.message : '수업 정보를 불러오지 못했습니다.',
          });
          setSessionStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, params.sessionId, setCurrentSession, isTeacherPreview]);

  useEffect(() => {
    if (mode !== 'session' || isTeacherPreview || !qa || !currentSession || currentSession.id !== params.sessionId) {
      return;
    }

    let cancelled = false;

    patchProgress({
      qaId: qa.id,
      readAt: new Date().toISOString(),
    })
      .then(() => {
        if (!cancelled) {
          updateViewerProgress(qa.id, {
            read: true,
            quizScore: viewerProgress[qa.id]?.quizScore,
          });
        }
      })
      .catch(() => {
        return undefined;
      });

    return () => {
      cancelled = true;
    };
  }, [currentSession, isTeacherPreview, mode, params.sessionId, qa, updateViewerProgress, viewerProgress]);

  if (mode === 'session') {
    if (sessionStatus === 'error' && sessionError?.status === 410) {
      return <Navigate replace to={isTeacherPreview ? `/teacher/session/${params.sessionId}` : '/join?closed=1'} />;
    }

    if (sessionStatus === 'error' && sessionError?.status === 401) {
      return <Navigate replace to={isTeacherPreview ? '/forbidden' : '/join?expired=1'} />;
    }

    if (
      sessionStatus !== 'ready' ||
      !qa ||
      !chapter ||
      !currentSession ||
      currentSession.id !== params.sessionId
    ) {
      return (
        <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
          <section className="w-full rounded-xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
            <p className="mb-3 text-sm font-medium text-stone-500">수업을 불러오는 중</p>
            <p className="text-sm text-stone-600">{sessionError?.message ?? '수업과 참여자 정보를 확인하고 있습니다.'}</p>
          </section>
        </main>
      );
    }

    return (
      <>
        <StudentExitGuard when={!isTeacherPreview} />
        {/* 🔑 목차 밖 1화면 — «0강»이 아니다. 건너뛰기가 항상 있어 수업을 막지 않는다. */}
        {readyCheckOpen && !isTeacherPreview ? (
          <ReadyCheck onDone={() => setReadyCheckOpen(false)} sessionId={params.sessionId!} />
        ) : null}
        <LearnLayout
        allSessionQas={sessionQas}
        availableChapters={sessionChapters}
        chapter={chapter}
        chapterQas={chapterQas}
        demo={demo}
        isTeacherPreview={isTeacherPreview}
        mode={mode}
        onScore={(score) => {
          void patchProgress({ qaId: qa.id, quizScore: score }).then(() => {
            updateViewerProgress(qa.id, {
              read: true,
              quizScore: score,
            });
          });
        }}
        libraryHref={`/library?sessionId=${params.sessionId}`}
        makeQaHref={(targetQaId) =>
          `/learn/${params.sessionId}?qa=${targetQaId}${isTeacherPreview ? '&role=teacher' : ''}`
        }
        progressMapOverride={viewerProgress}
        qa={qa}
        sessionCode={currentSession.code}
        sessionId={isTeacherPreview ? sessionId : undefined}
      />
      </>
    );
  }

  if (!chapter || !qa || qa.chapterId !== chapter.id) {
    return <Navigate replace to="/library" />;
  }

  return (
    <LearnLayout
      availableChapters={CHAPTERS}
      chapter={chapter}
      chapterQas={chapterQas}
      demo={demo}
      libraryHref="/library"
      // 🔑 장을 건너뛰는 이동도 이 한 줄로 처리된다 — 목적지 문항이 자기 장을 알고 있으므로
      //    현재 장 번호를 URL 에 박지 않는다(박으면 «12장 주소에 13장 문항»이 되어 튕긴다).
      makeQaHref={(targetQaId) => `/library/${getQaById(targetQaId)?.chapterId ?? chapter.id}/${targetQaId}`}
      mode={mode}
      qa={qa}
    />
  );
}
