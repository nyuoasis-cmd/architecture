import { useEffect, useMemo, useRef, useState } from 'react';
import { QrCode } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import QrFullscreen from '../common/QrFullscreen';
import type { DemoMeta } from '../../data/demos';
import type { Chapter, QaStub } from '../../data/qa-stubs';
import { getExtras } from '../../data/learn-extras';
import { getGhScript } from '../../data/gh-scripts';
import { getMiniLab } from '../../data/mini-labs';
import { PHISHING_QA_ID } from '../../data/phishing-check';
import { getTourKit } from '../../data/tour-kits';
import { LAB_CHAPTER_ID, LAB_QA_ID, LAB_QA_MISSION_SPANS } from '../../data/vibe-lab-ch18';
import { labSaveArtifact } from '../../lib/lab-api';
import { getDemoComponent } from '../../demos/registry';
import { DEMO_LAYOUT_MAX_WIDTH } from '../../demos/types';
import { getTeacherExplain, TeacherExplainClientError, type TeacherExplainBlock } from '../../lib/teacher-explain-fetch';
import { earnedMissionIndex, missionIndexOf } from '../../lib/lab-shell';
import { reportLabMission } from '../../lib/progress';
import { useLearnStore, type ContentTab } from '../../store/learn-store';
import GhSimTab from './GhSimTab';
import LabTab from './LabTab';
import MiniLabTab from './MiniLabTab';
import NextQuestionDoor from './NextQuestionDoor';
import PhishingCheck from './PhishingCheck';
import TourKit from './TourKit';
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
  exp: '🧭 체험',
  quiz: '📝 퀴즈',
  explain: '📋 설명 노트',
};

