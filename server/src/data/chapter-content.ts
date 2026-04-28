const CHAPTERS = [
  { id: 1, title: '컴퓨터의 큰 그림', count: 7, category: '컴퓨터 기초' },
  { id: 2, title: '소프트웨어 개발', count: 7, category: '개발' },
  { id: 3, title: '테스트와 배포', count: 7, category: '개발' },
  { id: 4, title: '데이터 다루기', count: 7, category: '데이터' },
  { id: 5, title: '프론트엔드와 백엔드', count: 7, category: '개발' },
  { id: 6, title: '컴퓨터 구조와 운영체제', count: 10, category: '컴퓨터 기초' },
  { id: 7, title: '데이터베이스', count: 6, category: '데이터' },
  { id: 8, title: '네트워크와 인터넷', count: 7, category: '네트워크' },
  { id: 9, title: '아키텍처와 설계', count: 6, category: '아키텍처' },
  { id: 10, title: '클라우드와 AI', count: 7, category: 'AI' },
] as const;

export type QaContext = {
  id: string;
  chapterId: number;
  chapterTitle: string;
  title: string;
  summary: string;
  body: string;
  keywords: string[];
  checkpoint: string;
};

export type ChapterContext = {
  systemPrompt: string;
  chapterContext: string;
  tokenEstimate: number;
  cachePrefixUsable: boolean;
};

function createPlaceholderQa(chapterId: number, order: number, chapterTitle: string): QaContext {
  const qaId = `ch${String(chapterId).padStart(2, '0')}_q${String(order).padStart(2, '0')}`;
  return {
    id: qaId,
    chapterId,
    chapterTitle,
    title: `${chapterTitle} Q&A ${order}`,
    summary: `${chapterTitle}의 핵심 개념을 차근차근 연결하는 예비 문항입니다.`,
    body: '이 문항의 상세 본문은 아직 확장 전입니다. 대신 핵심 개념을 쉬운 비유와 일상 언어로 풀어 설명해야 합니다.',
    keywords: ['기본개념', '준비중'],
    checkpoint: '핵심 개념을 한두 문장으로 다시 말할 수 있어야 합니다.',
  };
}

export const QA_CONTEXTS: QaContext[] = CHAPTERS.flatMap((chapter) =>
  Array.from({ length: chapter.count }, (_, index) => {
    const order = index + 1;
    if (chapter.id === 6 && order === 3) {
      return {
        id: 'ch06_q03',
        chapterId: 6,
        chapterTitle: chapter.title,
        title: '프로그램, 프로세스, 프로세서의 차이가 뭔가요?',
        summary: '저장된 파일, 실행 중인 상태, 실제 계산 부품을 구분합니다.',
        body: '프로그램은 디스크에 저장된 실행 파일입니다. 프로세스는 그 파일이 메모리에 올라와 실제로 움직이는 상태입니다. 프로세서는 CPU처럼 계산을 처리하는 부품입니다. 같은 앱을 두 번 열면 프로세스는 두 개가 생기지만 프로그램 파일은 그대로입니다.',
        keywords: ['프로그램', '프로세스', '프로세서', 'CPU'],
        checkpoint: '프로그램, 프로세스, 프로세서를 각각 한 줄로 구분할 수 있어야 합니다.',
      };
    }

    return createPlaceholderQa(chapter.id, order, chapter.title);
  }),
);

export function getQaContextById(qaId: string): QaContext | undefined {
  return QA_CONTEXTS.find((qa) => qa.id === qaId);
}

export function getChapterContexts(chapterId: number): QaContext[] {
  return QA_CONTEXTS.filter((qa) => qa.chapterId === chapterId);
}

export function buildChapterContextText(qaId: string): string | null {
  const currentQa = getQaContextById(qaId);
  if (!currentQa) {
    return null;
  }

  const chapterQas = getChapterContexts(currentQa.chapterId);
  const chapterMeta = CHAPTERS.find((chapter) => chapter.id === currentQa.chapterId);
  const header = [
    `현재 챕터: ${currentQa.chapterId}장 ${currentQa.chapterTitle}`,
    `카테고리: ${chapterMeta?.category ?? '일반'}`,
    `현재 질문 ID: ${currentQa.id}`,
    '아래 내용은 학생 설명용 컨텍스트이며, 책 문장을 복원하지 말고 반드시 새 표현으로 요약해야 한다.',
  ].join('\n');

  const body = chapterQas
    .map((qa) =>
      [
        `[${qa.id}] ${qa.title}`,
        `요약: ${qa.summary}`,
        `본문 핵심: ${qa.body}`,
        `키워드: ${qa.keywords.join(', ')}`,
        `체크포인트: ${qa.checkpoint}`,
      ].join('\n'),
    )
    .join('\n\n');

  return `${header}\n\n${body}`;
}

const SYSTEM_PROMPT = `너는 기술노트 아카데미의 학습 챗봇이다.

규칙:
- 비전공자 중학생도 이해할 수 있게 한국어로 설명한다.
- 답변은 최대 4문장이다.
- 코드, 명령어, 영어 전문용어 나열을 피한다.
- 먼저 개념을 한 줄로 말하고, 이어서 일상 비유를 붙인다.
- 책 문장을 그대로 복원하거나 길게 베끼지 않는다. 반드시 새로운 표현으로 바꾼다.
- 모르면 모른다고 말하고, 추측은 추측이라고 표시한다.

좋은 답변 예시:
1. "프로세스는 앱이 실제로 움직이는 순간의 모습이에요. 요리책이 프로그램이라면, 지금 불 위에서 끓는 냄비가 프로세스라고 보면 됩니다."
2. "CPU는 일을 처리하는 손과 같아요. 주문서가 들어오면 실제로 손이 움직여 재료를 썰고 볶는 것처럼 계산을 실행합니다."
3. "데이터베이스는 정리된 창고예요. 메모장처럼 아무 데나 적는 게 아니라, 찾기 쉽게 칸을 나눠 저장합니다."
4. "네트워크는 컴퓨터끼리 길을 만드는 약속이에요. 편지에 주소를 써야 배달되듯, 데이터에도 목적지가 필요합니다."
5. "테스트는 정답을 맞히려는 시험보다, 실수할 지점을 미리 잡는 안전 점검에 가깝습니다."

나쁜 답변 예시:
1. 원문 문장을 그대로 길게 반복하는 답변
2. "그냥 외우세요"처럼 학습을 포기하게 만드는 답변
3. 코드 블록이나 터미널 명령으로 설명하는 답변
4. 질문과 무관한 역사, 가격, 제품 추천을 늘어놓는 답변
5. 확실하지 않은 내용을 사실처럼 단정하는 답변`;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function getChapterContext(qaId: string): ChapterContext | null {
  const chapterContext = buildChapterContextText(qaId);
  if (!chapterContext) {
    return null;
  }

  const tokenEstimate = estimateTokens(`${SYSTEM_PROMPT}\n\n${chapterContext}`);
  return {
    systemPrompt: SYSTEM_PROMPT,
    chapterContext,
    tokenEstimate,
    cachePrefixUsable: tokenEstimate >= 4096,
  };
}
