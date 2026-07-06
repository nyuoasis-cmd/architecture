// 하네스 심화 트랙 — 모듈 2(나만의 스킬 · /init) 작업대 페이지.
// 라우트: /harness/module2 (학생/교사 흐름과 분리된 프리뷰. 네임스페이스 분리 결정 반영).
// 공용 키트(_kit)의 WorkbenchFrame이 배너·스위처·앵커·이전/다음을 처리. 페이지는 스킬 초안
// 상태(STEP 간 공유)만 소유한다.
import { useState } from 'react';
import { ConceptAnchor, PlaybackStepView, UnderstandingCheck, WorkbenchFrame, type NavItem } from './_kit';
import {
  ANCHOR_DONE,
  ANCHOR_HEADLINE,
  ANCHOR_PHASES,
  CHECK,
  EMPTY_DRAFT,
  IntroScreen,
  SkillDraftForm,
  SkillRunStep,
  STEP1,
  TONE,
  WrapScreen,
  type SkillDraft,
} from './Module2Workbench';

const NAV: NavItem[] = [
  { label: '도입', phase: '2차시 — /init 관찰 → 스킬 초안 → 확인' },
  { label: 'STEP 1 · /init', phase: '2차시 — /init 관찰 → 스킬 초안 → 확인' },
  { label: 'STEP 2 · 초안', phase: '2차시 — /init 관찰 → 스킬 초안 → 확인' },
  { label: 'STEP 3 · 확인', phase: '2차시 — /init 관찰 → 스킬 초안 → 확인' },
  { label: '이해 체크', phase: '2차시 — 정리' },
  { label: '마무리', phase: '2차시 — 정리' },
];

// idx → 개념 앵커에서 켤 phase key.
const ANCHOR_ACTIVE = ['', 'init', 'draft', 'confirm', 'confirm', 'done'];

export default function HarnessModule2Page() {
  const [draft, setDraft] = useState<SkillDraft>(EMPTY_DRAFT);

  const renderAnchor = (idx: number) => (
    <ConceptAnchor phases={ANCHOR_PHASES} active={ANCHOR_ACTIVE[idx]} headline={ANCHOR_HEADLINE} doneNote={ANCHOR_DONE} tone={TONE} />
  );

  const renderBody = (idx: number) => {
    switch (idx) {
      case 0:
        return <IntroScreen />;
      case 1:
        return <PlaybackStepView step={STEP1} tone={TONE} />;
      case 2:
        return <SkillDraftForm value={draft} onChange={setDraft} />;
      case 3:
        return <SkillRunStep draft={draft} />;
      case 4:
        return <UnderstandingCheck check={CHECK} tone={TONE} />;
      default:
        return <WrapScreen draft={draft} />;
    }
  };

  return (
    <WorkbenchFrame
      tone={TONE}
      nav={NAV}
      banner={
        <>
          🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 2(나만의 스킬·/init). 라이브 학습 콘텐츠와 분리된 검증용
          화면입니다. 각본형(정해진 결과 재생)이라 실제 AI를 호출하지 않습니다.
        </>
      }
      renderAnchor={renderAnchor}
      renderBody={renderBody}
    />
  );
}
