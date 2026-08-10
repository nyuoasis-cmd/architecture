import type { QuizAnswerSet } from './quiz-answers';

// ch03장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH03_ANSWERS: Record<string, QuizAnswerSet> = {
  ch03_q01: {
    qaId: "ch03_q01",
    answers: [
      {
        correctIdx: 0,
        explanation: "단위 테스트는 함수나 클래스처럼 작은 부품 하나를 따로 확인하는 검사입니다. 전체 여정을 보는 E2E와 범위가 다릅니다.",
      },
      {
        correctIdx: 1,
        explanation: "통합 테스트는 연결된 여러 부품이 실제로 맞물릴 때 생기는 규칙 불일치를 잘 잡아냅니다. 부품 하나만 떼어 보면 보이지 않던 문제가 여기서 드러납니다.",
      },
      {
        correctIdx: 2,
        explanation: "E2E 테스트는 범위가 넓고 느리며 유지 비용도 커서, 모든 경우를 덮기보다 핵심 사용자 흐름에 집중하는 편이 현실적입니다.",
      },
    ],
  },
  ch03_q02: {
    qaId: "ch03_q02",
    answers: [
      {
        correctIdx: 1,
        explanation: "Red는 아직 구현되지 않은 기능을 향해 테스트를 먼저 써서 실패를 확인하는 단계입니다. 이 실패가 목표를 분명하게 보여 줍니다.",
      },
      {
        correctIdx: 2,
        explanation: "Green에서는 테스트를 통과할 최소 구현부터 만듭니다. 처음부터 완벽한 구조를 목표로 하면 오히려 방향이 흐려질 수 있습니다.",
      },
      {
        correctIdx: 3,
        explanation: "Refactor는 테스트가 동작 유지 여부를 확인해 주기 때문에 가능한 단계입니다. 안전망이 있으니 구조를 다듬어도 불안이 줄어듭니다.",
      },
    ],
  },
  ch03_q03: {
    qaId: "ch03_q03",
    answers: [
      {
        correctIdx: 2,
        explanation: "CI의 핵심은 코드를 자주 합치고 자동 검증으로 문제를 빨리 드러내는 것입니다. 큰 덩어리로 늦게 합치면 원인 추적이 훨씬 어려워집니다.",
      },
      {
        correctIdx: 3,
        explanation: "CI에서는 보통 빌드, 테스트, 정적 검사 같은 공통 검증이 자동 실행됩니다. 모두 팀의 기본 기준을 기계적으로 확인하는 작업입니다.",
      },
      {
        correctIdx: 0,
        explanation: "작은 변경 단위에서 바로 실패를 보면 원인 범위를 쉽게 좁힐 수 있습니다. 그래서 문제를 더 빠르고 싸게 찾을 수 있습니다.",
      },
    ],
  },
  ch03_q04: {
    qaId: "ch03_q04",
    answers: [
      {
        correctIdx: 3,
        explanation: "Continuous Delivery와 Deployment의 표현 차이는 있어도, 둘 다 검증된 변경을 안정적으로 배포 흐름에 올리는 자동화가 핵심입니다.",
      },
      {
        correctIdx: 0,
        explanation: "staging은 운영과 비슷한 조건에서 최종 점검을 해 보는 리허설 환경입니다. 실제 사용자용인 prod와 역할이 다릅니다.",
      },
      {
        correctIdx: 1,
        explanation: "환경을 나누는 이유는 위험을 한 번에 운영에 노출하지 않고 단계별로 확인하기 위해서입니다. 계단을 한 칸씩 올라가며 검증하는 구조에 가깝습니다.",
      },
    ],
  },
  ch03_q05: {
    qaId: "ch03_q05",
    answers: [
      {
        correctIdx: 0,
        explanation: "즉시 롤백은 방금 올린 버전을 내리고 직전 안정 버전으로 빠르게 되돌리는 방식입니다. 가장 단순하지만 상황에 따라 데이터 정합성은 별도 검토가 필요합니다.",
      },
      {
        correctIdx: 1,
        explanation: "블루그린은 두 환경을 준비해 두므로 문제가 생기면 트래픽을 원래 환경으로 쉽게 돌릴 수 있습니다. 이 복귀 속도가 큰 장점입니다.",
      },
      {
        correctIdx: 2,
        explanation: "카나리 배포는 일부 사용자에게만 새 버전을 먼저 열어 작은 범위에서 반응과 오류를 확인하는 전략입니다. 영향을 통제하기 좋습니다.",
      },
    ],
  },
  ch03_q06: {
    qaId: "ch03_q06",
    answers: [
      {
        correctIdx: 1,
        explanation: "요청 수, 응답 시간, 에러율은 서비스 상태를 직접 보여 주는 대표적인 운영 신호입니다. 이런 지표를 꾸준히 봐야 이상 징후를 빨리 찾을 수 있습니다.",
      },
      {
        correctIdx: 2,
        explanation: "좋은 알림은 지금 사람이 행동해야 할 순간에만 울리도록 맞춰야 합니다. 너무 자주 울리면 경고에 무뎌져 중요한 장애도 놓치기 쉽습니다.",
      },
      {
        correctIdx: 3,
        explanation: "SLI는 실제로 재는 값이고, SLO는 그 값이 어느 수준은 되어야 한다는 목표입니다. 둘을 구분해야 운영 품질을 숫자로 관리할 수 있습니다.",
      },
    ],
  },
  ch03_q07: {
    qaId: "ch03_q07",
    answers: [
      {
        correctIdx: 2,
        explanation: "코드 리뷰의 핵심은 변경의 위험을 줄이고 팀 안에 지식을 공유하는 것입니다. 속도 경쟁이나 PR 개수 늘리기가 목적은 아닙니다.",
      },
      {
        correctIdx: 3,
        explanation: "작은 PR과 명확한 변경 의도, 테스트 결과는 리뷰어가 핵심 판단에 집중하게 도와 줍니다. 큰 덩어리 PR보다 훨씬 효율적입니다.",
      },
      {
        correctIdx: 0,
        explanation: "행동 가능한 리뷰는 무엇이 위험한지와 왜 그런지를 함께 적습니다. 그래서 수정 방향이 분명해지고 대화 비용이 줄어듭니다.",
      },
    ],
  },
};
