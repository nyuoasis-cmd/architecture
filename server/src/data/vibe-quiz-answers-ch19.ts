import type { QuizAnswerSet } from './quiz-answers';

// 13강(속 ch19) «나만의 스킬 · /init» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch19.ts CH19_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

export const CH19_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch19_q01: {
    qaId: 'ch19_q01',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '규칙은 «어떻게 써야 하나»(존댓말·길이·호칭), 스킬은 «무엇을 어떤 차례로 하나»입니다. 둘을 한 문서에 욱여넣으면 이번에 필요한 순서만 골라 읽기가 어려워집니다.',
      },
      {
        correctIdx: 0,
        explanation: '세 번이면 우연이 아니라 습관입니다. 습관이 된 일은 이름을 붙여 둘 때가 된 것입니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '시간도 아끼지만 더 큰 것은 빠뜨림이 없어진다는 것입니다. 말로 설명하면 바쁜 날 한 단계가 빠지고, 회신란 없는 안내문이 그렇게 나갑니다.',
      },
    ],
  },
  ch19_q02: {
    qaId: 'ch19_q02',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '이름(부르면 딸려오는 짧은 말) · 언제 쓰나(꺼내는 상황) · 단계(무엇을 어떤 차례로). 가운데가 가장 자주 빕니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '스킬이 열 개쯤 쌓였을 때 아무도 못 고릅니다. 도구 상자에 이름표 없는 도구가 가득한 것과 같습니다 — 있는데 못 씁니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '너무 굵으면 아무것도 안 정해지고, 너무 잘면 읽다가 지칩니다. «한 단계 = 결과물이 하나 나오는 일»이 좋은 기준입니다.',
      },
    ],
  },
  ch19_q03: {
    qaId: 'ch19_q03',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '두 번 이하면 그냥 하는 게 낫고, 다섯 번 이상이면 적는 게 확실히 이득입니다. 세 번은 애매한 경계인데, 반복은 대체로 예상보다 많이 일어납니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '멈추는 순간이 이 강의 진짜 소득입니다. 머릿속에 있을 때는 안 보이던 빈 곳이 글로 옮기면 드러납니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '완벽을 노리면 10분이 한 시간이 되고 결국 안 적게 됩니다. 세 단계만 적고 써 보다가 막히는 자리에 한 줄씩 더하는 게 낫습니다.',
      },
    ],
  },
  ch19_q04: {
    qaId: 'ch19_q04',
    answers: [
      {
        correctIdx: 0,
        explanation: '안 해 본 일을 적으면 단계가 상상이 되고, 상상한 단계에서는 빈 곳이 드러나지 않습니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '실제로 해 본 일이라야 «그다음에 뭐 하지?»에서 멈추는 순간이 옵니다. 그 멈춤이 빈 곳을 알려 줍니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '«언제 쓰나»가 비어 꺼낼 상황이 안 정해진 경우, 그리고 단계가 너무 굵어 누가 읽어도 같은 일을 못 하는 경우입니다.',
      },
    ],
  },
};
