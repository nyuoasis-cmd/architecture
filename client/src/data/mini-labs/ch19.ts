import { MINI_REPLAY_LABEL, line, type MiniLab } from '../../lib/mini-lab';

/**
 * 13강(속 ch19) 미니 실습실 — 「나만의 스킬 · /init」. 비유 = 단골 가게 주문.
 * («늘 먹던 걸로» 한마디가 통하는 이유 = 가게가 내 주문을 적어 뒀기 때문.)
 *
 * 산출물 = **스킬 한 개** → 계보 'skill' (23강 묶음의 2번째 칸).
 */
const LONG_REQUEST = 'ask 학급 신문 기사 써 줘. 제목은 20자 이내, 첫 문단은 사실만, 둘째 문단은 인터뷰, 끝에 다음 호 예고. 반말 금지';

export const CH19_MINI_LAB: MiniLab = {
  scopeId: 'ch19',
  chapterId: 19,
  homeLabel: '~/skills',
  aboutTitle: '이 실습실에 대하여',
  aboutLines: [
    '여기는 «반복하는 부탁을 적어 두는 법»을 연습하는 실습실입니다.',
    '',
    '  진짜      ask 로 보내는 부탁. 실제 AI 가 답합니다.',
    '  사전 생성 init 의 출력. REPLAY 라벨이 붙어 있습니다.',
    '  줄인 것   셸 그 자체. help 에 있는 명령만 알아듣습니다.',
  ],
  commands: [
    {
      name: 'ask',
      usage: '<긴 부탁>',
      what: '매번 처음부터 설명해서 시킨다 — 길다는 걸 몸으로 느껴 보세요',
      run: (args) => {
        const request = args.trim();
        if (request.length < 2) {
          return { lines: [line(`무엇을 부탁할지 이어서 적어 주세요. 예) ${LONG_REQUEST}`, 'bad')] };
        }
        return {
          lines: [line('AI 에게 보냅니다. (실제로 부릅니다)', 'warn')],
          effect: { kind: 'ask', text: request },
        };
      },
    },
    {
      name: 'skill',
      usage: '',
      what: '반복하는 부탁을 스킬 세 칸(이름·언제 쓰나·단계)으로 적는다',
      run: () => ({
        lines: [
          line('옆에 편집기를 열었습니다. 세 칸을 적으세요:', 'dim'),
          line('  이름 한 줄 · 언제 쓰나 한 줄 · 단계 서너 줄 (한 단계 = 결과물 하나)', 'dim'),
        ],
        effect: {
          kind: 'editor',
          flag: 'skillText',
          fileLabel: '학급신문-기사.skill',
          minChars: 40,
          artifactKind: 'skill',
        },
      }),
    },
    {
      name: 'init',
      usage: '',
      what: '방을 훑어 «늘 쓰는 것»을 미리 적어 두게 한다 (두 번 실행해 보세요)',
      run: (_args, state) => {
        const runs = Number(state.flags.initRuns ?? 0) + 1;
        if (runs === 1) {
          return {
            lines: [
              line(MINI_REPLAY_LABEL, 'dim'),
              line('처음 실행 — 방 전체를 훑습니다. 시간이 걸립니다…', 'warn'),
              line('  읽는 중  신문 지난 호 4부 … 학급 규칙 1장 … 당번표 …', 'dim'),
              line('  적는 중  «이 반의 신문은 2쪽, 제목은 20자, 반말 금지»', 'dim'),
              line('  적는 중  «인터뷰 꼭지가 항상 둘째 문단»', 'dim'),
              line('  (총 41초 걸림)', 'dim'),
              line('끝 — 알아낸 것을 메모장에 적어 뒀습니다.', 'ok'),
            ],
            flags: { initRuns: runs },
          };
        }
        return {
          lines: [
            line(MINI_REPLAY_LABEL, 'dim'),
            line('두 번째 실행 — 메모장이 이미 있습니다.', 'ok'),
            line('  (0.4초 걸림) 적어 둔 것을 다시 만들지 않습니다.', 'ok'),
            line(''),
            line('첫 실행이 오래 걸린 이유 = «늘 먹던 걸로»가 통하려면 누군가 한 번은'),
            line('내 주문을 적어 둬야 하기 때문입니다. 두 번째부터는 그 메모를 씁니다.'),
          ],
          flags: { initRuns: runs },
        };
      },
    },
    {
      name: 'run-skill',
      usage: '',
      what: '내가 적은 스킬대로 시켜 본다',
      run: (_args, state) => {
        const skill = String(state.flags.skillText ?? '');
        if (skill.trim() === '') {
          return { lines: [line('아직 적은 스킬이 없습니다. skill 로 먼저 적어 보세요.', 'warn')] };
        }
        return {
          lines: [
            line('내 스킬을 부탁문 앞에 얹어 AI 에게 보냅니다. (실제로 부릅니다)', 'warn'),
            line('  이제 부탁은 한 마디면 됩니다 — «늘 하던 그 기사로».', 'dim'),
          ],
          effect: { kind: 'ask', text: `아래 절차(스킬)를 그대로 지켜서 학급 신문 기사를 한 편 써 줘.\n\n${skill}` },
        };
      },
    },
  ],
  missions: [
    {
      label: '긴 설명으로 두 번 시켜 보기',
      goal: '같은 긴 부탁을 두 번 보내 보세요 — 매번 처음부터 설명하는 게 얼마나 번거로운지 느끼는 게 목적입니다.',
      nextCommand: () => LONG_REQUEST,
      done: (state) => Number(state.flags.askAnswered ?? 0) >= 2,
    },
    {
      label: '스킬 세 칸 적기',
      goal: 'skill 로 편집기를 열고, 방금 반복한 부탁을 세 칸(이름·언제 쓰나·단계)으로 적으세요.',
      nextCommand: () => 'skill',
      done: (state) => String(state.flags.skillText ?? '').trim().length >= 40,
    },
    {
      label: 'init 두 번 실행해 보기',
      goal: 'init 을 두 번 실행해 보세요 — 첫 번째(오래 걸림)와 두 번째(즉시)의 차이가 이 강의 핵심입니다.',
      nextCommand: () => 'init',
      done: (state) => Number(state.flags.initRuns ?? 0) >= 2,
    },
    {
      label: '내 스킬로 시켜 보기',
      goal: 'run-skill 로 내가 적은 스킬대로 시켜 보세요 — 부탁이 한 마디로 줄어듭니다.',
      nextCommand: () => 'run-skill',
      done: (state) =>
        String(state.flags.skillText ?? '').trim().length >= 40 && Number(state.flags.askAnswered ?? 0) >= 3,
    },
  ],
  qaMissionSpans: {
    ch19_q01: { from: 1, to: 1 },
    ch19_q02: { from: 2, to: 2 },
    ch19_q03: { from: 3, to: 3 },
    ch19_q04: { from: 4, to: 4 },
  },
  askFallbacks: [
    '(기사 예시) 제목: 가을 체육대회, 우리 반 2위\n첫 문단: 지난 화요일 열린 체육대회에서 우리 반이 종합 2위를 했다.\n둘째 문단: 계주 주자 인터뷰 — "마지막 바퀴에서 다리가 풀렸는데 함성 덕에 뛰었어요."\n다음 호 예고: 학예회 준비 소식.',
    '(기사 예시) 제목: 급식 설문 결과 발표\n첫 문단: 지난주 전교생 급식 설문에 214명이 참여했다.\n둘째 문단: 영양 선생님 인터뷰 — "1위 메뉴는 다음 달 식단에 반영할 계획이에요."\n다음 호 예고: 도서관 새 책 소개.',
  ],
};
