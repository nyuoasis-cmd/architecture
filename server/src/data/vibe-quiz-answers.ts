import type { QuizAnswerSet } from './quiz-answers';
import { CH11_QUIZ_ANSWERS } from './vibe-quiz-answers-ch11';
import { CH12_QUIZ_ANSWERS } from './vibe-quiz-answers-ch12';
import { CH14_QUIZ_ANSWERS } from './vibe-quiz-answers-ch14';
import { CH15_QUIZ_ANSWERS } from './vibe-quiz-answers-ch15';
import { CH16_QUIZ_ANSWERS } from './vibe-quiz-answers-ch16';
import { CH17_QUIZ_ANSWERS } from './vibe-quiz-answers-ch17';

// 13장 «아무도 안 적는 세 칸» 퀴즈 정답·해설.
// 선지 순서는 클라이언트 vibe-ch13.ts CH13_QUIZZES와 1:1 — 수정 시 양쪽을 함께 고친다.

const CH13_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ch13_q01: {
    qaId: 'ch13_q01',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '"한 명이 3권까지"는 어떻게 되어야 하는지에 대한 약속이므로 정책입니다. 검색·대출·버튼은 모두 "할 수 있는 일", 즉 기능입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '규칙 칸은 비워 둔다고 비지 않습니다. AI가 그럴듯한 값으로 조용히 채우고, 앱은 멀쩡해 보이기 때문에 한참 뒤에야 드러납니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '규칙은 "~하면 ~한다" 모양의 문장으로, 숫자·기한·예외 대상을 정해 미리 적습니다. AI에게 "알아서"라고 맡기는 순간 규칙을 정하는 사람이 바뀝니다.',
      },
    ],
  },
  ch13_q02: {
    qaId: 'ch13_q02',
    answers: [
      {
        correctIdx: 1,
        explanation:
          '예외 처리는 빈 값·이상한 값·중복처럼 어긋나는 순간에 앱이 하기로 정한 반응, 곧 "잘못됐을 때의 각본"입니다.',
      },
      {
        correctIdx: 2,
        explanation:
          'AI가 쓴 각본은 꽤 그럴듯해서 검토 없이 지나가기 쉽습니다. 하지만 우리 교실에 맞는 반응인지 아무도 확인한 적이 없다는 사실은 바뀌지 않습니다.',
      },
      {
        correctIdx: 3,
        explanation: '본문이 권한 세 장면은 "칸이 비었을 때, 값이 이상할 때, 같은 일이 두 번일 때"입니다.',
      },
    ],
  },
  ch13_q03: {
    qaId: 'ch13_q03',
    answers: [
      {
        correctIdx: 2,
        explanation:
          '최악의 사용자를 상상하는 것은 의심이 아니라 설계의 기술입니다. 제일 험하게 쓰는 경우를 기준으로 잡아야 모두가 안전해집니다.',
      },
      {
        correctIdx: 3,
        explanation:
          '놀이터 안전 규격은 얌전히 타는 아이가 아니라 서서 타고 거꾸로 타는 아이를 기준으로 정합니다. 앱 설계도 같습니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '안내문이나 명단 공개가 아니라, 떠올린 장난 장면마다 "이런 사용자가 오면 이렇게 한다"를 부탁문에 한 줄씩 적는 것이 방어의 시작입니다.',
      },
    ],
  },
  ch13_q04: {
    qaId: 'ch13_q04',
    answers: [
      {
        correctIdx: 3,
        explanation:
          '데이터 규칙은 "무엇을 저장한다 · 무엇은 저장하지 않는다 · 언제 지운다" 세 부분이 다 있어야 완성입니다. 특히 "언제 지운다"가 자주 빠집니다.',
      },
      {
        correctIdx: 0,
        explanation:
          '세 질문은 "없어도 되는가, 남이 보면 곤란한가, 언제 지우는가"입니다. 멋져 보이는지는 저장 여부를 정하는 기준이 아닙니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '게시판에 붙이는 순간 모두가 보게 되듯, 저장하는 순간 그 정보는 남고 볼 수 있게 됩니다. 화면에 안 보여도 그 감각을 유지해야 합니다.',
      },
    ],
  },
  ch13_q05: {
    qaId: 'ch13_q05',
    answers: [
      {
        correctIdx: 0,
        explanation:
          '데이터의 모양을 그린다는 것은 표의 열 이름과 "한 줄이 무엇을 뜻하는지"를 정하는 일입니다. 색·아이콘·버튼 순서는 화면의 일입니다.',
      },
      {
        correctIdx: 1,
        explanation:
          '표의 모양이 바뀌면 그동안 쌓인 데이터를 새 모양으로 옮겨야 합니다. 쓰던 중간에 상자 구조를 바꾸는 셈이라 사고가 잦습니다.',
      },
      {
        correctIdx: 2,
        explanation:
          '표를 그리면 "같은 학생이 두 줄이면? 칸이 비면? 언제 비우지?" 같은 질문이 저절로 떠오릅니다. 그 질문들이 곧 정책·예외·삭제 시점입니다.',
      },
    ],
  },
  ch13_q06: {
    qaId: 'ch13_q06',
    answers: [
      {
        correctIdx: 1,
        explanation:
          'AI 기획서는 기능과 화면은 풍성하지만 정책·예외·데이터는 거의 등장하지 않습니다. 그 세 칸이 이 장에서 배운 빈칸입니다.',
      },
      {
        correctIdx: 2,
        explanation:
          'AI는 세상의 글을 닮게 답하는데, 세상의 기획서 대부분이 기능·화면 중심이라 세 칸을 닮을 재료가 적습니다.',
      },
      {
        correctIdx: 3,
        explanation:
          '버리는 것도 그대로 쓰는 것도 아닙니다. 출발점으로 쓰되 세 칸 검사표를 들고 빈칸을 찾아, 우리 교실을 아는 내가 채우는 것이 올바른 분업입니다.',
      },
    ],
  },
};

export const VIBE_QUIZ_ANSWERS: Record<string, QuizAnswerSet> = {
  ...CH11_QUIZ_ANSWERS,
  ...CH12_QUIZ_ANSWERS,
  ...CH13_QUIZ_ANSWERS,
  ...CH14_QUIZ_ANSWERS,
  ...CH15_QUIZ_ANSWERS,
  ...CH16_QUIZ_ANSWERS,
  ...CH17_QUIZ_ANSWERS,
};
