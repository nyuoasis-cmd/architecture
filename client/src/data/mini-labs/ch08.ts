import { MINI_REPLAY_LABEL, line, type MiniLab, type MiniRunResult } from '../../lib/mini-lab';

/**
 * 8강(ch08) 미니 실습실 — 「인터넷 너머의 보이지 않는 길」.
 * 비유 = 택배: 주소(DNS)·포장(https)·가까운 물류창고(CDN) (카드 8강).
 * 🚨 응답은 전부 사전 생성 + REPLAY 라벨 — 실습실이 진짜 바깥 네트워크를 부르지 않는다.
 * 🔑 q1(길찾기)·q5(차단/보호 통로)·q7 은 카드 확정대로 견학 미션 유지(partialNote).
 */
export const CH08_MINI_LAB: MiniLab = {
  scopeId: 'ch08',
  chapterId: 8,
  homeLabel: '~/네트워크',
  aboutTitle: '이 실습실에 대하여 — 택배의 길',
  aboutLines: [
    '요청이 나가고 응답이 돌아오는 길을 명령으로 짚어 봅니다.',
    '',
    '  사전 생성 이 실습실의 모든 응답. 진짜 바깥 네트워크를 부르지 않아서,',
    '            출력마다 REPLAY 라벨이 붙어 있습니다.',
  ],
  commands: [
    {
      name: 'curl',
      usage: 'http(s)://…',
      what: '주소로 요청을 보내 본다 — 포장(https) 유무를 비교해 보세요',
      run: (args): MiniRunResult => {
        const target = args.trim();
        if (target.startsWith('https://')) {
          return {
            lines: [
              line(MINI_REPLAY_LABEL, 'dim'),
              line(`${target} 에 보냈습니다.`),
              line('  🔒 포장됨 — 내용이 자물쇠 상자에 담겨 갑니다. 지나가는 길에서 못 읽어요.', 'ok'),
              line('  응답: 200 (잘 받았고, 답장을 보냈어요)'),
            ],
            flags: { curlHttps: true },
          };
        }
        if (target.startsWith('http://')) {
          return {
            lines: [
              line(MINI_REPLAY_LABEL, 'dim'),
              line(`${target} 에 보냈습니다.`),
              line('  ⚠️ 포장 안 됨 — 내용이 맨몸으로 갑니다. 지나가는 길목마다 읽힐 수 있어요.', 'bad'),
              line('  브라우저가 「주의 요함」을 띄우는 이유가 이거예요.', 'dim'),
            ],
            flags: { curlHttp: true },
          };
        }
        return {
          lines: [
            line('주소를 http:// 또는 https:// 로 시작해 주세요. 예) curl http://우리학교.kr', 'bad'),
          ],
        };
      },
    },
    {
      name: 'lookup',
      usage: '<이름>',
      what: '이름(주소)을 숫자 번지로 바꿔 본다 — 택배의 주소 찾기(DNS)',
      run: (args) => {
        const name = args.trim() || 'youtube.com';
        return {
          lines: [
            line(MINI_REPLAY_LABEL, 'dim'),
            line(`${name} 의 번지를 물어봅니다…`),
            line(`  ${name}  →  208.65.153.238`, 'ok'),
            line(''),
            line('우리는 이름(youtube.com)으로 부르지만, 택배 기사(네트워크)는 숫자 번지로 갑니다.', 'dim'),
            line('이름→번지를 바꿔 주는 전화번호부가 DNS 예요.', 'dim'),
          ],
          flags: { lookedUp: true },
        };
      },
    },
    {
      name: 'ping',
      usage: '서울|미국',
      what: '가까운 창고와 먼 창고의 왕복 시간을 잰다',
      run: (args): MiniRunResult => {
        const where = args.trim();
        if (where === '서울') {
          return {
            lines: [
              line(MINI_REPLAY_LABEL, 'dim'),
              line('서울의 창고까지 왕복:'),
              line('  1번째  4ms   2번째  5ms   3번째  4ms', 'ok'),
            ],
            flags: { pingSeoul: true },
          };
        }
        if (where === '미국') {
          return {
            lines: [
              line(MINI_REPLAY_LABEL, 'dim'),
              line('미국의 창고까지 왕복:'),
              line('  1번째  182ms   2번째  179ms   3번째  185ms', 'warn'),
              line(''),
              line('40배쯤 멀어요. 그래서 큰 서비스는 «가까운 물류창고(CDN)»에 복사본을 둡니다 —', 'dim'),
              line('유튜브가 한국에서 빠른 진짜 비결이에요.', 'dim'),
            ],
            flags: { pingUs: true },
          };
        }
        return { lines: [line('서울 또는 미국 중에서 골라 주세요. 예) ping 서울', 'bad')] };
      },
    },
    {
      name: 'live',
      usage: '',
      what: '메시지가 «즉시» 오는 길(붙잡아 둔 전화선)을 본다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('보통의 요청은 «묻고 → 답 받고 → 끊기»입니다. 그런데 메신저는:'),
          line(''),
          line('  10:03:00  전화선을 연결해 둠 (끊지 않는다)', 'ok'),
          line('  10:07:41  상대가 보냄 → 그 선으로 즉시 도착', 'ok'),
          line('  10:07:41  화면에 뜸 (0.1초)'),
          line(''),
          line('매번 «새 편지 왔나요?»라고 묻지 않고, 선을 붙잡아 두고 오면 바로 받아요.', 'dim'),
        ],
        flags: { sawLive: true },
      }),
    },
  ],
  missions: [
    {
      label: '포장 유무 비교하기',
      goal: 'curl http://우리학교.kr 와 curl https://우리학교.kr — 포장 안 된 상자와 자물쇠 상자를 비교합니다.',
      nextCommand: (state) => (state.flags.curlHttp ? 'curl https://우리학교.kr' : 'curl http://우리학교.kr'),
      done: (state) => Boolean(state.flags.curlHttp) && Boolean(state.flags.curlHttps),
    },
    {
      label: '이름을 번지로 바꿔 보기',
      goal: 'lookup youtube.com — 이름이 숫자 번지로 바뀌는 것(DNS)을 봅니다.',
      nextCommand: () => 'lookup youtube.com',
      done: (state) => Boolean(state.flags.lookedUp),
    },
    {
      label: '가까운 창고 vs 먼 창고',
      goal: 'ping 서울 과 ping 미국 — 왕복 시간이 왜 다른지 숫자로 봅니다.',
      nextCommand: (state) => (state.flags.pingSeoul ? 'ping 미국' : 'ping 서울'),
      done: (state) => Boolean(state.flags.pingSeoul) && Boolean(state.flags.pingUs),
    },
    {
      label: '즉시 도착의 비밀 보기',
      goal: 'live — 메시지가 즉시 오는 길(붙잡아 둔 선)을 봅니다.',
      nextCommand: () => 'live',
      done: (state) => Boolean(state.flags.sawLive),
    },
  ],
  qaMissionSpans: {
    ch08_q02: { from: 1, to: 1 },
    ch08_q03: { from: 2, to: 2 },
    ch08_q04: { from: 3, to: 3 },
    ch08_q06: { from: 4, to: 4 },
  },
  // 카드 8강 확정: q1(길찾기)·q5(차단/보호 통로)·q7(보안 습관)은 견학 미션 유지.
  partialNote: '카드 8강 — q1·q5·q7 은 견학 미션 유지(체험 탭이 견학으로 선다)',
  askFallbacks: [],
};
