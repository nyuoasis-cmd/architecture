/**
 * 견학 링크 레지스트리 — 밖으로 나가는 짝 링크의 정본 한 곳 (SDD 결정 17 · MAP §견학 키트).
 *
 * 🚨 **무로그인 공개 페이지만** 등재한다(SDD 결정 2 — 학생은 실계정을 만들지 않는다).
 * 🚨 전부 **새 탭**으로 연다(iframe 차단 전제) — 여는 쪽 컴포넌트(TourKit)가 지킨다.
 * 🔑 status: 'candidate' 는 후보다 — **최종 확정은 사용자 몫**(밤샘 핸드오프 §4·§6).
 *    확정되면 'confirmed' 로 바꾸고, 스냅샷(snapshotPath)이 준비되면 폴백이 자동으로 켜진다.
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
