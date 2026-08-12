import type { TeacherExplainBlock } from './types';

export default {
  qaId: 'ch23_q03',
  tldr: '문서 묶음은 쓰는 자리에서 늘리고 낡은 전제가 생기면 이유를 남겨 줄입니다.',
  misconception:
    '한 번 완성한 문서는 바꾸면 안 되는 정답지이거나 오래될수록 계속 항목을 더해야 좋다고 생각하기 쉽습니다. 실제 작업에서 생긴 신호로 보태고 더는 맞지 않는 규칙은 근거와 함께 줄인다고 안내해 주세요.',
  relatedQas: ['ch19_q03', 'ch22_q01', 'ch23_q02'],
  goal: '학생이 문서를 늘릴 신호와 줄일 신호를 말하고 변경 이유를 같은 자리에서 기록하게 만듭니다.',
  cue: '"문서를 지우는 것은 실패일까요, 아니면 세상이 바뀌었다는 새 결정을 남기는 일일까요?"',
  concept:
    '문서 묶음은 실제 일과 함께 자랍니다. 반복된 질문, 새 예외, 검사 실패가 나오면 필요한 칸을 보태고, 더는 쓰지 않는 단계나 바뀐 전제는 이유를 남겨 줄여야 현재 정본을 유지합니다.',
  mechanism:
    '정원에서 새 가지를 키우고 마른 가지를 잘라 내는 것과 같습니다. 계속 더하기만 하면 빛이 막히고, 이유 없이 베면 건강한 줄기까지 잃습니다.',
  realLife:
    '환경이 바뀌어 더는 필요 없는 배포 단계를 문서에 남겨 두자 새 작업자가 매번 실패한 뒤 건너뛰었습니다. 단계를 지우고 "자동화돼 삭제"라고 적자 현재 순서와 변화 이유가 함께 남았습니다.',
  prompts: [
    {
      q: '언제 문서를 바로 고쳐야 하나요?',
      a: '실제 작업에서 문서와 다른 행동을 한 바로 그 자리입니다. 나중으로 미루면 다음 사람은 옛 순서를 정본으로 믿습니다.',
    },
    {
      q: '옛 내용은 전부 보관해야 하나요?',
      a: '현재 문서는 읽기 쉽게 유지하고 중요한 변경 이유는 넘김 기록이나 이력에 남기세요. 현재 규칙과 과거 기록의 역할을 나눕니다.',
    },
    {
      q: '이 기술은 AI가 없어도 쓸 수 있나요?',
      a: '핵심은 사람이 정한 기준과 순서, 증거를 외부에 남기는 일입니다. AI는 초안과 검사를 도울 뿐 묶음의 가치는 협업과 기억 한계를 다루는 데 있습니다.',
    },
  ],
  beforeDemo:
    '현재 스킬에서 실제와 달라진 단계 하나를 찾아 그 자리에서 고치고 이유를 한 줄 남기세요. 새 항목 추가뿐 아니라 필요 없는 문장을 줄이는 선택도 함께 시연합니다.',
  note:
    '규칙이 틀렸다고 몰아가기보다 전제가 바뀌었는지 먼저 보세요. 지울 때도 왜 지우는지 한 줄을 남기면 ch22의 넘김 기록과 자연스럽게 연결됩니다.',
  advanced: {
    technicalSpec:
      'living documentation requires update trigger, owner, canonical location, deprecation path. append-only growth causes entropy; versioned removal with rationale preserves current usability and historical provenance.',
    friendlyExplanation:
      '시간표는 학기마다 고치지만 옛 시간표를 교실 벽에 겹쳐 붙이지 않습니다. 현재 표는 선명하게 두고 바뀐 이유는 기록에 남기는 것과 같습니다.',
  },
} satisfies TeacherExplainBlock;
