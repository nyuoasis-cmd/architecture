import { MINI_REPLAY_LABEL, line, type MiniLab } from '../../lib/mini-lab';

/**
 * 5강(ch05) 미니 실습실 — 「보이는 쪽과 안 보이는 쪽」, «이 페이지 X-ray».
 * 비유 = 식당의 홀(화면)과 주방(서버). X-ray = 주방 창문 (카드 5강, 8강과 부품 공유).
 *
 * 🔑 진실성 — menu 가 그리는 화면과 curl 이 받는 JSON 은 **같은 데이터**다. «이 제목이 저 칸»이
 *    거짓말이 되지 않게, 화면도 JSON 도 아래 MENU 하나에서 나온다.
 * 🔑 q5~q7 은 카드 확정대로 견학 미션을 유지한다(부분 적용 — partialNote).
 */
const MENU = {
  date: '10월 21일 화요일',
  main: '제육볶음',
  soup: '순두붓국',
  side: '김치·시금치나물',
};

export const CH05_MINI_LAB: MiniLab = {
  scopeId: 'ch05',
  chapterId: 5,
  homeLabel: '~/식당',
  aboutTitle: '이 실습실에 대하여 — 홀과 주방',
  aboutLines: [
    '식당의 홀(손님이 보는 화면)과 주방(요리가 만들어지는 곳)을 오가 봅니다.',
    '',
    '  진짜      menu 화면과 curl 의 JSON 은 같은 데이터에서 나옵니다 — 그래서 연결이 참말입니다.',
    '  사전 생성 kitchen · render 의 기록. REPLAY 라벨이 붙어 있습니다.',
  ],
  commands: [
    {
      name: 'menu',
      usage: '',
      what: '홀에서 본다 — 손님(학생)에게 보이는 급식 화면',
      run: () => ({
        lines: [
          line('┌─ 오늘의 급식 ─────────────┐'),
          line(`│  ${MENU.date}`),
          line(`│  메인   ${MENU.main}`, 'ok'),
          line(`│  국     ${MENU.soup}`),
          line(`│  반찬   ${MENU.side}`),
          line('└──────────────────────────┘'),
          line('  이게 «홀»이에요 — 손님은 예쁘게 차려진 접시만 봅니다.', 'dim'),
        ],
        flags: { sawHall: true },
      }),
    },
    {
      name: 'layers',
      usage: '',
      what: '같은 화면을 세 층(뼈대·모양·움직임)으로 갈라 본다',
      run: () => ({
        lines: [
          line('방금 그 급식 화면을 세 층으로 가르면:'),
          line(''),
          line('  뼈대(HTML)   «제목 하나, 메뉴 세 줄이 있다»', 'ok'),
          line('  모양(CSS)    «테두리를 두르고, 메인은 초록색으로»', 'warn'),
          line('  움직임(JS)   «날짜가 바뀌면 내용을 갈아끼운다»', 'ai'),
          line(''),
          line('한 언어로 셋을 다 하면 섞여서 못 고칩니다 — 역할이 달라서 언어도 셋이에요.', 'dim'),
        ],
        flags: { sawLayers: true },
      }),
    },
    {
      name: 'curl',
      usage: '/급식.json',
      what: '창구(API)로 직접 받아 본다 — 화면이 실제로 먹는 재료(JSON)',
      run: (args) => {
        const target = args.trim();
        if (target !== '/급식.json') {
          return {
            lines: [
              line(`${target || '(빈칸)'} — 이 실습실의 창구 목록에 없는 주소입니다.`, 'bad'),
              line('  열 수 있는 창구: /급식.json (오늘 배울 창구는 이 하나예요)', 'dim'),
            ],
          };
        }
        return {
          lines: [
            line('{'),
            line(`  "date": "${MENU.date}",`),
            line(`  "main": "${MENU.main}",`, 'ok'),
            line(`  "soup": "${MENU.soup}",`),
            line(`  "side": "${MENU.side}"`),
            line('}'),
            line(''),
            line('이게 «주방 창문(X-ray)»으로 본 모습이에요. menu 화면의 초록 글씨(메인)와', 'dim'),
            line(`위 JSON 의 "main" 칸이 같은 값이죠 — ${MENU.main}. 화면은 이 재료를 받아 차린 접시예요.`, 'dim'),
          ],
          flags: { xrayed: true },
        };
      },
    },
    {
      name: 'render',
      usage: '',
      what: '같은 화면을 «미리 그려 옴»과 «지금 그림» 두 방식으로 비교한다',
      run: () => ({
        lines: [
          line(MINI_REPLAY_LABEL, 'dim'),
          line('같은 급식 화면, 두 가지 그리는 시점:'),
          line(''),
          line('  방식 A — 주방에서 접시까지 다 차려서 내옴 (서버가 미리 그림)'),
          line('    손님: 받자마자 바로 먹음. 다만 주방이 매번 상을 차림', 'dim'),
          line('  방식 B — 재료(JSON)만 받고 홀에서 조립함 (브라우저가 지금 그림)'),
          line('    손님: 처음에 빈 접시가 잠깐 보임. 다음부터는 재료만 받아 빠름', 'dim'),
          line(''),
          line('둘 다 정답이 아니라 «상황에 맞는 선택»이에요 — 무엇이 급한지에 따라 갈립니다.'),
        ],
        flags: { sawRender: true },
      }),
    },
  ],
  missions: [
    {
      label: '홀에서 보기',
      goal: 'menu — 손님에게 보이는 화면(홀)을 먼저 봅니다.',
      nextCommand: () => 'menu',
      done: (state) => Boolean(state.flags.sawHall),
    },
    {
      label: '세 층으로 가르기',
      goal: 'layers — 같은 화면을 뼈대·모양·움직임 세 층으로 갈라 봅니다.',
      nextCommand: () => 'layers',
      done: (state) => Boolean(state.flags.sawLayers),
    },
    {
      label: '창구(API)로 직접 받기',
      goal: 'curl /급식.json — 화면이 실제로 먹는 재료를 주방 창문으로 직접 받아 봅니다.',
      nextCommand: () => 'curl /급식.json',
      done: (state) => Boolean(state.flags.xrayed),
    },
    {
      label: '그리는 시점 비교하기',
      goal: 'render — 같은 화면을 «미리 그려 옴»과 «지금 그림»으로 비교합니다.',
      nextCommand: () => 'render',
      done: (state) => Boolean(state.flags.sawRender),
    },
  ],
  qaMissionSpans: {
    ch05_q01: { from: 1, to: 1 },
    ch05_q02: { from: 2, to: 2 },
    ch05_q03: { from: 3, to: 3 },
    ch05_q04: { from: 4, to: 4 },
  },
  // 카드 5강 확정: q5(상태 맞추기)·q6(라이브러리)·q7(빌드)은 견학 미션을 유지한다.
  partialNote: '카드 5강 — q5~q7 은 견학 미션 유지(체험 탭이 견학으로 선다)',
  askFallbacks: [],
};
