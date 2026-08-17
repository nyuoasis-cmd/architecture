import { MINI_REPLAY_LABEL, line, type MiniLab } from '../../lib/mini-lab';

/**
 * 11강(ch11) 미니 실습실 — 「AI에게 일을 시킨다는 것」. 비유 = 전학생에게 부탁하기.
 *
 * 🚨 이 강은 **AI 가 «필수»인 유일한 강**이다(MAP 공통 규칙 1) — `ask` 는 실제 호출이고,
 *    장애 시 검수된 대체 응답 풀(askFallbacks)로 수업이 이어진다. 라벨은 화면이 붙인다.
 * 🔑 미션 판정에 쓰는 askAnswered 는 «답을 실제로 받은 횟수»다(MiniLabTab 이 센다) —
 *    명령을 친 횟수가 아니다(12강 실습실의 reviewDone 과 같은 교훈).
 */
const ASK_TARGET = 3;

export const CH11_MINI_LAB: MiniLab = {
  scopeId: 'ch11',
  chapterId: 11,
  homeLabel: '~/ai-실험실',
  aboutTitle: '이 실습실에 대하여',
  aboutLines: [
    '여기는 AI 에게 부탁을 보내 보는 실험실입니다.',
    '',
    '  진짜      ask 로 보내는 부탁. 실제 AI 가 답합니다.',
    '  사전 생성 tokens · memory 의 출력. REPLAY 라벨이 붙어 있습니다.',
    '  줄인 것   셸 그 자체. help 에 있는 명령만 알아듣습니다.',
  ],
  commands: [
    {
      name: 'ask',
      usage: '<부탁>',
      what: 'AI 에게 부탁을 보낸다 (같은 부탁을 여러 번 보내 보세요)',
      run: (args) => {
        const request = args.trim();
        if (request.length < 2) {
          return { lines: [line('무엇을 부탁할지 이어서 적어 주세요. 예) ask 학급 안내문 써 줘', 'bad')] };
        }
        return {
          lines: [line('AI 에게 보냅니다. (실제로 부릅니다)', 'warn')],
          effect: { kind: 'ask', text: request },
        };
      },
    },
    {
      name: 'tokens',
      usage: '',
      what: 'AI 가 문장을 어떤 조각으로 만드는지 본다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('문장: "내일 체육대회가 열립니다"'),
          line(''),
          line('AI 가 이 문장을 만든 순서 (조각을 하나씩 고른다):'),
          line('  [내일] → [ 체육] → [대회] → [가] → [ 열립] → [니다]', 'ok'),
          line(''),
          line('각 칸에서 AI 는 «다음에 올 법한 조각»을 확률로 골랐습니다.', 'dim'),
          line('  [내일] 다음 후보: " 체육"(41%) · " 학예"(23%) · " 급식"(11%) …', 'dim'),
          line('갈림길에서 다른 조각을 고르면 — 그게 «같은 부탁, 다른 답»의 정체입니다.'),
        ],
        flags: { sawTokens: true },
      }),
    },
    {
      name: 'compare',
      usage: '',
      what: '받은 답들을 나란히 놓고 무엇이 흔들렸는지 본다',
      run: (_args, state) => {
        const answered = Number(state.flags.askAnswered ?? 0);
        if (answered < 2) {
          return {
            lines: [
              line('비교할 답이 아직 부족합니다 — ask 로 같은 부탁을 두 번 이상 보내 보세요.', 'warn'),
            ],
          };
        }
        return {
          lines: [
            line('방금 받은 답들을 떠올리며 세 칸을 비교해 보세요:'),
            line(''),
            line('  흔들리는 것   말투 · 문장 순서 · 인사말 · 길이', 'warn'),
            line('  흔들리면 안 되는 것   날짜 · 숫자 · 해야 할 일 같은 «사실»', 'ok'),
            line(''),
            line('사실이 흔들렸다면 그건 스타일 차이가 아니라 «지어냄»입니다.'),
            line('  어느 쪽이 흔들렸는지는 📝 퀴즈가 물어봅니다.', 'dim'),
          ],
          flags: { compared: true },
        };
      },
    },
    {
      name: 'memory',
      usage: '',
      what: 'AI 가 긴 대화에서 규칙을 어디까지 기억하는지 본다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('실험 기록 — 첫머리에 규칙을 주고, 한참 다른 이야기를 한 대화입니다:'),
          line(''),
          line('  나: 앞으로 대답은 항상 두 줄로 해 줘'),
          line('  AI: 네, 두 줄로 답할게요. / 편하게 물어보세요.', 'ok'),
          line('  (…다른 질문 12개를 주고받음…)', 'dim'),
          line('  나: 오늘 급식 메뉴 추천해 줘'),
          line('  AI: 오늘같이 쌀쌀한 날엔 국물이 있는 메뉴가 좋아요. 순두부찌개는 단백질이', 'bad'),
          line('      풍부하고… (다섯 줄로 답함 — 규칙이 밀려났다)', 'bad'),
          line(''),
          line('책상이 좁아서 서류가 밀려 떨어진 것과 같습니다. 그래서 중요한 규칙은'),
          line('«맨 처음 한 번»이 아니라 **부탁할 때마다** 담아야 안전합니다.'),
        ],
        flags: { sawMemory: true },
      }),
    },
    {
      name: 'brief',
      usage: '',
      what: '오늘 본 것을 한 장으로 정리한다',
      run: () => ({
        lines: [
          line('오늘 직접 본 것', 'warn'),
          line('  1. 같은 부탁 → 다른 답 (갈림길에서 다른 조각을 고른다)'),
          line('  2. 흔들려도 되는 것(말투)과 안 되는 것(사실)이 다르다'),
          line('  3. 긴 대화에서는 앞의 규칙이 밀려난다'),
          line(''),
          line('그럼 매번 다르게 알아듣는 상대에게 일을 어떻게 시킬까요?'),
          line('  → 12강(왜 하네스인가)이 그 답 — «적어 두기»를 만듭니다.', 'ok'),
        ],
        flags: { briefed: true },
      }),
    },
  ],
  missions: [
    {
      label: '같은 부탁 세 번 보내기',
      goal: `ask 학급 안내문 써 줘 — 같은 부탁을 ${ASK_TARGET}번 보내고, 답이 매번 어떻게 다른지 보세요.`,
      nextCommand: () => 'ask 학급 안내문 써 줘',
      done: (state) => Number(state.flags.askAnswered ?? 0) >= ASK_TARGET,
    },
    {
      label: '조각 만들기 구경하기',
      goal: 'tokens 로 AI 가 문장을 조각으로 만드는 장면을 보세요 — «다른 답»이 나오는 갈림길이 보입니다.',
      nextCommand: () => 'tokens',
      done: (state) => Boolean(state.flags.sawTokens),
    },
    {
      label: '흔들린 칸 가르기',
      goal: 'compare 로 받은 답들을 비교하세요 — 흔들려도 되는 것과 안 되는 것을 가릅니다.',
      nextCommand: () => 'compare',
      done: (state) => Boolean(state.flags.compared),
    },
    {
      label: '기억 실험 보기',
      goal: 'memory 로 긴 대화에서 규칙이 밀려나는 장면을 보세요.',
      nextCommand: () => 'memory',
      done: (state) => Boolean(state.flags.sawMemory),
    },
    {
      label: '오늘 본 것 정리',
      goal: 'brief 로 오늘 본 세 가지를 정리하고, 다음 강(12강)이 무엇을 해결하는지 보세요.',
      nextCommand: () => 'brief',
      done: (state) => Boolean(state.flags.briefed),
    },
  ],
  qaMissionSpans: {
    ch11_q01: { from: 1, to: 1 },
    ch11_q02: { from: 2, to: 2 },
    ch11_q03: { from: 3, to: 3 },
    ch11_q04: { from: 4, to: 4 },
    ch11_q05: { from: 5, to: 5 },
  },
  // 🚨 AI «필수» 강의 안전망 — 검수된 학급 안내문 3종. 서로 달라야 «세 다른 답» 체험이 유지된다.
  askFallbacks: [
    '학부모님께.\n다음 주 화요일 체육대회가 열립니다. 학생들은 체육복을 입고 등교해 주세요.\n점심은 학교에서 제공합니다.',
    '안녕하세요, 우리 반 알림입니다!\n🏃 체육대회: 다음 주 화요일\n👕 준비물: 체육복, 물통\n🍱 점심 제공됩니다. 응원 많이 와 주세요!',
    '가정통신문\n1. 일시: 다음 주 화요일 오전 9시\n2. 내용: 교내 체육대회\n3. 준비물: 체육복, 물통\n4. 기타: 점심은 학교에서 제공하며, 우천 시 강당에서 진행합니다.',
  ],
};
