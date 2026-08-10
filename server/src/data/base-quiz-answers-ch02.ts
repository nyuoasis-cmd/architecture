import type { QuizAnswerSet } from './quiz-answers';

// ch02장 정답·해설 — scripts/rebalance-base-quiz.mjs 가 생성했다. 서버에만 둔다.
// 한 문의 정답이 전부 같은 자리에 몰리지 않도록 자리를 흩어 두었다(baseQuizContract ⑦⑧).
export const CH02_ANSWERS: Record<string, QuizAnswerSet> = {
  ch02_q01: {
    qaId: "ch02_q01",
    answers: [
      {
        correctIdx: 0,
        explanation: "시스템 소프트웨어는 운영체제나 드라이버처럼 컴퓨터 바닥에서 자원과 장치를 정리하는 역할을 맡습니다. 사용자가 직접 목표를 수행하는 앱과는 위치가 다릅니다.",
      },
      {
        correctIdx: 1,
        explanation: "문서 작성 앱과 게임은 사용자가 직접 목적을 이루기 위해 쓰는 도구이므로 응용 소프트웨어에 가깝습니다. 드라이버나 파일 시스템은 바닥 운영 쪽입니다.",
      },
      {
        correctIdx: 2,
        explanation: "미들웨어는 응용 프로그램들이 공통 기능과 연결을 더 쉽게 쓰게 돕는 중간층입니다. 하드웨어 부품이나 전원 장치가 아닙니다.",
      },
    ],
  },
  ch02_q02: {
    qaId: "ch02_q02",
    answers: [
      {
        correctIdx: 1,
        explanation: "오픈소스 소프트웨어는 소스 코드가 공개되고, 라이선스가 허용하는 범위 안에서 수정과 배포가 가능합니다. 다만 조건이 전혀 없는 것은 아니므로 라이선스를 읽어야 합니다.",
      },
      {
        correctIdx: 2,
        explanation: "상용 소프트웨어는 기능뿐 아니라 사용 목적과 라이선스 범위를 함께 확인해야 합니다. 학생용과 상업용처럼 허용 범위가 달라질 수 있기 때문입니다.",
      },
      {
        correctIdx: 3,
        explanation: "GPL은 오픈소스 라이선스의 한 종류로, 수정본을 배포할 때 공개 의무가 붙을 수 있습니다. 단순 할인 제도나 하드웨어 계약과는 성격이 다릅니다.",
      },
    ],
  },
  ch02_q03: {
    qaId: "ch02_q03",
    answers: [
      {
        correctIdx: 2,
        explanation: "모듈은 한 가지 기능을 맡는 비교적 작은 코드 묶음입니다. 여러 모듈이 모여 더 큰 패키지를 이루는 경우가 많습니다.",
      },
      {
        correctIdx: 3,
        explanation: "패키지는 모듈 여러 개를 묶어 배포하는 단위입니다. 항상 하나의 파일만 의미하지는 않으며, 내부에 다양한 기능이 함께 들어갈 수 있습니다.",
      },
      {
        correctIdx: 0,
        explanation: "npm과 pip는 패키지를 설치하고 버전과 의존성을 관리하는 도구입니다. CPU 속도를 직접 올리거나 운영체제를 새로 만드는 도구가 아닙니다.",
      },
    ],
  },
  ch02_q04: {
    qaId: "ch02_q04",
    answers: [
      {
        correctIdx: 3,
        explanation: "클라우드는 인터넷 너머의 서버와 저장소 같은 자원을 빌려 쓰는 방식입니다. 단순한 입력 장치나 오프라인 디스크를 뜻하지 않습니다.",
      },
      {
        correctIdx: 0,
        explanation: "SaaS는 브라우저나 앱으로 접속해 바로 쓰는 완성형 소프트웨어 서비스입니다. 사용자가 서버 장비를 직접 조립하는 단계는 아닙니다.",
      },
      {
        correctIdx: 1,
        explanation: "일반적으로 아래층에서 위층으로 갈수록 IaaS, PaaS, SaaS 순으로 올라갑니다. 인프라를 빌리는 단계에서 완성 서비스를 쓰는 단계로 추상화가 높아지는 구조입니다.",
      },
    ],
  },
};
