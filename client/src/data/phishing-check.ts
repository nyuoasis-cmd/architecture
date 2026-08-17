/**
 * 22강 q3 «진짜/가짜 로그인 화면 판별» 미니 체험의 데이터 (SDD 결정 20 — 부품·강 신설 없음).
 *
 * 🚨 진짜는 **정확히 하나**다. 🚨 가짜마다 «해부»(tells)가 반드시 있다 — 오답을 맞고도
 *    왜 가짜인지 못 보면 이 체험은 찍기 게임이 된다(카드: 오답은 반드시 해부 씬).
 * 🔑 소재는 가상의 학교 서비스 «알림장» — 실존 서비스를 흉내 내지 않는다(사칭 방지).
 */
export const PHISHING_QA_ID = 'ch22_q03';

export type PhishingCard = {
  id: string;
  /** 주소창에 그대로 보여 줄 URL — 여기를 읽는 것이 이 체험의 전부다. */
  url: string;
  https: boolean;
  real: boolean;
  /** 가짜의 «해부» — 어디가 이상한지. 진짜는 빈 배열. */
  tells: string[];
};

export const PHISHING_SITE_NAME = '알림장 — 우리 학교 알림 서비스';

export const PHISHING_CARDS: PhishingCard[] = [
  {
    id: 'http',
    url: 'http://alrimjang.school.kr/login',
    https: false,
    real: false,
    tells: [
      '주소가 https 가 아니라 http 로 시작해요 — 포장(자물쇠) 없이 보내는 상자라, 로그인 정보가 길에서 읽힐 수 있어요.',
    ],
  },
  {
    id: 'real',
    url: 'https://alrimjang.school.kr/login',
    https: true,
    real: true,
    tells: [],
  },
  {
    id: 'tail',
    url: 'https://alrimjang.school.kr.login-check.xyz/login',
    https: true,
    real: false,
    tells: [
      '앞부분은 똑같지만 주소의 진짜 «성(姓)»은 맨 뒤예요 — 이 집의 성은 login-check.xyz, 남의 집이에요.',
    ],
  },
  {
    id: 'glyph',
    url: 'https://aIrimjang.school.kr/login',
    https: true,
    real: false,
    tells: [
      '두 번째 글자가 소문자 l(엘)이 아니라 대문자 I(아이)예요 — 글꼴에 따라 똑같아 보여요. 남이 미리 사 둘 수 있는 주소예요.',
    ],
  },
  {
    id: 'dash',
    url: 'https://alrimjang.school-kr.com/login',
    https: true,
    real: false,
    tells: ['school.kr 이 아니라 school-kr.com 이에요 — 점(.)이 붙임표(-)로 바뀌면 완전히 다른 집이에요.'],
  },
  {
    id: 'typo',
    url: 'https://alrimjang.schooll.kr/login',
    https: true,
    real: false,
    tells: ['school 에 l 이 하나 더 있어요(schooll) — 오탈자 주소는 누구나 미리 사 둘 수 있어요.'],
  },
];
