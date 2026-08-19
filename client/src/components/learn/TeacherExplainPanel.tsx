import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Glossary, { collectMatchedTerms } from './Glossary';
import { getQaById } from '../../data/qa-stubs';
import type { TeacherExplainBlock } from '../../lib/teacher-explain-fetch';

type TeacherExplainPanelProps = {
  block: TeacherExplainBlock;
  currentQaId: string;
  sessionId?: string;
  availableQaIds?: string[];
};

type ReadingMode = 'quick' | 'full';
type TimeTone = 'before' | 'during' | 'after';
type AdvancedTab = 'advanced' | 'demoTip';

const QUICK_MODE_STORAGE_KEY = 'architecture-teacher-explain-mode';

const FLOW_CHIPS = ['1. 학습', '2. 채팅', '3. 시연', '4. 퀴즈'] as const;

function getSavedReadingMode(): ReadingMode {
  if (typeof window === 'undefined') {
    return 'full';
  }

  return window.localStorage.getItem(QUICK_MODE_STORAGE_KEY) === 'quick' ? 'quick' : 'full';
}

function ExplainCard({
  label,
  tone,
  children,
  subtle = false,
}: {
  label: string;
  tone: TimeTone;
  children: ReactNode;
  subtle?: boolean;
}) {
  return (
    <section className={`teacher-explain-card ${subtle ? 'teacher-explain-card--subtle' : ''}`}>
      <span className={`teacher-explain-card__band teacher-explain-card__band--${tone}`} aria-hidden="true" />
      <p className="teacher-explain-card__label">
        <span className={`teacher-explain-card__dot teacher-explain-card__dot--${tone}`} aria-hidden="true" />
        {label}
      </p>
      <div className="teacher-explain-card__body">{children}</div>
    </section>
  );
}

function renderText(text: string, seenTerms: Set<string>) {
  return text.split(/\n\n+/).map((paragraph, index) => {
    const paragraphSeenTerms = new Set(seenTerms);

    for (const term of collectMatchedTerms(paragraph, paragraphSeenTerms)) {
      seenTerms.add(term);
    }

    return (
      <p key={`${paragraph.slice(0, 16)}-${index}`}>
        <Glossary seenTerms={paragraphSeenTerms} text={paragraph} />
      </p>
    );
  });
}

// ── 📋 노트의 «층 3개» (2026-08-20 jery 승인) ────────────────────────────────
// 층 1 = 수업 중 30초 · 층 2 = 수업 전 3분 · 층 3 = 물어보는 학생이 있을 때만.
//
// 🚨 층이 하나도 없는 노트는 이 화면을 안 쓴다 — 아래 기존 카드 배치로 그대로 그린다.
//    «모든 노트에 층이 있다»를 강제하지 않기 때문이다(교안 계약 ⑯ 의 실패를 되풀이하지 않는다).
//    131개를 여러 PR 로 나눠 옮기는 동안, 아직 안 옮긴 노트도 계속 멀쩡히 보여야 한다.
// 🚨 여기에 «몇 분»·«다음은 무엇»·«어느 차시» 칸을 만들지 않는다 — 그건 「📋 교안」이고 철거됐다.
type LayerTab = 'live' | 'why' | 'deep';

const LAYER_TAB_LABELS: Record<LayerTab, string> = {
  live: '1 · 지금 말할 것',
  why: '2 · 왜 그런가',
  deep: '3 · 더 깊이',
};

// 🔑 «읽는 시간»이지 «수업 진행 시간»이 아니다 — 교사가 언제 읽는 물건인지를 알려 준다.
const LAYER_TAB_HINTS: Record<LayerTab, string> = {
  live: '수업 중 · 30초',
  why: '수업 전 · 3분',
  deep: '물어보는 학생이 있을 때',
};

