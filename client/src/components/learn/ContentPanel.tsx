import { useEffect, useMemo, useRef, useState } from 'react';
import { QrCode } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import QrFullscreen from '../common/QrFullscreen';
import type { DemoMeta } from '../../data/demos';
import type { Chapter, QaStub } from '../../data/qa-stubs';
import { getExtras } from '../../data/learn-extras';
import { LAB_QA_ID } from '../../data/vibe-lab-ch18';
import { getDemoComponent } from '../../demos/registry';
import { DEMO_LAYOUT_MAX_WIDTH } from '../../demos/types';
import { getTeacherExplain, TeacherExplainClientError, type TeacherExplainBlock } from '../../lib/teacher-explain-fetch';
import { earnedMissionIndex, missionIndexOf } from '../../lib/lab-shell';
import { useLearnStore, type ContentTab } from '../../store/learn-store';
import LabTab from './LabTab';
import MyTurnTab from './MyTurnTab';
import NextQuestionDoor from './NextQuestionDoor';
import { getNextQuestionDoorTarget } from './next-question-door';
import QuizTab from './QuizTab';
import ReadTab from './ReadTab';
import TeacherExplainPanel from './TeacherExplainPanel';
import TourTab from './TourTab';

type ContentPanelProps = {
  chapter: Chapter;
  qa: QaStub;
  demo?: DemoMeta;
  scenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  quizProps?: {
    onScore?: (score: number) => void;
  };
  sessionCode?: string;
  teacherPanel?: boolean;
  sessionId?: string;
  availableQaIds?: string[];
};

const TAB_LABELS: Record<ContentTab, string> = {
  read: '📖 읽기',
  demo: '🎮 시연',
  tour: '🚌 견학',
  myturn: '✋ 내 차례',
  lab: '🧪 실습',
  quiz: '📝 퀴즈',
  explain: '📋 설명 노트',
};

const QA_ID_PATTERN = /^ch\d{2}_q\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 우측 컬럼 — 이 문항의 내용 전부를 탭으로 담는다.
 *
 * 🚨 탭은 **데이터가 있을 때만** 켜진다(시연·견학·내 차례). 없는 탭을 띄워 두면 학생이
 *    빈 화면을 열게 된다. 반대로 데이터가 생겼는데 탭이 안 켜지면 만든 콘텐츠가 영영 안 보인다 —
 *    그래서 판정은 «데이터가 있는가» 하나뿐이고, 화면 종류를 가르는 데는 쓰지 않는다.
 * 🚨 탭은 **줄바꿈**으로 접는다(가로 스크롤 금지). 390px 학생 화면에서 탭이 6개가 되면
 *    스크롤된다는 표시 없이 💬·📝 가 화면 밖으로 나갔다(2026-08-11 prod QA, 새내기 f1).
 */
