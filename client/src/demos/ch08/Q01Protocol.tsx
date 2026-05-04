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
  ip: {
    title: '어디로 갈지 정하는 일은 길 찾기와 가깝다',
    summary: '네트워크에서 먼저 필요한 일은 목적지까지 경로를 잡는 것입니다. IP는 데이터를 어느 주소로 보낼지 정하는 표지판 역할을 맡습니다.',
    active: 0,
    lanes: [
      ['목적지 주소 확인', '중간 길 선택'],
      ['패킷에 주소 기록', '라우터가 다음 홉 결정'],
      ['도착 방향은 맞추되 전달 품질은 별도'],
    ],
    note: 'IP는 길을 정하는 규칙에 가깝습니다. 길을 안다고 해서 반드시 안전하거나 빠르게 도착하는 것은 아닙니다.',
    logs: [
      ['20:08:01', '목적지 IP 확인'],
      ['20:08:02', '라우팅 테이블 조회'],
      ['20:08:03', '다음 홉 전달'],
    ],
  },
  tcp: {
    title: '중요한 짐은 도착 확인까지 챙기는 편이 안전하다',
    summary: 'TCP는 보냈다고 끝내지 않고, 도착 확인과 순서 복원을 챙깁니다. 그래서 느릴 수는 있어도 신뢰가 필요한 통신에 잘 맞습니다.',
    active: 1,
    lanes: [
      ['보내고 확인 받기', '순서대로 재조립'],
      ['연결 설정', 'ACK 응답 확인'],
      ['유실 시 재전송으로 신뢰 보강'],
    ],
    note: 'TCP는 속도보다 정확성을 우선하는 선택입니다. 파일 전송이나 웹 문서처럼 빠짐없이 받아야 하는 데이터에 적합합니다.',
    logs: [
      ['20:09:01', 'SYN 전송'],
      ['20:09:02', 'ACK 수신 확인'],
      ['20:09:03', '재전송 타이머 설정'],
    ],
  },
  udp: {
    title: '가벼운 전달은 확인 절차를 줄여 더 빨라진다',
    summary: 'UDP는 연결을 길게 잡지 않고 바로 보냅니다. 일부 손실을 감수하더라도 지연을 줄이고 싶은 상황에서 강점이 드러납니다.',
    active: 2,
    lanes: [
      ['바로 던져 보내기', '확인 절차 생략'],
      ['비연결 전송', '순서 보장 없음'],
      ['손실 가능성 대신 지연 최소화'],
    ],
    note: 'UDP는 틀릴 수 없는 전달보다 늦지 않는 전달이 중요한 상황에 어울립니다. 실시간 음성이나 게임 상태 전송이 대표적입니다.',
    logs: [
      ['20:10:01', 'UDP datagram 생성'],
      ['20:10:02', '연결 없이 전송'],
      ['20:10:03', '수신 확인 생략'],
    ],
  },
  mix: {
    title: '길과 신뢰와 속도는 함께 보아야 전달 방식을 이해할 수 있다',
    summary: 'IP가 길을 잡고, TCP와 UDP가 전달 성격을 나눠 맡습니다. 같은 인터넷 위에서도 무엇을 우선하느냐에 따라 다른 조합이 선택됩니다.',
    active: 3,
    lanes: [
      ['길 찾기', '정확성', '지연'],
      ['IP 공통 기반', 'TCP/UDP 성격 분화'],
      ['서비스 목적에 따라 조합 선택'],
    ],
    note: '프로토콜은 경쟁 관계라기보다 역할 분담에 가깝습니다. 무엇을 보장해야 하는지가 선택 기준입니다.',
    logs: [
      ['20:11:01', '전달 요구 분석'],
      ['20:11:02', 'IP + TCP 조합 선택'],
      ['20:11:03', '실시간 경로는 UDP 후보 표시'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.PathIcon />, label: '길', sub: '경로' },
  { icon: <Icons.TrustIcon />, label: '신뢰', sub: '확인 통신' },
  { icon: <Icons.SpeedIcon />, label: '빠름', sub: '단방향' },
  { icon: <Icons.CompareIcon />, label: '함께', sub: '대조' },
];

const IT = [
  { icon: <Icons.IpIcon />, label: '주소 IP', sub: '경로 지정' },
  { icon: <Icons.TcpIcon />, label: '신뢰 TCP', sub: '연결 통신' },
  { icon: <Icons.UdpIcon />, label: '빠름 UDP', sub: '비연결' },
  { icon: <Icons.OverviewIcon />, label: '함께 보기', sub: '계층 비교' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q01Protocol({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.ip;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="네트워크 전달 기본" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="전달 감각"
        itTitle="프로토콜 역할"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">역할 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['생활 장면', '네트워크 동작', '해석'];
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

      <LogBox logs={scene.logs} variant="blue" title="전달 로그" />
    </div>
  );
}