function LayeredNote({
  block,
  seenTerms,
  relatedSlot,
}: {
  block: TeacherExplainBlock;
  seenTerms: Set<string>;
  relatedSlot: ReactNode;
}) {
  const tabs: LayerTab[] = [];
  if (block.layer1) tabs.push('live');
  if (block.layer2) tabs.push('why');
  if (block.layer3 || block.advanced || block.demoTip) tabs.push('deep');

  const [activeTab, setActiveTab] = useState<LayerTab>(tabs[0] ?? 'live');
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    setActiveTab(tabs[0] ?? 'live');
    setShowBackground(false);
  }, [block.qaId]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="teacher-layers">
      <div className="teacher-layers__tabs" role="tablist" aria-label="설명 노트 층">
        {tabs.map((tab) => (
          <button
            key={tab}
            aria-selected={activeTab === tab}
            className={`teacher-layers__tab ${activeTab === tab ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            <span className="teacher-layers__tab-label">{LAYER_TAB_LABELS[tab]}</span>
            <span className="teacher-layers__tab-hint">{LAYER_TAB_HINTS[tab]}</span>
          </button>
        ))}
      </div>

      {/* 🔑 세 층을 전부 DOM 에 두고 CSS 로 가린다 — 안 그리면 🖨️ 인쇄가 «지금 열어 둔 층» 하나만
          찍는다. 교사가 종이로 들고 가는 것은 수업 전에 읽을 층 2 인데, 그게 빠진다. */}
      {block.layer1 ? (
        <div className={`teacher-layers__panel ${activeTab === 'live' ? '' : 'is-hidden'}`}>
          <p className="teacher-layers__opening">{block.layer1.opening}</p>
          <ol className="teacher-layers__steps">
            {block.layer1.steps.map((step, index) => (
              <li key={`${step.act}-${index}`}>
                <p className="teacher-layers__act">{step.act}</p>
                <div className="teacher-layers__say">{renderText(step.say, seenTerms)}</div>
              </li>
            ))}
          </ol>
          <p className="teacher-layers__closing">{block.layer1.closing}</p>
        </div>
      ) : null}

      {block.layer2 ? (
        <div className={`teacher-layers__panel ${activeTab === 'why' ? '' : 'is-hidden'}`}>
          {block.layer2.why.map((item) => (
            <section className="teacher-layers__why" key={item.heading}>
              <h3 className="teacher-layers__why-heading">{item.heading}</h3>
              <div className="teacher-layers__why-body">{renderText(item.body, seenTerms)}</div>
            </section>
          ))}

          <section className="teacher-layers__stop">
            <p className="teacher-layers__stop-label">🚨 여기서 끊으세요</p>
            <div className="teacher-layers__stop-body">{renderText(block.layer2.stopHere, seenTerms)}</div>
          </section>

          <section className="teacher-explain-card teacher-explain-card--prompts">
            <span className="teacher-explain-card__band teacher-explain-card__band--during" aria-hidden="true" />
            <p className="teacher-explain-card__label">
              <span className="teacher-explain-card__dot teacher-explain-card__dot--during" aria-hidden="true" />
              학생이 이렇게 물어볼 겁니다
            </p>
            <ul className="teacher-explain-prompts">
              {block.prompts.map((prompt) => (
                <li key={prompt.q}>
                  <p className="teacher-explain-prompts__question">
                    <Glossary seenTerms={seenTerms} text={prompt.q} />
                  </p>
                  <div className="teacher-explain-prompts__answer">{renderText(prompt.a, seenTerms)}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* 🔑 기존 칸들은 버리지 않고 «배경»으로 접어 둔다 — 층이 이들의 승격판이라 위에서 반복되지만,
              원문이 사라지면 교사가 어디서 온 말인지 확인할 길이 없어진다. */}
          <button
            aria-expanded={showBackground}
            className="teacher-layers__more"
            onClick={() => setShowBackground((prev) => !prev)}
            type="button"
          >
            {showBackground ? '▾ 배경 접기' : '▸ 배경 — 개념·작동 방식·오개념·메모'}
          </button>
          {showBackground ? (
            <div className="teacher-layers__background">
              <ExplainCard label="이 Q&A 수업 목표" tone="before" subtle>
                {renderText(block.goal, seenTerms)}
              </ExplainCard>
              <ExplainCard label="개념 설명" tone="before">
                {renderText(block.concept, seenTerms)}
              </ExplainCard>
              <ExplainCard label="작동 방식" tone="before">
                {renderText(block.mechanism, seenTerms)}
              </ExplainCard>
              <ExplainCard label="실생활 활용 연결" tone="before">
                {renderText(block.realLife, seenTerms)}
              </ExplainCard>
              <section className="teacher-explain-card teacher-explain-card--misconception">
                <span className="teacher-explain-card__band teacher-explain-card__band--during" aria-hidden="true" />
                <p className="teacher-explain-card__label teacher-explain-card__label--misconception">
                  <span className="teacher-explain-card__warning" aria-hidden="true">
                    ⚠️
                  </span>
                  흔한 오개념 + 정정법
                </p>
                <div className="teacher-explain-card__body teacher-explain-card__body--misconception">
                  {renderText(block.misconception, seenTerms)}
                </div>
              </section>
              <ExplainCard label="교사 메모" tone="after">
                {renderText(block.note, seenTerms)}
              </ExplainCard>
            </div>
          ) : null}
        </div>
      ) : null}

      {tabs.includes('deep') ? (
        <div className={`teacher-layers__panel ${activeTab === 'deep' ? '' : 'is-hidden'}`}>
          {block.layer3 ? (
            <ExplainCard label="⚡ 이 앱에서 실제로 있었던 일" tone="after">
              {renderText(block.layer3.incidentLink, seenTerms)}
            </ExplainCard>
          ) : null}
          <AdvancedSection block={block} seenTerms={seenTerms} />
          <ExplainCard label="시연 시작 전 체크" tone="during">
            {renderText(block.beforeDemo, seenTerms)}
          </ExplainCard>
          {relatedSlot}
        </div>
      ) : null}
    </div>
  );
}

function AdvancedSection({ block, seenTerms }: { block: TeacherExplainBlock; seenTerms: Set<string> }) {
  const tabs: AdvancedTab[] = [];
  if (block.advanced) {
    tabs.push('advanced');
  }
  if (block.demoTip) {
    tabs.push('demoTip');
  }

  const [activeTab, setActiveTab] = useState<AdvancedTab>(tabs[0] ?? 'advanced');

  useEffect(() => {
    setActiveTab(tabs[0] ?? 'advanced');
  }, [block.advanced, block.demoTip]);

  if (tabs.length === 0) {
    return null;
  }

  if (tabs.length === 1 && block.advanced) {
    return (
      <ExplainCard label="작동 원리" tone="before">
        <div className="teacher-explain-card__section">
          <p className="teacher-explain-card__subheading">기술 설명</p>
          {renderText(block.advanced.technicalSpec, seenTerms)}
        </div>
        <div className="teacher-explain-card__section">
          <p className="teacher-explain-card__subheading">풀어쓴 설명</p>
          {renderText(block.advanced.friendlyExplanation, seenTerms)}
        </div>
      </ExplainCard>
    );
  }

  if (tabs.length === 1 && block.demoTip) {
    return (
      <ExplainCard label="시연 운영 팁" tone="during">
        <div className="teacher-explain-card__section">
          <p className="teacher-explain-card__subheading">시나리오 순서</p>
          {renderText(block.demoTip.scenarioOrder, seenTerms)}
        </div>
        <div className="teacher-explain-card__section">
          <p className="teacher-explain-card__subheading">학생 반응 포인트</p>
          {renderText(block.demoTip.studentReaction, seenTerms)}
        </div>
      </ExplainCard>
    );
  }

  return (
    <section className="teacher-explain-card teacher-explain-card--tabs">
      <span className="teacher-explain-card__band teacher-explain-card__band--before" aria-hidden="true" />
      <div className="teacher-explain-tabs" role="tablist" aria-label="설명 노트 보조 탭">
        <button
          aria-selected={activeTab === 'advanced'}
          className={`teacher-explain-tabs__button ${activeTab === 'advanced' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('advanced')}
          role="tab"
          type="button"
        >
          작동 원리
        </button>
        <button
          aria-selected={activeTab === 'demoTip'}
          className={`teacher-explain-tabs__button ${activeTab === 'demoTip' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('demoTip')}
          role="tab"
          type="button"
        >
          시연 운영 팁
        </button>
      </div>
      <div className="teacher-explain-tabs__panel">
        {activeTab === 'advanced' && block.advanced ? (
          <>
            <div className="teacher-explain-card__section">
              <p className="teacher-explain-card__subheading">기술 설명</p>
              {renderText(block.advanced.technicalSpec, seenTerms)}
            </div>
            <div className="teacher-explain-card__section">
              <p className="teacher-explain-card__subheading">풀어쓴 설명</p>
              {renderText(block.advanced.friendlyExplanation, seenTerms)}
            </div>
          </>
        ) : null}
        {activeTab === 'demoTip' && block.demoTip ? (
          <>
            <div className="teacher-explain-card__section">
              <p className="teacher-explain-card__subheading">시나리오 순서</p>
              {renderText(block.demoTip.scenarioOrder, seenTerms)}
            </div>
            <div className="teacher-explain-card__section">
              <p className="teacher-explain-card__subheading">학생 반응 포인트</p>
              {renderText(block.demoTip.studentReaction, seenTerms)}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default function TeacherExplainPanel({
  block,
  currentQaId,
  sessionId,
  availableQaIds = [],
}: TeacherExplainPanelProps) {
  const navigate = useNavigate();
  const [readingMode, setReadingMode] = useState<ReadingMode>(() => getSavedReadingMode());
  const seenTerms = new Set<string>();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(QUICK_MODE_STORAGE_KEY, readingMode);
  }, [readingMode]);

  const showFull = readingMode === 'full';

  // 🔑 층이 하나라도 있으면 «층 3개» 화면으로, 없으면 지금까지의 카드 배치 그대로.
  //    131개를 여러 PR 로 나눠 옮기는 동안 두 모양이 공존한다 — 아직 안 옮긴 노트도 멀쩡히 보인다.
  const hasLayers = Boolean(block.layer1 || block.layer2 || block.layer3);

  const relatedSection = (
    <section className="teacher-explain-related">
      <span className="teacher-explain-card__band teacher-explain-card__band--after" aria-hidden="true" />
      <p className="teacher-explain-card__label">
        <span className="teacher-explain-card__dot teacher-explain-card__dot--after" aria-hidden="true" />
        👉 함께 보면 좋은 Q&A
      </p>
      <div className="teacher-explain-related__chips">
        {block.relatedQas.map((qaId) => {
          const qa = getQaById(qaId);
          const isAvailable = availableQaIds.includes(qaId);

          return (
            <button
              key={qaId}
              className={`teacher-explain-related__chip ${isAvailable ? '' : 'is-disabled'}`}
              disabled={!isAvailable || !sessionId}
              onClick={() => {
                if (!sessionId || !isAvailable) {
                  return;
                }
                navigate(`/learn/${sessionId}?role=teacher&qa=${qaId}`);
              }}
              title={isAvailable ? qa?.title ?? qaId : '이 수업에 담기지 않은 문항'}
              type="button"
            >
              <span>{qa?.title ?? qaId}</span>
              <span className="teacher-explain-related__meta">{qaId}</span>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <section className="teacher-explain-print teacher-explain-panel">
      <div className="teacher-explain-panel__controls">
        {/* 🔑 층이 있으면 «훑기/정독» 토글이 필요 없다 — 층 자체가 «언제 읽는가»를 가르고 있다.
            토글이 남으면 층 1 을 정독 모드로 읽는 것 같은 이상한 조합이 생긴다. */}
        {hasLayers ? (
          <span className="teacher-explain-panel__mode-note">📋 설명 노트 · 층 3개</span>
        ) : (
          <div className="teacher-explain-panel__toggle" role="group" aria-label="설명 노트 읽기 모드">
            <button
              className={readingMode === 'quick' ? 'is-active' : ''}
              onClick={() => setReadingMode('quick')}
              type="button"
            >
              ⏱️ 1분 훑기
            </button>
            <button
              className={readingMode === 'full' ? 'is-active' : ''}
              onClick={() => setReadingMode('full')}
              type="button"
            >
              📖 3분 정독
            </button>
          </div>
        )}
        <button
          aria-label="설명 노트 인쇄"
          className="teacher-explain-panel__print"
          onClick={() => window.print()}
          type="button"
        >
          🖨️
        </button>
      </div>

      <div className="teacher-explain-panel__header">
        <div>
          <p className="teacher-explain-panel__eyebrow">{block.qaId.toUpperCase()}</p>
          <h2 className="teacher-explain-panel__title">{getQaById(currentQaId)?.title ?? currentQaId}</h2>
        </div>
        <span className="teacher-explain-panel__badge">수업 주인 전용</span>
      </div>

      <section className="teacher-explain-tldr">
        <span className="teacher-explain-tldr__icon" aria-hidden="true">
          💡
        </span>
        <p className="teacher-explain-tldr__text">{block.tldr}</p>
      </section>

      {hasLayers ? null : (
        <div className="teacher-explain-flow">
          {FLOW_CHIPS.map((label, index) => (
            <span
              key={label}
              className={`teacher-explain-flow__chip ${index === 0 ? 'is-current' : ''}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {hasLayers ? (
        <LayeredNote block={block} relatedSlot={relatedSection} seenTerms={seenTerms} />
      ) : (
        <>
        <div className="teacher-explain-grid">
          {showFull ? (
            <ExplainCard label="이 Q&A 수업 목표" tone="before" subtle>
              {renderText(block.goal, seenTerms)}
            </ExplainCard>
          ) : null}
          <ExplainCard label="교사가 먼저 해줄 말" tone="before" subtle={showFull}>
            {renderText(block.cue, seenTerms)}
          </ExplainCard>
        </div>

        {showFull ? (
          <>
            <ExplainCard label="개념 설명" tone="before">
              {renderText(block.concept, seenTerms)}
            </ExplainCard>
            <ExplainCard label="작동 방식" tone="before">
              {renderText(block.mechanism, seenTerms)}
            </ExplainCard>
            <AdvancedSection block={block} seenTerms={seenTerms} />
            <ExplainCard label="실생활 활용 연결" tone="before">
              {renderText(block.realLife, seenTerms)}
            </ExplainCard>
          </>
        ) : null}

        <section className="teacher-explain-card teacher-explain-card--prompts">
          <span className="teacher-explain-card__band teacher-explain-card__band--during" aria-hidden="true" />
          <p className="teacher-explain-card__label">
            <span className="teacher-explain-card__dot teacher-explain-card__dot--during" aria-hidden="true" />
            학생 질문 대비
          </p>
          <ul className="teacher-explain-prompts">
            {block.prompts.map((prompt) => (
              <li key={prompt.q}>
                <p className="teacher-explain-prompts__question">
                  <Glossary seenTerms={seenTerms} text={prompt.q} />
                </p>
                <div className="teacher-explain-prompts__answer">{renderText(prompt.a, seenTerms)}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="teacher-explain-card teacher-explain-card--misconception">
          <span className="teacher-explain-card__band teacher-explain-card__band--during" aria-hidden="true" />
          <p className="teacher-explain-card__label teacher-explain-card__label--misconception">
            <span className="teacher-explain-card__warning" aria-hidden="true">
              ⚠️
            </span>
            흔한 오개념 + 정정법
          </p>
          <div className="teacher-explain-card__body teacher-explain-card__body--misconception">
            {renderText(block.misconception, seenTerms)}
          </div>
        </section>

        {showFull ? (
          <>
            <ExplainCard label="시연 시작 전 체크" tone="during">
              {renderText(block.beforeDemo, seenTerms)}
            </ExplainCard>
            <ExplainCard label="교사 메모" tone="after">
              {renderText(block.note, seenTerms)}
            </ExplainCard>
            {relatedSection}
          </>
        ) : null}
        </>
      )}
    </section>
  );
}
