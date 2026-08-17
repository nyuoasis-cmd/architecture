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
