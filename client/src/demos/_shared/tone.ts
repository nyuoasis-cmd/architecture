import './design-tokens.css';

export type Tone = {
  accent: string;
  accentSoft: string;
  accentBorder: string;
};

export type Chapter = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const TONE_BY_CHAPTER: Record<Chapter, Tone> = {
  1: {
    accent: 'var(--demo-accent-ch01)',
    accentSoft: 'var(--demo-accent-soft-ch01)',
    accentBorder: 'var(--demo-accent-border-ch01)',
  },
  2: {
    accent: 'var(--demo-accent-ch02)',
    accentSoft: 'var(--demo-accent-soft-ch02)',
    accentBorder: 'var(--demo-accent-border-ch02)',
  },
  3: {
    accent: 'var(--demo-accent-ch03)',
    accentSoft: 'var(--demo-accent-soft-ch03)',
    accentBorder: 'var(--demo-accent-border-ch03)',
  },
  4: {
    accent: 'var(--demo-accent-ch04)',
    accentSoft: 'var(--demo-accent-soft-ch04)',
    accentBorder: 'var(--demo-accent-border-ch04)',
  },
  5: {
    accent: 'var(--demo-accent-ch05)',
    accentSoft: 'var(--demo-accent-soft-ch05)',
    accentBorder: 'var(--demo-accent-border-ch05)',
  },
  6: {
    accent: 'var(--demo-accent-ch06)',
    accentSoft: 'var(--demo-accent-soft-ch06)',
    accentBorder: 'var(--demo-accent-border-ch06)',
  },
  7: {
    accent: 'var(--demo-accent-ch07)',
    accentSoft: 'var(--demo-accent-soft-ch07)',
    accentBorder: 'var(--demo-accent-border-ch07)',
  },
  8: {
    accent: 'var(--demo-accent-ch08)',
    accentSoft: 'var(--demo-accent-soft-ch08)',
    accentBorder: 'var(--demo-accent-border-ch08)',
  },
  9: {
    accent: 'var(--demo-accent-ch09)',
    accentSoft: 'var(--demo-accent-soft-ch09)',
    accentBorder: 'var(--demo-accent-border-ch09)',
  },
  10: {
    accent: 'var(--demo-accent-ch10)',
    accentSoft: 'var(--demo-accent-soft-ch10)',
    accentBorder: 'var(--demo-accent-border-ch10)',
  },
};

export function getTone(chapter: Chapter): Tone {
  return TONE_BY_CHAPTER[chapter];
}
