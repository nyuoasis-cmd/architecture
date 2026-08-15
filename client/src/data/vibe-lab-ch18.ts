/**
 * 12강(ch18) 「가짜 터미널 실습실」의 스냅샷 — 파일과 미션.
 *
 * 🚨 여기 있는 파일은 **진짜 파일이다.** 학생이 `cat` 으로 여는 내용이 곧 이 문자열이고,
 *    화면에 꾸며낸 것을 덧붙이지 않는다. 「가짜」가 되는 것은 **셸 그 자체 하나뿐**이다
 *    (근거 = docs/HANDOFF-vibe-terminal-lab-2026-08-15.md §2).
 *
 * 🚨 `runs/` 의 세 결과는 **사전 생성분**이라 파일 안에 `REPLAY` 라벨을 박아 둔다.
 *    라벨을 떼면 학생은 방금 AI 가 답한 것으로 오해한다 — 그 순간 「AI 호출은 진짜」라는
 *    약속이 안에서 깨진다(§3-가).
 *
 * 🔑 세 결과는 **뜻이 같고 형식이 다르다.** 이게 12강의 전부다 —
 *    「같아진다」가 아니라 「약속을 지킨다」를 가르친다.
 */

export type LabFileNode =
  | { kind: 'file'; text: string }
  | { kind: 'dir'; children: Record<string, LabFileNode> };

export type LabMission = {
  /** 좌측 목차에 세우는 이름. 짧게 — 280px 칸에서 한 줄로 끝나야 한다. */
  label: string;
  /** 이 미션에서 지금 할 일. 고른 미션 아래에 한 덩어리로 편다. */
  goal: string;
  /** 이 PR 에서 실제로 판정되는가. false 면 좌측에 «아직 안 열림»으로 세운다. */
  live: boolean;
};

/** 실습실이 걸리는 문항. 12강(ch18)의 마지막 문항 하나뿐이다. */
export const LAB_QA_ID = 'ch18_q04';

/** 처음 열었을 때 뜨는 축소판 고지. 🚨 「가짜」만 말하면 학생이 실습 전체를 흉내로 여긴다. */
export const LAB_ABOUT: { title: string; lines: string[] } = {
  title: '이 실습실에 대하여',
  lines: [
    '여기는 수업용으로 줄인 터미널입니다. 오늘 배울 명령만 알아듣습니다.',
    '',
    '  진짜      파일. cat 으로 여는 내용은 실제 파일 그대로입니다.',
    '  진짜      판정. 검사기가 실제로 돌려 준 결과를 보여 줍니다.',
    '  진짜      AI. 뒤에서 AI 를 부르는 명령은 실제로 부릅니다.',
    '  줄인 것   셸 그 자체. 아래 목록 밖의 명령은 모릅니다.',
    '  사전 생성 runs/ 의 세 결과. 파일 안에 REPLAY 라벨이 있습니다.',
    '',
    '막히면 help, 화면이 이상하면 lab doctor 를 쳐 보세요.',
  ],
};

/**
 * 미션 7단계.
 * 🚨 지금 실제로 판정되는 것은 1~3 뿐이다(4번부터는 편집기·AI 가 있어야 한다). 나머지를 «곧 열림»이 아니라 **«아직 안 열림»**으로
 *    적는 이유 = 앱이 못 하는 일을 할 수 있는 것처럼 적으면 학생이 그 앞에서 기다린다.
 */
export const LAB_MISSIONS: LabMission[] = [
  {
    label: '실습실 둘러보기',
    goal: 'ls 로 어떤 파일이 있는지, pwd 로 지금 어디인지 확인해 보세요.',
    live: true,
  },
  {
    label: '세 결과 열어 보기',
    goal: 'runs/ 안에 답이 셋 있습니다. cat 으로 셋 다 열어 무엇이 다른지 보세요.',
    live: true,
  },
  {
    label: '파서에 넣어 보기',
    goal: 'npm test 로 세 결과를 파서에 넣어 보세요. 2개가 터집니다 — 왜 터지는지 읽어 보세요.',
    live: true,
  },
  {
    label: '무엇이 다른지 적기',
    goal: 'edit 로 편집기를 열고, 세 결과가 어떻게 달랐는지 적어 보세요.',
    live: true,
  },
  {
    label: '규칙 문서 쓰기',
    goal: '다음 사람이 지킬 수 있게 규칙으로 다듬어 보세요. 무엇을 어느 자리에 적을지까지.',
    live: true,
  },
  {
    label: 'AI 비평 받기',
    goal: 'claude review 로 어디가 애매한지 들어 보세요. AI 는 대신 써 주지 않습니다.',
    live: true,
  },
  { label: '제출', goal: '아직 안 열린 미션입니다.', live: false },
];

/** 미션 2 를 끝냈다고 보려면 이 셋을 다 열어야 한다. */
export const LAB_RUN_FILES = ['runs/run-1.txt', 'runs/run-2.txt', 'runs/run-3.txt'] as const;

const RUN_1 = `--- REPLAY - 사전 생성 예시 (실시간 AI 호출이 아닙니다) ---
할인율: 10%
최종가: 9000
`;

const RUN_2 = `--- REPLAY - 사전 생성 예시 (실시간 AI 호출이 아닙니다) ---
할인율은 10% off 입니다. 최종가는 9,000원.
`;

const RUN_3 = `--- REPLAY - 사전 생성 예시 (실시간 AI 호출이 아닙니다) ---
{ "discount": 0.1, "final": 9000 }
`;

const PARSE_JS = `// 세 결과를 받아서 처리하는 쪽. 사람이 아니라 프로그램이 읽는다.
// 이 파일이 못 읽으면, 답이 아무리 맞아도 다음 단계가 돌지 않는다.

function 할인율읽기(text) {
  const m = text.match(/^할인율: (\\d+)%$/m);
  if (!m) throw new Error('할인율을 못 찾음');
  return Number(m[1]);
}

function 최종가읽기(text) {
  const m = text.match(/^최종가: (\\d+)$/m);
  if (!m) throw new Error('최종가를 못 찾음');
  return Number(m[1]);
}

module.exports = { 할인율읽기, 최종가읽기 };
`;

const CLAUDE_MD = `# 우리 반 규칙

(아직 비어 있습니다. 여기에 규칙을 적게 됩니다.)
`;

const PACKAGE_JSON = `{
  "name": "pricing",
  "private": true,
  "scripts": {
    "test": "node check.js"
  }
}
`;

/** 실습실의 파일 나무. 루트 = 학생의 홈(`~/pricing`). */
export const LAB_TREE: LabFileNode = {
  kind: 'dir',
  children: {
    'CLAUDE.md': { kind: 'file', text: CLAUDE_MD },
    'parse.js': { kind: 'file', text: PARSE_JS },
    'package.json': { kind: 'file', text: PACKAGE_JSON },
    runs: {
      kind: 'dir',
      children: {
        'run-1.txt': { kind: 'file', text: RUN_1 },
        'run-2.txt': { kind: 'file', text: RUN_2 },
        'run-3.txt': { kind: 'file', text: RUN_3 },
      },
    },
  },
};

/** 프롬프트에 그리는 홈 이름. `~/pricing` 아래가 루트다. */
export const LAB_HOME_LABEL = '~/pricing';
