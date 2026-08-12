import { create } from 'zustand';

/**
 * 학습 화면 상태.
 *
 * 🚨 화면은 **한 종류뿐이다**(2026-08-11, 에픽 2/6). 예전에는 «이 장에 extras 가 있는가»로
 *    3컬럼 ↔ 5탭 두 형판을 갈랐는데, 견학이 107/107 전 문항에 붙으면서 조건이 17/17 장을
 *    참으로 만들어 **3컬럼이 도달 불가 죽은 코드**가 됐다. 좌측 문항 목록과 챗봇 컬럼이
 *    통째로 안 그려졌고, 아무도 안 알려 줬다. 형판 분기를 지운 이유다 — 조건이 데이터를
 *    따라 조용히 뒤집히는 자리를 없앤다.
 */

/** 모바일에서 세 컬럼이 접히는 자리. PC(lg 이상)에서는 셋 다 동시에 보인다. */
export type MobileTab = 'nav' | 'chat' | 'content';

/**
 * 우측 콘텐츠 컬럼의 탭. 데이터가 있을 때만 켜진다(견학·내 차례·시연).
 * 🚨 `explain`(📋 설명 노트)은 **교사 전용**이다 — 학생 화면에서는 배열에 들어가지 않는다
 *    (ContentPanel 의 `if (teacherPanel)` 한 곳). 여기 열거돼 있다는 것은 «그런 탭이 있다»는
 *    뜻일 뿐, «누구에게 보인다»는 뜻이 아니다.
 */
export type ContentTab = 'read' | 'demo' | 'tour' | 'myturn' | 'quiz' | 'explain';

type LearnStoreState = {
  currentQaId: string;
  scenarioId: string;
  mobileTab: MobileTab;
  contentTab: ContentTab;
  setCurrentQaId: (qaId: string) => void;
  setScenarioId: (scenarioId: string) => void;
  setMobileTab: (mobileTab: MobileTab) => void;
  setContentTab: (contentTab: ContentTab) => void;
  resetForQa: (qaId: string, scenarioId: string) => void;
};

export const useLearnStore = create<LearnStoreState>((set) => ({
  currentQaId: 'ch06_q03',
  scenarioId: 'launch',
  // 🔑 모바일 기본은 «콘텐츠» — 학생이 들어오면 바로 읽을 것이 보여야 한다.
  //    문항 목록이 먼저 뜨면 «고르는 화면»으로 읽혀 한 번 더 눌러야 시작된다.
  mobileTab: 'content',
  contentTab: 'read',
  setCurrentQaId: (currentQaId) => set({ currentQaId }),
  setScenarioId: (scenarioId) => set({ scenarioId }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  setContentTab: (contentTab) => set({ contentTab }),
  // 🔑 문항을 바꿔도 **탭 상태는 유지한다**(읽기 → 읽기). 매번 첫 탭으로 튕기면
  //    «견학만 몰아서 보는» 동선이 끊긴다. 새 문항에 그 탭이 없으면 ContentPanel 이 접는다.
  resetForQa: (currentQaId, scenarioId) => set({ currentQaId, scenarioId }),
}));
