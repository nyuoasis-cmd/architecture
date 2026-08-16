/**
 * 「가짜 터미널 실습실」의 셸 — 순수 리듀서.
 *
 * 🚨 이 파일에는 React 도 DOM 도 없다. 그래야 서버 테스트가 그대로 불러 **행동을 검사**할 수 있고,
 *    훗날 진짜 런타임으로 갈아끼울 때 **여기 한 자리만** 바꾸면 된다(§5 골격 1).
 *    19강(테스트 직접 작성)·22강(진짜 git 훅)이 그날의 이유다 — 12강이 아니다.
 *
 * 🚨 `run(command) -> output` 이 아니라 `execute(command, state, key) -> {events, nextState}` 인 이유:
 *    좁은 서명은 현재 경로·연 파일·미션 진행을 표현하지 못한다(Codex 지적). 상태를 밖에서 들고 돈다.
 *
 * 🚨 **꾸며낸 대사를 만들지 않는다**(§5 골격 2). 모르는 명령에는 지금 상태에 맞는 오류와 `help` 를 준다.
 *    아직 안 만든 명령은 «모른다»가 아니라 **«아직 안 열렸다»**로 갈라 답한다 — 둘은 학생이 할 일이 다르다.
 */

import { LAB_VERSION, checkAll, passCount } from './lab-checker';
import {
  LAB_ABOUT,
  LAB_HOME_LABEL,
  LAB_MISSIONS,
  LAB_RUN_FILES,
  LAB_TREE,
  type LabFileNode,
} from '../data/vibe-lab-ch18';

export type LabTone = 'input' | 'plain' | 'dim' | 'ok' | 'bad' | 'warn';

export type LabEvent =
  | { kind: 'line'; text: string; tone: LabTone }
  | { kind: 'clear' }
  | { kind: 'exit' }
  /** 옆 패널 편집기를 연다. 🚨 터미널 안에서 nano·heredoc 을 흉내 내지 않는다 — 태블릿엔 Ctrl·Esc 가 없다. */
  | { kind: 'editor' }
  /** 🚨 셸은 순수 함수라 AI 를 못 부른다. **의도만** 내보내고 화면이 부른다. */
  | { kind: 'ai'; mode: 'review' | 'verify' | 'ask'; text: string }
  /** 🚨 제출. 판정은 **서버가 저장된 본문으로** 낸다 — 화면이 판정해서 보내지 않는다. */
  | { kind: 'submit'; rules: string };

/** 화면 쪽이 재어서 넣어 주는 값. 셸은 재지 않는다(순수해야 하므로). */
export type LabEnv = {
  widthPx: number;
  /** 붙여넣기 API 를 쓸 수 있는가. 태블릿·구형 브라우저에서 막힌다. */
  canPaste: boolean;
};

export type LabState = {
  /** 루트(`~/pricing`)부터의 경로 조각. 빈 배열이면 홈. */
  cwd: string[];
  /** `cat` 으로 연 파일(루트 기준 경로). 미션 2 판정에 쓴다. */
  openedFiles: string[];
  /** 실행한 명령 이름. 미션 1 판정에 쓴다. */
  ranCommands: string[];
  /** 고지를 한 번이라도 봤는가. */
  seenAbout: boolean;
  /** 학생이 편집기에 쓴 규칙 문서. 🔑 비어 있으면 아직 «재생 3종»을 검사한다. */
  rules: string;
  /** 내 규칙대로 시켜서 받은 결과. 있으면 `npm test` 가 이것을 검사한다. */
  myOutputs: string[];
  /**
   * 🚨 AI 비평을 **실제로 받았는가**. 명령을 쳤는가가 아니다 —
   *    예전에는 `claude` 를 친 순간 기록해서, 호출이 실패해도 미션이 끝난 것으로 표시됐다
   *    (2026-08-15 Codex 리뷰). 이 값은 서버 응답이 온 뒤에만 참이 된다.
   */
  reviewDone: boolean;
  /** 🔑 서버가 받아 준 마지막 판 번호. 0 이면 아직 낸 적이 없다. */
  submittedRevision: number;
  /**
   * 🚨 건너뛴 미션 번호(0-based). 막힌 학생이 수업에서 낙오하지 않게 열어 두되, **건너뛴 사실을 지운다고
   *    없어지지 않게** 상태에 남긴다 — 과정 점수는 0 이고 산출물 점수는 살린다(§5 골격 5).
   *    null 이면 안 건너뛴 것이다.
   */
  jumpedTo: number | null;
  /** 🚨 같은 키가 두 번 들어오면 두 번 실행하지 않는다 — 되돌리기·재전송이 진행을 두 칸 밀지 않게. */
  lastKey: string | null;
  env: LabEnv;
};

