/**
 * 상대 시간 표기. BUILDER-UX-POLICY §4 「상대 시간 표시 규칙」 + 미래 시각 clamp.
 *
 * 🚨 왜 Intl.RelativeTimeFormat 을 쓰지 않는가(2026-08-14): 그것은 「3시간 전」·「어제」까지는
 *    잘 말하지만 §4 가 요구하는 **「오늘 14:30 시작」**을 만들지 못한다. 교사가 수업 카드에서
 *    알고 싶은 것은 «몇 시에 시작한 반인가»이지 «몇 시간 지났는가»가 아니다.
 *
 * 🚨 미래 시각 clamp 필수 — 서버·기기 시계가 몇 초만 어긋나도 Intl 은 「1분 후」를 뱉었고,
 *    방금 만든 수업이 「1분 후 시작」으로 보였다. 미래면 그냥 「방금 시작」이다.
 *
 * 🔑 mode 두 갈래: default = 수업 시작 시각(「오늘 14:30 시작」), compact = 활동 피드(「2분 전」).
 *    같은 함수를 쓰되 부르는 자리가 무엇을 말하려는지에 따라 문장이 달라진다.
 */
export type RelativeTimeMode = 'default' | 'compact';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(
  value: string | Date,
  options: { mode?: RelativeTimeMode; now?: Date } = {},
): string {
  const mode = options.mode ?? 'default';
  const now = options.now ?? new Date();
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return mode === 'default' ? '방금 시작' : '방금';
  }

  if (diffMs < MINUTE_MS) {
    return mode === 'default' ? '방금 시작' : '방금';
  }

  if (diffMs < HOUR_MS) {
    return `${Math.floor(diffMs / MINUTE_MS)}분 전`;
  }

  const days = calendarDayDiff(date, now);

  if (days === 0) {
    return mode === 'default' ? `오늘 ${hhmm(date)} 시작` : `오늘 ${hhmm(date)}`;
  }

  if (days === 1) {
    return '어제';
  }

  if (days <= 6) {
    return `${days}일 전`;
  }

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function calendarDayDiff(target: Date, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const other = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.floor((today - other) / DAY_MS);
}

function hhmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
