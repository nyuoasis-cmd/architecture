import type { ComponentType } from 'react';

export type DemoComponentProps = {
  scenarioId: string;
};

export type DemoLayout = 'wide' | 'tall' | 'square';

export type DemoComponentMeta = {
  Component: ComponentType<DemoComponentProps>;
  layout: DemoLayout;
};

export const DEMO_LAYOUT_MAX_WIDTH: Record<DemoLayout, string> = {
  wide: 'max-w-[860px]',
  square: 'max-w-[640px]',
  tall: 'max-w-[480px]',
};
