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
  | { kind: 'exit' };

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
  /** 🚨 같은 키가 두 번 들어오면 두 번 실행하지 않는다 — 되돌리기·재전송이 진행을 두 칸 밀지 않게. */
  lastKey: string | null;
  env: LabEnv;
};

export const INITIAL_LAB_STATE: LabState = {
  cwd: [],
  openedFiles: [],
  ranCommands: [],
  seenAbout: false,
  lastKey: null,
  env: { widthPx: 0, canPaste: false },
};

/** PR1 에서 실제로 도는 명령. 🔑 `help` 가 이 목록에서 나온다 — 손으로 적으면 곧 어긋난다. */
const COMMANDS: { name: string; args: string; what: string; group: '둘러보기' | '확인하기' | '나가기' }[] = [
  { name: 'ls', args: '[폴더]', what: '이 폴더에 무엇이 있는지 본다', group: '둘러보기' },
  { name: 'cat', args: '<파일>', what: '파일 내용을 연다', group: '둘러보기' },
  { name: 'cd', args: '<폴더>', what: '폴더 안으로 들어간다 (cd .. 로 나온다)', group: '둘러보기' },
  { name: 'pwd', args: '', what: '지금 어느 폴더인지 본다', group: '둘러보기' },
  { name: 'clear', args: '', what: '화면을 지운다', group: '둘러보기' },
  { name: 'lab missions', args: '', what: '미션 목록과 지금 할 일을 본다', group: '확인하기' },
  { name: 'lab about', args: '', what: '이 실습실이 무엇인지 다시 읽는다', group: '확인하기' },
  { name: 'lab doctor', args: '', what: '내 화면·입력이 실습에 맞는지 검사한다', group: '확인하기' },
  { name: 'exit', args: '', what: '실습실에서 나간다', group: '나가기' },
];

/**
 * 아직 안 만든 명령들. 🚨 «모르는 명령»으로 답하면 학생이 오타를 의심하며 다시 친다.
 *    무엇이 없는지, 왜 없는지를 말한다.
 */
const NOT_YET: Record<string, string> = {
  npm: '검사(npm test)는 아직 안 열렸습니다. 지금은 파일을 여는 것까지 할 수 있어요.',
  node: '검사(npm test)는 아직 안 열렸습니다. 지금은 파일을 여는 것까지 할 수 있어요.',
  git: '이 실습실에는 git 이 없습니다. 22강에서 다시 만나요.',
  claude: 'AI 비평은 아직 안 열렸습니다.',
  ask: 'AI 에게 묻기는 아직 안 열렸습니다.',
  edit: '편집기는 아직 안 열렸습니다. 지금은 파일을 읽기만 할 수 있어요.',
  nano: '편집기는 아직 안 열렸습니다. 지금은 파일을 읽기만 할 수 있어요.',
  vi: '편집기는 아직 안 열렸습니다. 지금은 파일을 읽기만 할 수 있어요.',
  reset: '되돌리기는 아직 안 열렸습니다.',
  jump: '건너뛰기는 아직 안 열렸습니다.',
  check: '제출은 아직 안 열렸습니다.',
  rm: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  mv: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  cp: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  touch: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
  mkdir: '이 실습실은 읽기 전용입니다. 파일을 지우거나 고칠 수 없어요.',
};

// ─────────────────────────── 파일 나무 ───────────────────────────

function nodeAt(segments: string[]): LabFileNode | null {
  let node: LabFileNode = LAB_TREE;
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
  const lookedAround = state.ranCommands.includes('ls') && state.ranCommands.includes('pwd');
  if (!lookedAround) return 0;
  const openedAllRuns = LAB_RUN_FILES.every((file) => state.openedFiles.includes(file));
  if (!openedAllRuns) return 1;
  // 🚨 3번부터는 이 PR 에서 판정하지 않는다. «다 끝났다»가 아니라 «여기서 멈춘다»로 세운다.
  return 2;
}

// ─────────────────────────── 출력 조각 ───────────────────────────

function line(text: string, tone: LabTone = 'plain'): LabEvent {
  return { kind: 'line', text, tone };
}

function helpLines(): LabEvent[] {
  const out: LabEvent[] = [];
  for (const group of ['둘러보기', '확인하기', '나가기'] as const) {
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

function missionLines(state: LabState): LabEvent[] {
  const now = missionIndexOf(state);
  const out: LabEvent[] = [line('미션', 'warn')];
  LAB_MISSIONS.forEach((mission, index) => {
    const mark = index < now ? '  [끝]' : index === now ? '  [지금]' : mission.live ? '      ' : '  [잠김]';
    const tone: LabTone = index === now ? 'plain' : index < now ? 'ok' : 'dim';
    out.push(line(`${mark} ${index + 1}. ${mission.label}`, tone));
  });
  out.push(line(''));
  const current = LAB_MISSIONS[now];
  if (current) out.push(line(`지금 할 일 — ${current.goal}`, current.live ? 'plain' : 'dim'));
  return out;
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
export function execute(command: string, state: LabState, idempotencyKey: string): LabResult {
  if (idempotencyKey !== '' && idempotencyKey === state.lastKey) {
    return { events: [], nextState: state };
  }
  const base: LabState = { ...state, lastKey: idempotencyKey };
  const raw = command.trim();
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
    return {
      events: [echo, line(`lab ${sub} 은 없습니다. lab about · lab missions · lab doctor 중에서 골라 주세요.`, 'bad')],
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

    case 'ls': {
      const target = resolvePath(rest[0] ?? '', base.cwd);
      const node = target ? nodeAt(target) : null;
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
      const node = nodeAt(target);
      if (!node) return { events: [echo, line(`${rest[0]} 라는 폴더가 없습니다.`, 'bad')], nextState: base };
      if (node.kind === 'file') {
        return { events: [echo, line(`${rest[0]} 은 파일입니다. cat 으로 열어 보세요.`, 'bad')], nextState: base };
      }
      return { events: [echo, line(pathLabel(target), 'dim')], nextState: { ...remember('cd'), cwd: target } };
    }

    case 'cat': {
      if (rest.length === 0) return { events: [echo, line('무엇을 열지 적어 주세요. 예) cat parse.js', 'bad')], nextState: base };
      const target = resolvePath(rest[0]!, base.cwd);
      const node = target ? nodeAt(target) : null;
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
    events: [echo, line(`${head} 은 이 실습실이 모르는 명령입니다.`, 'bad'), line('help 로 쓸 수 있는 명령을 볼 수 있어요.', 'dim')],
    nextState: base,
  };
}

/** 화면이 처음 열릴 때 그리는 줄. 🚨 고지를 **먼저** 보여 준다(§2 「당연히 가짜임을 알려줘야지」). */
export function openingEvents(): LabEvent[] {
  return [...aboutLines(), line(''), line('help 를 치면 쓸 수 있는 명령이 나옵니다.', 'dim')];
}

export const LAB_COMMAND_NAMES = COMMANDS.map((c) => c.name);
