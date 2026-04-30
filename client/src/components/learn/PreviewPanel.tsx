import { useEffect, useRef } from 'react';
import type { DemoMeta } from '../../data/demos';
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
};

export default function PreviewPanel({
  demo,
  qaId,
  scenarioId,
  onScenarioChange,
  initialTab = 'demo',
  quizProps,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewTab = useLearnStore((state) => state.previewTab);
  const setPreviewTab = useLearnStore((state) => state.setPreviewTab);

  useEffect(() => {
    setPreviewTab(initialTab);
  }, [initialTab, setPreviewTab]);

  const isDemo = previewTab === 'demo';

  const handleScenarioHash = (nextScenarioId: string) => {
    const iframe = iframeRef.current;
    if (iframe && demo) {
      // sandbox iframe은 cross-origin location.hash 쓰기를 차단하므로
      // src 자체를 #scenario 으로 재할당하여 시나리오를 바꾼다.
      iframe.src = `${demo.url}#${nextScenarioId}`;
    }
    onScenarioChange(nextScenarioId);
  };

  const handleReload = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const currentSrc = iframe.src || (demo ? `${demo.url}#${scenarioId}` : '');
    if (!currentSrc) {
      return;
    }

    iframe.src = 'about:blank';
    requestAnimationFrame(() => {
      if (iframeRef.current) {
        iframeRef.current.src = currentSrc;
      }
    });
  };

  const handleFullscreen = async () => {
    const host = iframeRef.current?.closest('.phone-frame');
    if (host instanceof HTMLElement && host.requestFullscreen) {
      try {
        await host.requestFullscreen();
      } catch {
        return;
      }
    }
  };

  return (
    <section className="flex h-full flex-1 flex-col bg-[var(--color-surface-alt)]">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            className="rounded-md px-3 py-1 text-xs font-medium"
            onClick={() => setPreviewTab('demo')}
            style={{
              background: isDemo ? 'var(--color-surface-hover)' : 'transparent',
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
              background: isDemo ? 'transparent' : 'var(--color-surface-hover)',
              color: isDemo ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            }}
            type="button"
          >
            퀴즈
          </button>
        </div>

        <div className="flex items-center gap-1" style={{ visibility: isDemo ? 'visible' : 'hidden' }}>
          <button className="toolbar-btn" onClick={handleReload} title="처음 상태로" type="button">
            ↺
          </button>
          <button className="toolbar-btn" onClick={handleFullscreen} title="전체화면" type="button">
            ⛶
          </button>
        </div>
      </div>

      {isDemo ? (
        <div className="flex flex-1 flex-col items-center justify-center overflow-auto p-6 lg:p-8">
          {demo ? (
            <>
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <iframe
                    key={demo.qaId}
                    ref={iframeRef}
                    sandbox="allow-scripts"
                    src={`${demo.url}#${scenarioId}`}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    title={demo.title}
                  />
                </div>
              </div>
              <div className="preview-scenario-dots" aria-label="시연 시나리오 선택">
                {demo.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    aria-label={scenario.label}
                    className={`preview-scenario-dot ${scenarioId === scenario.id ? 'is-active' : ''}`}
                    onClick={() => handleScenarioHash(scenario.id)}
                    type="button"
                  />
                ))}
              </div>
              <p className="mt-4 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                ▶ <strong>{demo.scenarios.find((scenario) => scenario.id === scenarioId)?.label}</strong> —{' '}
                {demo.description}
              </p>
            </>
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
