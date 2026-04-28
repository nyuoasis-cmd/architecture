export type DemoScenario = {
  id: string;
  label: string;
};

export type DemoMeta = {
  qaId: string;
  title: string;
  url: string;
  description: string;
  scenarios: DemoScenario[];
};

export const DEMOS: DemoMeta[] = [
  {
    qaId: 'ch01_q01',
    title: '라면으로 보는 컴퓨터 한 바퀴',
    url: '/demos/ch01/q01.html',
    description: '입력과 메모리, CPU, 출력이 라면 끓이기 비유에서 어떻게 연결되는지 보여줍니다.',
    scenarios: [
      { id: 'input', label: '재료 받기 — 입력' },
      { id: 'memory', label: '냄비 준비 — 메모리' },
      { id: 'cpu', label: '불로 익히기 — 처리' },
      { id: 'output', label: '그릇에 담기 — 출력' },
    ],
  },
  {
    qaId: 'ch01_q02',
    title: '무대와 대본으로 나누는 컴퓨터',
    url: '/demos/ch01/q02.html',
    description: '실제 부품과 명령 묶음이 공연 준비처럼 어떻게 구분되는지 살펴봅니다.',
    scenarios: [
      { id: 'stage', label: '무대 장비 — 하드웨어' },
      { id: 'script', label: '대본 흐름 — 소프트웨어' },
      { id: 'rehearsal', label: '함께 움직이기' },
      { id: 'swap', label: '대본만 바꾸기' },
    ],
  },
  {
    qaId: 'ch01_q03',
    title: '식당 매니저로 보는 운영체제',
    url: '/demos/ch01/q03.html',
    description: '앱과 자원, 파일, 보안 규칙을 식당 운영 장면에 빗대어 설명합니다.',
    scenarios: [
      { id: 'seats', label: '자리 배치 — 자원 분배' },
      { id: 'orders', label: '주문 나누기 — 작업 조정' },
      { id: 'storage', label: '영수증 보관 — 파일 관리' },
      { id: 'checkout', label: '결제 확인 — 권한과 인터페이스' },
    ],
  },
  {
    qaId: 'ch01_q04',
    title: '책장과 책상 사이의 데이터 이동',
    url: '/demos/ch01/q04.html',
    description: '저장소에서 RAM, CPU, 캐시를 거쳐 결과가 다시 저장되는 흐름을 따라갑니다.',
    scenarios: [
      { id: 'storage', label: '책장에서 찾기 — 저장소' },
      { id: 'ram', label: '책상에 펼치기 — RAM' },
      { id: 'cache', label: '포스트잇 붙이기 — 캐시' },
      { id: 'cpu', label: '펜으로 계산 — CPU' },
      { id: 'save', label: '다시 꽂기 — 결과 저장' },
    ],
  },
  {
    qaId: 'ch02_q01',
    title: '시스템과 응용을 나누는 분류 트리',
    url: '/demos/ch02/q01.html',
    description: '운영체제와 드라이버, 앱, 미들웨어가 어떤 층에 놓이는지 분류합니다.',
    scenarios: [
      { id: 'os', label: 'OS — 시스템 SW' },
      { id: 'driver', label: '드라이버 — 장치 연결' },
      { id: 'app', label: '앱 — 응용 SW' },
      { id: 'middleware', label: '미들웨어 — 중간층' },
    ],
  },
  {
    qaId: 'ch02_q02',
    title: '라이선스로 보는 소프트웨어 선택',
    url: '/demos/ch02/q02.html',
    description: '오픈소스와 상용, GPL, 학생용 라이선스의 차이를 카드로 비교합니다.',
    scenarios: [
      { id: 'open', label: '오픈소스 자유' },
      { id: 'commercial', label: '상용 비용' },
      { id: 'gpl', label: 'GPL 공개 의무' },
      { id: 'student', label: '학생용 제한' },
    ],
  },
  {
    qaId: 'ch02_q03',
    title: '모듈에서 패키지까지 한눈에',
    url: '/demos/ch02/q03.html',
    description: '작은 기능 모듈이 패키지와 의존성으로 확장되는 구조를 따라갑니다.',
    scenarios: [
      { id: 'module', label: '단일 모듈' },
      { id: 'package', label: '패키지 묶음' },
      { id: 'dependency', label: '의존성 연결' },
      { id: 'install', label: 'npm install' },
    ],
  },
  {
    qaId: 'ch02_q04',
    title: '클라우드 서비스 계층',
    url: '/demos/ch02/q04.html',
    description: 'IaaS, PaaS, SaaS와 구독형 서비스의 차이를 층별로 보여줍니다.',
    scenarios: [
      { id: 'iaas', label: 'IaaS — 인프라' },
      { id: 'paas', label: 'PaaS — 실행 기반' },
      { id: 'saas', label: 'SaaS — 완성 서비스' },
      { id: 'subscription', label: '구독 — 이용 방식' },
    ],
  },
  {
    qaId: 'ch03_q01',
    title: '테스트 피라미드 실험실',
    url: '/demos/ch03/q01.html',
    description: '단위, 통합, E2E 테스트가 어느 층에서 무엇을 검증하는지 피라미드로 비교합니다.',
    scenarios: [
      { id: 'unit', label: '단위 — 작은 부품' },
      { id: 'integration', label: '통합 — 연결 지점' },
      { id: 'e2e', label: 'E2E — 사용자 여정' },
      { id: 'balance', label: '균형 — 피라미드' },
    ],
  },
  {
    qaId: 'ch03_q02',
    title: 'Red-Green-Refactor 사이클',
    url: '/demos/ch03/q02.html',
    description: '실패하는 테스트에서 시작해 최소 구현과 구조 개선으로 이어지는 TDD 리듬을 보여줍니다.',
    scenarios: [
      { id: 'red', label: 'Red — 실패 쓰기' },
      { id: 'green', label: 'Green — 최소 통과' },
      { id: 'refactor', label: 'Refactor — 구조 정리' },
      { id: 'loop', label: 'Loop — 다시 반복' },
    ],
  },
  {
    qaId: 'ch03_q03',
    title: 'CI 자동 검증 게이트',
    url: '/demos/ch03/q03.html',
    description: '커밋 이후 빌드, 테스트, 리포트가 자동으로 이어지는 흐름을 단계별로 보여줍니다.',
    scenarios: [
      { id: 'commit', label: '커밋 감지' },
      { id: 'build', label: '빌드 실행' },
      { id: 'test', label: '테스트 점검' },
      { id: 'report', label: '결과 리포트' },
    ],
  },
  {
    qaId: 'ch03_q04',
    title: '배포 환경 계단',
    url: '/demos/ch03/q04.html',
    description: 'dev, staging, prod 환경이 어떤 질문을 분담하는지 계단형 검증 흐름으로 보여줍니다.',
    scenarios: [
      { id: 'dev', label: 'dev — 빠른 확인' },
      { id: 'staging', label: 'staging — 운영 리허설' },
      { id: 'prod', label: 'prod — 실제 서비스' },
      { id: 'cd', label: 'CD — 자동 이동' },
    ],
  },
  {
    qaId: 'ch03_q05',
    title: '롤백 전략 비교판',
    url: '/demos/ch03/q05.html',
    description: '즉시 롤백, 블루그린, 카나리 배포가 실패를 다루는 방식을 비교합니다.',
    scenarios: [
      { id: 'rollback', label: '즉시 롤백' },
      { id: 'bluegreen', label: '블루그린' },
      { id: 'canary', label: '카나리' },
      { id: 'decision', label: '전략 선택' },
    ],
  },
  {
    qaId: 'ch03_q06',
    title: '모니터링 대시보드 시뮬레이터',
    url: '/demos/ch03/q06.html',
    description: '요청 수, 에러율, 지연 시간, 알림 기준이 어떻게 연결되는지 운영 화면처럼 보여줍니다.',
    scenarios: [
      { id: 'traffic', label: '요청 수' },
      { id: 'latency', label: '지연 시간' },
      { id: 'error', label: '에러율' },
      { id: 'alert', label: '알림 트리거' },
    ],
  },
  {
    qaId: 'ch03_q07',
    title: '코드 리뷰 흐름 보드',
    url: '/demos/ch03/q07.html',
    description: 'PR 생성부터 코멘트, 수정, 승인, 머지까지 리뷰 대화를 흐름 보드로 정리합니다.',
    scenarios: [
      { id: 'pr', label: 'PR 열기' },
      { id: 'comment', label: '코멘트 남기기' },
      { id: 'revise', label: '수정 반영' },
      { id: 'merge', label: '승인 후 머지' },
    ],
  },
  {
    qaId: 'ch06_q03',
    title: '카톡 프로세스 시뮬레이터',
    url: '/demos/ch06/q03.html',
    description: '디스크의 프로그램이 메모리의 프로세스가 되고 CPU가 처리하는 흐름을 보여줍니다.',
    scenarios: [
      { id: 'launch', label: '카톡 실행 — 프로세스 만들어지기' },
      { id: 'multi', label: '같은 앱 두 번 — 프로세스 2개' },
      { id: 'cpu', label: 'CPU가 일하는 모습' },
      { id: 'kill', label: '앱 종료 — 프로세스 사라지기' },
    ],
  },
];

export function getDemoByQaId(qaId: string) {
  return DEMOS.find((demo) => demo.qaId === qaId);
}
