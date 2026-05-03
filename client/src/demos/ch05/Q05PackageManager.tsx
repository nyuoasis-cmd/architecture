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
  local: {
    title: '각 폴더가 따로 챙기면 무거워진다',
    summary:
      '프로젝트마다 필요한 패키지를 자기 폴더에 들고 있으면 독립성은 생기지만, 어디까지 설치됐는지와 어떤 버전을 쓰는지 파악하기가 어렵습니다.',
    active: 0,
    lanes: [
      ['팀원별 로컬 설치', '각자 node_modules 보관'],
      ['프로젝트마다 의존성 보유', '실행 환경은 독립 유지'],
      ['용량 증가', '상태 추적 어려움'],
    ],
    note:
      '패키지 관리는 눈에 보이지 않는 작업 환경을 정리하는 일입니다. 로컬 설치는 편리하지만, 기준점이 없으면 팀 전체 상태를 공유하기 어렵습니다.',
    logs: [
      ['15:20:01', 'client/node_modules 설치 완료'],
      ['15:20:02', 'server/node_modules 버전 차이 감지'],
      ['15:20:03', '로컬 환경 비교 필요 표시'],
    ],
  },
  shared: {
    title: '공용 명세가 있어야 함께 맞춘다',
    summary:
      '모두가 같은 package.json을 기준으로 의존성을 적어 두면, 팀원이 바뀌어도 필요한 패키지 목록과 버전 의도를 바로 공유할 수 있습니다.',
    active: 1,
    lanes: [
      ['공용 게시판에 목록 작성', '누구나 같은 기준 확인'],
      ['package.json 의존성 선언', '설치 대상 명세 공유'],
      ['팀 온보딩 단축', '기준 버전 가시화'],
    ],
    note:
      '실제 패키지는 로컬에 설치되더라도 기준 문서는 공용으로 남아야 합니다. 그래서 package.json은 설치 결과보다 의도를 공유하는 문서에 가깝습니다.',
    logs: [
      ['15:21:01', 'package.json dependency 목록 확인'],
      ['15:21:02', '새 팀원이 install 준비'],
      ['15:21:03', '기준 버전 문서화 완료'],
    ],
  },
  update: {
    title: '한 번 바꾸면 모두가 따라오게 만든다',
    summary:
      '버전을 갱신할 때는 선언 파일과 잠금 파일, 실제 설치 결과가 함께 움직여야 합니다. 한 곳만 바꾸면 실행 환경과 기록이 다시 어긋납니다.',
    active: 2,
    lanes: [
      ['변경 공지 후 새 목록 반영', '기존 사본도 갱신'],
      ['install/update 실행', 'lockfile 재생성'],
      ['환경 재현성 유지', '오류 원인 축소'],
    ],
    note:
      '의존성 갱신은 단순 설치보다 상태 동기화에 가깝습니다. 선언과 실제 파일이 함께 움직여야 팀원 모두가 같은 환경을 재현할 수 있습니다.',
    logs: [
      ['15:22:01', 'react 버전 범위 수정'],
      ['15:22:02', 'lockfile 업데이트 반영'],
      ['15:22:03', '동일 환경 재설치 확인'],
    ],
  },
  tool: {
    title: '도구는 방식 차이를 만들지만 목적은 같다',
    summary:
      'npm, pnpm, yarn은 저장 방식과 속도, 워크스페이스 지원이 다르지만 모두 의존성 목록을 읽고 팀 환경을 재현한다는 같은 목적을 가집니다.',
    active: 3,
    lanes: [
      ['공구에 따라 보관 방식 다름', '작업 습관도 달라짐'],
      ['npm/pnpm/yarn 선택', '캐시와 workspace 전략 차이'],
      ['팀 규약 통일', '설치 혼선 감소'],
    ],
    note:
      '패키지 매니저 선택은 취향만의 문제가 아닙니다. 설치 속도와 디스크 사용량, 모노레포 전략까지 연결되므로 팀 단위 기준을 함께 정하는 편이 좋습니다.',
    logs: [
      ['15:23:01', 'pnpm workspace 후보 검토'],
      ['15:23:02', 'npm lockfile 호환성 비교'],
      ['15:23:03', '팀 공용 명령어 확정'],
    ],
  },
};

const TONE = getTone(5);

const METAPHOR = [
  { icon: <Icons.DistributedIcon />, label: '분산', sub: '여러 장소' },
  { icon: <Icons.ShareIcon />, label: '공유', sub: '함께 사용' },
  { icon: <Icons.ChangeIcon />, label: '변경', sub: '버전 갱신' },
  { icon: <Icons.ToolMetaIcon />, label: '도구', sub: '용도별 선택' },
];

const IT = [
  { icon: <Icons.LocalIcon />, label: '로컬', sub: 'node_modules' },
  { icon: <Icons.SharedIcon />, label: '공용', sub: 'package.json' },
  { icon: <Icons.UpdateIcon />, label: '갱신', sub: 'install/update' },
  { icon: <Icons.ToolPickIcon />, label: '도구 선택', sub: 'npm/pnpm/yarn' },
];

validatePairSet(METAPHOR, IT, { layout: 'wide', subPolicy: 'all' });

export default function Q05PackageManager({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.local;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="의존성 관리" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairMatch
        metaphorTitle="도구 함의 변화"
        itTitle="의존성 관리"
        metaphor={METAPHOR}
        it={IT}
        activeIndex={scene.active}
        tone={TONE}
      />

      <section
        className="rounded-2xl border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--demo-card-bg)' }}
      >
        <h3 className="m-0 text-[14px] font-semibold">설치 상태 비교 보드</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {scene.lanes.map((items, index) => {
            const active = scene.active === index;
            const titles = ['운영 장면', '패키지 해석', '팀 효과'];
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

      <LogBox logs={scene.logs} variant="blue" title="패키지 관리 로그" lineTimeColor="var(--demo-log-time-cyan)" />
    </div>
  );
}
