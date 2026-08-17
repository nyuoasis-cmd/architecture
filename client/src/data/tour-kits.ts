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
  // ── 견학형 잔여 11강 (E5-5) — 강마다 대표 문항 하나에 키트를 얹는다 ──
  ch02_q01: {
    qaId: 'ch02_q01',
    intro: '설치해서 쓰는 «진짜 프로그램»의 공식 집을 구경합니다 — 무료 3D 프로그램 블렌더예요.',
    linkId: 'ch02-blender',
    linkTitle: 'Blender — 설치형 프로그램의 공식 페이지',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 영어여도 괜찮아요, 버튼만 찾으면 돼요',
    mission: {
      question: '이 프로그램은 «내려받기(Download)» 버튼이 있나요?',
      choices: [
        { label: '있어요 — 설치해서 쓰는 프로그램이에요', correct: true },
        { label: '없어요', correct: false },
      ],
      hint: '첫 화면 가운데나 위쪽 메뉴를 보세요 — 큰 버튼이에요.',
      caption: '맞아요 — 설치형 프로그램은 내려받아 내 컴퓨터에서 돌아요. 브라우저에서 바로 도는 웹 앱과의 차이가 이 버튼 하나에 보여요.',
    },
  },
  ch04_q01: {
    qaId: 'ch04_q01',
    intro: '나라가 모아 둔 진짜 데이터 창고를 구경합니다 — 누구나 로그인 없이 구경할 수 있어요.',
    linkId: 'ch04-datago',
    linkTitle: '공공데이터포털 — 나라의 데이터 창고',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '첫 화면에 «데이터가 몇 건»인지 세는 숫자가 보이나요?',
      choices: [
        { label: '보여요 — 수만 건이 넘어요', correct: true },
        { label: '안 보여요', correct: false },
      ],
      hint: '첫 화면을 천천히 훑어 보세요 — 큰 숫자가 있어요.',
      caption: '데이터는 «모아 두고 셀 수 있어야» 쓸 수 있어요. 길들인 데이터는 이렇게 개수부터 보여 줍니다.',
    },
  },
  ch06_q01: {
    qaId: 'ch06_q01',
    intro: '컴퓨터의 머리(CPU)가 실제로 어떻게 생겼는지, 백과사전의 사진으로 봅니다.',
    linkId: 'ch06-wiki-cpu',
    linkTitle: '위키백과 — 중앙 처리 장치(CPU)',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '문서에 CPU 실물 사진이 있나요?',
      choices: [
        { label: '있어요 — 네모난 칩이에요', correct: true },
        { label: '없어요 — 글자뿐이에요', correct: false },
      ],
      hint: '문서 첫 부분 오른쪽 상자를 보세요.',
      caption: '저 손톱만 한 네모가 이 강에서 «계산하는 부품»이라고 부른 그것이에요 — 실물은 생각보다 작죠.',
    },
  },
  ch07_q01: {
    qaId: 'ch07_q01',
    intro: '데이터 창고(데이터베이스)를 백과사전이 어떻게 설명하는지 훑어봅니다.',
    linkId: 'ch07-wiki-db',
    linkTitle: '위키백과 — 데이터베이스',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 다 읽을 필요 없어요',
    mission: {
      question: '문서 안에 «표» 또는 «테이블»이라는 말이 나오나요?',
      choices: [
        { label: '나와요', correct: true },
        { label: '안 나와요', correct: false },
      ],
      hint: '브라우저의 «페이지에서 찾기»로 «테이블»을 찾아 보세요.',
      caption: '창고의 기본 모양이 «표»라는 것 — 이 강에서 배운 그대로예요. 세상의 설명도 같은 말을 씁니다.',
    },
  },
  ch09_q01: {
    qaId: 'ch09_q01',
    intro: '큰 시스템의 뼈대(아키텍처)를 세상은 어떻게 그리는지 훑어봅니다.',
    linkId: 'ch09-wiki-arch',
    linkTitle: '위키백과 — 소프트웨어 아키텍처',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 다 읽을 필요 없어요',
    mission: {
      question: '문서에 상자와 선으로 그린 «그림(다이어그램)»이 있나요?',
      choices: [
        { label: '있어요', correct: true },
        { label: '없어요 — 글자뿐이에요', correct: false },
      ],
      hint: '문서를 아래로 내려 보세요.',
      caption: '뼈대는 글보다 «상자와 선»으로 그려요 — 무엇이 있고 서로 어떻게 이어지는지가 한눈에 보이니까요.',
    },
  },
  ch12_q01: {
    qaId: 'ch12_q01',
    intro: '만들 것을 정해서 «실제로 만든» 결과를 구경합니다 — 이 수업 브랜드의 수업 도구 모음이에요.',
    linkId: 'ch12-tools',
    linkTitle: 'tools.teachermate.co.kr — 수업 도구 모음',
    linkNote: '새 탭으로 열려요 · 로그인 없이 구경할 수 있어요',
    mission: {
      question: '도구가 대략 몇 개나 보이나요?',
      choices: [
        { label: '한두 개', correct: false },
        { label: '열 개가 넘어요', correct: true },
      ],
      hint: '첫 화면을 아래로 내리며 세어 보세요.',
      caption: '하나하나가 «만들 것을 정하는 일»에서 시작됐어요 — 정하지 않으면 이 목록은 없었을 거예요.',
    },
  },
  ch13_q02: {
    qaId: 'ch13_q02',
    intro: '«아무도 안 적는 세 칸»이 실제로 지켜진 서비스를 구경합니다 — 교육여행 자료 탐색이에요.',
    linkId: 'ch13-trip',
    linkTitle: 'trip.teachermate.co.kr — 교육여행 자료 탐색',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음',
    mission: {
      question: '자료 화면에 «학교 이름»이 그대로 보이나요?',
      choices: [
        { label: '안 보여요 — 지역·학교급처럼 뭉뚱그려져 있어요', correct: true },
        { label: '보여요', correct: false },
      ],
      hint: '자료 카드 몇 개를 열어 어디까지 적혀 있는지 보세요.',
      caption: '그게 «데이터 칸»의 결정이에요 — 무엇을 저장하고 무엇을 안 보여 줄지 미리 적어 둔 결과입니다.',
    },
  },
  ch14_q01: {
    qaId: 'ch14_q01',
    intro: '«일 시키는 순서»를 화면 전체로 만든 서비스를 구경합니다 — 앱 기획 도우미예요.',
    linkId: 'ch14-plan',
    linkTitle: 'plan.teachermate.co.kr — 단계별 앱 기획',
    linkNote: '새 탭으로 열려요 · 첫 화면만 보면 돼요',
    mission: {
      question: '기획이 몇 단계로 나뉘어 있다고 하나요?',
      choices: [
        { label: '7단계', correct: true },
        { label: '2단계', correct: false },
      ],
      hint: '첫 화면의 큰 글씨를 보세요.',
      caption: '큰 일을 한 번에 하지 않고 «순서»로 쪼갠 거예요 — 이 강에서 배우는 그것이 화면이 된 모습입니다.',
    },
  },
  ch15_q01: {
    qaId: 'ch15_q01',
    intro: '«믿지 않고 확인하는 법»을 세상은 무엇이라고 부르는지 훑어봅니다.',
    linkId: 'ch15-wiki-test',
    linkTitle: '위키백과 — 소프트웨어 테스트',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 다 읽을 필요 없어요',
    mission: {
      question: '문서 첫 문단에 «결함(버그)을 찾는다»는 취지의 말이 나오나요?',
      choices: [
        { label: '나와요', correct: true },
        { label: '안 나와요', correct: false },
      ],
      hint: '첫 두세 문장만 읽으면 돼요.',
      caption: '확인은 «의심»이 아니라 «직업적인 습관»이에요 — 세상이 이름까지 붙여 둔 일입니다.',
    },
  },
  ch16_q01: {
    qaId: 'ch16_q01',
    intro: '진짜 프로젝트의 «자동 검사장»을 구경합니다 — 합격·불합격이 실시간으로 찍히는 곳이에요.',
    linkId: 'ch16-gh-actions',
    linkTitle: 'github/docs — 실제 자동 검사(Actions) 기록',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 영어여도 괜찮아요, 색만 보면 돼요',
    mission: {
      question: '초록색 체크(통과) 표시가 보이나요?',
      choices: [
        { label: '보여요', correct: true },
        { label: '하나도 없어요', correct: false },
      ],
      hint: '목록의 왼쪽 동그라미 색을 보세요 — 초록은 합격, 빨강은 불합격이에요.',
      caption: '수백 명이 일하는 프로젝트도 합격·불합격을 이 색 두 개로 읽어요 — 사람이 아니라 검사가 판정하니까요.',
    },
  },
  ch17_q01: {
    qaId: 'ch17_q01',
    intro: '큰 서비스가 자기 장애를 «숨기지 않고» 적어 두는 페이지를 구경합니다.',
    linkId: 'ch17-githubstatus',
    linkTitle: 'GitHub Status — 장애 이력 페이지',
    linkNote: '새 탭으로 열려요 · 로그인 필요 없음 · 영어여도 괜찮아요, 있는지만 보면 돼요',
    mission: {
      question: '최근 몇 달 사이에 장애 기록이 있나요?',
      choices: [
        { label: '있어요 — 날짜와 함께 적혀 있어요', correct: true },
        { label: '하나도 없어요', correct: false },
      ],
      hint: '페이지를 아래로 내리며 달(月)별 기록을 보세요.',
      caption: '세계 최대급 서비스도 장애가 나요. 중요한 건 «안 나는 것»이 아니라 «숨기지 않고 적고, 고친 과정을 남기는 것»이에요.',
    },
  },
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
