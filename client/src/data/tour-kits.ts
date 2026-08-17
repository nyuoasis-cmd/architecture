/**
 * 견학 키트 — 견학형 강의 표준 부품 데이터 (SDD 결정 17 · 목업 3 확정 화면).
 *
 * 키트 = 링크 카드(레지스트리 참조) + **고르기형 관찰 미션 1개**(체크포인트) + 정답 캡션.
 * 🚨 미션 답은 고르기·세기·있다/없다 수준만 — 자유 입력·영어 표기 답 금지(쉬움 3원칙 3).
 * 🔑 기존 견학(tour) 미션은 그대로 산다 — 키트는 그 «위에» 한 장 더 얹는 부품이다(카드 공통 전제).
 */
export type TourKitChoice = { label: string; correct: boolean };

export type TourKitConfig = {
  qaId: string;
  /** 무엇을 보러 가는지 한 문장. */
  intro: string;
  /** 링크 레지스트리의 항목 id. */
  linkId: string;
  /** 링크 카드에 적는 제목·부제. */
  linkTitle: string;
  linkNote: string;
  mission: {
    question: string;
    choices: TourKitChoice[];
    /** 오답 때 여는 힌트 — 볼 곳을 좁혀 준다. */
    hint: string;
    /** 정답 뒤에 잇는 캡션 — 이 미션이 가르치려던 문장을 대놓고 적는다. */
    caption: string;
  };
};

export const TOUR_KITS: Record<string, TourKitConfig> = {
  // 3강(ch03) — 짝 링크 견학(유사 페이지형의 «진짜 먼저 보기», SDD 결정 3).
  ch03_q04: {
    qaId: 'ch03_q04',
    intro: '진짜로 «게시판에 걸린» 페이지를 먼저 봅니다 — 이 수업 브랜드의 실제 GitHub Pages 예요.',
    linkId: 'ch03-ai-school',
    linkTitle: 'ai.teachermate.co.kr — 실제 GitHub Pages 로 배포된 페이지',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '이 페이지 주소에 github 라는 글자가 들어 있나요?',
      choices: [
        { label: '없어요 — 자기 주소를 써요', correct: true },
        { label: '있어요', correct: false },
      ],
      hint: '주소창을 천천히 읽어 보세요 — ai.teachermate.co.kr 뿐이에요.',
      caption: '맞아요 — 게시판(GitHub Pages)에 걸어도 자기 주소(도메인)를 붙일 수 있어요. 이제 🧭 체험에서 직접 걸어 봅니다.',
    },
  },
  // 16강(ch20) — 진짜 이슈 목록 견학.
  ch20_q01: {
    qaId: 'ch20_q01',
    intro: '진짜 개발 현장의 «심부름 쪽지판»(이슈 목록)을 먼저 구경합니다.',
    linkId: 'ch20-github-issues',
    linkTitle: 'github/docs — 실제 공개 이슈 목록',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 영어여도 괜찮아요, 개수만 보면 돼요',
    mission: {
      question: '열린(Open) 이슈가 대략 몇 개대인가요?',
      choices: [
        { label: '몇 개', correct: false },
        { label: '몇십 개', correct: true },
        { label: '0개', correct: false },
      ],
      hint: '목록 위쪽의 Open 숫자를 찾아 보세요.',
      caption: '큰 프로젝트일수록 쪽지가 쌓여요 — 그래서 «시작할 수 있는 쪽지»를 쓰는 법이 중요해요. 🧭 체험에서 직접 써 봅니다.',
    },
  },
  // 22강(ch22) — 합쳐진 PR 구경 (목업 2 의 1단계).
  ch22_q04: {
    qaId: 'ch22_q04',
    intro: '진짜 GitHub 에서 «합쳐진 쪽지(PR)»를 먼저 구경합니다.',
    linkId: 'ch22-merged-prs',
    linkTitle: 'github/docs — 실제로 합쳐진 PR 목록',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '보라색 Merged 표시를 찾았나요?',
      choices: [
        { label: '찾았어요 — 보라색이에요', correct: true },
        { label: '안 보여요', correct: false },
      ],
      hint: '목록의 제목 왼쪽 아이콘 색을 보세요 — 합쳐진 것은 보라색이에요.',
      caption: '그 보라색이 «문집에 실렸다»는 표시예요. 이제 🧭 체험에서 내 쪽지로 그 흐름을 직접 밟아요.',
    },
  },
  // 10강(ch10) 시범 — 목업 3 그대로. 지도 확정 링크(Google Cloud 위치 지도).
  ch10_q01: {
    qaId: 'ch10_q01',
    intro: '클라우드 회사의 컴퓨터(데이터센터)가 실제로 지구 어디에 있는지, 진짜 지도를 열어 확인해 봅니다.',
    linkId: 'ch10-gcp-locations',
    linkTitle: 'Google Cloud — 전 세계 데이터센터 위치 지도',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '한국에도 저 회사의 데이터센터가 있을까요?',
      choices: [
        { label: '있어요 — 지도에서 찾았어요', correct: true },
        { label: '없는 것 같아요', correct: false },
      ],
      hint: '지도를 아시아 쪽으로 확대해 보세요 — 도시 이름이 나올 때까지.',
      caption: '맞아요 — 서울에 있어요. 지금 이 수업 앱도, 저런 «빌린 컴퓨터» 어딘가에서 돌고 있어요.',
    },
  },
};

export function getTourKit(qaId: string): TourKitConfig | undefined {
  return TOUR_KITS[qaId];
}
