import type { QuizAnswerSet } from './quiz-answers';

// 17장 «재고, 지키고, 운영하기» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch17.ts CH17_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.
// (어긋나면 server/src/lib/vibeQuizContract.test.ts 가 빨강을 낸다.)

export const CH17_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch17_q01: {
    qaId: 'ch17_q01',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '고친 뒤에만 재면 비교 대상이 기억뿐이고, 기억은 늘 후하게 편집됩니다. 고치기 전 30초 기록이 «좋아졌다»를 주장할 수 있게 만들어 줍니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '세 가지를 한 번에 고치면 좋아져도 무엇 덕분인지, 나빠져도 무엇 탓인지 알 수 없습니다. 하나 고치고 재는 리듬이 배움을 남깁니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '몸무게를 잴 때 같은 저울·같은 시간에 재는 것과 같습니다. 잣대를 문장으로 정해 두면(15장 검사 문장) 전후 비교가 공정해집니다.',
      },
    ],
  },
  ch17_q02: {
    qaId: 'ch17_q02',
    answers: [
      {
        correctIdx: 1,
        explanation:
          'AI의 답은 매번 다르므로 한 번의 시험 결과는 그 기능의 실력이 아니라 표본입니다. 표본을 실력으로 적으면 다음 측정에서 유령을 쫓게 됩니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '"몇 번 쟀어?"가 그 숫자를 해석할 수 있게 만듭니다. 재는 횟수를 안 적은 숫자는 나중에 아무도 해석할 수 없습니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '흔들림 안의 우연일 수 있습니다. 몇 번 더 재 보고 그래도 나쁘면 그때 원인을 찾습니다 — 측정과의 건강한 거리감이 운영의 기본기입니다.',
      },
    ],
  },
  ch17_q03: {
    qaId: 'ch17_q03',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '못 찾음(자료를 못 가져옴)과 잘못 말함(가져왔는데 이상하게 말함)은 고치는 방법이 완전히 다릅니다. 그래서 나눠서 진단합니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '사서가 엉뚱한 책을 꺼내 왔는데 요약 실력을 탓하는 일이 흔합니다. 답이 이상하면 먼저 무엇을 꺼내 왔는지를 봅니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '문서가 뒤죽박죽이면 최고의 사서도 못 찾습니다. 자료를 잘게 나누고 제목을 다는 것만으로 찾기 성공률이 크게 오릅니다.',
      },
    ],
  },
  ch17_q04: {
    qaId: 'ch17_q04',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '맡긴 일의 수, 한 번에 통과한 비율, 평균 수정 횟수. 이 세 숫자면 "AI가 요즘 왜 이래"가 구체적인 대화로 바뀝니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '숫자는 원인을 말해 주지 않습니다. 부탁문이 나빠졌는지, 일 크기가 커졌는지, 프로젝트가 복잡해졌는지는 찾아봐야 합니다. 숫자는 종을 울릴 뿐입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '수정 횟수가 줄어드는 것은 AI가 좋아진 것이 아니라 대부분 내 부탁문이 좋아진 것입니다. 성적표는 그 성장을 눈에 보이게 해 줍니다.',
      },
    ],
  },
  ch17_q05: {
    qaId: 'ch17_q05',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '호출 제한은 «얼마나 자주»를 막고, 출구 검사는 «무엇이 나가는가»를 봅니다. 서로 다른 층의 안전장치라 서로를 대신하지 못합니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '팻말은 읽는 쪽의 협조에 기대지만 출구 검사는 기대지 않습니다. AI가 어떤 답을 만들든 문을 통과하지 못하면 나가지 못합니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '떠오른 최악들이 그대로 검사 목록이 됩니다. 잘림·앱에 없는 규칙·형식 어긋남처럼요. 목록이 짧아도 문이 있는 것과 없는 것의 차이가 훨씬 큽니다.',
      },
    ],
  },
  ch17_q06: {
    qaId: 'ch17_q06',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '혼자 시험할 때는 절대 닿지 않던 한도에, 30명이 동시에 누르는 순간 부딪히는 것입니다. 버그가 아니라 설계에서 빠뜨린 숫자입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '30명 × 2번 = 분당 60번으로 딱 한도입니다. 세 번씩 누르면 90번이 되어 초과합니다. 이 환산 한 줄이 수업 중 사고와 수업 전 발견을 가릅니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '능력만 보고 고르면 하루 70장짜리 모델로 20명 수업을 계획하는 일이 생깁니다. 한도를 반드시 우리 반 인원수로 환산해 봐야 합니다.',
      },
    ],
  },
  ch17_q07: {
    qaId: 'ch17_q07',
    answers: [
      {
        correctIdx: 0,
        explanation:
          'AI 호출은 몇 초가 걸리고 돈이 들지만 저장본을 꺼내는 것은 즉시이고 공짜입니다. 30명이 비슷한 질문을 하는 교실에서 차이가 큽니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '사람마다 달라야 하는 답을 저장해 나눠 주면 남의 정보가 샙니다. 급식 반찬은 나눠도 되지만 이름 적힌 도시락은 안 됩니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '"이 답은 누가 물어도 같은가?" 같으면 캐시 후보, 다르면 캐시 금지. 이 구분 하나만 지켜도 캐시는 안전한 도구가 됩니다.',
      },
    ],
  },
};
