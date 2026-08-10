import type { QuizAnswerSet } from './quiz-answers';

// ch07장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH07_ANSWERS: Record<string, QuizAnswerSet> = {
  ch07_q01: {
    qaId: "ch07_q01",
    answers: [
      {
        correctIdx: 3,
        explanation: "RDBMS는 표와 관계, 명확한 스키마를 중심으로 데이터를 다루기 좋습니다. 일관성과 조인이 중요한 업무에서 특히 강점을 보입니다.",
      },
      {
        correctIdx: 0,
        explanation: "NoSQL은 속성이 자주 바뀌거나 문서형 데이터처럼 구조가 유연해야 하는 상황, 그리고 분산 저장이 필요한 서비스에서 자주 선택됩니다.",
      },
      {
        correctIdx: 1,
        explanation: "데이터베이스 선택의 핵심은 유행이 아니라 데이터 구조, 조회 패턴, 일관성 요구입니다. 어떤 질문을 자주 던질지 먼저 봐야 합니다.",
      },
    ],
  },
  ch07_q02: {
    qaId: "ch07_q02",
    answers: [
      {
        correctIdx: 0,
        explanation: "SELECT는 조건에 맞는 데이터를 읽어 오는 명령입니다. 추가는 INSERT, 변경은 UPDATE, 삭제는 DELETE가 맡습니다.",
      },
      {
        correctIdx: 1,
        explanation: "새 행을 추가할 때는 INSERT를 사용합니다. 기존 값을 고칠 때는 UPDATE를 씁니다.",
      },
      {
        correctIdx: 2,
        explanation: "UPDATE에 WHERE 조건이 빠지면 의도보다 훨씬 많은 행이 함께 바뀔 수 있습니다. 수정문은 특히 범위를 신중히 확인해야 합니다.",
      },
    ],
  },
  ch07_q03: {
    qaId: "ch07_q03",
    answers: [
      {
        correctIdx: 1,
        explanation: "원자성은 트랜잭션이 일부만 남지 않도록 전부 성공하거나 전부 취소되게 만드는 성질입니다.",
      },
      {
        correctIdx: 2,
        explanation: "고립성은 동시에 진행 중인 여러 작업이 서로의 미완성 결과를 함부로 보거나 섞지 않게 만드는 성질입니다.",
      },
      {
        correctIdx: 3,
        explanation: "지속성은 성공 완료된 결과가 전원 장애나 시스템 재시작 뒤에도 유지되어야 한다는 뜻입니다.",
      },
    ],
  },
  ch07_q04: {
    qaId: "ch07_q04",
    answers: [
      {
        correctIdx: 2,
        explanation: "인덱스는 책 뒤 색인처럼 원하는 위치를 빨리 찾아가게 돕는 길잡이입니다. 본문 전체 그 자체는 아닙니다.",
      },
      {
        correctIdx: 3,
        explanation: "인덱스는 정렬된 구조를 따라 범위를 좁혀 가며 필요한 위치를 찾습니다. 그래서 전체 스캔보다 적은 비교로 결과에 도달할 수 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "인덱스가 많아질수록 INSERT나 UPDATE 시 인덱스도 함께 갱신해야 하므로 쓰기 비용과 저장 공간이 늘어날 수 있습니다.",
      },
    ],
  },
  ch07_q05: {
    qaId: "ch07_q05",
    answers: [
      {
        correctIdx: 3,
        explanation: "정규화의 핵심 목적은 중복을 줄이고, 그 결과로 생기는 수정 이상과 모순을 막는 데 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "같은 주소가 여러 행에 반복되면 일부만 고쳐지는 수정 이상이 생길 수 있습니다. 정규화는 이런 문제를 줄이기 위한 설계입니다.",
      },
      {
        correctIdx: 1,
        explanation: "1, 2, 3정규형은 중복과 함수 종속 문제를 단계적으로 줄여 가는 설계 원칙으로 이해하는 편이 실용적입니다.",
      },
    ],
  },
  ch07_q06: {
    qaId: "ch07_q06",
    answers: [
      {
        correctIdx: 0,
        explanation: "격리 수준은 동시에 실행되는 트랜잭션이 서로 어디까지 영향을 주고받을 수 있는지 정하는 규칙입니다.",
      },
      {
        correctIdx: 1,
        explanation: "Read Uncommitted에서는 아직 커밋되지 않은 값을 읽는 더티 리드가 발생할 수 있습니다. 가장 약한 수준의 대표적 위험입니다.",
      },
      {
        correctIdx: 2,
        explanation: "Serializable은 동시 실행이어도 결과가 마치 한 줄로 순서대로 처리된 것처럼 보이게 하는 가장 강한 격리 수준입니다. 대신 비용이 더 클 수 있습니다.",
      },
    ],
  },
};
