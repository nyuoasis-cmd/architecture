import { useEffect, useRef, useState } from 'react';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QrFullscreen from '../common/QrFullscreen';
import type { DemoMeta } from '../../data/demos';
import { getDemoComponent } from '../../demos/registry';
import { DEMO_LAYOUT_MAX_WIDTH } from '../../demos/types';
import { getTeacherExplain, TeacherExplainClientError, type TeacherExplainBlock } from '../../lib/teacher-explain-fetch';
import { useLearnStore } from '../../store/learn-store';
import QuizTab from './QuizTab';
import TeacherExplainPanel from './TeacherExplainPanel';

type PreviewPanelProps = {
  demo?: DemoMeta;
  qaId: string;
  scenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  initialTab?: 'demo' | 'quiz';
  quizProps?: {
    onScore?: (score: number) => void;
  };
  sessionCode?: string;
  teacherPanel?: boolean;
  sessionId?: string;
  availableQaIds?: string[];
};

const QA_ID_PATTERN = /^ch(0[1-9]|10)_q(0[1-9]|10)$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function PreviewPanel({
  demo,
  qaId,
  scenarioId,
  onScenarioChange,
  initialTab = 'demo',
  quizProps,
  sessionCode,
  teacherPanel = false,
  sessionId,
  availableQaIds = [],
}: PreviewPanelProps) {
  const inlineHostRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const previewTab = useLearnStore((state) => state.previewTab);
  const setPreviewTab = useLearnStore((state) => state.setPreviewTab);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [teacherExplain, setTeacherExplain] = useState<TeacherExplainBlock | null>(null);
  const [teacherExplainStatus, setTeacherExplainStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [teacherExplainMessage, setTeacherExplainMessage] = useState<string | null>(null);

  useEffect(() => {
    setPreviewTab(initialTab);
  }, [initialTab, setPreviewTab]);

  useEffect(() => {
    if (!teacherPanel && previewTab === 'explain') {
      setPreviewTab('demo');
    }
  }, [previewTab, setPreviewTab, teacherPanel]);

  useEffect(() => {
    if (previewTab !== 'explain') {
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
      setTeacherExplainMessage('세션 정보 없음');
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
            setTeacherExplainMessage('이 Q&A는 현재 세션에 포함되어 있지 않아요');
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
  }, [navigate, previewTab, qaId, sessionId, teacherPanel]);

  const isDemo = previewTab === 'demo';
  const inlineMeta = qaId ? getDemoComponent(qaId) : undefined;

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
  const showToolbar = isDemo;

  return (
    <section className="flex h-full flex-1 flex-col bg-[var(--color-surface-alt)]">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-2">
        <div className="flex min-w-0 items-center gap-1">
          <button
            className="rounded-md px-3 py-1 text-xs font-medium"
            onClick={() => setPreviewTab('demo')}
            style={{
              background: isDemo ? '#f5f5f4' : 'transparent',
              color: isDemo ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
            type="button"
          >
            시연
          </button>
          <button
            className="rounded-md px-3 py-1 text-xs font-medium"
            onClick={() => setPreviewTab('quiz')}
            style={{
              background: isDemo ? 'transparent' : '#f5f5f4',
              color: isDemo ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            }}
            type="button"
          >
            퀴즈
          </button>
          {teacherPanel ? (
            <button
              className="rounded-md px-3 py-1 text-xs font-medium"
              onClick={() => setPreviewTab('explain')}
              style={{
                background: previewTab === 'explain' ? '#f5f5f4' : 'transparent',
                color: previewTab === 'explain' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}
              type="button"
            >
              <span className="sm:hidden">📝 설명</span>
              <span className="hidden sm:inline">📝 설명 노트</span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
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
          <span className="flex items-center gap-1" style={{ visibility: showToolbar ? 'visible' : 'hidden' }}>
            <button className="toolbar-btn" onClick={handleReload} title="처음 상태로" type="button">
              ↺
            </button>
            <button className="toolbar-btn" onClick={handleFullscreen} title="전체화면" type="button">
              ⛶
            </button>
          </span>
        </div>
      </div>

      {isQrOpen && sessionCode ? <QrFullscreen code={sessionCode} onClose={() => setIsQrOpen(false)} /> : null}

      {previewTab === 'explain' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-8">
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
      ) : isDemo ? (
        <div className="flex flex-1 flex-col overflow-auto px-4 py-6 lg:px-8">
          {demo && InlineComponent ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-col sm:gap-0">
              <div ref={inlineHostRef} className={`mx-auto w-full ${inlineMaxWidth}`}>
                <InlineComponent key={`${qaId}:${scenarioId}`} scenarioId={scenarioId} />
              </div>
              <ScenarioPicker
                demo={demo}
                scenarioId={scenarioId}
                onChange={handleScenarioHash}
                description={demo.description}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-center text-sm">
              이 문항의 시연은 콘텐츠 PR에서 연결됩니다.
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <QuizTab onScore={quizProps?.onScore} qaId={qaId} />
        </div>
      )}
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
        className="flex flex-wrap gap-1.5 rounded-full border bg-white p-1"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="시연 시나리오 선택"
        role="tablist"
      >
        {demo.scenarios.map((scenario) => {
          const active = scenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium transition"
              onClick={() => onChange(scenario.id)}
              style={{
                background: active ? 'var(--color-text-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--color-text-muted)',
              }}
              role="tab"
              aria-selected={active}
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
