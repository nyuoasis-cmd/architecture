import { line, type MiniLab } from '../../lib/mini-lab';

/**
 * 23강(ch23) 미니 실습실 — 「종합 = 졸업」의 터미널 쪽 절반. 비유 = 졸업 전시회.
 *
 * 흐름: map(산출물이 어디서 왔는지) → bundle(서버 계보에서 5종을 불러 묶음) →
 *       빠진 칸이 있으면 그 강으로 돌아가는 문 → 완성 시 졸업 전시 잠금 해제(전시는 화면 절반).
 * 🚨 bundle 의 판정은 **서버가** 한다(저장된 계보로) — 화면이 «다 있다»고 지어내지 않는다.
 */
export const CH23_MINI_LAB: MiniLab = {
  scopeId: 'ch23',
  chapterId: 23,
  homeLabel: '~/졸업',
  aboutTitle: '이 실습실에 대하여 — 졸업 전시회 준비',
  aboutLines: [
    '한 학기 동안 만든 것 다섯 장을 한 묶음으로 조립합니다. 다 모이면 전시가 열립니다.',
    '',
    '  진짜      bundle 의 판정. 서버에 실제로 저장된 여러분의 산출물로 셉니다.',
  ],
  commands: [
    {
      name: 'map',
      usage: '',
      what: '다섯 산출물이 어느 강에서 왔는지 지도를 본다',
      run: () => ({
        lines: [
          line('산출물 지도 — 각 장이 태어난 자리:', 'warn'),
          line('  1. 우리 반 규칙 한 장     ← 12강 (왜 하네스인가)'),
          line('  2. 스킬 한 개            ← 13강 (나만의 스킬)'),
          line('  3. 완료 조건 한 벌        ← 16강 (기획·이슈)'),
          line('  4. 약속 문장 한 개        ← 19강 (TDD 한 바퀴)'),
          line('  5. 넘김 쪽지 한 장        ← 22강 (커밋·PR)'),
          line(''),
          line('다섯 장이 열쇠예요 — 다 모이면 bundle 로 묶고, 전시가 열립니다.', 'dim'),
        ],
        flags: { sawMap: true },
      }),
    },
    {
      name: 'bundle',
      usage: '',
      what: '서버에 저장된 내 산출물 다섯 장을 불러와 한 묶음으로 조립한다',
      run: () => ({
        lines: [line('서버에서 내 산출물을 불러옵니다…', 'warn')],
        effect: { kind: 'bundle' },
      }),
    },
    {
      name: 'exhibit',
      usage: '',
      what: '졸업 전시를 연다 (묶음이 완성돼야 열린다)',
      run: (_args, state) => {
        if (!state.flags.exhibitOpen) {
          return {
            lines: [
              line('전시는 아직 잠겨 있습니다 — 다섯 장이 다 모여야 열려요.', 'warn'),
              line('  bundle 로 무엇이 비었는지 확인해 보세요.', 'dim'),
            ],
          };
        }
        return {
          lines: [
            line('🎓 전시가 열렸습니다 — 터미널 아래에 «내 저장소»가 펼쳐졌어요.', 'ok'),
            line('  화면을 옆 짝꿍에게 보여 주세요. 그게 이 수업의 마지막 미션입니다.', 'dim'),
          ],
          flags: { exhibitViewed: true },
        };
      },
    },
  ],
  missions: [
    {
      label: '산출물 지도 보기',
      goal: 'map — 다섯 산출물이 어느 강에서 왔는지 봅니다.',
      nextCommand: () => 'map',
      done: (state) => Boolean(state.flags.sawMap),
    },
    {
      label: '묶어 보고 빈 칸 찾기',
      goal: 'bundle — 서버에 저장된 내 산출물을 불러와 봅니다. 빠진 칸이 있으면 그 강으로 돌아가는 문이 열립니다.',
      nextCommand: () => 'bundle',
      done: (state) => Boolean(state.flags.bundleTried),
    },
    {
      label: '다섯 장 완성하기',
      goal: '빠진 칸의 강으로 다녀와 채우고, 다시 bundle — 다섯 장이 모이면 묶음이 완성됩니다.',
      nextCommand: () => 'bundle',
      done: (state) => Boolean(state.flags.exhibitOpen),
    },
    {
      label: '졸업 전시 열기',
      goal: 'exhibit — 내 저장소 전시를 열고, 짝꿍에게 보여 주세요.',
      nextCommand: () => 'exhibit',
      done: (state) => Boolean(state.flags.exhibitViewed),
    },
  ],
  qaMissionSpans: {
    ch23_q01: { from: 1, to: 1 },
    ch23_q02: { from: 2, to: 2 },
    ch23_q03: { from: 3, to: 3 },
    ch23_q04: { from: 4, to: 4 },
  },
  askFallbacks: [],
};
