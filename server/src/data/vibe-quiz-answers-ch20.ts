import type { QuizAnswerSet } from './quiz-answers';

// 16강(속 ch20) «기획 · 요구사항·이슈·AC» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch20.ts CH20_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

export const CH20_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch20_q01: {
    qaId: 'ch20_q01',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '«완료»는 결과의 이름이지 결과의 모습이 아닙니다. 이름만 주고받으면 각자 자기가 아는 모습을 떠올립니다 — 12강의 흔들리는 칸과 같은 일입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '안 정하면 AI가 정합니다. 화면만 뜨면 완료인지, 실제로 빌려져야 완료인지 — 대개 가장 쉬운 쪽으로 정해집니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '«잘 동작한다»는 눌러 볼 장면이 안 떠오릅니다. «책 한 권을 빌리면 내 목록에 그 책이 보인다»는 떠오릅니다 — 떠오르면 판정할 수 있습니다.',
      },
    ],
  },
  ch20_q02: {
    qaId: 'ch20_q02',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '무엇이(누가 무엇을 하면) · 어떻게 되면(무슨 일이 일어나야 하는지) · 어떻게 확인(어디서 눈으로 보는지). 세 조각을 «~하면 ~된다» 형식에 담습니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '막혀야 하는 장면을 안 적으면 AI는 성공 경로만 만듭니다. 잘못된 경우가 아무 데도 안 막힙니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '숫자를 못 넣겠다는 건 아직 무엇을 재야 할지 정하지 못했다는 뜻입니다. 조건이 흐리다는 신호로 읽으세요.',
      },
    ],
  },
  ch20_q03: {
    qaId: 'ch20_q03',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '이미 만들어진 것을 앞에 두면 기준이 그것에 맞게 깎입니다. 그렇게 적힌 기준은 언제나 통과합니다 — 통과하도록 적었으니까요.',
      },
      {
        correctIdx: 1,
        explanation:
          '쓸 것이 없다는 건 무엇을 만들지가 아직 안 정해졌다는 뜻입니다. 만들고 나서 알면 만든 것을 버려야 하니, 지금 아는 게 가장 쌉니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '고쳐도 됩니다. 다만 조용히 고치면 «결과에 맞춰 깎기»와 구분되지 않습니다. 왜 고쳤는지 한 줄이 그 둘을 가릅니다.',
      },
    ],
  },
  ch20_q04: {
    qaId: 'ch20_q04',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '아직 안 끝난 일이어야 합니다. 끝난 일에 적으면 앞 문항에서 배운 «기준 깎기»를 그대로 하게 됩니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '이미 되어 있는 것만 조건으로 남고 안 된 것은 빠집니다. 그러면 100% 통과하는 기준이 되어 아무 일도 하지 않습니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '«막혀야 하는 장면»이 통째로 비는 경우, 그리고 확인 방법이 «보면 안다»인 경우입니다. 둘 다 판정을 사람마다 갈리게 만듭니다.',
      },
    ],
  },
};
