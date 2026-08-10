import type { QuizAnswerSet } from './quiz-answers';

// ch09장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH09_ANSWERS: Record<string, QuizAnswerSet> = {
  ch09_q01: {
    qaId: "ch09_q01",
    answers: [
      {
        correctIdx: 0,
        explanation: "모놀리식은 여러 기능이 하나의 코드베이스와 배포 단위 안에 함께 있는 구조입니다. 한 부분 수정도 전체 배포와 연결되기 쉽습니다.",
      },
      {
        correctIdx: 1,
        explanation: "마이크로서비스는 서비스별로 따로 고치고 배포하기 쉬운 점이 큰 장점입니다. 대신 분산 통신과 운영 도구가 더 중요해집니다.",
      },
      {
        correctIdx: 2,
        explanation: "서비스를 나누면 네트워크 호출, 관찰성, 데이터 일관성 같은 분산 시스템 문제가 새로 커집니다. 단순 분할만으로 끝나지 않습니다.",
      },
    ],
  },
  ch09_q02: {
    qaId: "ch09_q02",
    answers: [
      {
        correctIdx: 1,
        explanation: "레이어드 아키텍처의 핵심은 역할이 다른 코드를 층으로 나눠 관심사를 분리하는 데 있습니다. 구조의 목적은 읽기와 변경 관리입니다.",
      },
      {
        correctIdx: 2,
        explanation: "서비스 계층은 할인 규칙, 승인 절차 같은 비즈니스 로직을 담당합니다. 화면 표시나 저장 기술 세부사항과는 구분됩니다.",
      },
      {
        correctIdx: 3,
        explanation: "계층을 나누면 변경이 어떤 책임에 속하는지 보이기 쉬워져 영향 범위를 좁히고 테스트 지점을 잡기 편해집니다.",
      },
    ],
  },
  ch09_q03: {
    qaId: "ch09_q03",
    answers: [
      {
        correctIdx: 2,
        explanation: "디자인 패턴은 반복되는 설계 문제에 이름 붙인 해법입니다. 코드를 맹목적으로 복사하는 규칙집은 아닙니다.",
      },
      {
        correctIdx: 3,
        explanation: "옵저버 패턴은 한쪽 상태 변화가 여러 구독자에게 전파되어야 하는 상황에 잘 맞습니다. 이벤트 구독 구조를 떠올리면 쉽습니다.",
      },
      {
        correctIdx: 0,
        explanation: "패턴은 문제와 맥락이 맞을 때만 가치가 있습니다. 이름이 익숙하다고 무조건 넣으면 구조가 오히려 무거워질 수 있습니다.",
      },
    ],
  },
  ch09_q04: {
    qaId: "ch09_q04",
    answers: [
      {
        correctIdx: 3,
        explanation: "CDN 캐시는 사용자 가까운 거점에서 정적 파일을 전달해 네트워크 왕복을 줄이는 데 강점이 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "메모리 캐시에는 자주 읽는 설정값, 세션, 계산 결과처럼 반복 접근이 많은 데이터를 올려 두는 경우가 많습니다.",
      },
      {
        correctIdx: 1,
        explanation: "캐싱은 값을 넣는 일보다 언제 오래된 값으로 볼지, 언제 비울지 정하는 무효화 전략이 더 까다롭습니다.",
      },
    ],
  },
  ch09_q05: {
    qaId: "ch09_q05",
    answers: [
      {
        correctIdx: 0,
        explanation: "메시지 큐는 시간이 조금 걸려도 되는 후속 작업을 비동기로 분리해 사용자 응답 경로를 가볍게 만드는 데 효과적입니다.",
      },
      {
        correctIdx: 1,
        explanation: "생산자는 할 일을 큐에 넣고, 소비자는 큐에서 꺼내 처리합니다. 둘을 분리해야 느슨한 결합과 비동기 흐름이 생깁니다.",
      },
      {
        correctIdx: 2,
        explanation: "큐는 급증한 작업을 잠시 쌓아 두는 버퍼 역할을 합니다. 즉시 모두 처리하지 못해도 시스템이 숨 돌릴 시간을 벌 수 있습니다.",
      },
    ],
  },
  ch09_q06: {
    qaId: "ch09_q06",
    answers: [
      {
        correctIdx: 1,
        explanation: "수직 확장은 CPU, 메모리, 디스크를 더 강한 것으로 바꿔 한 대의 능력을 키우는 방식입니다. 빠르지만 한계가 분명합니다.",
      },
      {
        correctIdx: 2,
        explanation: "수평 확장은 같은 역할의 서버를 여러 대 두고 요청을 분산하는 방식입니다. 규모 확장에 유리하지만 분산 설계가 필요합니다.",
      },
      {
        correctIdx: 3,
        explanation: "확장성 논의는 먼저 병목이 CPU인지 DB인지 네트워크인지 측정해야 의미가 있습니다. 원인 파악 없이 자원만 늘리면 낭비가 생길 수 있습니다.",
      },
    ],
  },
};