export const INITIAL_LAB_STATE: LabState = {
  cwd: [],
  openedFiles: [],
  ranCommands: [],
  seenAbout: false,
  rules: '',
  myOutputs: [],
  reviewDone: false,
  submittedRevision: 0,
  jumpedTo: null,
  lastKey: null,
  env: { widthPx: 0, canPaste: false },
};

/** PR1 에서 실제로 도는 명령. 🔑 `help` 가 이 목록에서 나온다 — 손으로 적으면 곧 어긋난다. */
const COMMANDS: { name: string; args: string; what: string; group: '둘러보기' | '만들기' | '확인하기' | '나가기' }[] = [
  { name: 'ls', args: '[폴더]', what: '이 폴더에 무엇이 있는지 본다', group: '둘러보기' },
  { name: 'cat', args: '<파일>', what: '파일 내용을 연다', group: '둘러보기' },
  { name: 'cd', args: '<폴더>', what: '폴더 안으로 들어간다 (cd .. 로 나온다)', group: '둘러보기' },
  { name: 'pwd', args: '', what: '지금 어느 폴더인지 본다', group: '둘러보기' },
  { name: 'clear', args: '', what: '화면을 지운다', group: '둘러보기' },
  { name: 'edit', args: '', what: '옆에 편집기를 열어 규칙을 쓴다', group: '만들기' },
  { name: 'claude review', args: '', what: '내가 쓴 것의 어디가 애매한지 AI 에게 듣는다', group: '만들기' },
  { name: 'ask', args: '<질문>', what: '모르는 것을 물어본다 (미션 횟수와 따로)', group: '만들기' },
  { name: 'npm test', args: '', what: '결과를 파서에 넣어 본다', group: '확인하기' },
  { name: 'lab missions', args: '', what: '미션 목록과 지금 할 일을 본다', group: '확인하기' },
  { name: 'lab version', args: '', what: '재생본을 만든 모델·날짜를 본다', group: '확인하기' },
  { name: 'lab check', args: '', what: '낸다 — 서버가 내 규칙으로 직접 시켜 본다', group: '확인하기' },
  { name: 'reset', args: '', what: '실습실을 처음으로 되돌린다', group: '나가기' },
  { name: 'jump', args: '<번호>', what: '막혔을 때 그 미션으로 건너뛴다', group: '나가기' },
  { name: 'lab about', args: '', what: '이 실습실이 무엇인지 다시 읽는다', group: '확인하기' },
  { name: 'lab doctor', args: '', what: '내 화면·입력이 실습에 맞는지 검사한다', group: '확인하기' },
  { name: 'exit', args: '', what: '실습실에서 나간다', group: '나가기' },
];

/**
 * 아직 안 만든 명령들. 🚨 «모르는 명령»으로 답하면 학생이 오타를 의심하며 다시 친다.
 *    무엇이 없는지, 왜 없는지를 말한다.
 */
const NOT_YET: Record<string, string> = {
  git: '이 실습실에는 git 이 없습니다. 22강에서 다시 만나요.',
  nano: '이 실습실에는 nano 가 없습니다. edit 로 옆에 편집기를 여세요.',
  vi: '이 실습실에는 vi 가 없습니다. edit 로 옆에 편집기를 여세요.',
  check: '제출은 아직 안 열렸습니다.',
  rm: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  mv: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  cp: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  touch: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  mkdir: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
};

// ─────────────────────────── 파일 나무 ───────────────────────────

/**
 * 지금 상태에서 본 파일 나무.
 *
 * 🚨 스냅샷은 상수지만, **학생이 만든 것은 상태에 있다.** 이 둘을 안 합치면
 *    저장한 규칙을 `cat CLAUDE.md` 로 열었을 때 「아직 비어 있습니다」가 나온다 —
 *    게다가 화면은 「cat 으로 내 답을 열어 보세요」라고 안내한다(2026-08-15 Codex 리뷰).
 *    **화면이 하라고 한 일은 실제로 할 수 있어야 한다.**
 */
