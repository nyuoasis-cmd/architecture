import { Hero, Icons, LogBox, PairVertical, StateChips, getTone, validatePairSet } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  active: number;
  chips: Array<{ label: string; active?: boolean }>;
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  iaas: {
    title: '직접 다루는 범위가 넓을수록 자유도는 커지지만 책임도 함께 올라간다',
    summary: '빈 작업실만 빌려 선반과 공구를 스스로 채우듯, IaaS는 기반 자원을 직접 고르며 운영 폭을 크게 가져갑니다.',
    active: 0,
    chips: [
      { label: '직접 설정', active: true },
      { label: '자유도 큼' },
      { label: '운영 책임' },
    ],
    note: 'IaaS는 서버와 네트워크, 운영체제 선택권이 넓습니다. 대신 어디까지 직접 챙길지 팀의 운영 역량도 함께 요구됩니다.',
    logs: [
      ['16:10:01', '가상 서버와 네트워크 직접 생성'],
      ['16:10:02', '운영체제와 보안 규칙 수동 구성'],
      ['16:10:03', '애플리케이션 배포 준비 완료'],
    ],
  },
  paas: {
    title: '기반을 빌리면 운영 부담 일부를 넘기고 서비스 코드에 더 집중할 수 있다',
    summary: '조리대와 화구가 갖춰진 주방을 빌리듯, PaaS는 실행 기반을 제공해 사용자가 애플리케이션 개발과 배포에 집중하게 합니다.',
    active: 1,
    chips: [
      { label: '기반 제공', active: true },
      { label: '배포 단순' },
      { label: '운영 절감' },
    ],
    note: 'PaaS는 개발 속도를 높이는 대신 플랫폼 제약을 함께 받습니다. 무엇을 맡기고 무엇을 포기하는지 책임 경계를 분명히 봐야 합니다.',
    logs: [
      ['16:11:01', '플랫폼 런타임과 빌드팩 자동 선택'],
      ['16:11:02', '코드 push 뒤 배포 파이프라인 실행'],
      ['16:11:03', '확장 옵션만 선택해 운영 반영'],
    ],
  },
  saas: {
    title: '완성 서비스를 쓰는 방식은 가장 빠르지만 내부 제어 범위는 가장 좁다',
    summary: '가구가 모두 갖춰진 사무실에 바로 입주하듯, SaaS는 기능을 즉시 사용하게 해 주는 대신 내부 운영은 제공자가 맡습니다.',
    active: 2,
    chips: [
      { label: '즉시 사용', active: true },
      { label: '관리 최소' },
      { label: '제어 제한' },
    ],
    note: 'SaaS는 가장 빠르게 시작할 수 있지만 세부 동작은 제공자 정책에 따릅니다. 커스터마이징보다 활용 속도를 우선할 때 잘 맞습니다.',
    logs: [
      ['16:12:01', '계정 생성 후 서비스 바로 사용'],
      ['16:12:02', '업데이트와 패치는 제공자 측 반영'],
      ['16:12:03', '사용자는 업무 설정과 데이터 입력에 집중'],
    ],
  },
  boundary: {
    title: '클라우드 선택의 핵심은 기능 이름보다 누가 어디까지 맡는지 구분하는 일이다',
    summary: '같은 사무실이라도 청소와 보안, 장비 관리를 누가 맡는지 계약이 다르듯, 클라우드는 책임 경계를 기준으로 비교해야 합니다.',
    active: 3,
    chips: [
      { label: '책임 분담', active: true },
      { label: '보안 구분' },
      { label: '운영 계약' },
    ],
    note: 'IaaS, PaaS, SaaS는 기술 이름이 아니라 관리 책임의 분할선으로 이해하는 편이 정확합니다. 운영, 보안, 패치 범위를 함께 비교해야 선택이 선명해집니다.',
    logs: [
      ['16:13:01', '인프라 책임 항목 점검 시작'],
      ['16:13:02', '플랫폼 관리 주체와 패치 범위 확인'],
      ['16:13:03', '서비스별 책임 경계 표 작성 완료'],
    ],
  },
};

const TONE = getTone(10);

const METAPHOR = [
  { icon: <Icons.HandIcon />, label: '직접', sub: '하드부터' },
  { icon: <Icons.RentIcon />, label: '빌리기', sub: '플랫폼만' },
  { icon: <Icons.CompleteIcon />, label: '완성', sub: '소프트만' },
  { icon: <Icons.DutyIcon />, label: '경계', sub: '책임 분담' },
];

const IT = [
  { icon: <Icons.IaasIcon />, label: '직접 IaaS', sub: 'infra' },
  { icon: <Icons.PaasIcon />, label: '빌리기 PaaS', sub: 'platform' },
  { icon: <Icons.SaasIcon />, label: '완성 SaaS', sub: 'software' },
  { icon: <Icons.SharedIcon />, label: '책임 경계', sub: 'shared model' },
];

validatePairSet(METAPHOR, IT, { layout: 'square', subPolicy: 'all' });

export default function Q01CloudService({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.iaas;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="클라우드 서비스 모델" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairVertical
        metaphorTitle="사무실 준비 비유"
        itTitle="클라우드 책임 모델"
        pairs={METAPHOR.map((metaphor, index) => ({ metaphor, it: IT[index] }))}
        activeIndex={scene.active}
        tone={TONE}
      />

      <StateChips title="선택 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="blue" title="클라우드 책임 로그" />
    </div>
  );
}
