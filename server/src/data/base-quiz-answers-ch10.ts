import type { QuizAnswerSet } from './quiz-answers';

// ch10장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH10_ANSWERS: Record<string, QuizAnswerSet> = {
  ch10_q01: {
    qaId: "ch10_q01",
    answers: [
      {
        correctIdx: 2,
        explanation: "IaaS는 서버, 저장소, 네트워크 같은 인프라를 빌려 주는 단계입니다. 그 위 운영체제와 애플리케이션은 사용자가 더 많이 책임집니다.",
      },
      {
        correctIdx: 3,
        explanation: "PaaS는 실행 환경과 배포 기반까지 함께 제공해 개발자가 서버 관리보다 코드와 서비스 로직에 더 집중하게 돕습니다.",
      },
      {
        correctIdx: 0,
        explanation: "SaaS는 완성된 소프트웨어를 계정으로 바로 쓰는 방식이라, 내부 서버 운영과 런타임 관리는 제공자가 대부분 맡습니다.",
      },
    ],
  },
  ch10_q02: {
    qaId: "ch10_q02",
    answers: [
      {
        correctIdx: 3,
        explanation: "컨테이너는 애플리케이션과 필요한 실행 환경을 함께 묶은 실행 단위입니다. 운영체제 전체를 복제하는 가상머신과는 관점이 다릅니다.",
      },
      {
        correctIdx: 0,
        explanation: "이미지는 컨테이너를 만들기 위한 설계도나 템플릿입니다. 실제로 실행 중인 상태는 컨테이너라고 부릅니다.",
      },
      {
        correctIdx: 1,
        explanation: "컨테이너는 호스트 커널을 공유하면서 필요한 범위만 격리하기 때문에, 운영체제 전체를 따로 올리는 방식보다 보통 더 가볍고 시작도 빠릅니다.",
      },
    ],
  },
  ch10_q03: {
    qaId: "ch10_q03",
    answers: [
      {
        correctIdx: 0,
        explanation: "쿠버네티스의 핵심은 컨테이너 무리를 안정적으로 배치하고, 복구하고, 확장하는 운영 자동화입니다. HTML이나 브라우저 기능과는 무관합니다.",
      },
      {
        correctIdx: 1,
        explanation: "자가 복구는 죽은 컨테이너나 파드를 감지해 다시 띄워 원하는 개수를 맞추는 동작을 뜻합니다. 선언한 상태를 유지하는 대표 기능입니다.",
      },
      {
        correctIdx: 2,
        explanation: "롤링 업데이트는 새 버전을 조금씩 교체하며 문제 여부를 확인하는 배포 방식입니다. 한 번에 모두 바꾸는 것보다 중단 위험을 줄이는 데 유리합니다.",
      },
    ],
  },
  ch10_q04: {
    qaId: "ch10_q04",
    answers: [
      {
        correctIdx: 1,
        explanation: "AI가 가장 넓은 개념이고, 그 안에 머신러닝이, 다시 그 안에 딥러닝이 들어가는 포함 관계로 이해하는 것이 정확합니다.",
      },
      {
        correctIdx: 2,
        explanation: "머신러닝은 예시 데이터를 보고 패턴을 배워 분류나 예측을 수행하게 하는 방식입니다. 규칙을 사람이 전부 직접 적는 것과 구분됩니다.",
      },
      {
        correctIdx: 3,
        explanation: "딥러닝은 신경망을 활용하는 머신러닝의 한 갈래입니다. AI 전체와 같은 뜻도 아니고, 보안 기술도 아닙니다.",
      },
    ],
  },
  ch10_q05: {
    qaId: "ch10_q05",
    answers: [
      {
        correctIdx: 2,
        explanation: "LLM은 지금까지 나온 문맥을 보고 다음에 올 토큰을 예측하는 방식으로 작동합니다. 이 예측을 반복해 긴 문장을 만들어 냅니다.",
      },
      {
        correctIdx: 3,
        explanation: "앞에서 어떤 질문과 답이 오갔는지에 따라 다음 출력이 달라지므로 문맥은 매우 중요합니다. 같은 질문도 앞선 대화가 다르면 답이 달라질 수 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "LLM은 자연스러운 문장 생성에 강하지만, 모든 사실을 실시간으로 검증하는 엔진은 아닙니다. 그래서 중요한 정보는 별도 확인이 필요할 수 있습니다.",
      },
    ],
  },
  ch10_q06: {
    qaId: "ch10_q06",
    answers: [
      {
        correctIdx: 3,
        explanation: "API 비용은 먼저 무엇을 기준으로 돈이 붙는지 봐야 합니다. 호출 수 기준인지, 토큰이나 데이터 양 기준인지에 따라 절감 전략이 달라집니다.",
      },
      {
        correctIdx: 0,
        explanation: "토큰당 과금에서는 입력과 출력 길이가 곧 비용이 되므로, 불필요하게 긴 프롬프트와 장황한 응답을 줄이는 것이 직접적인 절감으로 이어집니다.",
      },
      {
        correctIdx: 1,
        explanation: "캐시는 같은 결과를 다시 계산하지 않게 하고, 배치는 여러 건을 한 번에 처리하게 해 요청 수를 줄일 수 있으므로 비용 절감에 도움이 됩니다.",
      },
    ],
  },
  ch10_q07: {
    qaId: "ch10_q07",
    answers: [
      {
        correctIdx: 0,
        explanation: "IAM은 누가 어떤 자원에 접근하고 수정할 수 있는지 권한을 관리하는 체계입니다. 클라우드에서는 최소 권한 원칙과 함께 매우 중요합니다.",
      },
      {
        correctIdx: 1,
        explanation: "암호화는 저장 중이거나 이동 중인 데이터를 중간에서 쉽게 읽지 못하게 보호하는 장치입니다. 성능을 일부 희생하더라도 보안의 핵심 축입니다.",
      },
      {
        correctIdx: 2,
        explanation: "네트워크 격리는 외부에 공개할 영역과 내부 전용 영역을 나눠 공격 표면과 피해 확산 범위를 줄이는 방식입니다. 모두를 같은 망에 두는 것과 반대 개념입니다.",
      },
    ],
  },
};