function treeOf(state: LabState): LabFileNode {
  const runs = LAB_TREE.kind === 'dir' ? LAB_TREE.children.runs : undefined;
  const runChildren = runs && runs.kind === 'dir' ? runs.children : {};
  const mine: Record<string, LabFileNode> = {};
  state.myOutputs.forEach((text, index) => {
    mine[`my-${index + 1}.txt`] = { kind: 'file', text: `${text}\n` };
  });
  return {
    kind: 'dir',
    children: {
      ...(LAB_TREE.kind === 'dir' ? LAB_TREE.children : {}),
      // 🔑 저장했으면 저장한 것이 보인다. 안 했으면 스냅샷의 빈 문서가 그대로 보인다.
      ...(state.rules.trim() !== '' ? { 'CLAUDE.md': { kind: 'file' as const, text: state.rules } } : {}),
      runs: { kind: 'dir', children: { ...runChildren, ...mine } },
    },
  };
}

function nodeAt(segments: string[], state: LabState): LabFileNode | null {
  let node: LabFileNode = treeOf(state);
  for (const seg of segments) {
    if (node.kind !== 'dir') return null;
    const next = node.children[seg];
    if (!next) return null;
    node = next;
  }
  return node;
}

/** 학생이 친 경로를 루트 기준 조각으로 바꾼다. 나무 밖으로 나가려 하면 null. */
function resolvePath(arg: string, cwd: string[]): string[] | null {
  const trimmed = arg.trim();
  let segments: string[];
  if (trimmed === '' || trimmed === '.') return [...cwd];
  if (trimmed === '~' || trimmed === '/') return [];
  if (trimmed.startsWith('~/')) segments = [...trimmed.slice(2).split('/')];
  else if (trimmed.startsWith('/')) segments = [...trimmed.slice(1).split('/')];
  else segments = [...cwd, ...trimmed.split('/')];

  const out: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      // 🚨 루트 위로 못 올라간다. 여기서 막지 않으면 학생이 실습실 밖으로 «나간 것처럼» 보인다.
      if (out.length === 0) return null;
      out.pop();
      continue;
    }
    out.push(seg);
  }
  return out;
}

function pathLabel(segments: string[]): string {
  return segments.length === 0 ? LAB_HOME_LABEL : `${LAB_HOME_LABEL}/${segments.join('/')}`;
}

// ─────────────────────────── 미션 ───────────────────────────

/**
 * 지금 몇 번째 미션인가(0-based).
 * 🔑 상태에서 **계산한다** — 따로 저장하면 화면과 진행이 어긋나는 자리가 하나 더 생긴다.
 */
export function missionIndexOf(state: LabState): number {
  const earned = earnedMissionIndex(state);
  // 🚨 건너뛴 자리가 «번 자리»보다 앞서면 건너뛴 쪽을 쓴다. 뒤로 끌어내리지는 않는다 —
  //    건너뛴 뒤에 스스로 더 나아간 학생을 되돌리면, 건너뛴 것이 벌이 된다.
  if (state.jumpedTo !== null && state.jumpedTo > earned) return state.jumpedTo;
  return earned;
}

/** 학생이 **스스로** 도달한 자리. 🔑 건너뛰기와 갈라 둔다 — 과정 점수는 이쪽을 본다. */
export function earnedMissionIndex(state: LabState): number {
  const lookedAround = state.ranCommands.includes('ls') && state.ranCommands.includes('pwd');
  if (!lookedAround) return 0;
  const openedAllRuns = LAB_RUN_FILES.every((file) => state.openedFiles.includes(file));
  if (!openedAllRuns) return 1;
  if (!state.ranCommands.includes('npm')) return 2;
  // 🔑 4~6 은 «쓴 것»과 «부른 것»에서 계산한다. 🚨 규칙의 **내용을 채점하지 않는다** —
  //    낱말로 채점하면 그 낱말만 적는 것이 최적 전략이 된다(굿하트). 채점은 검사기가 결과로 한다.
  if (state.rules.trim() === '') return 3;
  if (state.rules.trim().length < MIN_RULES_CHARS) return 4;
  // 🚨 «비평을 받았고, 내 규칙으로 다시 시켜 봤는가». 둘 다 봐야 한다 —
  //    예전에는 `claude` 를 친 것만 봐서, 호출이 실패해도·검증을 한 번도 안 해도
  //    미션이 전부 끝난 것으로 표시됐다(2026-08-15 Codex 리뷰).
  if (!state.reviewDone || state.myOutputs.length === 0) return 5;
  // 🔑 «냈는가»는 서버가 받아 준 판 번호로 센다 — 화면이 «냈어요»라고 기억하는 것으로 세지 않는다.
  if (state.submittedRevision === 0) return 6;
  return 7;
}

