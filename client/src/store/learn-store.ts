import { create } from 'zustand';
import type { LabEvent, LabState } from '../lib/lab-shell';

/**
 * 학습 화면 상태.
 *
 * 🚨 화면은 **한 종류뿐이다**(2026-08-11, 에픽 2/6). 예전에는 «이 장에 extras 가 있는가»로
 *    두 형판을 갈랐는데, 견학이 107/107 전 문항에 붙으면서 조건이 17/17 장을 참으로 만들어
 *    **한쪽 형판이 도달 불가 죽은 코드**가 됐다. 좌측 문항 목록 컬럼이 통째로 안 그려졌고,
 *    아무도 안 알려 줬다. 형판 분기를 지운 이유다 — 조건이 데이터를 따라 조용히 뒤집히는
 *    자리를 없앤다.
 * 🔑 2026-08-17 체험 재구조화: 좌측 AI 챗봇 컬럼을 철거해 2컬럼(문항 목록 · 콘텐츠)이 됐다.
 *    AI 보조는 체험(터미널의 ai▸ 목소리) 안에 산다. «화면은 한 종류»는 그대로다.
 */

/** 모바일에서 두 컬럼이 접히는 자리. PC(lg 이상)에서는 둘 다 동시에 보인다. */
export type MobileTab = 'nav' | 'content';

/**
 * 우측 콘텐츠 컬럼의 탭 — 학생은 «읽기 → 체험 → 퀴즈» 세 걸음이다(SDD 체험 재구조화 결정 5).
 * 🚨 `exp`(🧭 체험)는 **전 문항에 있다**(결정 4) — 견학·터미널·유사 페이지가 전부 이 탭 하나로
 *    들어온다. 강마다 탭이 출렁이지 않는다.
 * 🚨 `explain`(📋 설명 노트)은 **교사 전용**이다 — 학생 화면에서는 배열에 들어가지 않는다
 *    (ContentPanel 의 `if (teacherPanel)` 한 곳). 여기 열거돼 있다는 것은 «그런 탭이 있다»는
 *    뜻일 뿐, «누구에게 보인다»는 뜻이 아니다.
 * 🚨 철거된 탭을 여기 되살리지 말 것(2026-08-17 체험 재구조화): `tour`(체험으로 흡수) ·
 *    `myturn`(체험 안 미션으로 흡수) · `lab`(체험 본체가 됨) · `labclass`(수업 현황으로 이관) ·
 *    좌측 AI 챗봇 컬럼(AI 보조는 체험 안에 산다). learnLayoutContract 가 잡는다.
 */
export type ContentTab = 'read' | 'demo' | 'exp' | 'quiz' | 'explain';

type LabSession = { qaId: string; state: LabState; lines: LabEvent[]; history: string[] };
type LabSessionUpdate = LabSession | null | ((current: LabSession | null) => LabSession | null);

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
  setLabSession: (update: LabSessionUpdate) => void;
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
  setLabSession: (update) =>
    set((store) => ({ labSession: typeof update === 'function' ? update(store.labSession) : update })),
  // 🔑 문항을 바꿔도 **탭 상태는 유지한다**(읽기 → 읽기). 매번 첫 탭으로 튕기면
  //    «견학만 몰아서 보는» 동선이 끊긴다. 새 문항에 그 탭이 없으면 ContentPanel 이 접는다.
  resetForQa: (currentQaId, scenarioId) => set({ currentQaId, scenarioId }),
}));
