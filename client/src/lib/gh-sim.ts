/**
 * 「가짜 GitHub」의 단일 상태 기계 — 순수 리듀서 (SDD 결정 8·16, 목업 2).
 *
 * 🚨 이 파일에는 React 도 DOM 도 없다 — lab-shell 과 같은 이유(서버 테스트가 행동을 검사한다).
 * 🚨 **상태 모델은 하나다.** 저장소→파일→이슈→검사→PR→병합을 3강(배포)·16강(이슈)·22강(PR)·
 *    23강(졸업 전시)이 나눠 쓴다 — 강마다 필요한 화면만 노출하고, 기계를 복제하지 않는다.
 * 🚨 **대본형이다.** 정해진 흐름의 버튼·입력만 작동한다. 대본 밖 요소는 흐림 + 누르면 이유 설명
 *    (몰래 안 눌리는 게 아니라 «왜 안 눌리는지»를 말한다 — 목업 2 확정).
 * 🚨 화면 어딘가에 «연습용» 표지가 항상 떠 있다 — REPLAY 라벨과 같은 진실성 장치이자 사칭 방지.
 */

export type GhFile = { name: string; summary: string };
export type GhComment = { who: string; body: string };
export type GhIssue = {
  id: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  comments: GhComment[];
};
export type GhPr = {
  number: number;
  title: string;
  /** PR 본문 — 산출물 슬롯이 여기 들어온다(«내가 쓴 게 저기 올라갔다»). */
  body: string;
  state: 'open' | 'merged';
  review: { who: string; body: string; approved: boolean } | null;
  checks: 'pending' | 'pass';
};

export type GhSimState = {
  repo: string;
  files: GhFile[];
  issues: GhIssue[];
  pr: GhPr | null;
  pages: 'off' | 'building' | 'live';
  pagesUrl: string | null;
};

export type GhScreen = 'code' | 'issues' | 'pr' | 'pages';

/** 화면 탭의 표기 — 실제 GitHub 용어 그대로(실제 UX 재현 원칙). 뜻은 도슨트 자막이 생활어로 말한다. */
export const GH_SCREEN_LABELS: Record<GhScreen, string> = {
  code: 'Code',
  issues: 'Issues',
  pr: 'Pull requests',
  pages: 'Pages',
};

export type GhAction =
  /** 버튼 하나 누르기 — 대본의 다음 칸으로. */
  | { kind: 'next'; label: string }
  /**
   * 산출물 입력 — 학생이 쓴 것이 상태(이슈 본문·PR 본문)에 들어간다.
   * 🔑 `artifactKind` 가 있으면 완료 시 서버 계보에 저장하고, 있던 산출물로 미리 채운다.
   */
  | { kind: 'input'; label: string; placeholder: string; minChars: number; artifactKind?: string }
  /** Merge — 마지막 확정 버튼. 🚨 자동으로 눌리지 않는다. 학생 손이 누른다. */
  | { kind: 'merge'; label: string };

export type GhScriptStep = {
  id: string;
  /** 도슨트 자막 — 매 단계 생활어 한 문장, 항상 떠 있다 (쉬움 3원칙 2). */
  docent: string;
  /** 비유 다리에서 지금 켜지는 단계(1-based). 없으면 다리는 이전 상태 유지. */
  bridgeStage?: number;
  /** 이 단계에서 열리는 화면 탭. 나머지 탭은 흐림. */
  screen: GhScreen;
  action: GhAction;
  /** 행동이 끝났을 때의 상태 변화. input 이면 학생 글이 들어온다. */
  apply?: (state: GhSimState, input?: string) => GhSimState;
  /**
   * 계보에 저장할 내용 — 기본은 입력 그대로. 고침 단계처럼 «이전 본문 + 덧붙임»이 산출물일 때만 쓴다.
   * 🚨 부분(덧붙임)만 저장하면 23강 bundle 이 반쪽 쪽지를 꺼낸다.
   */
  artifactOf?: (state: GhSimState, input: string) => string;
};

export type GhScript = {
  /** 세션 저장 키 — 강 단위('ch22' 등). */
  scopeId: string;
  repoName: string;
  /** 비유 다리 — 읽기 탭에서 심은 생활 비유가 화면 단계와 1:1 로 이어진다 (쉬움 3원칙 1). */
  bridge: { name: string; stages: string[] };
  /** 이 체험의 새 영어 용어 — 🚨 최대 2개 (쉬움 3원칙 2, ghSimContract 가 잰다). */
  newTerms: string[];
  initial: GhSimState;
  steps: GhScriptStep[];
  /** 대본 끝 자막. */
  outro: string;
};

/**
 * 대본 진행을 상태로 되살린다 — 저장하는 것은 «몇 번째 칸 + 입력들»뿐이고, 상태는 항상
 * 여기서 다시 접는다(결정적 재생). 컴포넌트가 unmount 돼도 같은 자리로 돌아온다.
 */
export function foldGhState(script: GhScript, stepIndex: number, inputs: Record<string, string>): GhSimState {
  let state = script.initial;
  for (let i = 0; i < Math.min(stepIndex, script.steps.length); i += 1) {
    const step = script.steps[i]!;
    if (step.apply) state = step.apply(state, inputs[step.id]);
  }
  return state;
}

/** 대본 밖 요소를 눌렀을 때의 설명 — 몰래 막지 않고 이유를 말한다. */
export function outOfScriptReason(screen: GhScreen, script: GhScript, stepIndex: number): string {
  const current = script.steps[Math.min(stepIndex, script.steps.length - 1)];
  const where = current ? GH_SCREEN_LABELS[current.screen] : '';
  return `${GH_SCREEN_LABELS[screen]} 은 이 연습 흐름에서는 안 눌려요 — 지금은 ${where} 차례예요. 진짜 GitHub 에서는 언제든 눌 수 있어요.`;
}

/** 항상 떠 있는 연습용 표지 문구 — 🚨 떼지 않는다(진실성 장치). ghSimContract 가 잰다. */
export const GH_PRACTICE_BADGE = '연습용 — 진짜 GitHub 아님';
