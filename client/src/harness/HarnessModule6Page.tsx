// 하네스 심화 트랙 — 모듈 6(종합 · 졸업) 작업대 페이지.
// 라우트: /harness/module6 (학생/교사 흐름과 분리된 프리뷰. 네임스페이스 분리 결정 반영).
// 공용 키트(_kit)의 WorkbenchFrame이 배너·스위처·앵커·이전/다음을 처리. 페이지는 졸업 스킬
// 입력 상태(STEP 간 공유)를 소유하며, 마운트 시 서버(3-B)에서 이전 제출을 비동기 조회해 복원한다.
// 조회가 끝나기 전에는 STEP3에 로딩 표시만 두어(GraduationStep 자체는 조회 완료 후에만 마운트)
// "제출 완료" 카드와 폼 내용이 어긋나는 상태가 절대 나타나지 않게 한다.
import { useEffect, useState } from 'react';
import { ConceptAnchor, PlaybackStepView, UnderstandingCheck, WorkbenchFrame, type NavItem } from './_kit';
import {
  ANCHOR_DONE,
  ANCHOR_HEADLINE,
  ANCHOR_PHASES,
  CHECK,
  EMPTY_GRADUATION,
  fetchGraduationSubmission,
  GraduationLoading,
  GraduationStep,
  IntroScreen,
  STEP1,
  STEP2,
  TONE,
  WrapScreen,
  type GraduationSkill,
  type SubmittedGraduation,
} from './Module6Workbench';

const NAV: NavItem[] = [
  { label: '도입', phase: '졸업 — 종합 → 자동화 → 졸업' },
  { label: 'STEP 1 · 한 바퀴', phase: '졸업 — 종합 → 자동화 → 졸업' },
  { label: 'STEP 2 · 자동화', phase: '졸업 — 종합 → 자동화 → 졸업' },
  { label: 'STEP 3 · 졸업', phase: '졸업 — 종합 → 자동화 → 졸업' },
  { label: '이해 체크', phase: '졸업 — 정리' },
  { label: '마무리', phase: '졸업 — 정리' },
];

// idx → 개념 앵커에서 켤 phase key.
const ANCHOR_ACTIVE = ['', 'cycle', 'automate', 'graduate', 'graduate', 'done'];

export default function HarnessModule6Page() {
  const [loaded, setLoaded] = useState(false);
  const [skill, setSkill] = useState<GraduationSkill>(EMPTY_GRADUATION);
  const [initialSubmission, setInitialSubmission] = useState<SubmittedGraduation | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGraduationSubmission().then((submission) => {
      if (cancelled) return;
      if (submission) {
        setSkill(submission.skill);
        setInitialSubmission(submission);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        return <PlaybackStepView step={STEP2} tone={TONE} />;
      case 3:
        return loaded ? (
          <GraduationStep skill={skill} onChange={setSkill} initialSubmission={initialSubmission} />
        ) : (
          <GraduationLoading />
        );
      case 4:
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
          🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 6(종합·졸업). 라이브 학습 콘텐츠와 분리된 검증용 화면입니다.
          STEP1~2는 각본형, STEP3 졸업 제출은 서버(3-B 제출 슬롯)에 저장됩니다.
        </>
      }
      renderAnchor={renderAnchor}
      renderBody={renderBody}
    />
  );
}
