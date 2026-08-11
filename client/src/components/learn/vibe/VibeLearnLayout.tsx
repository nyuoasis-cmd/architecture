import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChapterStub, QaStub } from '../../../data/qa-stubs';
import { getDemoByQaId } from '../../../data/demos';
import { getDemoComponent } from '../../../demos/registry';
import { getCategoryMeaning } from '../../../data/category-meanings';
import { getExtras } from '../../../data/learn-extras';
import ChatPanel from '../ChatPanel';
import QuizTab from '../QuizTab';
import VibeMyTurnTab from './VibeMyTurnTab';
import VibeReadTab from './VibeReadTab';
import VibeTourTab from './VibeTourTab';

type VibeTabId = 'read' | 'demo' | 'myturn' | 'tour' | 'quiz' | 'chat';

type VibeLearnLayoutProps = {
  chapter: ChapterStub;
  chapterQas: QaStub[];
  qa: QaStub;
  makeQaHref: (qaId: string) => string;
  onScore?: (score: number) => void;
};

const TAB_LABELS: Record<VibeTabId, string> = {
  read: '📖 본문',
  demo: '🎮 시연',
  myturn: '✍️ 내 차례',
  tour: '🚌 견학',
  quiz: '✅ 퀴즈',
  chat: '💬 챗봇',
};

/**
 * 카테고리 «바이브코딩» 전용 학습 화면 — 탭으로 하나씩, 전체 폭 (PC 기본).
 * 탭 순서 = 수업 동선: 읽고 → 보고 → 해보고 → 진짜에서 확인하고 → 퀴즈.
 * 정본 목업: mockups/vibecoding-ch13q01-learn.html (v3).
 */
export default function VibeLearnLayout({ chapter, chapterQas, qa, makeQaHref, onScore }: VibeLearnLayoutProps) {
  const extras = getExtras(qa.id);
  const demoMeta = getDemoByQaId(qa.id);
  const demoComponent = getDemoComponent(qa.id);
  const categoryMeaning = getCategoryMeaning(chapter.category);

  const tabs = useMemo(() => {
    const list: VibeTabId[] = ['read'];
    if (demoComponent) {
      list.push('demo');
    }
    if (extras?.myTurn) {
      list.push('myturn');
    }
    if (extras?.tour?.length) {
      list.push('tour');
    }
    list.push('quiz', 'chat');
    return list;
  }, [demoComponent, extras]);

  const [activeTab, setActiveTab] = useState<VibeTabId>('read');
  const [scenarioId, setScenarioId] = useState<string>('');

  useEffect(() => {
    setActiveTab('read');
    setScenarioId(getDemoByQaId(qa.id)?.scenarios[0]?.id ?? '');
  }, [qa.id]);

  const nextTabAfterRead: VibeTabId = tabs[1] ?? 'quiz';

  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 pb-10">
      <header className="pt-5">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          <span>{chapter.emoji}</span>
          <span>
            {chapter.id}장 · {chapter.title}
          </span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
            {chapter.category}
          </span>
          <nav aria-label="문항 이동" className="ml-auto flex items-center gap-1">
            {chapterQas.map((item) => (
              <Link
                key={item.id}
                aria-current={item.id === qa.id ? 'page' : undefined}
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold ${
                  item.id === qa.id
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                }`}
                to={makeQaHref(item.id)}
              >
                {item.order}
              </Link>
            ))}
          </nav>
        </div>
        <h1 className="mt-2 text-[22px] font-semibold leading-[1.35] text-[var(--color-text-primary)]">{qa.title}</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-text-muted)]">
          {qa.order}/{chapter.qaCount} · {qa.summary}
        </p>
        {categoryMeaning ? (
          <p className="mt-1.5 text-[12px] leading-[1.6] text-[var(--color-text-faint)]">{categoryMeaning}</p>
        ) : null}
      </header>

      {/*
        🚨 탭은 **줄바꿈**으로 접는다 — 가로 스크롤로 두지 않는다.
           「내 차례」가 붙은 문항은 탭이 6개가 되는데, 390px 학생 화면에서는 scrollWidth 476 > 358 이라
           ✅퀴즈 라벨이 잘리고 💬챗봇은 화면 밖으로 나갔다(2026-08-11 prod QA 실측, 새내기 f1).
           스크롤은 됐지만 **스크롤된다는 표시가 없어** 학생은 탭이 4개인 줄 알았고, 막혔을 때
           물어볼 유일한 통로인 챗봇이 바로 그 안 보이는 자리에 있었다.
           줄바꿈이면 탭이 몇 개로 늘어도 «화면 밖»이 생기지 않는다 — 표시를 덧붙여 고치는 대신
           넘칠 수 있는 구조 자체를 없앤다.
      */}
      <nav className="mt-4 flex flex-wrap gap-0.5 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`whitespace-nowrap px-4 py-2.5 text-[13.5px] ${
              activeTab === tab
                ? 'border-b-2 border-[var(--color-text-primary)] font-semibold text-[var(--color-text-primary)]'
                : 'border-b-2 border-transparent font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      <div className="min-h-[440px]">
        {activeTab === 'read' ? (
          <VibeReadTab
            doneLabel={`${TAB_LABELS[nextTabAfterRead]}으로 →`}
            incident={extras?.incident}
            onDone={() => setActiveTab(nextTabAfterRead)}
            qa={qa}
          />
        ) : null}

        {activeTab === 'demo' && demoComponent ? (
          <div className="mx-auto w-full max-w-[860px] px-5 py-6">
            {demoMeta && demoMeta.scenarios.length > 1 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {demoMeta.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium ${
                      scenarioId === scenario.id
                        ? 'border-transparent bg-[var(--color-btn-primary)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]'
                    }`}
                    onClick={() => setScenarioId(scenario.id)}
                    type="button"
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            ) : null}
            <demoComponent.Component scenarioId={scenarioId} />
          </div>
        ) : null}

        {activeTab === 'myturn' && extras?.myTurn ? <VibeMyTurnTab config={extras.myTurn} qaId={qa.id} /> : null}

        {activeTab === 'tour' && extras?.tour?.length ? <VibeTourTab missions={extras.tour} qaId={qa.id} /> : null}

        {activeTab === 'quiz' ? (
          <div className="mx-auto w-full max-w-[720px]">
            <QuizTab onScore={onScore} qaId={qa.id} />
          </div>
        ) : null}

        {activeTab === 'chat' ? (
          <div className="mx-auto flex h-[520px] w-full max-w-[720px] flex-col overflow-hidden rounded-b-xl border-x border-b border-[var(--color-border)]">
            <ChatPanel qaId={qa.id} qaTitle={qa.title} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
