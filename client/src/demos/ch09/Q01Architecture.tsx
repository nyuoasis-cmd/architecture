import { Hero, Icons, LogBox, PairBinary, StateChips, getTone } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  leftActive: boolean;
  rightActive: boolean;
  leftCards: string[];
  rightCards: string[];
  chips: Array<{ label: string; active?: boolean }>;
  note: string;
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  mono: {
    title: '작게 시작할 때는 한 솥이 준비와 배포를 단순하게 만든다',
    summary: '한 솥에 국과 재료를 함께 넣어 움직이듯, 모놀리식은 기능이 한 배포 단위에 묶여 시작 속도와 이해 난도를 낮춥니다.',
    leftActive: true,
    rightActive: false,
    leftCards: ['단일 배포', '같은 코드베이스', '빠른 시작'],
    rightCards: ['분리는 아직 이르다', '운영 팀도 단일'],
    chips: [
      { label: '처음엔 단순', active: true },
      { label: '한 번에 배포' },
      { label: '조직도 작음' },
    ],
    note: '기능 수가 적고 팀이 작을 때는 한 덩어리 구조가 오히려 빠릅니다. 배포와 디버깅 경로가 하나라서 초반 학습 비용이 낮습니다.',
    logs: [
      ['09:01:01', '서비스 전체 빌드 시작'],
      ['09:01:02', '단일 패키지 배포 완료'],
      ['09:01:03', '장애 추적 범위 한곳으로 수렴'],
    ],
  },
  growth: {
    title: '기능이 늘어나면 한 솥 안에서 열과 충돌이 함께 커진다',
    summary: '같은 솥에 재료가 계속 늘면 젓기 어렵고 넘치기 쉬운 것처럼, 커진 모놀리식은 수정 충돌과 배포 부담이 함께 커집니다.',
    leftActive: true,
    rightActive: false,
    leftCards: ['기능 충돌 증가', '배포 시간 증가', '작은 수정도 전체 재배포'],
    rightCards: ['분리 요구 대기', '경계 재설계 필요'],
    chips: [
      { label: '성장 통증', active: true },
      { label: '배포 묶임' },
      { label: '팀 충돌' },
    ],
    note: '문제는 모놀리식 자체보다 성장 이후의 밀도입니다. 팀과 기능이 커질수록 같은 저장소와 배포 파이프라인을 함께 건드리는 비용이 커집니다.',
    logs: [
      ['09:02:01', '결제 수정이 주문 모듈 테스트 재유발'],
      ['09:02:02', '배포 대기열 3팀 충돌 감지'],
      ['09:02:03', '부분 장애가 전체 재배포로 확대'],
    ],
  },
  micro: {
    title: '여러 솥으로 나누면 기능별로 따로 끓이고 따로 내릴 수 있다',
    summary: '국물, 밥, 반찬을 여러 솥으로 나누면 각각 다른 속도로 준비하듯, 마이크로서비스는 서비스별로 독립 배포와 확장을 가능하게 합니다.',
    leftActive: false,
    rightActive: true,
    leftCards: ['공통 코어는 축소', '중앙 묶음 약화'],
    rightCards: ['독립 배포', '서비스별 확장', '팀별 책임 분리'],
    chips: [
      { label: '독립 배포', active: true },
      { label: '경계 분리' },
      { label: '서비스별 확장' },
    ],
    note: '마이크로서비스의 장점은 분업과 독립성입니다. 필요한 부분만 배포하고, 부하가 큰 기능만 따로 확장할 수 있습니다.',
    logs: [
      ['09:03:01', '주문 서비스만 새 버전 배포'],
      ['09:03:02', '추천 서비스 인스턴스만 2배 확장'],
      ['09:03:03', '팀별 책임 구간 독립 운영'],
    ],
  },
  tradeoff: {
    title: '구조 선택은 정답 찾기보다 지금 감당할 복잡도를 고르는 일이다',
    summary: '한 솥이든 여러 솥이든 장단이 있듯, 아키텍처는 규모와 팀 구조에 맞춰 트레이드오프를 선택하는 문제입니다.',
    leftActive: true,
    rightActive: true,
    leftCards: ['단순한 운영', '초기 속도'],
    rightCards: ['독립 배포', '세밀한 확장'],
    chips: [
      { label: '상황 우선', active: true },
      { label: '운영 복잡' },
      { label: '팀 구조 영향' },
    ],
    note: '작은 팀이 처음부터 과하게 쪼개면 운영 부담이 앞서고, 큰 팀이 오래 묶여 있으면 배포 충돌이 커집니다. 규모와 변화 속도에 맞춰 선택해야 합니다.',
    logs: [
      ['09:04:01', '팀 규모와 배포 빈도 재평가'],
      ['09:04:02', '서비스 경계 후보 3개 비교'],
      ['09:04:03', '복잡도와 민첩성 균형안 채택'],
    ],
  },
};

const TONE = getTone(9);

export default function Q01Architecture({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.mono;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="모놀리식과 마이크로서비스" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairBinary
        metaphorTitle="솥 비유"
        itTitle="구조 선택"
        metaphorLeft={{ icon: <Icons.PotIcon />, label: '한 솥', cards: scene.leftCards }}
        metaphorRight={{ icon: <Icons.DistributedIcon />, label: '여러 솥', cards: scene.rightCards }}
        itLeft={{ icon: <Icons.BoxIcon />, label: '모놀리식', sub: '한 덩어리' }}
        itRight={{ icon: <Icons.SeparationIcon />, label: '마이크로서비스', sub: '서비스 분리' }}
        leftActive={scene.leftActive}
        rightActive={scene.rightActive}
        tone={TONE}
      />

      <StateChips title="구조 판단 포인트" items={scene.chips} tone={TONE} description={scene.note} />

      <LogBox logs={scene.logs} variant="navy" title="아키텍처 검토 로그" />
    </div>
  );
}
