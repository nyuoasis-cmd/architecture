import type { QuizAnswerSet } from './quiz-answers';

// ch06장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH06_ANSWERS: Record<string, QuizAnswerSet> = {
  ch06_q01: {
    qaId: "ch06_q01",
    answers: [
      {
        correctIdx: 1,
        explanation: "제어 장치는 명령의 의미를 읽고 어떤 부품이 움직여야 하는지 신호를 보내는 역할을 합니다. 계산 자체는 ALU가 주로 맡습니다.",
      },
      {
        correctIdx: 2,
        explanation: "레지스터는 CPU 내부에 있는 아주 빠른 임시 저장 공간입니다. 지금 계산할 값이나 방금 읽은 명령을 잠깐 올려 두는 데 쓰입니다.",
      },
      {
        correctIdx: 3,
        explanation: "ALU는 산술 연산과 논리 연산을 담당합니다. 파일 정리나 네트워크 연결은 CPU 외부의 다른 계층이 맡는 일입니다.",
      },
    ],
  },
  ch06_q02: {
    qaId: "ch06_q02",
    answers: [
      {
        correctIdx: 2,
        explanation: "메모리 종류가 여러 개인 이유는 속도, 용량, 가격, 전원 차단 후 보존 여부를 하나로 모두 만족시키기 어렵기 때문입니다. 그래서 층별 역할 분담이 생깁니다.",
      },
      {
        correctIdx: 3,
        explanation: "RAM은 실행 중인 앱과 데이터를 올려 두는 주 작업 공간입니다. 빠르지만 전원을 끄면 내용이 사라집니다.",
      },
      {
        correctIdx: 0,
        explanation: "SSD와 HDD는 운영체제, 앱, 문서처럼 오래 보관할 데이터를 맡는 장기 저장소입니다. CPU가 직접 실시간 계산하는 작업 공간은 아닙니다.",
      },
    ],
  },
  ch06_q03: {
    qaId: "ch06_q03",
    answers: [
      {
        correctIdx: 3,
        explanation: "프로그램은 저장된 파일이고, 프로세스는 메모리에서 실행 중인 상태이며, 프로세서는 CPU 같은 처리 부품입니다.",
      },
      {
        correctIdx: 0,
        explanation: "같은 앱을 두 번 실행하면 메모리에는 서로 독립된 프로세스 두 개가 만들어집니다.",
      },
      {
        correctIdx: 1,
        explanation: "CPU는 명령을 실제로 처리하는 프로세서입니다.",
      },
    ],
  },
  ch06_q04: {
    qaId: "ch06_q04",
    answers: [
      {
        correctIdx: 0,
        explanation: "캐시는 자주 쓸 데이터를 CPU 가까이에 둬 메모리 접근 대기 시간을 줄이는 장치입니다. 영구 저장이 목적은 아닙니다.",
      },
      {
        correctIdx: 1,
        explanation: "방금 사용한 데이터를 다시 쓸 가능성이 높은 경향을 시간 지역성이라고 합니다. 이 특성이 캐시의 효과를 크게 높여 줍니다.",
      },
      {
        correctIdx: 2,
        explanation: "캐시 적중은 필요한 데이터가 이미 캐시에 있어서 바로 읽을 수 있는 경우입니다. 적중률이 높을수록 CPU가 덜 기다리게 됩니다.",
      },
    ],
  },
  ch06_q05: {
    qaId: "ch06_q05",
    answers: [
      {
        correctIdx: 1,
        explanation: "인터럽트는 장치나 타이머 같은 사건이 발생했을 때 CPU가 잠깐 현재 작업을 멈추고 대응하도록 만드는 신호입니다.",
      },
      {
        correctIdx: 2,
        explanation: "폴링은 CPU가 계속 상태를 반복 확인하는 방식이라 단순하지만 비효율적일 수 있습니다. 인터럽트는 필요한 순간에만 알립니다.",
      },
      {
        correctIdx: 3,
        explanation: "타이머 인터럽트가 있어야 운영체제가 주기적으로 CPU 제어권을 되찾아 각 작업에 시간을 나눠 줄 수 있습니다.",
      },
    ],
  },
  ch06_q06: {
    qaId: "ch06_q06",
    answers: [
      {
        correctIdx: 2,
        explanation: "멀티태스킹의 핵심은 CPU가 작업을 아주 짧은 시간 조각으로 번갈아 실행하는 것입니다. 그래서 동시에 돌아가는 듯한 체감이 생깁니다.",
      },
      {
        correctIdx: 3,
        explanation: "문맥 교환은 현재 작업의 상태를 저장하고 다른 작업 상태를 CPU에 올리는 과정입니다. 이 비용이 너무 크면 오히려 비효율이 생길 수 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "운영체제는 우선순위와 반응성을 고려해 어떤 작업에 CPU를 먼저 줄지 정합니다. 화면 크기나 키보드 색상은 무관합니다.",
      },
    ],
  },
  ch06_q07: {
    qaId: "ch06_q07",
    answers: [
      {
        correctIdx: 3,
        explanation: "가상 메모리는 프로그램마다 넓고 정돈된 주소 공간을 제공하고, 서로 다른 프로그램을 안전하게 격리하는 데 도움을 줍니다.",
      },
      {
        correctIdx: 0,
        explanation: "스왑 공간은 RAM이 부족할 때 덜 쓰는 메모리 일부를 디스크에 잠깐 옮겨 두는 영역입니다. 편리하지만 RAM보다 훨씬 느립니다.",
      },
      {
        correctIdx: 1,
        explanation: "디스크 스왑이 잦아지면 메모리 접근이 매우 느려져 전체 성능이 떨어집니다. 흔히 버벅임이 심해지는 이유가 여기에 있습니다.",
      },
    ],
  },
  ch06_q08: {
    qaId: "ch06_q08",
    answers: [
      {
        correctIdx: 0,
        explanation: "파일 시스템은 파일 이름, 폴더 구조, 실제 저장 위치, 권한, 복구 규칙을 함께 관리해 저장 장치를 일관되게 다루게 합니다.",
      },
      {
        correctIdx: 1,
        explanation: "inode는 파일 이름표 뒤에서 실제 저장 위치와 권한, 수정 시각 같은 메타데이터를 담는 구조입니다.",
      },
      {
        correctIdx: 2,
        explanation: "저널링은 중요한 변경 기록을 남겨 장애가 났을 때 손상을 줄이고 복구를 쉽게 만드는 장치입니다.",
      },
    ],
  },
  ch06_q09: {
    qaId: "ch06_q09",
    answers: [
      {
        correctIdx: 1,
        explanation: "디바이스 드라이버는 운영체제의 공통 요청을 장치가 이해하는 구체적 신호로 바꿔 주는 소프트웨어입니다.",
      },
      {
        correctIdx: 2,
        explanation: "운영체제가 모든 장치 세부 규격을 직접 알 필요가 없도록, 드라이버가 공통 인터페이스와 장치별 제어 방식을 이어 줍니다.",
      },
      {
        correctIdx: 3,
        explanation: "그래픽 카드 드라이버가 불안정하면 화면 깨짐이나 출력 이상 같은 문제가 생길 수 있습니다. 드라이버는 안정성에도 직접 영향을 줍니다.",
      },
    ],
  },
  ch06_q10: {
    qaId: "ch06_q10",
    answers: [
      {
        correctIdx: 2,
        explanation: "BIOS나 UEFI는 부팅 초기에 POST 같은 기본 점검을 수행해 하드웨어가 시작 준비가 됐는지 확인합니다.",
      },
      {
        correctIdx: 3,
        explanation: "부트로더는 저장 장치에서 운영체제 커널을 찾아 메모리에 올리고 실행을 넘겨 주는 중간 관리자입니다.",
      },
      {
        correctIdx: 0,
        explanation: "커널은 부팅 이후 드라이버를 초기화하고 파일 시스템을 연결하며 사용자 공간 프로세스를 시작합니다. 로그인 화면은 그 뒤에 나타납니다.",
      },
    ],
  },
};
