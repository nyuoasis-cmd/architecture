import type { QuizAnswerSet } from './quiz-answers';

// ch08장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH08_ANSWERS: Record<string, QuizAnswerSet> = {
  ch08_q01: {
    qaId: "ch08_q01",
    answers: [
      {
        correctIdx: 1,
        explanation: "IP는 목적지를 찾기 위한 주소 체계에 가깝습니다. 데이터가 어느 방향으로 가야 하는지 알려 주는 역할이지, 순서 확인까지 모두 맡지는 않습니다.",
      },
      {
        correctIdx: 2,
        explanation: "TCP는 확인 응답과 재전송을 통해 빠진 조각을 다시 보내고 순서를 맞추는 방식입니다. 그래서 웹 페이지나 결제처럼 완전성이 중요한 경우에 자주 쓰입니다.",
      },
      {
        correctIdx: 3,
        explanation: "UDP는 확인 절차를 줄여 지연을 낮추는 대신 일부 손실을 감수할 수 있습니다. 실시간 음성이나 게임처럼 타이밍이 중요한 상황에 잘 맞습니다.",
      },
    ],
  },
  ch08_q02: {
    qaId: "ch08_q02",
    answers: [
      {
        correctIdx: 2,
        explanation: "HTTP는 웹 요청과 응답의 형식을 정하는 기본 규칙입니다. 암호화나 인증서 검사는 HTTPS에서 추가됩니다.",
      },
      {
        correctIdx: 3,
        explanation: "HTTPS는 TLS를 사용해 통신 내용을 암호화하고, 중간에서 읽거나 바꾸기 어렵게 만듭니다. 핵심은 통로 보호입니다.",
      },
      {
        correctIdx: 0,
        explanation: "인증서는 접속한 서버가 정말 해당 도메인의 주체인지 확인하는 데 쓰입니다. 단순 속도 향상용 장식이 아닙니다.",
      },
    ],
  },
  ch08_q03: {
    qaId: "ch08_q03",
    answers: [
      {
        correctIdx: 3,
        explanation: "DNS의 핵심 역할은 사람이 기억하는 도메인 이름을 컴퓨터가 통신에 쓰는 IP 주소로 바꾸는 것입니다.",
      },
      {
        correctIdx: 0,
        explanation: "브라우저나 운영체제는 같은 주소를 다시 물을 때 더 빨리 처리하려고 먼저 로컬 캐시를 확인합니다.",
      },
      {
        correctIdx: 1,
        explanation: "DNS 응답이 틀리거나 느리면 실제 서버는 살아 있어도 사용자는 사이트가 열리지 않는 것처럼 느낄 수 있습니다.",
      },
    ],
  },
  ch08_q04: {
    qaId: "ch08_q04",
    answers: [
      {
        correctIdx: 0,
        explanation: "CDN은 정적 콘텐츠를 여러 지역 거점에 복사해 두고, 사용자와 가까운 곳에서 전달해 지연 시간을 줄입니다.",
      },
      {
        correctIdx: 1,
        explanation: "엣지 서버는 사용자 가까이에 위치한 CDN 거점으로, 원본 서버 대신 복사된 콘텐츠를 빠르게 전달하는 역할을 합니다.",
      },
      {
        correctIdx: 2,
        explanation: "CDN을 쓰면 요청이 여러 거점으로 분산되어 원본 서버 한곳에 트래픽이 몰리는 부담을 줄일 수 있습니다.",
      },
    ],
  },
  ch08_q05: {
    qaId: "ch08_q05",
    answers: [
      {
        correctIdx: 1,
        explanation: "방화벽은 규칙에 따라 어떤 트래픽을 허용하고 차단할지 결정하는 출입 통제 장치입니다.",
      },
      {
        correctIdx: 2,
        explanation: "VPN은 공용 인터넷 위에 암호화된 전용 터널을 만들어 외부에서도 내부망처럼 안전하게 연결하게 합니다.",
      },
      {
        correctIdx: 3,
        explanation: "방화벽과 VPN은 각각 통과 여부와 통신 경로 보호를 맡으므로, 실제 보안 환경에서는 함께 쓰이며 서로를 보완합니다.",
      },
    ],
  },
  ch08_q06: {
    qaId: "ch08_q06",
    answers: [
      {
        correctIdx: 2,
        explanation: "WebSocket은 처음 연결을 연 뒤 그 통로를 유지하면서 양방향으로 계속 메시지를 주고받을 수 있는 방식입니다.",
      },
      {
        correctIdx: 3,
        explanation: "실시간 채팅은 서버가 먼저 새 메시지를 밀어 넣어야 하므로 WebSocket의 양방향 연결 유지 특성과 잘 맞습니다.",
      },
      {
        correctIdx: 0,
        explanation: "일반적인 정적 페이지 조회나 단순 폼 전송은 여전히 HTTP가 더 단순하고 적합한 경우가 많습니다. WebSocket이 모든 상황의 대체재는 아닙니다.",
      },
    ],
  },
  ch08_q07: {
    qaId: "ch08_q07",
    answers: [
      {
        correctIdx: 3,
        explanation: "인증은 접속하려는 사용자가 정말 허가된 대상인지 확인하는 과정입니다. 비밀번호, 인증서, 다중 인증이 여기에 해당합니다.",
      },
      {
        correctIdx: 0,
        explanation: "격리는 한 구역이 침해되어도 피해가 전체로 번지지 않게 영역을 나누는 원칙입니다. 네트워크 분리와 권한 분리가 대표적입니다.",
      },
      {
        correctIdx: 1,
        explanation: "최소 권한은 사용자와 서비스에 꼭 필요한 권한만 주는 원칙입니다. 계정 탈취가 일어나도 피해 범위를 줄이는 데 중요합니다.",
      },
    ],
  },
};
