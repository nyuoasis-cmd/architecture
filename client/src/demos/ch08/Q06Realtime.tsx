import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  lanes: string[][];
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  oneshot: {
    title: '단발 요청은 물어보고 답을 받으면 연결이 끝난다',
    summary: '전화 한 통처럼 필요한 순간 요청하고 응답을 받은 뒤 종료하는 방식이 HTTP 기본 감각입니다. 문서 조회나 일반 API 호출에 자연스럽습니다.',
    active: 0,
    lanes: [
      ['한 번 요청', '한 번 응답'],
      ['request/response', '연결 종료'],
      ['문서 조회', '일반 API 호출'],
    ],
    note: 'HTTP는 기본적으로 단발 요청에 잘 맞습니다. 상태 변화가 잦지 않은 화면에서는 가장 단순하고 운영하기 쉬운 선택입니다.',
    logs: [
      ['21:02:01', 'GET /feed 요청 전송'],
      ['21:02:02', '서버 응답 200 반환'],
      ['21:02:03', '연결 종료'],
    ],
  },
  polling: {
    title: '폴링은 바뀌었는지 주기적으로 다시 묻는 방식이다',
    summary: '우체통을 몇 분마다 열어 보듯, 폴링은 클라이언트가 일정 주기로 새 데이터가 있는지 다시 확인합니다. 구현은 쉽지만 불필요한 요청이 늘 수 있습니다.',
    active: 1,
    lanes: [
      ['주기 확인', '변화 여부 재질문'],
      ['반복 HTTP', 'idle 요청 발생'],
      ['상태 체크', '갱신 간격 필요'],
    ],
    note: '폴링은 실시간이 아주 엄격하지 않을 때 현실적인 절충안입니다. 다만 바뀐 것이 없어도 계속 확인하므로 요청 수를 관리해야 합니다.',
    logs: [
      ['21:03:01', '5초 간격 폴링 시작'],
      ['21:03:06', '변경 없음 304 응답'],
      ['21:03:11', '새 알림 1건 수신'],
    ],
  },
  bidirectional: {
    title: '양방향 연결은 서버와 클라이언트가 동시에 말을 건넬 수 있다',
    summary: '대화를 계속 이어 놓은 무전기처럼, WebSocket은 연결을 유지한 채 양쪽이 필요할 때마다 메시지를 보낼 수 있습니다. 채팅과 실시간 협업에 잘 맞습니다.',
    active: 2,
    lanes: [
      ['연결 유지', '즉시 밀어주기'],
      ['WebSocket', '양쪽 송수신'],
      ['채팅', '실시간 협업'],
    ],
    note: '양방향 WS는 가장 실시간성이 좋지만, 연결 유지 비용과 운영 복잡도도 함께 커집니다. 정말 즉시성이 필요한 화면에 선택해야 합니다.',
    logs: [
      ['21:04:01', 'WS upgrade 성공'],
      ['21:04:02', 'server push 메시지 전달'],
      ['21:04:03', 'client ack 이벤트 회신'],
    ],
  },
  usecase: {
    title: '전달 방식은 기술 유행보다 화면 요구에 맞춰 골라야 한다',
    summary: '모든 기능에 가장 강한 실시간 연결이 필요한 것은 아닙니다. 조회 중심이면 HTTP, 느슨한 갱신이면 폴링, 즉시 상호작용이면 WebSocket이 더 알맞습니다.',
    active: 3,
    lanes: [
      ['즉시성', '구현 난도', '트래픽'],
      ['HTTP vs 폴링 vs WS', '요구별 선택'],
      ['문서/알림/채팅', '상황별 매핑'],
    ],
    note: '실시간 기술은 하나가 정답이 아니라 요구와 비용의 균형 문제입니다. 데이터를 얼마나 자주, 어느 방향으로, 얼마나 즉시 보내야 하는지가 선택 기준입니다.',
    logs: [
      ['21:05:01', '문서 조회는 HTTP 선택'],
      ['21:05:02', '대시보드 갱신은 폴링 유지'],
      ['21:05:03', '채팅 채널은 WS 연결 사용'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.SubmitIcon />, label: '단발', sub: '한 번 요청' },
  { icon: <Icons.PollingIcon />, label: '폴링', sub: '주기 확인' },
  { icon: <Icons.ShareIcon />, label: '양방향', sub: '동시 송수신' },
  { icon: <Icons.DecisionIcon />, label: '사례', sub: '적합 선택' },
];

const IT = [
  { icon: <Icons.HttpRequestIcon />, label: '단발 HTTP', sub: 'req/res' },
  { icon: <Icons.PollingIcon />, label: '폴링', sub: 'long poll' },
  { icon: <Icons.SignalIcon />, label: '양방향 WS', sub: 'WebSocket' },
  { icon: <Icons.TeamRuleIcon />, label: '적합 사례', sub: 'chat/feed' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q06Realtime({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.oneshot;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="실시간 연결 방식" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="연결 감각"
        itTitle="전달 방식"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">실시간 선택 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 장면', '네트워크 동작', '잘 맞는 곳'];
            return (
              <div
                key={titles[index]}
                className="rounded-2xl border p-3 transition"
                style={{
                  minHeight: 120,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  {titles[index]}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border px-2.5 py-2 text-[11px] leading-[1.5]"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="mt-3 rounded-2xl border px-3 py-2.5 text-[12px] leading-[1.7]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--demo-card-bg-alt)',
            color: 'var(--demo-summary-text-stone)',
          }}
        >
          {scene.note}
        </div>
      </section>

      <LogBox logs={scene.logs} variant="blue" title="실시간 전달 로그" />
    </div>
  );
}