/** 🚨 **서버가 받아 준 뒤에만** 부른다. 보낸 시점이 아니다. */
export function markSubmitted(state: LabState, revision: number): LabState {
  return { ...state, submittedRevision: revision };
}

/** 🚨 AI 비평을 **실제로 받았을 때만** 부른다. 명령을 친 시점이 아니다. */
export function markReviewDone(state: LabState): LabState {
  return { ...state, reviewDone: true };
}

/** 규칙 문서가 «한 번 써 본 것»으로 인정되는 최소 길이. 🔑 내용이 아니라 길이만 본다. */
export const MIN_RULES_CHARS = 40;

/**
 * 편집기에서 저장했다. 🚨 셸 밖에서 상태를 직접 주무르지 않게 여기 한 자리로 모은다 —
 *    저장 경로가 둘이 되면 «저장했는데 미션이 안 넘어간다» 가 생긴다.
 */
export function saveRules(state: LabState, rules: string): LabResult {
  const cleaned = normalizeInput(rules);
  const events: LabEvent[] = [
    line('CLAUDE.md 를 저장했습니다.', 'ok'),
    line(`  ${cleaned.trim().length}자 — npm test 로 내 규칙대로 시켜 볼 수 있습니다.`, 'dim'),
  ];
  if (cleaned.trim().length > 0 && cleaned.trim().length < MIN_RULES_CHARS) {
    events.push(line(`  (아직 짧습니다. ${MIN_RULES_CHARS}자는 넘어야 «써 봤다»로 셉니다.)`, 'warn'));
  }
  return { events, nextState: { ...state, rules: cleaned } };
}

/** 내 규칙으로 받은 결과를 상태에 담는다. 🔑 판정은 화면이 결정적 검사기로 한다. */
export function applyMyOutputs(state: LabState, outputs: string[]): LabState {
  return { ...state, myOutputs: outputs };
}

// ─────────────────────────── 출력 조각 ───────────────────────────

function line(text: string, tone: LabTone = 'plain'): LabEvent {
  return { kind: 'line', text, tone };
}

function helpLines(): LabEvent[] {
  const out: LabEvent[] = [
    line('지금 할 일 → lab missions', 'ok'),
    line('아래는 사전입니다. 순서표가 아니라 낱말 뜻풀이예요.', 'dim'),
  ];
  for (const group of ['둘러보기', '만들기', '확인하기', '나가기'] as const) {
    const rows = COMMANDS.filter((c) => c.group === group);
    if (rows.length === 0) continue;
    out.push(line(group, 'warn'));
    for (const row of rows) {
      const call = row.args ? `${row.name} ${row.args}` : row.name;
      out.push(line(`  ${call.padEnd(18)} ${row.what}`, 'dim'));
    }
    out.push(line(''));
  }
  out.push(line('이 목록 밖의 명령은 이 실습실이 모릅니다.', 'dim'));
  return out;
}

export function aboutLines(): LabEvent[] {
  const out: LabEvent[] = [line(LAB_ABOUT.title, 'warn')];
  for (const text of LAB_ABOUT.lines) out.push(line(text, 'dim'));
  return out;
}

/**
 * 「지금 할 일」 한 줄. 🔑 `lab missions` 와 처음 화면이 **같은 자리에서** 만든다 —
 *    처음 화면이 미션 목록의 «마지막 줄»을 집어 오면, 목록 끝에 무엇이 하나 붙는 날
 *    처음 화면이 조용히 엉뚱한 줄을 보여 준다.
 */
function goalLine(state: LabState): LabEvent | null {
  const current = LAB_MISSIONS[missionIndexOf(state)];
  if (!current) return null;
  return line(`지금 할 일 — ${current.goal}`, current.live ? 'plain' : 'dim');
}

function missionLines(state: LabState): LabEvent[] {
  const now = missionIndexOf(state);
  const out: LabEvent[] = [line('미션', 'warn')];
  LAB_MISSIONS.forEach((mission, index) => {
    const mark = index < now ? '  [끝]' : index === now ? '  [지금]' : mission.live ? '      ' : '  [잠김]';
    const tone: LabTone = index === now ? 'plain' : index < now ? 'ok' : 'dim';
    out.push(line(`${mark} ${index + 1}. ${mission.label}`, tone));
  });
  out.push(line(''));
  const goal = goalLine(state);
  if (goal) out.push(goal);
  return out;
}

