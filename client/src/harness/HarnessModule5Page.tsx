// 하네스 심화 트랙 — 모듈 5(커밋 · PR · 보안) 작업대 페이지.
// 라우트: /harness/module5 (학생/교사 흐름과 분리된 프리뷰. 네임스페이스 분리 결정 반영).
// 공용 키트(_kit)의 WorkbenchFrame이 배너·스위처·앵커·이전/다음을 처리. 페이지는 커밋 이름표 선택 +
// 보안 등급 분류 상태(STEP 간 공유는 아니지만 결과 카드 표시용)만 소유한다.
import { useState } from 'react';
import { ConceptAnchor, PlaybackStepView, UnderstandingCheck, WorkbenchFrame, type NavItem } from './_kit';
import {
  ANCHOR_DONE,
  ANCHOR_HEADLINE,
  ANCHOR_PHASES,
  CHECK,
  CommitTagStep,
  IntroScreen,
  SecurityGradeStep,
  STEP2,
  STEP3,
  TONE,
  WrapScreen,
  type SecurityWarning,
} from './Module5Workbench';

const NAV: NavItem[] = [
  { label: '도입', phase: '1차시 — 커밋 → PR·머지 → 보안' },
  { label: 'STEP 1 · 이름표', phase: '1차시 — 커밋 → PR·머지 → 보안' },
  { label: 'STEP 2 · 차단', phase: '1차시 — 커밋 → PR·머지 → 보안' },
  { label: 'STEP 3 · PR', phase: '1차시 — 커밋 → PR·머지 → 보안' },
  { label: 'STEP 4 · 보안', phase: '1차시 — 커밋 → PR·머지 → 보안' },
  { label: '이해 체크', phase: '1차시 — 정리' },
  { label: '마무리', phase: '1차시 — 정리' },
];

// idx → 개념 앵커에서 켤 phase key.
const ANCHOR_ACTIVE = ['', 'commit', 'commit', 'pr', 'security', 'security', 'done'];

export default function HarnessModule5Page() {
  const [commitTag, setCommitTag] = useState<string | null>(null);
  const [securityAnswers, setSecurityAnswers] = useState<Record<string, SecurityWarning['correct']>>({});

  const renderAnchor = (idx: number) => (
    <ConceptAnchor phases={ANCHOR_PHASES} active={ANCHOR_ACTIVE[idx]} headline={ANCHOR_HEADLINE} doneNote={ANCHOR_DONE} tone={TONE} />
  );

  const renderBody = (idx: number) => {
    switch (idx) {
      case 0:
        return <IntroScreen />;
      case 1:
        return <CommitTagStep picked={commitTag} onPick={setCommitTag} />;
      case 2:
        return <PlaybackStepView step={STEP2} tone={TONE} />;
      case 3:
        return <PlaybackStepView step={STEP3} tone={TONE} />;
      case 4:
        return (
          <SecurityGradeStep
            answers={securityAnswers}
            onAnswer={(id, grade) => setSecurityAnswers((prev) => ({ ...prev, [id]: grade }))}
          />
        );
      case 5:
        return <UnderstandingCheck check={CHECK} tone={TONE} />;
      default:
        return <WrapScreen />;
    }
  };

  return (
    <WorkbenchFrame
      tone={TONE}
      nav={NAV}
      banner={
        <>
          🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 5(커밋·PR·보안). 라이브 학습 콘텐츠와 분리된 검증용 화면입니다.
          각본형(정해진 결과 재생)이라 실제 AI를 호출하지 않습니다.
        </>
      }
      renderAnchor={renderAnchor}
      renderBody={renderBody}
    />
  );
}
