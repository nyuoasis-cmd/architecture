// 하네스 심화 트랙 — 모듈 3(기획 · 요구사항·이슈·AC) 작업대 페이지.
// 라우트: /harness/module3 (학생/교사 흐름과 분리된 프리뷰. 네임스페이스 분리 결정 반영).
// 공용 키트(_kit)의 WorkbenchFrame이 배너·스위처·앵커·이전/다음을 처리. 페이지는 AC(조각 2·3)
// 입력 상태(STEP 간 공유)를 소유하며, 마운트 시 서버(3-B)에서 이전 자동저장 값을 비동기 복원한다.
// 조회 상태는 loading/loaded/error 3단계 — 조회 실패를 "입력 없음"으로 오인해 기존 저장분을
// 빈 값 기반 자동저장으로 덮어쓸 위험을 막기 위해, 실패 시엔 입력 폼 자체를 열지 않는다.
import { useCallback, useEffect, useState } from 'react';
import { ConceptAnchor, PlaybackStepView, UnderstandingCheck, WorkbenchFrame, type NavItem } from './_kit';
import {
  ACLoadError,
  ACLoading,
  ACWriteStep,
  ANCHOR_DONE,
  ANCHOR_HEADLINE,
  ANCHOR_PHASES,
  CHECK,
  EMPTY_MODULE3_AC,
  fetchModule3Ac,
  IntroScreen,
  STEP1,
  STEP2,
  STEP3,
  TONE,
  WrapScreen,
  type Module3AC,
} from './Module3Workbench';

const NAV: NavItem[] = [
  { label: '도입', phase: '1차시 — 인터뷰 → PRD' },
  { label: 'STEP 1 · spec', phase: '1차시 — 인터뷰 → PRD' },
  { label: 'STEP 2 · PRD', phase: '1차시 — 인터뷰 → PRD' },
  { label: 'STEP 3 · 슬라이스', phase: '2차시 — 슬라이스 → AC' },
  { label: 'STEP 4 · AC', phase: '2차시 — 슬라이스 → AC' },
  { label: '이해 체크', phase: '2차시 — 정리' },
  { label: '마무리', phase: '2차시 — 정리' },
];

// idx → 개념 앵커에서 켤 phase key.
const ANCHOR_ACTIVE = ['', 'spec', 'prd', 'slice', 'ac', 'ac', 'done'];

type LoadState = 'loading' | 'loaded' | 'error';

export default function HarnessModule3Page() {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [ac, setAc] = useState<Module3AC>(EMPTY_MODULE3_AC);

  const load = useCallback(() => {
    setLoadState('loading');
    let cancelled = false;
    fetchModule3Ac().then((result) => {
      if (cancelled) return;
      if (result.status === 'error') {
        setLoadState('error');
        return;
      }
      if (result.ac) {
        setAc(result.ac);
      }
      setLoadState('loaded');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

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
        return <PlaybackStepView step={STEP3} tone={TONE} />;
      case 4:
        if (loadState === 'error') return <ACLoadError onRetry={load} />;
        if (loadState === 'loading') return <ACLoading />;
        return <ACWriteStep ac={ac} onChange={setAc} />;
      case 5:
        return <UnderstandingCheck check={CHECK} tone={TONE} />;
      default:
        return <WrapScreen ac={ac} />;
    }
  };

  return (
    <WorkbenchFrame
      tone={TONE}
      nav={NAV}
      banner={
        <>
          🧪 <strong>격리 프리뷰</strong> — 하네스 심화 트랙 · 모듈 3(기획·AC). 라이브 학습 콘텐츠와 분리된 검증용 화면입니다.
          STEP1~3은 각본형(정해진 결과 재생), STEP4 AC는 여러분이 직접 작성하며 서버(3-B 제출 슬롯)에 자동저장됩니다.
        </>
      }
      renderAnchor={renderAnchor}
      renderBody={renderBody}
    />
  );
}