/**
 * `npm test` — 세 결과를 파서에 넣어 본다.
 *
 * 🚨 여기가 12강이 실제로 가르치는 자리다. 세 답은 **뜻이 같은데 형식이 달라서** 2개가 터진다.
 *    학생은 「AI 가 매번 다르게 답한다」를 **말로 듣는 게 아니라 터지는 것으로** 겪는다.
 * 🚨 판정을 빨강/초록으로만 말하지 않는다 — `PASS`/`FAIL` 문자를 같이 적는다(접근성, Codex).
 */
function npmTestLines(state: LabState): LabEvent[] {
  const files = LAB_RUN_FILES.map((path) => {
    const node = nodeAt(path.split('/'), state);
    return { name: path.split('/').pop() ?? path, text: node && node.kind === 'file' ? node.text : '' };
  });
  const rows = checkAll(files);
  const out: LabEvent[] = [];
  for (const row of rows) {
    if (row.outcome.ok) {
      out.push(line(`  PASS  ${row.name.padEnd(11)} 할인율 ${row.outcome.discountPercent}%`, 'ok'));
    } else {
      out.push(line(`  FAIL  ${row.name.padEnd(11)} 터짐: ${row.outcome.reason}`, 'bad'));
    }
  }
  const passed = passCount(rows);
  out.push(line(''));
  out.push(
    line(
      `  ${passed} 통과 · ${rows.length - passed} 실패 — 세 답이 뜻은 같은데 형식이 다르다.`,
      passed === rows.length ? 'ok' : 'warn',
    ),
  );
  return out;
}

/** `lab version` — 무엇으로 만든 재생본인가. 🚨 이게 없으면 「달라진 게 규칙 때문인지 모델 때문인지」를 못 가른다. */
function versionLines(): LabEvent[] {
  return [
    line('이 실습실이 쓰는 것', 'warn'),
    line(`  재생본 만든 날    ${LAB_VERSION.fixturesCreatedAt}`, 'dim'),
    line(`  재생본 만든 모델  ${LAB_VERSION.fixturesModel}`, 'dim'),
    line(`  검사기 규칙 판    ${LAB_VERSION.checkerRevision}`, 'dim'),
    // 🚨 PR3 에서는 «해당 없음»이 맞았지만 PR4 에서 AI 가 붙었다. 문구를 안 고쳐 두면
    //    화면이 「AI 를 안 부른다」고 거짓말한다(2026-08-15 Codex 리뷰).
    line(`  실시간 AI 호출    claude review · npm test(내 규칙) 는 실제로 부릅니다.`, 'dim'),
    line(`  실시간 AI 모델    ${LAB_VERSION.liveModel}`, 'dim'),
  ];
}

/**
 * `lab doctor` — 실습 전에 내 자리가 성한지 본다.
 * 🚨 빨강/초록만으로 상태를 말하지 않는다. `OK`/`주의` 문자를 같이 적는다(접근성, Codex).
 * 🔑 한글 입력은 검사하지 않는다 — 이 터미널은 xterm.js 가 아니라 **평범한 웹 입력창**이라
 *    한글 위험이 0 이다(2026-08-15 정정). 없는 검사를 넣으면 초록이 하나 더 늘 뿐이다.
 */
function doctorLines(state: LabState): LabEvent[] {
  const out: LabEvent[] = [line('실습실 자가 검사', 'warn')];
  const width = state.env.widthPx;
  const wideEnough = width >= 640;
  out.push(
    line(
      `  ${wideEnough ? 'OK  ' : '주의'} 화면 폭 ${width}px — ${wideEnough ? '터미널 출력이 접히지 않습니다.' : '출력이 접힐 수 있습니다. 가로로 돌리거나 창을 넓혀 주세요.'}`,
      wideEnough ? 'ok' : 'bad',
    ),
  );
  out.push(
    line(
      `  ${state.env.canPaste ? 'OK  ' : '주의'} 붙여넣기 — ${state.env.canPaste ? '쓸 수 있습니다.' : '이 브라우저에서는 막혀 있습니다. 손으로 쳐도 됩니다.'}`,
      state.env.canPaste ? 'ok' : 'warn',
    ),
  );
  out.push(line(`  OK   명령 ${COMMANDS.length}개를 알아듣습니다.`, 'ok'));
  return out;
}

// ─────────────────────────── 본체 ───────────────────────────

export type LabResult = { events: LabEvent[]; nextState: LabState };

