// 하네스 심화 트랙 — 모듈 1(왜 하네스인가 · CLAUDE.md) 작업대 페이지.
// 라우트: /harness/module1 (학생/교사 흐름과 분리된 프리뷰. 네임스페이스 분리 결정 반영).
// 공용 키트(_kit)의 WorkbenchFrame이 배너·스위처·앵커·이전/다음을 처리. 페이지는 규칙 선택
// 상태(STEP 간 공유)만 소유한다.
import { useState } from 'react';
import { ConceptAnchor, PlaybackStepView, UnderstandingCheck, WorkbenchFrame, type NavItem } from './_kit';
import {
  ANCHOR_DONE,
  ANCHOR_HEADLINE,
  ANCHOR_PHASES,
  CHECK,
  ConfirmStep,
  EMPTY_RULES,
  IntroScreen,
  type Module1Rules,
  RulePicker,
  STEP1,
  TONE,
  WrapScreen,
} from './Module1Workbench';

const NAV: NavItem[] = [
  { label: '도입', phase: '1차시 — 왜 CLAUDE.md?' },
  { label: 'STEP 1 · 관찰', phase: '1차시 — 규칙 없음 → 규칙 → 확인' },
  { label: 'STEP 2 · 규칙', phase: '1차시 — 규칙 없음 → 규칙 → 확인' },
  { label: 'STEP 3 · 확인', phase: '1차시 — 규칙 없음 → 규칙 → 확인' },
  { label: '이해 체크', phase: '1차시 — 정리' },
  { label: '마무리', phase: '1차시 — 정리' },
];

// idx → 개념 앵커에서 켤 phase key.
const ANCHOR_ACTIVE = ['', 'observe', 'rule', 'confirm', 'confirm', 'done'];

export default function HarnessModule1Page() {
  const [rules, setRules] = useState<Module1Rules>(EMPTY_RULES);

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
        return <RulePicker value={rules} onChange={setRules} />;
      case 3:
        return <ConfirmStep rules={rules} />;
      case 4:
        return <UnderstandingCheck check={CHECK} tone={TONE} />;
      default:
        return <WrapScreen rules={rules} />;
    }
  };

  return (
    <WorkbenchFrame
      tone={TONE}
      nav={NAV}
      banner={
        <>
          🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 1(왜 하네스인가 · CLAUDE.md). 라이브 학습 콘텐츠와 분리된 검증용
          화면입니다. 각본형(정해진 결과 재생)이라 실제 AI를 호출하지 않습니다.
        </>
      }
      renderAnchor={renderAnchor}
      renderBody={renderBody}
    />
  );
}
