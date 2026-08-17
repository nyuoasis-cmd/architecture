import { MINI_REPLAY_LABEL, line, type MiniLab, type MiniRunResult } from '../../lib/mini-lab';

/**
 * 19강(속 ch21) 미니 실습실 — 「TDD 한 바퀴」. 비유 = 받아쓰기 채점표를 먼저 만들기.
 * (채점표(약속 문장)를 먼저 쓰고, 그다음 받아쓰기를 시킨다 — 카드 19강.)
 *
 * 산출물 = **약속 문장 한 개** → 계보 'promise' (23강 묶음의 4번째 칸).
 * 🔑 새 용어 0개 — 테스트 대신 «약속 문장·채점표»로만 말한다(카드 확정).
 */
export const CH21_MINI_LAB: MiniLab = {
  scopeId: 'ch21',
  chapterId: 21,
  homeLabel: '~/약속',
  aboutTitle: '이 실습실에 대하여 — 채점표 먼저',
  aboutLines: [
    '「다 됐어요」를 믿는 대신, 채점표(약속 문장)를 먼저 만들어 확인하는 한 바퀴를 돕니다.',
    '',
    '  진짜      내가 쓴 약속 문장. check 는 그것으로 판정합니다.',
    '  사전 생성 sample · build 의 출력. REPLAY 라벨이 붙어 있습니다.',
  ],
  commands: [
    {
      name: 'check',
      usage: '',
      what: '채점표(약속 문장)로 검사한다 — 없으면 검사가 안 된다는 것부터 보인다',
      run: (_args, state): MiniRunResult => {
        const promise = String(state.flags.promiseText ?? '').trim();
        if (promise === '') {
          return {
            lines: [
              line('검사할 약속 문장이 없습니다.', 'warn'),
              line(''),
              line('  만든 사람: "다 됐어요!"'),
              line('  검사기:    …무엇이 «됐다»는 건지 잴 기준이 없습니다.', 'dim'),
              line(''),
              line('«다 됐어요»는 판정이 아니라 주장이에요. 채점표가 있어야 판정이 됩니다.', 'dim'),
            ],
            flags: { checkedEmpty: true },
          };
        }
        if (!state.flags.built) {
          return {
            lines: [
              line('내 약속 문장으로 검사합니다…'),
              line('  FAIL  아직 만들어진 것이 없습니다', 'bad'),
              line(''),
              line('빨강이에요 — 그리고 이게 정상입니다. 채점표를 먼저 만들었으니', 'dim'),
              line('아직 없는 것이 «없다»고 정직하게 나오는 거예요. 이제 build 로 시키세요.', 'dim'),
            ],
            flags: { sawRed: true },
          };
        }
        return {
          lines: [
            line('내 약속 문장으로 검사합니다…'),
            line('  PASS  약속대로 됐습니다', 'ok'),
            line(''),
            line('초록! 빨강 → 만들기 → 초록, 이 한 바퀴가 오늘 배운 전부예요.', 'ok'),
            line('«다 됐어요» 대신 «채점표를 통과했어요»라고 말할 수 있게 됐습니다.', 'dim'),
          ],
          flags: { sawGreen: true },
        };
      },
    },
    {
      name: 'sample',
      usage: '',
      what: '약속 문장 견본을 열어 본다 — 네 칸의 모양',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('약속 문장 견본 — 도서관 앱의 것:'),
          line(''),
          line('  넣는 것       «어린 왕자»를 «김하늘»이 빌리면', 'ok'),
          line('  나와야 하는 것  김하늘의 목록에 «어린 왕자»가 보인다', 'ok'),
          line('  왜 그게 맞나   빌린 책을 자기 목록에서 확인하는 게 이 기능의 목적', 'ok'),
          line('  막혀야 하는 것  이미 빌려간 책을 또 빌리려 하면 거절된다', 'ok'),
          line(''),
          line('넣는 것에 «실제 값»이, 나와야 하는 것에 «장면»이 있는 게 핵심이에요.', 'dim'),
        ],
        flags: { sawSample: true },
      }),
    },
    {
      name: 'promise',
      usage: '',
      what: '내 약속 문장(채점표)을 네 칸으로 쓴다',
      run: () => ({
        lines: [
          line('옆에 편집기를 열었습니다. 네 칸을 적으세요:', 'dim'),
          line('  넣는 것(실제 값으로) · 나와야 하는 것(장면으로) · 왜 그게 맞나 · 막혀야 하는 것', 'dim'),
        ],
        effect: {
          kind: 'editor',
          flag: 'promiseText',
          fileLabel: '약속문장.txt',
          minChars: 40,
          artifactKind: 'promise',
        },
      }),
    },
    {
      name: 'build',
      usage: '',
      what: '이제 시킨다 — 채점표가 있으니 «됐는지»를 잴 수 있다',
      run: (_args, state): MiniRunResult => {
        if (String(state.flags.promiseText ?? '').trim() === '') {
          return {
            lines: [
              line('아직 채점표(약속 문장)가 없습니다 — promise 로 먼저 쓰세요.', 'warn'),
              line('  순서가 이 강의 전부예요: 채점표 먼저, 만들기는 그다음.', 'dim'),
            ],
          };
        }
        if (!state.flags.sawRed) {
          return {
            lines: [
              line('만들기 전에 check 를 한 번 치세요 — 빨강을 먼저 봐야 해요.', 'warn'),
              line('  빨강을 안 보고 만들면, 초록이 «약속 덕»인지 «원래 그런 건지» 알 수 없어요.', 'dim'),
            ],
          };
        }
        return {
          lines: [
            line(MINI_REPLAY_LABEL, 'dim'),
            line('시킵니다… 기능을 만드는 중…', 'warn'),
            line('  만들었습니다. 이제 스스로 «다 됐어요»라고 말하고 있어요.', 'dim'),
            line(''),
            line('믿을까요? 아니요 — check 로 내 채점표에 넣어 봅니다.', 'ok'),
          ],
          flags: { built: true },
        };
      },
    },
  ],
  missions: [
    {
      label: '채점표 없는 검사 보기',
      goal: 'check — 채점표가 없을 때 «다 됐어요»가 왜 못 미더운지 봅니다.',
      nextCommand: () => 'check',
      done: (state) => Boolean(state.flags.checkedEmpty),
    },
    {
      label: '견본 열어 보기',
      goal: 'sample — 약속 문장 네 칸의 모양을 견본으로 봅니다.',
      nextCommand: () => 'sample',
      done: (state) => Boolean(state.flags.sawSample),
    },
    {
      label: '내 채점표 쓰고 빨강 보기',
      goal: 'promise 로 약속 문장을 쓰고, check — 아직 안 만들었으니 빨강이 나옵니다. 그게 정상이에요.',
      nextCommand: (state) => (String(state.flags.promiseText ?? '').trim() === '' ? 'promise' : 'check'),
      done: (state) => Boolean(state.flags.sawRed),
    },
    {
      label: '시키고 초록 보기',
      goal: 'build 로 시키고, check — 빨강이 초록으로 바뀌는 한 바퀴를 완성합니다.',
      nextCommand: (state) => (state.flags.built ? 'check' : 'build'),
      done: (state) => Boolean(state.flags.sawGreen),
    },
  ],
  qaMissionSpans: {
    ch21_q01: { from: 1, to: 1 },
    ch21_q02: { from: 2, to: 2 },
    ch21_q03: { from: 3, to: 3 },
    ch21_q04: { from: 4, to: 4 },
  },
  askFallbacks: [],
};
