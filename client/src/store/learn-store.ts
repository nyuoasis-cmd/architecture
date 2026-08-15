import { create } from 'zustand';
import type { LabEvent, LabState } from '../lib/lab-shell';

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
export type ContentTab = 'read' | 'demo' | 'tour' | 'myturn' | 'lab' | 'quiz' | 'explain';

/**
 * 🚨 실습 탭에서만 챗봇 칸을 접는다 — 학생이 묻는 일이 **터미널 안으로** 옮겨가기 때문이다
 *    (2026-08-15 jery: 「터미널에도 AI가 있는데 왜 읽기 탭 챗봇에 물어봐야 해」).
 * 🔑 여기 한 줄이 «가운데 칸이 접히는» 유일한 조건이다. 조건을 늘리면 나머지 문항에서도
 *    챗봇이 조용히 사라진다 — 그러면 학생이 막혔을 때 물어볼 통로가 없어진다.
 * 🚨 이 판정을 **`extras` 유무에 매달지 말 것.** 데이터가 화면 골격을 가르는 것이 2026-08-11
 *    사고의 형태였다(3컬럼이 몇 주 동안 죽은 코드였다). 판정 기준은 «지금 열린 탭» 하나다.
 */
export function tabHidesChat(contentTab: ContentTab): boolean {
  return contentTab === 'lab';
}

type LearnStoreState = {
  currentQaId: string;
  scenarioId: string;
  mobileTab: MobileTab;
  contentTab: ContentTab;
  /** 🧪 실습에서 지금 몇 번째 미션인가(0-based). 좌측 목차가 이것을 읽어 진도를 세운다. */
  labMissionIndex: number;
  /** 🚨 «스스로» 도달한 자리. 건너뛰기(jump)를 «끝»으로 세지 않으려고 따로 둔다. */
  labEarnedIndex: number;
  /**
   * 🚨 실습실의 작업 전체. **화면 밖에 둔다.**
   *    예전에는 `LabTab` 컴포넌트 안에 있었는데, 우측 탭이 조건부 렌더라 학생이 📖 읽기 탭에
   *    한 번만 들렀다 와도 컴포넌트가 unmount 되면서 **규칙·터미널 기록·AI 결과가 통째로 사라졌다**
   *    (2026-08-15 Codex 리뷰). 90분짜리 작업이 탭 한 번에 날아가는 자리였다.
   * 🔑 문항이 바뀌면 통째로 버린다(`qaId` 로 판별) — 다른 문항의 출력이 섞이면 안 된다.
   */
  labSession: { qaId: string; state: LabState; lines: LabEvent[]; history: string[] } | null;
  setCurrentQaId: (qaId: string) => void;
  setScenarioId: (scenarioId: string) => void;
  setMobileTab: (mobileTab: MobileTab) => void;
  setContentTab: (contentTab: ContentTab) => void;
  setLabMissionIndex: (labMissionIndex: number, labEarnedIndex: number) => void;
  setLabSession: (labSession: { qaId: string; state: LabState; lines: LabEvent[]; history: string[] } | null) => void;
  resetForQa: (qaId: string, scenarioId: string) => void;
};

export const useLearnStore = create<LearnStoreState>((set) => ({
  currentQaId: 'ch06_q03',
  scenarioId: 'launch',
  // 🔑 모바일 기본은 «콘텐츠» — 학생이 들어오면 바로 읽을 것이 보여야 한다.
  //    문항 목록이 먼저 뜨면 «고르는 화면»으로 읽혀 한 번 더 눌러야 시작된다.
  mobileTab: 'content',
  contentTab: 'read',
  labMissionIndex: 0,
  labEarnedIndex: 0,
  labSession: null,
  setCurrentQaId: (currentQaId) => set({ currentQaId }),
  setScenarioId: (scenarioId) => set({ scenarioId }),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  setContentTab: (contentTab) => set({ contentTab }),
  setLabMissionIndex: (labMissionIndex, labEarnedIndex) => set({ labMissionIndex, labEarnedIndex }),
  setLabSession: (labSession) => set({ labSession }),
  // 🔑 문항을 바꿔도 **탭 상태는 유지한다**(읽기 → 읽기). 매번 첫 탭으로 튕기면
  //    «견학만 몰아서 보는» 동선이 끊긴다. 새 문항에 그 탭이 없으면 ContentPanel 이 접는다.
  resetForQa: (currentQaId, scenarioId) => set({ currentQaId, scenarioId }),
}));
