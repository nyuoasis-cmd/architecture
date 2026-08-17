import { MINI_REPLAY_LABEL, line, type MiniLab } from '../../lib/mini-lab';

/**
 * 1강(ch01) 미니 실습실 — 「컴퓨터가 1초 안에 하는 일」. 첫 터미널 인사, 총 3분대.
 * 비유 = 라면 끓이기(재료→불→그릇). 셸 숙달이 아니라 «큰 그림»이 목표(카드 1강).
 * 🔑 AI 는 여기 등장하지 않는다 — AI 는 11강에서 처음 명명된다(카드: AI 등장 최소).
 */
export const CH01_MINI_LAB: MiniLab = {
  scopeId: 'ch01',
  chapterId: 1,
  homeLabel: '~',
  aboutTitle: '첫 터미널 인사',
  aboutLines: [
    '여기는 컴퓨터에게 «글자로» 말을 거는 창입니다. 오늘은 서너 마디만 해 봅니다.',
    '',
    '  진짜      echo · date 의 답. 지금 이 순간의 진짜 값입니다.',
    '  사전 생성 apps · trace 의 출력. REPLAY 라벨이 붙어 있습니다.',
  ],
  commands: [
    {
      name: 'echo',
      usage: '<아무 말>',
      what: '친 것을 컴퓨터가 받아 그대로 돌려준다 (입력→처리→출력 한 바퀴)',
      run: (args) => {
        const said = args.trim();
        if (said === '') {
          return { lines: [line('따라 할 말을 이어서 적어 주세요. 예) echo 안녕', 'bad')] };
        }
        return {
          lines: [
            line(said),
            line('  방금 일어난 일 — 입력(친 글자) → 처리(받아서 다듬음) → 출력(돌려줌). 이게 한 바퀴예요.', 'dim'),
          ],
          flags: { echoed: true },
        };
      },
    },
    {
      name: 'date',
      usage: '',
      what: '컴퓨터 속 시계(부품)에게 지금 시각을 물어본다',
      run: () => ({
        lines: [
          line(new Date().toLocaleString('ko-KR')),
          line('  이 값은 진짜예요 — 이 기기의 시계 부품이 지금 알려 준 값입니다.', 'dim'),
          line('  date 는 «명령»이고, 시계는 «부품»이에요. 명령이 부품에게 심부름을 다녀왔어요.', 'dim'),
        ],
        flags: { sawDate: true },
      }),
    },
    {
      name: 'cal',
      usage: '',
      what: '같은 시계 부품으로 이번 달 달력을 그려 본다',
      run: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const first = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const rows: string[] = [];
        let row = '   '.repeat(first);
        for (let day = 1; day <= days; day += 1) {
          row += String(day).padStart(2, ' ') + ' ';
          if ((first + day) % 7 === 0) {
            rows.push(row);
            row = '';
          }
        }
        if (row.trim() !== '') rows.push(row);
        return {
          lines: [
            line(`      ${year}년 ${month + 1}월`),
            line('일 월 화 수 목 금 토', 'dim'),
            ...rows.map((text) => line(text)),
            line('  같은 시계 부품인데, 명령이 다르면(date/cal) 그릇에 담기는 모양이 달라요.', 'dim'),
          ],
          flags: { sawCal: true },
        };
      },
    },
    {
      name: 'apps',
      usage: '',
      what: '한 컴퓨터에서 «동시에 살아 있는 앱»의 한 순간을 본다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('어느 컴퓨터의 한 순간 — 동시에 살아 있는 프로그램들:'),
          line('  이름            하는 일             메모리'),
          line('  브라우저        이 화면을 그리는 중   612MB'),
          line('  음악 앱         노래 재생 중          148MB'),
          line('  메신저          새 메시지 기다리는 중  95MB'),
          line('  (그리고 화면에 안 보이는 심부름꾼 40여 개)', 'dim'),
          line(''),
          line('이 여럿이 안 부딪히게 순서와 자리를 정리해 주는 프로그램이 있어요 —'),
          line('운영체제(OS)입니다. 반장이 아니라 «교실 그 자체를 관리하는 담당»이에요.'),
        ],
        flags: { sawApps: true },
      }),
    },
    {
      name: 'trace',
      usage: '클릭',
      what: '클릭 한 번이 어디까지 다녀오는지 왕복 경로를 본다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('클릭 한 번의 왕복 (0.3초 동안 일어난 일):'),
          line('  1. 손가락  → 마우스가 «눌렸다» 신호를 보냄'),
          line('  2. 컴퓨터  → 어느 버튼이 눌렸는지 알아냄'),
          line('  3. 인터넷  → 요청이 바다 건너 서버까지 감', 'warn'),
          line('  4. 서버    → 필요한 데이터를 찾아 답장을 쌈'),
          line('  5. 인터넷  → 답장이 되돌아옴', 'warn'),
          line('  6. 화면    → 받은 것을 그려서 보여 줌'),
          line(''),
          line('여러분이 1초 안에 본 «클릭 → 화면 바뀜» 사이에 이 여섯 걸음이 있었어요.'),
          line('이 수업 전체가 이 여섯 걸음을 한 칸씩 확대해 보는 여행입니다.', 'ok'),
        ],
        flags: { traced: true },
      }),
    },
  ],
  missions: [
    {
      label: '컴퓨터에게 말 걸기',
      goal: 'echo 안녕 — 친 것이 처리돼 돌아오는 «입력→처리→출력» 한 바퀴를 봅니다.',
      nextCommand: () => 'echo 안녕',
      done: (state) => Boolean(state.flags.echoed),
    },
    {
      label: '부품에게 심부름 보내기',
      goal: 'date 와 cal — 같은 시계 부품에 다른 명령 둘을 보내 봅니다.',
      nextCommand: (state) => (state.flags.sawDate ? 'cal' : 'date'),
      done: (state) => Boolean(state.flags.sawDate) && Boolean(state.flags.sawCal),
    },
    {
      label: '동시에 사는 앱들 보기',
      goal: 'apps — 한 컴퓨터에서 동시에 살아 있는 앱들과, 그걸 정리하는 담당(OS)을 봅니다.',
      nextCommand: () => 'apps',
      done: (state) => Boolean(state.flags.sawApps),
    },
    {
      label: '클릭 한 번의 왕복 보기',
      goal: 'trace 클릭 — 클릭 한 번이 다녀오는 여섯 걸음을 봅니다.',
      nextCommand: () => 'trace 클릭',
      done: (state) => Boolean(state.flags.traced),
    },
  ],
  qaMissionSpans: {
    ch01_q01: { from: 1, to: 1 },
    ch01_q02: { from: 2, to: 2 },
    ch01_q03: { from: 3, to: 3 },
    ch01_q04: { from: 4, to: 4 },
  },
  askFallbacks: [],
};
