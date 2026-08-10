import type { QuizAnswerSet } from './quiz-answers';

// ch04장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH04_ANSWERS: Record<string, QuizAnswerSet> = {
  ch04_q01: {
    qaId: "ch04_q01",
    answers: [
      {
        correctIdx: 3,
        explanation: "정형 데이터는 열과 행이 분명하고 어떤 값이 들어올지 예측하기 쉬운 데이터입니다. 그래서 표 기반 검색과 집계에 잘 맞습니다.",
      },
      {
        correctIdx: 0,
        explanation: "주문마다 선택 항목이 달라질 수 있는 JSON 문서는 공통 뼈대는 있지만 속성이 유동적인 반정형 데이터의 좋은 예입니다.",
      },
      {
        correctIdx: 1,
        explanation: "비정형 데이터는 고정된 칸으로 바로 나누기 어려워 추가 분류나 해석 과정이 필요한 경우가 많습니다. 그래서 집계와 검색도 더 복잡해집니다.",
      },
    ],
  },
  ch04_q02: {
    qaId: "ch04_q02",
    answers: [
      {
        correctIdx: 0,
        explanation: "CSV는 값을 칸으로 구분해 표처럼 적는 단순한 텍스트 포맷입니다. 중첩 구조보다는 행과 열 중심 데이터에 잘 맞습니다.",
      },
      {
        correctIdx: 1,
        explanation: "JSON은 사람이 읽기에도 비교적 간단하고, 프로그램이 객체처럼 바로 다루기 쉬우며 중첩 구조도 표현할 수 있어 웹 API에서 널리 쓰입니다.",
      },
      {
        correctIdx: 2,
        explanation: "XML은 태그를 사용해 데이터의 의미와 계층 구조를 명시적으로 표현하기 좋습니다. 그만큼 장황해질 수 있지만 규칙이 분명합니다.",
      },
    ],
  },
  ch04_q03: {
    qaId: "ch04_q03",
    answers: [
      {
        correctIdx: 1,
        explanation: "정규화의 핵심은 중복을 줄여 같은 사실을 한곳에서 관리하게 만드는 것입니다. 그래야 수정과 검증이 쉬워집니다.",
      },
      {
        correctIdx: 2,
        explanation: "주소가 여러 행에 반복되면 변경 시 일부만 수정될 수 있어 같은 고객 정보가 서로 다르게 보이는 불일치가 생길 수 있습니다.",
      },
      {
        correctIdx: 3,
        explanation: "분리된 테이블은 고객 번호 같은 연결 키로 이어집니다. 이 키 덕분에 정보는 나뉘어 있어도 의미상 연결됩니다.",
      },
    ],
  },
  ch04_q04: {
    qaId: "ch04_q04",
    answers: [
      {
        correctIdx: 2,
        explanation: "색인은 원하는 단어가 나온 위치를 먼저 좁혀 주듯, 인덱스도 전체를 다 읽지 않고 필요한 데이터 위치를 빠르게 찾도록 돕습니다.",
      },
      {
        correctIdx: 3,
        explanation: "인덱스는 자주 조회하는 열에서 특히 효과가 큽니다. 반복 검색이 많은 화면일수록 체감 차이가 커집니다.",
      },
      {
        correctIdx: 0,
        explanation: "인덱스는 조회를 빠르게 하는 대신 쓰기 때도 함께 갱신해야 하므로 저장 공간과 수정 비용이 늘 수 있습니다. 그래서 필요한 곳에만 둬야 합니다.",
      },
    ],
  },
  ch04_q05: {
    qaId: "ch04_q05",
    answers: [
      {
        correctIdx: 3,
        explanation: "원자성은 작업이 전부 성공하거나, 실패하면 처음처럼 되돌아가야 한다는 뜻입니다. 절반만 남는 상태를 허용하지 않습니다.",
      },
      {
        correctIdx: 0,
        explanation: "고립성은 동시에 여러 작업이 진행돼도 서로의 미완성 상태를 함부로 읽거나 덮어쓰지 않게 해 줍니다. 동시성 충돌을 줄이는 핵심입니다.",
      },
      {
        correctIdx: 1,
        explanation: "지속성은 성공이 확정된 결과가 장애 뒤에도 사라지지 않아야 한다는 뜻입니다. 완료 메시지를 보여 줬다면 기록도 남아 있어야 합니다.",
      },
    ],
  },
  ch04_q06: {
    qaId: "ch04_q06",
    answers: [
      {
        correctIdx: 0,
        explanation: "백업은 사본을 남기는 행위이고, 복구는 그 사본으로 실제 서비스를 다시 동작시키는 절차입니다. 둘은 연결되지만 같은 뜻은 아닙니다.",
      },
      {
        correctIdx: 1,
        explanation: "RPO는 장애 시 어느 시점까지의 데이터 손실을 받아들일지 정하는 기준입니다. 백업 간격과 복제 전략에 직접 영향을 줍니다.",
      },
      {
        correctIdx: 2,
        explanation: "실제 장애 때 절차를 처음 수행하면 예상보다 오래 걸리기 쉽습니다. 그래서 복구 훈련은 문서가 아닌 실행 가능한 준비 상태를 확인하는 과정입니다.",
      },
    ],
  },
  ch04_q07: {
    qaId: "ch04_q07",
    answers: [
      {
        correctIdx: 1,
        explanation: "시각화는 먼저 어떤 질문에 답하려는지 정해야 합니다. 그래야 적절한 차트와 강조 방식을 고를 수 있습니다.",
      },
      {
        correctIdx: 2,
        explanation: "축을 잘라 작은 차이를 크게 보이게 하면 실제보다 변화가 과장되어 해석이 왜곡될 수 있습니다. 축과 단위는 솔직해야 합니다.",
      },
      {
        correctIdx: 3,
        explanation: "장식이 많으면 시선이 핵심 패턴보다 꾸밈 요소로 분산됩니다. 좋은 시각화는 한두 포인트만 강조하고 나머지는 조용히 두는 편이 읽기 쉽습니다.",
      },
    ],
  },
};
