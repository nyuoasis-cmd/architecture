const CHAPTERS = [
  { id: 1, title: '컴퓨터의 큰 그림', count: 4, category: '컴퓨터 기초' },
  { id: 2, title: '소프트웨어의 종류와 특징', count: 4, category: '개발' },
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

    if (chapter.id === 1 && order === 1) {
      return {
        id: 'ch01_q01',
        chapterId: 1,
        chapterTitle: chapter.title,
        title: '컴퓨터는 결국 무슨 일을 하나요?',
        summary: '입력과 저장, 처리와 출력을 한 흐름으로 묶어 컴퓨터의 기본 동작을 잡습니다.',
        body: '컴퓨터는 바깥에서 정보를 받아들이고(입력), 잠시 메모리에 붙잡아 둔 뒤 CPU가 계산하고(처리), 다시 화면이나 스피커로 보여 줍니다(출력). 폰 노이만 구조에서 CPU·메모리·입출력 장치가 역할을 나눕니다. 사진·소리·문장도 결국 0과 1 신호로 환원되어 같은 체계로 처리됩니다.',
        keywords: ['입력', '처리', '출력', '폰 노이만'],
        checkpoint: '컴퓨터의 동작을 입력·처리·출력 사이클로 한 줄로 설명할 수 있다.',
      };
    }

    if (chapter.id === 1 && order === 2) {
      return {
        id: 'ch01_q02',
        chapterId: 1,
        chapterTitle: chapter.title,
        title: '하드웨어와 소프트웨어의 차이는?',
        summary: '손으로 만질 수 있는 부품과 그 부품에 일을 시키는 명령을 분리해 이해합니다.',
        body: '하드웨어는 CPU, RAM, SSD, 키보드처럼 손으로 만질 수 있는 물리 부품입니다. 소프트웨어는 그 부품들이 어떤 순서로 움직일지 적어 둔 명령의 묶음입니다. 무대(하드웨어)와 대본(소프트웨어)의 관계로 이해하면 쉽습니다. 하드웨어가 능력을 제공하고 소프트웨어가 그 능력을 쓸 곳을 결정합니다.',
        keywords: ['하드웨어', '소프트웨어', '물리', '명령'],
        checkpoint: '하드웨어와 소프트웨어를 무대와 대본 비유로 구분할 수 있다.',
      };
    }

    if (chapter.id === 1 && order === 3) {
      return {
        id: 'ch01_q03',
        chapterId: 1,
        chapterTitle: chapter.title,
        title: '운영체제는 무슨 역할을 하나요?',
        summary: 'OS가 사용자와 부품 사이에서 자원을 배분하고 규칙을 세우는 이유를 설명합니다.',
        body: '운영체제(OS)는 사용자와 하드웨어 사이의 통역자이자 현장 감독입니다. 핵심 역할은 자원 분배(CPU 시간·메모리), 파일 관리, 보안과 사용자 인터페이스입니다. 식당 매니저가 손님 자리 배치·주문 분배·계산 순서를 정리하듯 OS도 앱과 부품 사이에서 질서를 유지합니다. Windows, macOS, Linux, Android, iOS가 대표적입니다.',
        keywords: ['운영체제', '자원', '관리', '인터페이스'],
        checkpoint: 'OS의 핵심 역할 3가지(자원 분배·파일 관리·UI)를 들 수 있다.',
      };
    }

    if (chapter.id === 1 && order === 4) {
      return {
        id: 'ch01_q04',
        chapterId: 1,
        chapterTitle: chapter.title,
        title: '컴퓨터 안에서 데이터는 어떻게 흐르나요?',
        summary: '저장소·메모리·CPU 사이의 이동 경로와 캐시의 위치를 비유로 잡습니다.',
        body: '데이터는 보통 저장소(SSD)에서 메모리(RAM)로 올라간 뒤 CPU가 RAM의 값을 읽어 계산합니다. 결과는 다시 RAM 또는 저장소로 갑니다. RAM은 빠르지만 휘발성이고, SSD는 느리지만 영구 저장입니다. 캐시는 자주 쓰는 메모를 책상 위 포스트잇처럼 CPU 가까이에 두어 시간을 줄이는 보조 기억입니다.',
        keywords: ['RAM', '저장소', '캐시', '데이터 흐름'],
        checkpoint: '데이터가 SSD→RAM→CPU 순서로 이동하는 이유를 비유로 설명할 수 있다.',
      };
    }

    if (chapter.id === 2 && order === 1) {
      return {
        id: 'ch02_q01',
        chapterId: 2,
        chapterTitle: chapter.title,
        title: '소프트웨어는 어떻게 분류되나요?',
        summary: '시스템 소프트웨어와 응용 소프트웨어, 미들웨어의 자리를 역할 중심으로 구분합니다.',
        body: '시스템 소프트웨어는 운영체제와 드라이버처럼 하드웨어와 가까운 곳에서 자원과 장치를 정리합니다. 응용 소프트웨어는 문서 작성 앱이나 게임처럼 사용자가 목적을 이루기 위해 직접 쓰는 도구입니다. 미들웨어는 그 둘 사이에서 공통 기능과 연결을 돕는 중간층입니다. 학교 행정실이 바닥 운영을 맡고 교실 수업이 실제 활동을 맡는 비유로 떠올리면 구분이 쉬워집니다.',
        keywords: ['시스템', '응용', '분류', 'OS'],
        checkpoint: '시스템 SW와 응용 SW의 역할을 한 줄로 구분할 수 있다.',
      };
    }

    if (chapter.id === 2 && order === 2) {
      return {
        id: 'ch02_q02',
        chapterId: 2,
        chapterTitle: chapter.title,
        title: '오픈소스와 상용 소프트웨어의 차이는?',
        summary: '가격보다 사용 규칙과 소스 공개 범위를 중심으로 두 유형의 차이를 설명합니다.',
        body: '오픈소스 소프트웨어는 소스 코드를 공개하고 라이선스 조건에 따라 수정과 배포를 허용하는 경우가 많습니다. 상용 소프트웨어는 보통 비용이나 구독 계약을 바탕으로 제공되고, 소스 코드는 제작사가 통제합니다. GPL처럼 공개 의무가 붙는 라이선스도 있어 무료냐 유료냐보다 약속의 내용이 더 중요합니다. 학생용과 상업용처럼 같은 제품 안에서도 허용 범위가 달라질 수 있습니다.',
        keywords: ['오픈소스', '상용', '라이선스', 'GPL'],
        checkpoint: '오픈소스와 상용의 차이를 라이선스 관점에서 설명할 수 있다.',
      };
    }

    if (chapter.id === 2 && order === 3) {
      return {
        id: 'ch02_q03',
        chapterId: 2,
        chapterTitle: chapter.title,
        title: '패키지와 모듈은 무엇인가요?',
        summary: '작은 기능 단위와 그 묶음인 배포 단위를 포함 관계로 정리합니다.',
        body: '모듈은 날짜 계산이나 로그인 검증처럼 한 가지 기능을 맡는 비교적 작은 코드 묶음입니다. 패키지는 이런 모듈 여러 개를 하나의 배포 단위로 묶은 더 큰 그룹입니다. 개발자는 npm이나 pip 같은 패키지 매니저로 패키지를 설치하고, 함께 따라오는 의존성도 관리합니다. 책 한 권이 모듈이고 책장이 패키지라는 비유로 이해하면 구조가 또렷해집니다.',
        keywords: ['모듈', '패키지', '라이브러리', '의존성'],
        checkpoint: '모듈과 패키지의 포함 관계를 한 줄로 말할 수 있다.',
      };
    }

    if (chapter.id === 2 && order === 4) {
      return {
        id: 'ch02_q04',
        chapterId: 2,
        chapterTitle: chapter.title,
        title: '클라우드와 SaaS는 무엇인가요?',
        summary: '인터넷 너머의 자원 제공과 그 위의 완성형 소프트웨어 서비스를 층별로 설명합니다.',
        body: '클라우드는 서버와 저장소 같은 컴퓨팅 자원을 인터넷 너머에서 빌려 쓰는 방식입니다. SaaS는 그 위에서 제공되는 완성형 소프트웨어 서비스로, 사용자는 브라우저나 앱으로 접속해 바로 기능을 씁니다. IaaS는 인프라, PaaS는 실행 기반, SaaS는 완성 서비스라는 층으로 나눠 보면 차이가 보입니다. SaaS의 핵심은 인터넷 접근과 계정 또는 구독 중심의 이용 방식입니다.',
        keywords: ['클라우드', 'SaaS', '구독', '서비스'],
        checkpoint: 'SaaS의 핵심 특징(구독·인터넷 접근)을 들 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 1) {
      return {
        id: 'ch03_q01',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: '단위·통합·E2E 테스트는 무엇이 다른가?',
        summary: '검증 범위가 다른 세 테스트를 피라미드 구조와 함께 설명합니다.',
        body: '단위 테스트는 함수나 클래스 같은 작은 부품을 빠르게 확인합니다. 통합 테스트는 여러 부품이 연결될 때 규칙이 맞는지 봅니다. E2E 테스트는 사용자의 전체 흐름을 처음부터 끝까지 점검합니다. 보통 빠르고 싼 단위 테스트를 많이 두고, 넓고 비싼 E2E 테스트는 핵심 경로에만 두는 피라미드 구조를 씁니다.',
        keywords: ['단위 테스트', '통합 테스트', 'E2E', '테스트 피라미드'],
        checkpoint: '세 테스트를 검증 범위와 속도 기준으로 구분할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 2) {
      return {
        id: 'ch03_q02',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: 'TDD는 어떻게 일하는 방식인가?',
        summary: 'Red-Green-Refactor 순환이 설계와 구현을 어떻게 이끄는지 설명합니다.',
        body: 'TDD는 테스트를 먼저 쓰고 그 테스트를 통과시키며 구현을 키워 가는 방식입니다. Red 단계에서는 실패하는 테스트로 목표를 분명히 하고, Green 단계에서는 최소 구현으로 통과를 만듭니다. Refactor 단계에서는 테스트를 안전망 삼아 구조를 정리합니다. 즉, TDD는 나중 검사보다 작은 약속을 먼저 세우는 설계 리듬에 가깝습니다.',
        keywords: ['TDD', 'Red-Green-Refactor', '설계', '리팩터링'],
        checkpoint: 'TDD의 세 단계가 왜 그 순서로 도는지 설명할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 3) {
      return {
        id: 'ch03_q03',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: 'CI는 무엇이고 왜 쓰나?',
        summary: '자주 합치고 자동 검증으로 위험을 빨리 드러내는 이유를 설명합니다.',
        body: 'CI는 여러 사람이 만든 코드를 자주 합치고, 그때마다 빌드와 테스트 같은 자동 검증을 돌리는 방식입니다. 작은 변경 단위에서 바로 실패를 발견하면 원인 범위를 빨리 좁힐 수 있습니다. 팀의 공통 기준도 실행 규칙으로 남길 수 있어 사람마다 검사 방식이 달라지는 문제를 줄여 줍니다. 즉, CI는 큰 장애를 입구에서 걸러 주는 자동 게이트입니다.',
        keywords: ['CI', '자동 검증', '빌드', '품질 게이트'],
        checkpoint: 'CI를 쓰는 이유를 자동 검증과 조기 발견 관점에서 설명할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 4) {
      return {
        id: 'ch03_q04',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: 'CD와 배포 환경(dev/staging/prod) 차이는?',
        summary: '배포 자동화와 환경 분리가 왜 함께 필요한지 계단형 검증 흐름으로 정리합니다.',
        body: 'CD는 검증된 변경을 배포 가능한 상태까지 자동화해 밀어 올리는 흐름입니다. dev는 빠른 개발 확인, staging은 운영과 비슷한 리허설, prod는 실제 사용자 환경입니다. 환경을 나누면 같은 기능도 단계별로 다른 질문을 하며 위험을 조금씩 노출할 수 있습니다. 결국 CD와 환경 분리는 더 자주 배포하면서도 놀라지 않게 만드는 장치입니다.',
        keywords: ['CD', 'dev', 'staging', 'prod'],
        checkpoint: 'CD와 dev·staging·prod 환경의 역할 차이를 구분할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 5) {
      return {
        id: 'ch03_q05',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: '배포가 잘못되면 어떻게 되돌리나?',
        summary: '롤백과 블루그린, 카나리 전략이 실패를 줄이는 방식을 비교합니다.',
        body: '즉시 롤백은 직전 안정 버전으로 빠르게 되돌리는 가장 단순한 방법입니다. 블루그린은 운영 환경을 두 벌 준비해 전환과 복귀를 쉽게 만듭니다. 카나리는 일부 사용자에게만 새 버전을 먼저 열어 영향을 작게 관찰합니다. 세 전략 모두 목적은 실패를 없애는 것이 아니라 실패 범위와 복구 시간을 줄이는 데 있습니다.',
        keywords: ['롤백', '블루그린', '카나리', '복구'],
        checkpoint: '즉시 롤백, 블루그린, 카나리의 차이를 설명할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 6) {
      return {
        id: 'ch03_q06',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: '운영 중인 서비스는 어떻게 감시하나?',
        summary: '모니터링과 알림, SLI·SLO를 운영 품질의 언어로 연결합니다.',
        body: '운영 중에는 요청 수, 응답 시간, 에러율 같은 신호를 계속 모아 서비스 상태를 봅니다. 알림은 그중에서 지금 행동이 필요한 순간만 골라 알려 주는 장치입니다. SLI는 실제로 재는 지표이고, SLO는 그 지표가 지켜야 할 목표 수준입니다. 이렇게 해야 운영 상태를 느낌이 아니라 숫자로 설명하고 대응할 수 있습니다.',
        keywords: ['모니터링', '알림', 'SLI', 'SLO'],
        checkpoint: '모니터링, 알림, SLI·SLO의 역할 차이를 구분할 수 있다.',
      };
    }

    if (chapter.id === 3 && order === 7) {
      return {
        id: 'ch03_q07',
        chapterId: 3,
        chapterTitle: chapter.title,
        title: '코드 리뷰는 왜 하고 어떻게 하나?',
        summary: '코드 리뷰를 품질 점검과 지식 공유의 대화 과정으로 설명합니다.',
        body: '코드 리뷰는 변경이 팀 기준에 맞는지 함께 확인하는 대화 과정입니다. 다른 눈이 빠진 예외 처리나 애매한 이름을 조기에 발견할 수 있고, 변경 의도와 맥락도 팀 안에 공유됩니다. 작은 PR과 명확한 설명은 리뷰 품질과 속도를 함께 높여 줍니다. 좋은 리뷰는 취향 싸움보다 위험과 근거를 분명히 남기는 쪽에 가깝습니다.',
        keywords: ['코드 리뷰', 'PR', '지식 공유', '결함 발견'],
        checkpoint: '좋은 코드 리뷰가 품질과 지식 공유에 왜 도움이 되는지 말할 수 있다.',
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
