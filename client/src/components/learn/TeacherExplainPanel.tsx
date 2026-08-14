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

  return (
    <section className="teacher-explain-print teacher-explain-panel">
      <div className="teacher-explain-panel__controls">
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
        </>
      ) : null}
    </section>
  );
}
