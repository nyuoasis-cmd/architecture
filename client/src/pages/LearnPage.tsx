import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ChatPanel from '../components/learn/ChatPanel';
import GuidePanel from '../components/learn/GuidePanel';
import PreviewPanel from '../components/learn/PreviewPanel';
import { getChapterById, getQaById, getQasByChapterId } from '../data/qa-stubs';
import { getDemoByQaId } from '../data/demos';
import { markRead } from '../lib/progress';
import { useLearnStore } from '../store/learn-store';

const LABELS = {
  guide: '📖 학습',
  chat: '💬 채팅',
  preview: '📱 시연',
  quiz: '✅ 퀴즈',
} as const;

type LearnPageProps = {
  mode: 'self' | 'session';
};

export default function LearnPage({ mode }: LearnPageProps) {
  const params = useParams();
  const chapterId = Number(params.chapterId);
  const qaId = params.qaId ?? '';
  const chapter = getChapterById(chapterId);
  const qa = getQaById(qaId);
  const chapterQas = chapter ? getQasByChapterId(chapter.id) : [];
  const demo = qa ? getDemoByQaId(qa.id) : undefined;
  const mobileTab = useLearnStore((state) => state.mobileTab);
  const scenarioId = useLearnStore((state) => state.scenarioId);
  const setMobileTab = useLearnStore((state) => state.setMobileTab);
  const resetForQa = useLearnStore((state) => state.resetForQa);
  const setScenarioId = useLearnStore((state) => state.setScenarioId);

  useEffect(() => {
    if (qa) {
      resetForQa(qa.id, demo?.scenarios[0]?.id ?? 'launch');
    }
  }, [demo?.scenarios, qa, resetForQa]);

  useEffect(() => {
    if (mode === 'self' && qa) {
      markRead(qa.id);
    }
  }, [mode, qa]);

  if (mode === 'session') {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
        <section className="w-full rounded-xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-sm font-medium text-stone-500">세션 학습 준비중</p>
          <h1 className="mb-3 text-2xl font-medium">세션 학습은 PR #6에서 연결됩니다</h1>
          <p className="text-sm text-stone-600">
            현재 PR은 자율학습 UI 골격만 다룹니다. 교사 세션 코드, 참여 흐름, 실시간 진도는 다음 단계에서
            연결됩니다.
          </p>
        </section>
      </main>
    );
  }

  if (!chapter || !qa || qa.chapterId !== chapter.id) {
    return <Navigate replace to="/library" />;
  }

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
            chapter={chapter}
            chapterQas={chapterQas}
            currentQa={qa}
            mode={mode}
            onScenarioChange={(nextScenarioId) => {
              setScenarioId(nextScenarioId);
              setMobileTab('preview');
            }}
          />
        </aside>

        <section
          className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} w-full flex-col border-r border-[var(--color-border)] lg:flex lg:w-[320px] lg:min-w-[280px] lg:flex-shrink-0`}
        >
          <ChatPanel qaId={qa.id} qaTitle={qa.title} />
        </section>

        <section
          className={`${mobileTab === 'preview' || mobileTab === 'quiz' ? 'flex' : 'hidden'} flex-1 flex-col lg:flex`}
        >
          <PreviewPanel
            demo={demo}
            initialTab={mobileTab === 'quiz' ? 'quiz' : 'demo'}
            onScenarioChange={setScenarioId}
            qaId={qa.id}
            scenarioId={scenarioId}
          />
        </section>
      </div>
    </div>
  );
}
