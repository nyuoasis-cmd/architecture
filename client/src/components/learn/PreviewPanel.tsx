import { useEffect, useRef, useState } from 'react';
import { QrCode } from 'lucide-react';
import QrFullscreen from '../common/QrFullscreen';
import type { DemoMeta } from '../../data/demos';
import { getDemoComponent } from '../../demos/registry';
import { DEMO_LAYOUT_MAX_WIDTH } from '../../demos/types';
import { useLearnStore } from '../../store/learn-store';
import QuizTab from './QuizTab';

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
};

export default function PreviewPanel({
  demo,
  qaId,
  scenarioId,
  onScenarioChange,
  initialTab = 'demo',
  quizProps,
  sessionCode,
}: PreviewPanelProps) {
  const inlineHostRef = useRef<HTMLDivElement>(null);
  const previewTab = useLearnStore((state) => state.previewTab);
  const setPreviewTab = useLearnStore((state) => state.setPreviewTab);
  const [isQrOpen, setIsQrOpen] = useState(false);

  useEffect(() => {
    setPreviewTab(initialTab);
  }, [initialTab, setPreviewTab]);

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

  return (
    <section className="flex h-full flex-1 flex-col bg-[var(--color-surface-alt)]">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-2">
        <div className="flex items-center gap-1">
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
              QR코드
            </button>
          ) : null}
          <span className="flex items-center gap-1" style={{ visibility: isDemo ? 'visible' : 'hidden' }}>
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

      {isDemo ? (
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
