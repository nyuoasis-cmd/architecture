import { Hero, Icons, LogBox, PairMatch, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  layers: string[];
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  auth: {
    title: '먼저 누구인지 확인해야 보호 규칙을 적용할 수 있다',
    summary: '출입증을 확인해야 문을 열어 줄지 결정할 수 있듯, 인증은 요청한 주체가 누구인지 확인하는 첫 단계입니다.',
    active: 0,
    layers: ['계정 확인', '세션 발급', '신원 기준 형성', '이후 권한 판단'],
    note: '인증은 보안의 시작점입니다. 누구인지 모르면 이후 암호화나 권한 규칙도 정확하게 적용할 수 없습니다.',
    logs: [
      ['21:12:01', 'login 요청 자격 증명 수신'],
      ['21:12:02', '사용자 신원 검증 완료'],
      ['21:12:03', '세션 토큰 발급'],
    ],
  },
  encrypt: {
    title: '내용은 보더라도 읽지 못하게 감싸야 이동 중 노출을 줄인다',
    summary: '봉투를 열기 전에는 내용을 읽을 수 없듯, 암호화는 전송 중이나 저장 중 데이터가 노출되더라도 바로 해석되지 않게 만듭니다.',
    active: 1,
    layers: ['내용 보호', '중간 노출 완화', '복호화 키 필요', '평문 노출 억제'],
    note: '암호화는 신원이 아니라 내용 보호를 담당합니다. 누가 봤는지보다, 봐도 바로 읽지 못하게 만드는 층입니다.',
    logs: [
      ['21:13:01', 'payload 암호화 적용'],
      ['21:13:02', '전송 구간 cipher suite 확인'],
      ['21:13:03', '복호화 키 검증 후 처리'],
    ],
  },
  isolate: {
    title: '민감한 구역은 서로 바로 들여다보지 못하게 나눠 둬야 한다',
    summary: '서버와 데이터베이스를 같은 복도에 모두 열어 두지 않듯, 격리는 네트워크와 시스템을 나눠 침입 범위를 줄이는 방식입니다.',
    active: 2,
    layers: ['망 분리', '직접 접근 차단', '피해 확산 축소', '가로 이동 제한'],
    note: '격리는 한 곳이 뚫려도 전체가 연쇄적으로 보이지 않게 만드는 장치입니다. 보안은 막는 것뿐 아니라 퍼지지 않게 나누는 일도 중요합니다.',
    logs: [
      ['21:14:01', 'db subnet 외부 접근 차단'],
      ['21:14:02', '내부 서비스만 허용 규칙 유지'],
      ['21:14:03', '격리 구간 lateral move 차단'],
    ],
  },
  least: {
    title: '필요한 만큼만 열어 두어야 실수와 남용의 범위를 줄일 수 있다',
    summary: '모든 창고 열쇠를 한 사람에게 주지 않듯, 최소 권한은 각 사용자와 서비스에 필요한 범위만 허용해 사고 영향을 줄입니다.',
    active: 3,
    layers: ['권한 최소화', '역할별 허용', '오남용 범위 축소', '불필요 권한 제거'],
    note: '최소 권한은 공격자만 막는 규칙이 아닙니다. 내부 실수나 과한 권한 부여가 만드는 사고까지 줄이는 운영 원칙입니다.',
    logs: [
      ['21:15:01', 'read only 역할 적용'],
      ['21:15:02', '관리자 권한 요청 거절'],
      ['21:15:03', '권한 과다 부여 경고 기록'],
    ],
  },
};

const TONE = getTone(8);

const METAPHOR = [
  { icon: <Icons.VerifyIcon />, label: '인증', sub: '신원 확인' },
  { icon: <Icons.CipherIcon />, label: '암호', sub: '내용 보호' },
  { icon: <Icons.IsolateMetaIcon />, label: '격리', sub: '서로 못 봄' },
  { icon: <Icons.OsLockIcon />, label: '최소', sub: '필요한 만큼' },
];

const IT = [
  { icon: <Icons.VerifyIcon />, label: '인증', sub: 'authenticate' },
  { icon: <Icons.TlsIcon />, label: '암호화', sub: 'encrypt' },
  { icon: <Icons.IsolationIcon />, label: '격리', sub: 'zone split' },
  { icon: <Icons.TeamRuleIcon />, label: '최소 권한', sub: 'least priv' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q07Security({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.auth;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="보안 기본 원칙" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="보호 감각"
        itTitle="보안 원칙"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">보안 층 점검</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {scene.layers.map((item, index) => {
            const active = scene.active === index;
            return (
              <div
                key={item}
                className="rounded-2xl border px-3 py-3 transition"
                style={{
                  minHeight: 108,
                  borderColor: active ? TONE.accent : 'var(--color-border)',
                  background: active ? TONE.accentSoft : 'var(--demo-card-bg-alt)',
                }}
              >
                <p
                  className="m-0 text-[11px] font-bold"
                  style={{ color: active ? TONE.accent : 'var(--color-text-muted)' }}
                >
                  점검 포인트 {index + 1}
                </p>
                <p className="mt-2 text-[12px] leading-[1.6]">{item}</p>
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

      <LogBox logs={scene.logs} variant="blue" title="보안 운영 로그" />
    </div>
  );
}
