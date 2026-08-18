/**
 * 견학 링크 레지스트리 — 밖으로 나가는 짝 링크의 정본 한 곳 (SDD 결정 17 · MAP §견학 키트).
 *
 * 🚨 **무로그인 공개 페이지만** 등재한다(SDD 결정 2 — 학생은 실계정을 만들지 않는다).
 * 🚨 전부 **새 탭**으로 연다(iframe 차단 전제) — 여는 쪽 컴포넌트(TourKit)가 지킨다.
 * 🔑 status 는 후보(candidate) → 사용자 확정(confirmed). 확정되면 값을 바꾸고,
 *    스냅샷(snapshotPath)이 준비되면 폴백이 자동으로 켜진다.
 * ✅ 2026-08-18 jery 확정 — 후보 전부 confirmed. 근거 = 전수 접속 확인(16/16 → HTTP 200,
 *    로그인 리다이렉트 없음). 🚨 **확인된 것은 「바깥에서 열린다」까지다** — 학교망 차단은
 *    재지 못했다. github.com 계열 3건(Actions·Issues·merged PR)은 교내망에서 막히는 사례가
 *    있는 계열이라, 교실에서 안 열리면 blockedAtSchools 를 여기 적고 스냅샷을 채운다.
 * 🔑 링크 사망·학교망 차단 관측은 여기 적는다 — 흩어 두면 다음 학기에 아무도 못 찾는다.
 */
export type RegisteredLink = {
  id: string;
  url: string;
  /** 버튼에 적는 말 — 생활어로. */
  label: string;
  /** 후보(candidate) → 사용자 확정(confirmed). */
  status: 'candidate' | 'confirmed';
  /** 🚨 항상 true 여야 등재 가능 — 계약(tourKitContract)이 잰다. */
  noLogin: true;
  /** 링크가 죽었을 때 대신 열 링크. */
  fallbackUrl?: string;
  /** 앱 내 스냅샷(정적 파일 경로). 있으면 «교실에서 안 열리면» 폴백이 켜진다. */
  snapshotPath?: string;
  /** 학교망 차단이 관측된 적 있는가. */
  blockedAtSchools?: boolean;
};

export const LINK_REGISTRY: Record<string, RegisteredLink> = {
  // ── 견학형 잔여 11강 (E5-5) — 2026-08-18 확정 이후 전부 confirmed ──
  'ch02-blender': {
    id: 'ch02-blender',
    url: 'https://www.blender.org',
    label: '진짜 페이지 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch04-datago': {
    id: 'ch04-datago',
    url: 'https://www.data.go.kr',
    label: '공공데이터포털 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch06-wiki-cpu': {
    id: 'ch06-wiki-cpu',
    url: 'https://ko.wikipedia.org/wiki/%EC%A4%91%EC%95%99_%EC%B2%98%EB%A6%AC_%EC%9E%A5%EC%B9%98',
    label: 'CPU 문서 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch07-wiki-db': {
    id: 'ch07-wiki-db',
    url: 'https://ko.wikipedia.org/wiki/%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4',
    label: '데이터베이스 문서 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch09-wiki-arch': {
    id: 'ch09-wiki-arch',
    url: 'https://ko.wikipedia.org/wiki/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4_%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98',
    label: '아키텍처 문서 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch12-tools': {
    id: 'ch12-tools',
    url: 'https://tools.teachermate.co.kr',
    label: '수업 도구 모음 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch13-trip': {
    // 🔑 기존 견학 링크 재사용(카드 공통 전제) — ch13_q02 tour 가 이미 쓰던 우리 서비스.
    id: 'ch13-trip',
    url: 'https://trip.teachermate.co.kr',
    label: '교육여행 탐색 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch14-plan': {
    id: 'ch14-plan',
    url: 'https://plan.teachermate.co.kr',
    label: '7단계 기획 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch15-wiki-test': {
    id: 'ch15-wiki-test',
    url: 'https://ko.wikipedia.org/wiki/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4_%ED%85%8C%EC%8A%A4%ED%8A%B8',
    label: '테스트 문서 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch16-gh-actions': {
    id: 'ch16-gh-actions',
    url: 'https://github.com/github/docs/actions',
    label: '진짜 자동 검사 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch17-githubstatus': {
    // MAP 확정 소재(21강) — GitHub 장애 이력.
    id: 'ch17-githubstatus',
    url: 'https://www.githubstatus.com/history',
    label: '장애 이력 열기',
    status: 'confirmed',
    noLogin: true,
  },
  // 3강(ch03) — 짝 링크(MAP 확정 소재): 우리 GitHub Pages(안 죽는다) + 공식 quickstart(후보).
  'ch03-ai-school': {
    id: 'ch03-ai-school',
    url: 'https://ai.teachermate.co.kr',
    label: '진짜 페이지 열기',
    status: 'confirmed',
    noLogin: true,
  },
  'ch03-pages-quickstart': {
    id: 'ch03-pages-quickstart',
    url: 'https://docs.github.com/en/pages/quickstart',
    label: '공식 안내 열기',
    status: 'confirmed',
    noLogin: true,
  },
  // 16강(ch20) — github/docs 공개 Issues 목록 (후보).
  'ch20-github-issues': {
    id: 'ch20-github-issues',
    url: 'https://github.com/github/docs/issues',
    label: '진짜 이슈 목록 열기',
    status: 'confirmed',
    noLogin: true,
  },
  // 22강(ch22) — 합쳐진 PR 구경 (후보 — 특정 PR 대신 merged 목록: 링크가 안 낡는다).
  'ch22-merged-prs': {
    id: 'ch22-merged-prs',
    url: 'https://github.com/github/docs/pulls?q=is%3Apr+is%3Amerged',
    label: '진짜 PR 구경하기',
    status: 'confirmed',
    noLogin: true,
  },
  // 10강(ch10) — 지도 확정 링크(MAP): Google Cloud 위치 지도. 시범 적용(목업 3).
  'ch10-gcp-locations': {
    id: 'ch10-gcp-locations',
    url: 'https://cloud.google.com/about/locations',
    label: '진짜 페이지 열기',
    status: 'confirmed',
    noLogin: true,
    // 스냅샷은 아직 없다 — 준비되면 경로를 적는 순간 폴백이 켜진다(REPORT 확정 대기 목록).
  },
};

export function getRegisteredLink(id: string): RegisteredLink | undefined {
  return LINK_REGISTRY[id];
}