const QA_ID_PATTERN = /^ch\d{2}_q\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 우측 컬럼 — 이 문항의 내용 전부를 탭으로 담는다.
 *
 * 🚨 학생 탭은 «읽기 → 체험 → 퀴즈» 세 걸음이다(SDD 체험 재구조화 결정 5). 🧭 체험은 전 문항에
 *    있고(결정 4), 시연(🎮)만 데이터가 있을 때 켜진다. 체험 안에 무엇이 사는지(터미널·유사
 *    페이지·견학)는 탭이 아니라 체험 탭 **안**에서 갈린다 — 강마다 탭이 출렁이지 않는다.
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
    // 🧭 체험은 **전 문항에 있다**(SDD 체험 재구조화 결정 4) — 터미널·유사 페이지가 없는
    //    문항은 견학(tour)이 곧 그 문항의 체험이다. 강마다 탭이 출렁이지 않는다.
    //    «데이터가 있는가»는 탭 유무가 아니라 체험 탭 **안의 부품**이 정한다(ExperienceTab).
    list.push('exp');
    list.push('quiz');
    // 🚨 여기가 «교사에게만»의 **유일한** 자리다. 교사 전용 탭을 이 블록 밖에서 밀어 넣으면
    //    학생 화면에 교사용 대본이 새고, 그건 화면을 열어 보기 전까지 아무도 안 알려 준다.
    //    (learnLayoutContract ⑦ 이 이 블록 밖의 explain 을 빨갛게 잡는다.)
    if (teacherPanel) {
      list.push('explain');
    }
    return list;
  }, [inlineMeta, teacherPanel]);

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

        {/*
          🧭 체험 탭 — 부품 3종(터미널형·유사 페이지형·견학형, SDD 결정 2)이 전부 이 안에 산다.
          지금(골격 재편)은 12강 실습실 문항 = 터미널, 나머지 = 견학이다. 에픽 3~5 가
          강별 배정(MAP-experience-23lessons)대로 부품을 채운다.
        */}
        {activeTab === 'exp' ? (
          chapter.id === LAB_CHAPTER_ID ? (
            <div className="flex h-full flex-col p-3 lg:p-4">
              {/* 🔑 전 문항이 같은 실습실을 이어 쓴다(SDD 결정 21) — 그래서 아래 LabTab 에는
                  지금 문항이 아니라 **대표 이름표(LAB_QA_ID)** 를 준다. 제출·진도·상태가 한 줄에 쌓인다. */}
              <p className="mb-2 flex-shrink-0 text-[12px] text-[var(--color-text-muted)]">
                💻 이 강의 문항들은 실습실 하나를 이어 써요 — 1번에서 만진 파일이 끝까지 남습니다.
                {LAB_QA_MISSION_SPANS[qaId]
                  ? ` 이 문항의 미션: ${LAB_QA_MISSION_SPANS[qaId]!.from}~${LAB_QA_MISSION_SPANS[qaId]!.to}`
                  : ''}
              </p>
              <div className="min-h-0 flex-1">
                <LabTab
                  onExit={() => setContentTab('read')}
                  onStateChange={(labState) => {
                    const at = missionIndexOf(labState);
                    const earned = earnedMissionIndex(labState);
                    setLabMissionIndex(at, earned);
                    // 🔑 교사 화면이 「실습 N/7」을 그리는 근거. 값이 달라졌을 때만 실제로 보낸다(t1).
                    // 🚨 교사가 자기 화면에서 시연할 때는 보내지 않는다 — 교사가 학생 줄에 섞인다.
                    // 🚨 보고도 대표 이름표로 — 문항별로 가르면 교사 통계가 네 줄로 흩어진다.
                    if (!teacherPanel) reportLabMission(LAB_QA_ID, at, earned);
                  }}
                  qaId={LAB_QA_ID}
                />
              </div>
            </div>
          ) : getMiniLab(chapter.id)?.qaMissionSpans[qaId] ? (
            // 터미널형 강 — 공용 미니 실습실. 강 전체가 실습실 하나를 이어 쓴다(결정 21).
            // 🔑 구간표에 없는 문항(카드가 견학 유지로 확정한 것)은 아래 견학 갈래로 내려간다.
            <MiniLabTab lab={getMiniLab(chapter.id)!} qaId={qaId} />
          ) : qaId === PHISHING_QA_ID ? (
            // 22강 q3 — 진짜/가짜 로그인 화면 판별 미니 체험 (SDD 결정 20, 부품 신설 없음)
            <PhishingCheck />
          ) : getGhScript(chapter.id) ? (
            <div className="flex flex-col">
              {/* 1단계 — 진짜 먼저 보기(짝 링크, SDD 결정 3). 견학 키트(체크포인트)는 E4-3 이 확장한다. */}
              {(() => {
                const pair = extras?.tour?.find((mission) => mission.link);
                return pair?.link ? (
                  <div className="mx-auto mt-4 flex w-full max-w-[860px] flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 lg:px-5">
                    <span className="text-[20px]">🚌</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold tracking-wide text-[var(--color-text-faint)]">
                        1단계 — 진짜 먼저 보기
                      </p>
                      <p className="truncate text-[13.5px] font-semibold text-[var(--color-text-primary)]">
                        {pair.title}
                      </p>
                    </div>
                    <a
                      className="rounded-lg bg-[var(--color-text-primary)] px-3.5 py-2 text-[12.5px] font-bold text-white"
                      href={pair.link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {pair.link.label} ↗
                    </a>
                  </div>
                ) : null;
              })()}
              {/* 2단계 — 유사 페이지에서 진행. 산출물은 계보로(실패해도 체험은 계속 — 23강이 빈 칸을 알려 준다). */}
              <GhSimTab
                onArtifact={(kind, content) => {
                  void labSaveArtifact(kind, content).then((result) => {
                    if (!result.ok) console.warn('[exp] artifact_save_failed', kind, result.failure);
                  });
                }}
                script={getGhScript(chapter.id)!}
              />
            </div>
          ) : extras?.tour?.length ? (
            <div className="flex flex-col">
              {/* 견학 키트(링크 카드 + 고르기 체크포인트) — 있는 문항에만 얹는다. 기존 견학 미션은 그대로 산다. */}
              {getTourKit(qaId) ? <TourKit kit={getTourKit(qaId)!} /> : null}
              <TourTab missions={extras.tour} qaId={qaId} />
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[720px] px-5 py-7 text-sm text-[var(--color-text-muted)]">
              이 문항의 체험은 준비 중이에요. 📖 읽기와 📝 퀴즈를 먼저 진행해 주세요.
            </div>
          )
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
