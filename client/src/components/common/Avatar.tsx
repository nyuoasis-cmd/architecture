/**
 * 활동 피드의 학생 아바타. BUILDER-UX-POLICY §4 Avatar 스펙 그대로.
 *
 * 🔑 색은 이름 첫 글자 해시로 정한다 — 재로딩·순서 변경에도 같은 학생은 같은 색이라
 *    교사가 «아까 그 아이»를 색으로 알아본다. 동명 이니셜의 색 충돌은 허용한다.
 * 🔑 Array.from 으로 첫 글자를 뽑는다 — 이모지 닉네임에서 charAt(0) 은 반쪽 글자를 낸다.
 */
const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', fg: '#92400e' },
  { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', fg: '#1e40af' },
  { bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', fg: '#166534' },
  { bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', fg: '#9f1239' },
];

export default function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initial = Array.from(name || '')[0] ?? '?';
  const palette = AVATAR_PALETTES[(name || '?').charCodeAt(0) % AVATAR_PALETTES.length];

  return (
    <span
      aria-label={name}
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full border-2 border-white ${className}`}
      style={{
        width: 24,
        height: 24,
        background: palette.bg,
        color: palette.fg,
        fontSize: 10.5,
        fontWeight: 600,
      }}
    >
      {initial}
    </span>
  );
}
