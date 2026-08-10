import type { QuizAnswerSet } from './quiz-answers';

// ch01장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH01_ANSWERS: Record<string, QuizAnswerSet> = {
  ch01_q01: {
    qaId: "ch01_q01",
    answers: [
      {
        correctIdx: 0,
        explanation: "컴퓨터의 큰 흐름은 입력을 받아 처리한 뒤 결과를 출력하는 것입니다. 나머지 선택지는 특정 사용 장면일 뿐 기본 구조를 설명하지 못합니다.",
      },
      {
        correctIdx: 1,
        explanation: "냄비는 재료를 올려 두고 조리 중인 상태를 유지하므로 메모리 비유에 가깝습니다. 재료 창고나 영수증은 입력 또는 보관 쪽에 더 가깝습니다.",
      },
      {
        correctIdx: 2,
        explanation: "사진, 문자, 소리처럼 겉모습이 달라도 컴퓨터 안에서는 모두 0과 1의 조합으로 바뀌어 처리됩니다. 그래서 같은 CPU와 메모리 체계로 다룰 수 있습니다.",
      },
    ],
  },
  ch01_q02: {
    qaId: "ch01_q02",
    answers: [
      {
        correctIdx: 1,
        explanation: "하드웨어는 CPU, RAM, SSD처럼 실제로 존재하는 물리 부품입니다. 문서나 설정 자체는 소프트웨어 또는 데이터에 가깝습니다.",
      },
      {
        correctIdx: 2,
        explanation: "같은 장비라도 어떤 소프트웨어가 올라가느냐에 따라 문서 작업, 게임, 편집처럼 전혀 다른 행동을 하게 됩니다. 하드웨어만으로 목적이 저절로 바뀌지는 않습니다.",
      },
      {
        correctIdx: 3,
        explanation: "무대와 조명은 하드웨어 쪽이고, 장면 순서와 대사를 정하는 대본이 소프트웨어 역할입니다. 소프트웨어는 부품에 무엇을 하라고 지시하는 쪽입니다.",
      },
    ],
  },
  ch01_q03: {
    qaId: "ch01_q03",
    answers: [
      {
        correctIdx: 2,
        explanation: "운영체제는 앱과 하드웨어 사이에서 자원과 공통 규칙을 조정하는 중심 소프트웨어입니다. 배경화면 저장이나 선 길이 측정은 운영체제의 본질적 역할이 아닙니다.",
      },
      {
        correctIdx: 3,
        explanation: "여러 앱이 동시에 열리면 CPU 시간과 메모리를 어떻게 나눌지가 핵심입니다. 운영체제는 이 자원 분배를 계속 조정해 충돌을 줄입니다.",
      },
      {
        correctIdx: 0,
        explanation: "파일 관리는 영수증과 예약 정보를 정리해 필요할 때 다시 찾을 수 있게 만드는 일과 비슷합니다. 단순히 불을 끄거나 식탁 수를 줄이는 일과는 다릅니다.",
      },
    ],
  },
  ch01_q04: {
    qaId: "ch01_q04",
    answers: [
      {
        correctIdx: 3,
        explanation: "일반적으로 데이터는 저장소에서 RAM으로 올라오고, CPU가 그 RAM의 데이터를 읽어 처리합니다. 모니터나 키보드는 이 핵심 이동 경로의 중심이 아닙니다.",
      },
      {
        correctIdx: 0,
        explanation: "RAM은 빠르게 읽고 쓰는 작업 공간이지만 전원을 끄면 내용이 사라지는 휘발성 메모리입니다. 오래 남는 저장은 SSD 같은 저장소가 맡습니다.",
      },
      {
        correctIdx: 1,
        explanation: "캐시는 자주 쓰는 정보를 CPU 가까이에 둬서 다시 찾는 시간을 줄이려는 장치입니다. 영구 저장이 목적이 아니라 속도를 높이는 것이 핵심입니다.",
      },
    ],
  },
};