/**
 * 명령 한 줄을 실행한다.
 *
 * @param idempotencyKey 같은 키로 두 번 부르면 두 번째는 **아무 일도 하지 않는다**.
 *        훗날 서버가 붙었을 때 재전송이 진행을 두 칸 밀지 않게 하는 자리다(§5 골격 4).
 */
/**
 * 🚨 **스마트따옴표를 ASCII 로 되돌린다. 입력 최전방에서.**
 *    iOS·안드로이드 자동교정이 `"` 를 `“`/`”` 로 바꿔 놓는다 — 30명이 동시에, 아무도 눈치 못 채게.
 *    이걸 안 하면 학생은 자기가 제대로 쳤는데 계속 터지는 것을 보게 되고, 그건 «내가 못한다»로 읽힌다.
 * 🔑 태블릿이 이 수업의 기본 기기라 이건 예외 처리가 아니라 **정상 경로**다.
 */
export function normalizeInput(raw: string): string {
  return raw
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ');
}

export function execute(command: string, state: LabState, idempotencyKey: string): LabResult {
  if (idempotencyKey !== '' && idempotencyKey === state.lastKey) {
    return { events: [], nextState: state };
  }
  const base: LabState = { ...state, lastKey: idempotencyKey };
  const raw = normalizeInput(command).trim();
  const echo = line(`${pathLabel(state.cwd)}$ ${raw}`, 'input');

  if (raw === '') return { events: [echo], nextState: base };

  const parts = raw.split(/\s+/);
  const head = parts[0]!;
  const rest = parts.slice(1);
  const remember = (name: string): LabState => ({
    ...base,
    ranCommands: base.ranCommands.includes(name) ? base.ranCommands : [...base.ranCommands, name],
  });

  // ── lab … ─────────────────────────────
  if (head === 'lab') {
    const sub = rest[0] ?? '';
    if (sub === 'about') {
      return { events: [echo, ...aboutLines()], nextState: { ...remember('lab'), seenAbout: true } };
    }
    if (sub === 'missions') return { events: [echo, ...missionLines(base)], nextState: remember('lab') };
    if (sub === 'doctor') return { events: [echo, ...doctorLines(base)], nextState: remember('lab') };
    if (sub === 'version') return { events: [echo, ...versionLines()], nextState: remember('lab') };
    if (sub === 'check') {
      if (base.rules.trim() === '') {
        return {
          events: [
            echo,
            line('낼 것이 없습니다. edit 로 규칙을 먼저 써 보세요.', 'warn'),
            line('  낸 뒤에도 몇 번이고 고쳐서 다시 낼 수 있습니다.', 'dim'),
          ],
          nextState: base,
        };
      }
      return {
        events: [
          echo,
          line('제출합니다. 서버가 여러분이 낸 규칙으로 직접 두 번 시켜 봅니다.', 'warn'),
          { kind: 'submit', rules: base.rules },
        ],
        nextState: remember('lab'),
      };
    }
    return {
      events: [
        echo,
        line(`lab ${sub} 은 없습니다. lab about · lab missions · lab doctor · lab version · lab check 중에서 골라 주세요.`, 'bad'),
      ],
      nextState: base,
    };
  }

  switch (head) {
    case 'help':
      return { events: [echo, ...helpLines()], nextState: remember('help') };

    case 'pwd':
      return { events: [echo, line(pathLabel(base.cwd))], nextState: remember('pwd') };

    case 'clear':
      return { events: [{ kind: 'clear' }], nextState: remember('clear') };

    case 'exit':
      return { events: [echo, line('실습실에서 나갑니다.', 'dim'), { kind: 'exit' }], nextState: remember('exit') };

    case 'npm': {
      if (rest[0] !== 'test') {
        return { events: [echo, line('이 실습실이 아는 npm 명령은 npm test 하나입니다.', 'bad')], nextState: base };
      }
      // 🔑 규칙을 쓴 뒤에는 **내 규칙대로 시켜서** 검사한다. 그 전에는 재생 3종을 검사한다.
      //    같은 명령이 «지금 무엇을 검사하는지»는 화면이 매번 밝혀 준다 — 안 밝히면 학생이 뒤섞는다.
      if (base.rules.trim() !== '') {
        return {
          events: [
            echo,
            line('내 규칙대로 두 번 시켜 봅니다. (AI 를 실제로 부릅니다)', 'warn'),
            { kind: 'ai', mode: 'verify', text: base.rules },
          ],
          nextState: remember('npm'),
        };
      }
      // 🚨 순서를 강제하지 않는다 — 세 결과를 안 열고 쳐도 돈다. 다만 «무엇을 보고 있는지» 한 줄 알려 준다.
      const openedAll = LAB_RUN_FILES.every((file) => base.openedFiles.includes(file));
      const head: LabEvent[] = openedAll
        ? []
        : [line('  (아직 안 연 결과가 있습니다. cat 으로 셋 다 열어 보면 왜 터지는지 보입니다.)', 'dim')];
      return {
        events: [echo, line('  검사 대상 — runs/ 의 사전 생성 결과 3개', 'dim'), ...head, ...npmTestLines(base)],
        nextState: remember('npm'),
      };
    }

    case 'edit': {
      return {
        events: [echo, line('옆에 편집기를 열었습니다. 다 쓰면 «저장» 을 누르세요.', 'dim'), { kind: 'editor' }],
        nextState: remember('edit'),
      };
    }

    case 'claude': {
      if (rest[0] !== 'review') {
        return {
          events: [echo, line('이 실습실이 아는 claude 명령은 claude review 하나입니다.', 'bad')],
          nextState: base,
        };
      }
      if (base.rules.trim() === '') {
        return {
          events: [
            echo,
            line('아직 쓴 것이 없습니다. edit 로 규칙을 먼저 써 보세요.', 'warn'),
            line('  AI 는 여러분이 쓴 것을 «비평»합니다 — 대신 써 주지 않습니다.', 'dim'),
          ],
          nextState: base,
        };
      }
      return {
        events: [
          echo,
          line('내가 쓴 것을 AI 에게 보여 주고 비평을 받습니다. (AI 를 실제로 부릅니다)', 'warn'),
          { kind: 'ai', mode: 'review', text: base.rules },
        ],
        // 🚨 여기서 «했다»고 적지 않는다. 실제 응답이 온 뒤 `markReviewDone` 이 적는다 —
        //    명령을 친 것과 비평을 받은 것은 다르다(2026-08-15 Codex 리뷰).
        nextState: base,
      };
    }

    case 'ask': {
      // 🔑 따옴표를 요구하지 않는다. `ask 이게 무슨 뜻이에요` 처럼 그냥 이어 쓰면 된다 —
      //    태블릿에서 따옴표는 자동교정에 가장 잘 망가지는 글자다(정규화가 있어도 안 만드는 게 낫다).
      const question = rest.join(' ').replace(/^["']|["']$/g, '').trim();
      if (question.length < 2) {
        return {
          events: [echo, line('무엇이 궁금한지 이어서 적어 주세요. 예) ask 파서가 뭐예요', 'bad')],
          nextState: base,
        };
      }
      return {
        events: [echo, { kind: 'ai', mode: 'ask', text: question }],
        nextState: remember('ask'),
      };
    }

    case 'reset': {
      // 🚨 되돌리기는 «지운다»가 아니라 «처음부터 다시»다. 무엇이 사라지는지 말하고 되돌린다.
      return {
        events: [
          { kind: 'clear' },
          ...openingEvents(),
          line(''),
          line('실습실을 처음으로 되돌렸습니다. 지금까지의 진행이 사라졌습니다.', 'warn'),
        ],
        nextState: { ...INITIAL_LAB_STATE, env: base.env, lastKey: idempotencyKey },
      };
    }

    case 'jump': {
      const asked = Number(rest[0]);
      if (!Number.isInteger(asked) || asked < 1 || asked > LAB_MISSIONS.length) {
        return {
          events: [echo, line(`어느 미션으로 갈지 1~${LAB_MISSIONS.length} 중에서 적어 주세요. 예) jump 3`, 'bad')],
          nextState: base,
        };
      }
      const target = asked - 1;
      const mission = LAB_MISSIONS[target]!;
      if (!mission.live) {
        return { events: [echo, line(`미션 ${asked} 은 아직 안 열렸습니다.`, 'warn')], nextState: base };
      }
      if (target <= earnedMissionIndex(base)) {
        return {
          events: [echo, line(`미션 ${asked} 은 이미 지나온 자리입니다. 건너뛸 것이 없어요.`, 'dim')],
          nextState: base,
        };
      }
      // 🚨 건너뛴 사실을 상태에 남긴다. 지운다고 없어지지 않아야 «과정 점수 0 · 산출물 점수 생존»을
      //    나중에 정직하게 계산할 수 있다(§5 골격 5).
      return {
        events: [
          echo,
          line(`미션 ${asked} 로 건너뜁니다 — ${mission.label}`, 'warn'),
          line('  건너뛴 구간은 과정 점수에 안 들어갑니다. 만든 것에 대한 점수는 그대로 살아 있어요.', 'dim'),
          line(`  지금 할 일 — ${mission.goal}`),
        ],
        nextState: { ...remember('jump'), jumpedTo: target },
      };
    }

    case 'ls': {
      const target = resolvePath(rest[0] ?? '', base.cwd);
      const node = target ? nodeAt(target, base) : null;
      if (!node) {
        return { events: [echo, line(`${rest[0] ?? ''} 라는 폴더가 없습니다.`, 'bad')], nextState: base };
      }
      if (node.kind === 'file') {
        return { events: [echo, line(`${rest[0]} 은 폴더가 아니라 파일입니다. cat 으로 열어 보세요.`, 'bad')], nextState: base };
      }
      const names = Object.entries(node.children).map(([name, child]) => (child.kind === 'dir' ? `${name}/` : name));
      return { events: [echo, line(names.join('   '))], nextState: remember('ls') };
    }

    case 'cd': {
      if (rest.length === 0) return { events: [echo, line('어디로 갈지 적어 주세요. 예) cd runs', 'bad')], nextState: base };
      const target = resolvePath(rest[0]!, base.cwd);
      if (!target) {
        return { events: [echo, line('여기가 실습실의 가장 바깥입니다. 더 나갈 수 없어요.', 'bad')], nextState: base };
      }
      const node = nodeAt(target, base);
      if (!node) return { events: [echo, line(`${rest[0]} 라는 폴더가 없습니다.`, 'bad')], nextState: base };
      if (node.kind === 'file') {
        return { events: [echo, line(`${rest[0]} 은 파일입니다. cat 으로 열어 보세요.`, 'bad')], nextState: base };
      }
      return { events: [echo, line(pathLabel(target), 'dim')], nextState: { ...remember('cd'), cwd: target } };
    }

    case 'cat': {
      if (rest.length === 0) return { events: [echo, line('무엇을 열지 적어 주세요. 예) cat parse.js', 'bad')], nextState: base };
      const target = resolvePath(rest[0]!, base.cwd);
      const node = target ? nodeAt(target, base) : null;
      if (!node) return { events: [echo, line(`${rest[0]} 라는 파일이 없습니다. ls 로 확인해 보세요.`, 'bad')], nextState: base };
      if (node.kind === 'dir') {
        return { events: [echo, line(`${rest[0]} 은 폴더입니다. ls ${rest[0]} 로 안을 보세요.`, 'bad')], nextState: base };
      }
      const key = target!.join('/');
      const body = node.text.replace(/\n$/, '').split('\n').map((text) => line(text));
      return {
        events: [echo, ...body],
        nextState: {
          ...remember('cat'),
          openedFiles: base.openedFiles.includes(key) ? base.openedFiles : [...base.openedFiles, key],
        },
      };
    }
  }

  const notYet = NOT_YET[head];
  if (notYet) return { events: [echo, line(notYet, 'warn'), line('help 로 지금 할 수 있는 것을 볼 수 있어요.', 'dim')], nextState: base };

  return {
    events: [
      echo,
      // 🔑 조사를 고르지 않는다. 학생이 무엇을 칠지 모르므로 받침을 알 수 없다 —
      //    「뭐하지 은」도 「'뭐하지' 이라는」도 깨진다. 줄표로 끊으면 어느 낱말이 와도 성립한다.
      line(`'${head}' — 이 실습실이 모르는 명령입니다.`, 'bad'),
      line('지금 할 일은 위에 적혀 있어요. 전체 목록은 help.', 'dim'),
    ],
    nextState: base,
  };
}

/** 화면이 처음 열릴 때 그리는 줄. 🚨 고지를 **먼저** 보여 준다(§2 「당연히 가짜임을 알려줘야지」). */
export function openingEvents(): LabEvent[] {
  const goal = goalLine(INITIAL_LAB_STATE);
  return [
    ...aboutLines(),
    line(''),
    ...(goal ? [goal] : []),
    line(''),
    line('먼저 ls 를 쳐 보세요.', 'ok'),
    line('전체 명령은 help · 미션 목록은 lab missions 로 볼 수 있습니다.', 'dim'),
  ];
}

export const LAB_COMMAND_NAMES = COMMANDS.map((c) => c.name);
