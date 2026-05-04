import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import ChatPanel from '../components/learn/ChatPanel';
import GuidePanel from '../components/learn/GuidePanel';
import PreviewPanel from '../components/learn/PreviewPanel';
import { CHAPTERS, getChapterById, getQaById, getQasByChapterId, type QaStub } from '../data/qa-stubs';
import { getDemoByQaId } from '../data/demos';
import { markRead } from '../lib/progress';
import { getSession, patchProgress, SessionClientError } from '../lib/session-client';
import { clearSessionTokenHint } from '../lib/session-token';
import { useLearnStore } from '../store/learn-store';
import { useSessionStore } from '../store/session-store';

const LABELS = {
  guide: '📖 학습',
  chat: '💬 채팅',
  preview: '📱 시연',
  quiz: '✅ 퀴즈',
} as const;

type LearnPageProps = {
  mode: 'self' | 'session';
};

function LearnLayout(props: {
  mode: 'self' | 'session';
  chapter: NonNullable<ReturnType<typeof getChapterById>>;
  chapterQas: QaStub[];
  qa: QaStub;
  demo: ReturnType<typeof getDemoByQaId>;
  allSessionQas?: QaStub[];
  availableChapters?: typeof CHAPTERS;
  progressMapOverride?: Record<string, { read: boolean; quizScore?: number }>;
  sessionId?: string;
  onScore?: (score: number) => void;
}) {
  const mobileTab = useLearnStore((state) => state.mobileTab);
  const scenarioId = useLearnStore((state) => state.scenarioId);
  const setMobileTab = useLearnStore((state) => state.setMobileTab);
  const setScenarioId = useLearnStore((state) => state.setScenarioId);

  return (
    <div className="flex h-[calc(100dvh-56px)] min-h-0 flex-col">
      <nav className="flex flex-shrink-0 border-b border-[var(--color-border)] lg:hidden">
        {(Object.keys(LABELS) as Array<keyof typeof LABELS>).map((tab) => (
          <button
            key={tab}
            className={`mtab flex-1 py-2.5 text-sm font-medium ${mobileTab === tab ? 'is-active' : ''}`}
            onClick={() => setMobileTab(tab)}
            type="button"
          >
            {LABELS[tab]}
          </button>
        ))}
      </nav>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden">
        <aside
          className={`${mobileTab === 'guide' ? 'flex' : 'hidden'} w-full flex-col border-r border-[var(--color-border)] lg:flex lg:w-[280px] lg:min-w-[260px] lg:flex-shrink-0`}
        >
          <GuidePanel
            activeScenarioId={scenarioId}
            allSessionQas={props.allSessionQas}
            chapter={props.chapter}
            chapterQas={props.chapterQas}
            currentQa={props.qa}
            mode={props.mode}
            onScenarioChange={(nextScenarioId) => {
              setScenarioId(nextScenarioId);
              setMobileTab('preview');
            }}
            progressMapOverride={props.progressMapOverride}
            sessionId={props.sessionId}
          />
        </aside>

        <section
          className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} w-full flex-col border-r border-[var(--color-border)] lg:flex lg:w-[320px] lg:min-w-[280px] lg:flex-shrink-0`}
        >
          <ChatPanel qaId={props.qa.id} qaTitle={props.qa.title} />
        </section>

        <section
          className={`${mobileTab === 'preview' || mobileTab === 'quiz' ? 'flex' : 'hidden'} flex-1 flex-col lg:flex`}
        >
          <PreviewPanel
            demo={props.demo}
            initialTab={mobileTab === 'quiz' ? 'quiz' : 'demo'}
            onScenarioChange={setScenarioId}
            qaId={props.qa.id}
            quizProps={props.onScore ? { onScore: props.onScore } : undefined}
            scenarioId={scenarioId}
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
  const [sessionError, setSessionError] = useState<{ status?: number; message: string } | null>(null);

  const isTeacherPreview = mode === 'session' && searchParams.get('role') === 'teacher';
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

    getSession(params.sessionId, isTeacherPreview ? { teacher: true } : undefined)
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
            message: caught instanceof Error ? caught.message : '세션 정보를 불러오지 못했습니다.',
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
            <p className="mb-3 text-sm font-medium text-stone-500">세션 학습 로딩 중</p>
            <p className="text-sm text-stone-600">{sessionError?.message ?? '세션과 참여자 정보를 확인하고 있습니다.'}</p>
          </section>
        </main>
      );
    }

    return (
      <LearnLayout
        allSessionQas={sessionQas}
        availableChapters={sessionChapters}
        chapter={chapter}
        chapterQas={chapterQas}
        demo={demo}
        mode={mode}
        onScore={(score) => {
          void patchProgress({ qaId: qa.id, quizScore: score }).then(() => {
            updateViewerProgress(qa.id, {
              read: true,
              quizScore: score,
            });
          });
        }}
        progressMapOverride={viewerProgress}
        qa={qa}
        sessionId={currentSession.id}
      />
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
      mode={mode}
      qa={qa}
    />
  );
}
