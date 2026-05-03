import { Hero, Icons, LogBox, PairBinary, getTone } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  stageActive: boolean;
  scriptActive: boolean;
  stageCards: string[];
  scriptCards: string[];
  hwLabel: string;
  swLabel: string;
  badges: string[];
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  stage: {
    title: '무대 장비 — 하드웨어',
    summary: '조명, 스피커, 무대 바닥처럼 실제로 설치된 장비가 하드웨어입니다.',
    stageActive: true,
    scriptActive: false,
    stageCards: ['CPU 조명실', 'RAM 대기석', 'SSD 소품 창고', '키보드 입구'],
    scriptCards: ['명령은 아직 대기 중', '장비만으로는 공연 시작 불가'],
    hwLabel: '회로가 켜져 동작 준비',
    swLabel: '아직 실행될 명령 없음',
    badges: ['실체 있음', '전기 신호 처리', '성능 한계 결정'],
    logs: [
      ['11:20:01', '무대 장비 전원 확인'],
      ['11:20:02', '스피커와 조명 준비 완료'],
      ['11:20:03', '대본 입력 대기'],
    ],
  },
  script: {
    title: '대본 흐름 — 소프트웨어',
    summary: '누가 언제 등장하고 어떤 동작을 할지 적은 규칙 묶음이 소프트웨어입니다.',
    stageActive: false,
    scriptActive: true,
    stageCards: ['무대는 그대로 유지', '장비는 같은 자리에 있음'],
    scriptCards: ['1막 시작', '배우 입장', '배경 전환', '엔딩 음악 재생'],
    hwLabel: '회로는 그대로 대기',
    swLabel: '명령이 순서대로 실행',
    badges: ['명령의 묶음', '기능 결정', '업데이트 가능'],
    logs: [
      ['11:20:04', '공연 대본 로드'],
      ['11:20:05', '장면 순서 배치'],
      ['11:20:06', '무대 장비에 동작 지시'],
    ],
  },
  rehearsal: {
    title: '함께 움직이기',
    summary: '무대와 대본이 함께 있어야 비로소 공연이 시작되듯, 하드웨어와 소프트웨어는 함께 동작합니다.',
    stageActive: true,
    scriptActive: true,
    stageCards: ['조명 ON', '스피커 재생', '무대 장치 이동'],
    scriptCards: ['오프닝 음악', '대사 출력', '장면 전환 요청'],
    hwLabel: 'HW 가 명령에 반응',
    swLabel: 'SW 가 HW 에 명령 전달',
    badges: ['둘 다 필요', '분리해서 생각 가능', '함께 실행됨'],
    logs: [
      ['11:20:07', '대본 1막 시작'],
      ['11:20:08', '조명과 스피커 동시 반응'],
      ['11:20:09', '공연 장면 정상 진행'],
    ],
  },
  swap: {
    title: '대본만 바꾸기',
    summary: '무대는 그대로 두고 대본만 바꾸면 전혀 다른 공연이 됩니다. 같은 컴퓨터에 다른 앱을 설치하는 상황과 비슷합니다.',
    stageActive: false,
    scriptActive: true,
    stageCards: ['같은 CPU', '같은 RAM', '같은 SSD'],
    scriptCards: ['뮤지컬 대본 → 게임 규칙', '문서 편집 → 영상 편집'],
    hwLabel: '동일한 부품 재사용',
    swLabel: '다른 앱으로 교체',
    badges: ['장비 재사용', '기능 변화', '소프트웨어 교체'],
    logs: [
      ['11:20:10', '새 대본 업로드'],
      ['11:20:11', '기존 무대 장비 유지'],
      ['11:20:12', '다른 기능으로 공연 시작'],
    ],
  },
};

const TONE = getTone(1);

export default function Q02Stage({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.stage;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="하드웨어 vs 소프트웨어" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairBinary
        metaphorTitle="공연장"
        itTitle="컴퓨터"
        metaphorLeft={{ icon: <Icons.StageIcon />, label: '무대', cards: scene.stageCards }}
        metaphorRight={{ icon: <Icons.ScriptIcon />, label: '대본', cards: scene.scriptCards }}
        itLeft={{ icon: <Icons.HardwareIcon />, label: '하드웨어', sub: scene.hwLabel }}
        itRight={{ icon: <Icons.SoftwareIcon />, label: '소프트웨어', sub: scene.swLabel }}
        leftActive={scene.stageActive}
        rightActive={scene.scriptActive}
        tone={TONE}
      />

      <div className="flex flex-wrap gap-2">
        {scene.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border px-3 py-1.5 text-[11px] font-medium"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--demo-card-bg)',
              color: 'var(--color-text-body)',
            }}
          >
            {badge}
          </span>
        ))}
      </div>

      <LogBox logs={scene.logs} variant="navy" title="운영 로그" />
    </div>
  );
}
