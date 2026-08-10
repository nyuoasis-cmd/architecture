import type { QuizAnswerSet } from './quiz-answers';

// ch05장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH05_ANSWERS: Record<string, QuizAnswerSet> = {
  ch05_q01: {
    qaId: "ch05_q01",
    answers: [
      {
        correctIdx: 2,
        explanation: "프론트엔드는 버튼, 입력창, 화면 전환처럼 사용자가 직접 보는 경험을 맡습니다. 백업이나 권한 저장 같은 뒤쪽 운영은 주로 백엔드 성격이 더 강합니다.",
      },
      {
        correctIdx: 3,
        explanation: "백엔드는 주문 계산, 권한 확인, 데이터 저장처럼 서비스 규칙과 안정성을 처리합니다. 버튼 색이나 여백처럼 보이는 문제는 프론트엔드 영역에 가깝습니다.",
      },
      {
        correctIdx: 0,
        explanation: "프론트엔드와 백엔드를 나누면 화면 경험과 비즈니스 규칙을 각자 더 분명하게 다듬을 수 있고, 팀도 동시에 협업하기 쉬워집니다.",
      },
    ],
  },
  ch05_q02: {
    qaId: "ch05_q02",
    answers: [
      {
        correctIdx: 3,
        explanation: "HTML은 제목, 본문, 버튼 같은 요소가 어떤 구조로 놓일지 적는 뼈대입니다. 시각 효과나 서버 동작을 직접 맡지는 않습니다.",
      },
      {
        correctIdx: 0,
        explanation: "CSS는 색상, 글자 크기, 여백, 정렬처럼 화면이 어떻게 보일지를 담당합니다. 로그인 검증이나 데이터 저장은 다른 층의 일입니다.",
      },
      {
        correctIdx: 1,
        explanation: "클릭 후 목록을 다시 보여 주는 반응은 JavaScript가 맡는 대표 사례입니다. 제목을 적거나 색만 칠하는 일과는 역할이 다릅니다.",
      },
    ],
  },
  ch05_q03: {
    qaId: "ch05_q03",
    answers: [
      {
        correctIdx: 0,
        explanation: "API는 프론트엔드와 백엔드가 어떤 요청을 보내고 어떤 응답을 받을지 정해 둔 대화 창구입니다. 단순한 색 규칙이나 하드웨어가 아닙니다.",
      },
      {
        correctIdx: 1,
        explanation: "REST에서는 사용자, 주문, 게시글 같은 자원을 기준으로 주소를 나누고, 메서드로 행동을 표현하는 흐름을 자주 씁니다.",
      },
      {
        correctIdx: 2,
        explanation: "REST에서는 한 번의 요청에 필요한 정보가 충분히 담겨 있어야 처리와 확장이 단순해집니다. 서버가 숨은 상태를 과하게 기억하는 흐름과는 거리가 있습니다.",
      },
    ],
  },
  ch05_q04: {
    qaId: "ch05_q04",
    answers: [
      {
        correctIdx: 1,
        explanation: "SPA는 브라우저가 코드를 받아 필요한 부분만 바꿔 가며 화면을 움직이는 방식입니다. 그래서 앱처럼 매끄러운 전환이 가능한 경우가 많습니다.",
      },
      {
        correctIdx: 2,
        explanation: "SSR은 서버가 먼저 HTML을 만들어 보내므로 첫 화면 내용을 더 빨리 보여 주기 쉬운 편입니다. 다만 이후 흐름은 서비스 설계에 따라 달라집니다.",
      },
      {
        correctIdx: 3,
        explanation: "SPA와 SSR 비교의 핵심은 화면을 언제 어디서 만들어 주느냐입니다. 첫 진입 속도와 이후 상호작용 감각도 이 차이에서 나옵니다.",
      },
    ],
  },
  ch05_q05: {
    qaId: "ch05_q05",
    answers: [
      {
        correctIdx: 2,
        explanation: "상태 관리는 여러 화면과 컴포넌트가 같은 현재 정보를 일관되게 보도록 돕습니다. 디자인 꾸밈 자체가 목적은 아닙니다.",
      },
      {
        correctIdx: 3,
        explanation: "헤더와 결제 화면의 장바구니 수가 다르면 같은 상태를 여러 곳에서 따로 들고 있어 어긋난 상황으로 볼 수 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "Context, Redux, Zustand는 모두 공통 상태를 어떻게 보관하고 갱신할지 도와주는 방식이나 도구입니다. 브라우저 종류나 데이터베이스 종류가 아닙니다.",
      },
    ],
  },
  ch05_q06: {
    qaId: "ch05_q06",
    answers: [
      {
        correctIdx: 3,
        explanation: "프레임워크와 라이브러리는 반복되는 UI 문제를 매번 맨손으로 풀지 않도록 공통 규칙과 도구를 제공합니다. 서버를 없애는 기술은 아닙니다.",
      },
      {
        correctIdx: 0,
        explanation: "컴포넌트 방식의 큰 장점은 한 번 만든 UI 조각을 여러 곳에서 다시 쓸 수 있다는 점입니다. 이렇게 해야 큰 화면도 구조적으로 관리하기 쉽습니다.",
      },
      {
        correctIdx: 1,
        explanation: "도구 선택은 유행보다 팀의 익숙함, 유지보수 기간, 필요한 기능, 생태계 지원을 함께 보는 편이 현실적입니다.",
      },
    ],
  },
  ch05_q07: {
    qaId: "ch05_q07",
    answers: [
      {
        correctIdx: 0,
        explanation: "빌드 도구는 여러 소스 파일과 자산을 브라우저가 읽기 쉬운 형태로 정리해 줍니다. 단순한 주변기기 설정 도구가 아닙니다.",
      },
      {
        correctIdx: 1,
        explanation: "개발 중에는 저장 직후 빠르게 반영되고 화면이 곧바로 갱신되는 경험이 매우 중요합니다. 빌드 도구는 이 흐름을 크게 개선해 줍니다.",
      },
      {
        correctIdx: 2,
        explanation: "번들링은 여러 파일을 전달하기 좋은 묶음으로 정리하는 과정입니다. 최적화나 압축과 함께 배포 준비의 핵심 단계로 자주 다뤄집니다.",
      },
    ],
  },
};
