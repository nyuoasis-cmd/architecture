import { type SVGProps } from 'react';

export type DemoIconProps = SVGProps<SVGSVGElement>;

export const ICON_BASE = {
  width: 40,
  height: 40,
  viewBox: '0 0 40 40',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
} as const satisfies DemoIconProps;