export default function ContentPanel({
  chapter,
  qa,
  demo,
  scenarioId,
  onScenarioChange,
  quizProps,
  sessionCode,
  teacherPanel = false,
  sessionId,
  availableQaIds = [],
}: ContentPanelProps) {
  const qaId = qa.id;
  const inlineHostRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const contentTab = useLearnStore((state) => state.contentTab);
  const setContentTab = useLearnStore((state) => state.setContentTab);
  const setLabMissionIndex = useLearnStore((state) => state.setLabMissionIndex);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [teacherExplain, setTeacherExplain] = useState<TeacherExplainBlock | null>(null);
  const [teacherExplainStatus, setTeacherExplainStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [teacherExplainMessage, setTeacherExplainMessage] = useState<string | null>(null);

  const extras = getExtras(qaId);
  const inlineMeta = qaId ? getDemoComponent(qaId) : undefined;

  const tabs = useMemo(() => {
    const list: ContentTab[] = ['read'];
    if (inlineMeta) {
      list.push('demo');
    }
    if (extras?.tour?.length) {
      list.push('tour');
    }
    if (extras?.myTurn) {
      list.push('myturn');
    }
    // 🔑 실습실은 12강 마지막 문항 하나에만 붙는다. 조건은 다른 탭과 **같은 모양**이다 —
    //    «이 문항에 그 데이터가 있는가» 하나뿐이고, 화면 종류를 가르는 데는 쓰지 않는다.
    if (qaId === LAB_QA_ID) {
      list.push('lab');
    }
    list.push('quiz');
    // 🚨 여기가 «교사에게만»의 **유일한** 자리다. 교사 전용 탭을 이 블록 밖에서 밀어 넣으면
    //    학생 화면에 교사용 대본이 새고, 그건 화면을 열어 보기 전까지 아무도 안 알려 준다.
    //    (learnLayoutContract ⑦ 이 이 블록 밖의 explain 을 빨갛게 잡는다.)
    if (teacherPanel) {
      list.push('explain');
    }
    return list;
  }, [chapter.id, extras, inlineMeta, qaId, teacherPanel]);

  // 🔑 탭 상태는 문항을 바꿔도 유지한다(읽기 → 읽기). 새 문항에 그 탭이 없을 때만 첫 탭으로 접는다 —
  //    없는 탭에 머무르면 화면이 통째로 비고, 학생은 «고장»으로 읽는다.
  const activeTab = tabs.includes(contentTab) ? contentTab : 'read';
  useEffect(() => {
    if (!tabs.includes(contentTab)) {
      setContentTab('read');
    }
  }, [contentTab, setContentTab, tabs]);


  useEffect(() => {
    if (activeTab !== 'explain') {
      return;
    }

    if (!teacherPanel) {
      setTeacherExplainStatus('idle');
      setTeacherExplainMessage(null);
      setTeacherExplain(null);
      return;
    }

    if (!sessionId || !UUID_PATTERN.test(sessionId)) {
      setTeacherExplainStatus('error');
      setTeacherExplainMessage('수업 정보 없음');
      setTeacherExplain(null);
      return;
    }

    if (!QA_ID_PATTERN.test(qaId)) {
      setTeacherExplainStatus('error');
      setTeacherExplainMessage('설명 노트를 불러올 문항 정보가 올바르지 않아요.');
      setTeacherExplain(null);
      return;
    }

    let cancelled = false;

    setTeacherExplainStatus('loading');
    setTeacherExplainMessage(null);

    getTeacherExplain(qaId, sessionId)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setTeacherExplain(data);
        setTeacherExplainStatus('ready');
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof TeacherExplainClientError) {
          if (error.status === 401) {
            setTeacherExplainMessage('권한을 다시 확인하는 중입니다.');
            setTeacherExplainStatus('error');
            navigate('/forbidden', { replace: true });
            return;
          }

          if (error.status === 403) {
            setTeacherExplainMessage('이 Q&A는 이 수업에 담겨 있지 않아요');
            setTeacherExplainStatus('error');
            return;
          }

          if (error.status === 404) {
            setTeacherExplainMessage('준비 중');
            setTeacherExplainStatus('error');
            return;
          }
        }

        setTeacherExplainMessage('설명 노트를 불러오지 못했습니다.');
        setTeacherExplainStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, navigate, qaId, sessionId, teacherPanel]);

  const handleScenarioHash = (nextScenarioId: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${nextScenarioId}`);
    }
    onScenarioChange(nextScenarioId);
  };

  const handleReload = () => {
    onScenarioChange(scenarioId);
  };

  const handleFullscreen = async () => {
    const host = inlineHostRef.current;
    if (host && host.requestFullscreen) {
      try {
        await host.requestFullscreen();
      } catch {
        return;
      }
    }
  };

  const InlineComponent = inlineMeta?.Component;
  const inlineMaxWidth = inlineMeta ? DEMO_LAYOUT_MAX_WIDTH[inlineMeta.layout] : '';
  const nextTab = tabs[tabs.indexOf('read') + 1];
  const isSessionRoute = location.pathname.startsWith('/learn/');
  const nextQuestion = getNextQuestionDoorTarget(qaId, isSessionRoute ? availableQaIds : undefined);

  const handleOpenNextQuestion = () => {
    if (!nextQuestion) {
      return;
    }

    if (isSessionRoute) {
      const nextSearch = new URLSearchParams(location.search);
      nextSearch.set('qa', nextQuestion.qa.id);
      navigate(`${location.pathname}?${nextSearch.toString()}`);
      return;
    }

    navigate(`/library/${nextQuestion.chapter.id}/${nextQuestion.qa.id}`);
  };

  return (
    <section className="flex h-full flex-1 flex-col bg-[var(--color-surface-alt)]">
      <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-white px-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)]">
              {chapter.lessonNo}강 · {qa.order}번
            </p>
            <h1
              className="mt-0.5 truncate text-[17px] font-semibold leading-[1.35] text-[var(--color-text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {qa.title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {sessionCode ? (
              <button
                aria-label="QR 코드 보기"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setIsQrOpen(true)}
                title="학생 참여 QR 코드"
                type="button"
              >
                <QrCode size={14} strokeWidth={1.75} />
                <span className="sm:hidden">QR</span>
                <span className="hidden sm:inline">QR코드</span>
              </button>
            ) : null}
            <span className="flex items-center gap-1" style={{ visibility: activeTab === 'demo' ? 'visible' : 'hidden' }}>
              <button className="toolbar-btn" onClick={handleReload} title="처음 상태로" type="button">
                ↺
              </button>
              <button className="toolbar-btn" onClick={handleFullscreen} title="전체화면" type="button">
                ⛶
              </button>
            </span>
          </div>
        </div>

        <nav aria-label="문항 콘텐츠" className="mt-2 flex flex-wrap gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`whitespace-nowrap px-3 py-2 text-[13px] ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--color-text-primary)] font-semibold text-[var(--color-text-primary)]'
                  : 'border-b-2 border-transparent font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
              onClick={() => setContentTab(tab)}
              type="button"
            >
              {TAB_LABELS[tab]}
              {tab === 'explain' ? (
                <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-800">교사</span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {isQrOpen && sessionCode ? <QrFullscreen code={sessionCode} onClose={() => setIsQrOpen(false)} /> : null}

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'read' ? (
          <ReadTab
            doneLabel={nextTab ? `${TAB_LABELS[nextTab]}으로 →` : undefined}
            incident={extras?.incident}
            onDone={nextTab ? () => setContentTab(nextTab) : undefined}
            qa={qa}
          />
        ) : null}

        {activeTab === 'demo' && InlineComponent ? (
          <div className="flex flex-col px-4 py-6 lg:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-col sm:gap-0">
              <div ref={inlineHostRef} className={`mx-auto w-full ${inlineMaxWidth}`}>
                <InlineComponent key={`${qaId}:${scenarioId}`} scenarioId={scenarioId} />
              </div>
              {demo ? (
                <ScenarioPicker
                  demo={demo}
                  description={demo.description}
                  onChange={handleScenarioHash}
                  scenarioId={scenarioId}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'tour' && extras?.tour?.length ? <TourTab missions={extras.tour} qaId={qaId} /> : null}

        {activeTab === 'myturn' && extras?.myTurn ? <MyTurnTab config={extras.myTurn} qaId={qaId} /> : null}

        {activeTab === 'lab' ? (
          <div className="h-full p-3 lg:p-4">
            <LabTab
              onExit={() => setContentTab('read')}
              onStateChange={(labState) => setLabMissionIndex(missionIndexOf(labState), earnedMissionIndex(labState))}
              qaId={qaId}
            />
          </div>
        ) : null}

        {activeTab === 'quiz' ? (
          <div className="mx-auto w-full max-w-[720px] p-6 lg:p-8">
            <QuizTab onScore={quizProps?.onScore} qaId={qaId} />
            {nextQuestion ? (
              <NextQuestionDoor
                chapter={nextQuestion.chapter}
                onOpen={handleOpenNextQuestion}
                qa={nextQuestion.qa}
              />
            ) : null}
          </div>
        ) : null}

        {activeTab === 'explain' ? (
          <div className="px-4 py-4 lg:px-8">
            {teacherExplainStatus === 'ready' && teacherExplain ? (
              <TeacherExplainPanel
                availableQaIds={availableQaIds}
                block={teacherExplain}
                currentQaId={qaId}
                sessionId={sessionId}
              />
            ) : teacherExplainStatus === 'loading' ? (
              <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3">
                <div className="h-12 animate-pulse rounded-xl bg-stone-200" />
                <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
                <div className="h-36 animate-pulse rounded-xl bg-stone-100" />
                <div className="h-48 animate-pulse rounded-xl bg-stone-100" />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[760px] rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
                {teacherExplainMessage ?? '설명 노트를 불러오는 중 문제가 생겼습니다.'}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ScenarioPicker({
  demo,
  scenarioId,
  onChange,
  description,
}: {
  demo: DemoMeta;
  scenarioId: string;
  onChange: (scenarioId: string) => void;
  description: string;
}) {
  const activeLabel = demo.scenarios.find((scenario) => scenario.id === scenarioId)?.label;

  return (
    <div className="mx-auto mt-6 flex w-full max-w-[860px] flex-col gap-3">
      <div
        aria-label="시연 시나리오 선택"
        className="flex flex-wrap gap-1.5 rounded-full border bg-white p-1"
        role="tablist"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {demo.scenarios.map((scenario) => {
          const active = scenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              aria-selected={active}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium transition"
              onClick={() => onChange(scenario.id)}
              role="tab"
              style={{
                background: active ? 'var(--color-text-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--color-text-muted)',
              }}
              type="button"
            >
              {scenario.label}
            </button>
          );
        })}
      </div>
      <p className="text-[12px] leading-[1.7]" style={{ color: 'var(--color-text-muted)' }}>
        ▶ <strong style={{ color: 'var(--color-text-body)' }}>{activeLabel}</strong> — {description}
      </p>
    </div>
  );
}
