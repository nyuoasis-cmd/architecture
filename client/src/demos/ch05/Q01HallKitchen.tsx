import { Hero, Icons, LogBox, PairBinary, StateChips, getTone } from '../_shared';
import type { DemoComponentProps } from '../types';

type Scene = {
  title: string;
  summary: string;
  leftActive: boolean;
  rightActive: boolean;
  hallCards: string[];
  kitchenCards: string[];
  frontendSub: string;
  backendSub: string;
  badges: string[];
  logs: Array<[string, string]>;
};

const SCENES: Record<string, Scene> = {
  hall: {
    title: '손님이 먼저 만나는 쪽',
    summary: '식당에서 손님은 홀을 통해 메뉴를 보고 주문 흐름을 경험합니다. 웹에서도 프론트엔드는 사용자가 직접 만나는 화면과 반응을 맡습니다.',
    leftActive: true,
    rightActive: false,
    hallCards: ['메뉴판 보여 주기', '자리 안내', '주문 입력 받기'],
    kitchenCards: ['조리는 아직 대기', '재고 계산 전'],
    frontendSub: '화면과 입력 반응',
    backendSub: '규칙 처리 대기',
    badges: ['보이는 영역', '사용자 경험', '즉각 반응'],
    logs: [
      ['15:05:01', '고객이 메뉴 화면 확인'],
      ['15:05:02', '프론트엔드가 입력 이벤트 수신'],
      ['15:05:03', '주문 요청 준비 완료'],
    ],
  },
  kitchen: {
    title: '보이지 않지만 핵심을 처리하는 쪽',
    summary: '주방은 손님 눈앞에 있지 않아도 조리 규칙과 재고 판단을 책임집니다. 백엔드는 화면 뒤에서 데이터와 비즈니스 규칙을 안정적으로 처리합니다.',
    leftActive: false,
    rightActive: true,
    hallCards: ['주문 결과 기다림', '상태 안내만 표시'],
    kitchenCards: ['레시피 확인', '재고 차감', '주문 저장'],
    frontendSub: '요청 결과 표시',
    backendSub: '데이터와 규칙 처리',
    badges: ['보이지 않는 처리', '일관성 유지', '데이터 저장'],
    logs: [
      ['15:06:01', '백엔드가 주문 payload 수신'],
      ['15:06:02', '재고 및 결제 규칙 검사'],
      ['15:06:03', '주문 상태 저장 완료'],
    ],
  },
  promise: {
    title: '홀과 주방이 맞추는 약속',
    summary: '주문표 형식이 정해져 있어야 홀과 주방이 엇갈리지 않듯, 프론트엔드와 백엔드는 API 약속으로 같은 요청 형식과 응답 형식을 공유합니다.',
    leftActive: true,
    rightActive: true,
    hallCards: ['메뉴 번호', '수량', '요청사항'],
    kitchenCards: ['같은 주문표 해석', '조리 상태 반환', '완료 시간 전달'],
    frontendSub: 'API 요청 조립',
    backendSub: 'API 응답 반환',
    badges: ['API 계약', '형식 통일', '협업 기준'],
    logs: [
      ['15:07:01', '주문 스키마 버전 확인'],
      ['15:07:02', 'API 요청 형식 검증 통과'],
      ['15:07:03', '예상 완료 시간 응답'],
    ],
  },
  separate: {
    title: '분리돼 있어야 각각 더 잘 고친다',
    summary: '홀 동선을 바꾸면서도 주방 레시피는 유지할 수 있어야 운영이 편해집니다. 프론트엔드와 백엔드를 나누면 UI 변화와 데이터 규칙 개선을 서로 덜 방해하며 진행할 수 있습니다.',
    leftActive: true,
    rightActive: true,
    hallCards: ['모바일 화면 개편', '버튼 위치 조정', '문구 수정'],
    kitchenCards: ['정산 규칙 개선', 'DB 최적화', '권한 검사 강화'],
    frontendSub: 'UI를 빠르게 실험',
    backendSub: '핵심 규칙을 안정 유지',
    badges: ['동시 작업', '역할 분리', '변경 영향 축소'],
    logs: [
      ['15:08:01', '프론트엔드 배너 레이아웃 수정'],
      ['15:08:02', '백엔드 할인 규칙 배포'],
      ['15:08:03', '공통 API 계약은 그대로 유지'],
    ],
  },
};

const TONE = getTone(5);

export default function Q01HallKitchen({ scenarioId }: DemoComponentProps) {
  const scene = SCENES[scenarioId] ?? SCENES.hall;

  return (
    <div className="flex flex-col gap-3">
      <Hero eyebrow="프론트엔드 vs 백엔드" title={scene.title} summary={scene.summary} tone={TONE} />

      <PairBinary
        metaphorTitle="식당 운영"
        itTitle="웹 아키텍처"
        metaphorLeft={{ icon: <Icons.HallIcon />, label: '홀', cards: scene.hallCards }}
        metaphorRight={{ icon: <Icons.KitchenIcon />, label: '주방', cards: scene.kitchenCards }}
        itLeft={{ icon: <Icons.FrontendIcon />, label: '프론트엔드', sub: scene.frontendSub }}
        itRight={{ icon: <Icons.BackendIcon />, label: '백엔드', sub: scene.backendSub }}
        leftActive={scene.leftActive}
        rightActive={scene.rightActive}
        tone={TONE}
      />

      <StateChips
        title="약속과 분리 포인트"
        items={[
          { label: '약속 = API 형식', active: scenarioId === 'promise' },
          { label: '분리 = 역할 분담', active: scenarioId === 'separate' },
          { label: '홀 = 사용자 경험', active: scenarioId === 'hall' },
          { label: '주방 = 데이터 규칙', active: scenarioId === 'kitchen' },
        ]}
        tone={TONE}
        description="프론트엔드와 백엔드는 서로 떨어져 있는 것이 목적이 아니라, 공통 약속을 유지한 채 각자 더 빠르고 안정적으로 바뀌기 위해 나뉩니다."
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

      <LogBox logs={scene.logs} variant="navy" title="웹 요청 운영 로그" />
    </div>
  );
}
