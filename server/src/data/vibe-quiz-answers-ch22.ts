import type { QuizAnswerSet } from './quiz-answers';

// 22강(속 ch22) «커밋·PR·보안» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch22.ts CH22_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

export const CH22_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch22_q01: {
    qaId: 'ch22_q01',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '결과물에는 무엇이 바뀌었는지가 남지만 왜 바뀌었는지는 없습니다. 나중에 필요한 건 대개 «왜»입니다.',
      },
      {
        correctIdx: 3,
        explanation:
          '쪽지는 결과물을 좋게 만들지 않습니다. 읽는 사람이 다시 안 열어 봐도 알게 하고, 되돌릴지 판단하게 하고, 같은 일을 두 번 안 하게 합니다.',
      },
      {
        correctIdx: 1,
        explanation: '길이가 아니라 «왜»가 들어 있는지가 좋은 쪽지를 가릅니다. 한두 줄이면 충분합니다.',
      },
    ],
  },
  ch22_q02: {
    qaId: 'ch22_q02',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '무엇을 바꿨나 · 왜 바꿨나 · 이번엔 안 한 것. 셋째 칸은 12강의 «안 하는 것»과 같은 자리입니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '무엇을 바꿨는지 알려 주지 않으면서 쪽지가 있는 것처럼 보이게 만듭니다. 그래서 없는 것보다 나쁩니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '«이것저것 많이 고침»밖에 안 나온다면 덩어리가 너무 큰 것입니다. 13강의 «한 단계 = 결과물 하나»가 여기서도 통합니다.',
      },
    ],
  },
  ch22_q03: {
    qaId: 'ch22_q03',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '사람 정보(이름·연락처·사진) · 열쇠(새면 남이 내 이름으로 씀) · 아직 안 정한 것(시험 문제, 발표 전 자료).',
      },
      {
        correctIdx: 0,
        explanation:
          '만들 때 편하려고 넣어 둔 것을 넘길 때 잊어버립니다. 그래서 필요한 건 지식이 아니라 «보내기 전에 한 번 본다»는 습관입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '지워도 이미 본 사람은 봤고, 열쇠는 지운다고 무효가 되지 않습니다 — 새로 만들어야 무효가 됩니다. 알리고 바꾸는 것이 언제나 빠릅니다.',
      },
    ],
  },
  ch22_q04: {
    qaId: 'ch22_q04',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '세 번의 검색(이름·긴 숫자·열쇠 낱말)을 실제로 하고, 무엇을 확인했는지 구체적으로 적는 칸입니다.',
      },
      {
        correctIdx: 3,
        explanation:
          '맞춤법은 이 검색의 대상이 아닙니다. 사람 이름 · 숫자가 길게 이어진 문자열 · «비밀번호·열쇠» 낱말 셋입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '«필요해서»에는 무엇이 곤란했는지가 없습니다. 그게 없으면 나중에 되돌릴지 판단할 수 없어 «왜»의 쓸모가 사라집니다.',
      },
    ],
  },
};
