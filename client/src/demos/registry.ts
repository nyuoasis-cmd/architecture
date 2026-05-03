import Q01Ramen from './ch01/Q01Ramen';
import Q02Stage from './ch01/Q02Stage';
import Q03Restaurant from './ch01/Q03Restaurant';
import Q04Bookshelf from './ch01/Q04Bookshelf';
import Q01Software from './ch02/Q01Software';
import Q02License from './ch02/Q02License';
import Q03Module from './ch02/Q03Module';
import Q04Cloud from './ch02/Q04Cloud';
import Q01Test from './ch03/Q01Test';
import Q02TddCycle from './ch03/Q02TddCycle';
import Q03CiCd from './ch03/Q03CiCd';
import Q04Deploy from './ch03/Q04Deploy';
import type { DemoComponentMeta } from './types';

export const DEMO_REGISTRY: Record<string, DemoComponentMeta> = {
  ch01_q01: { Component: Q01Ramen, layout: 'wide' },
  ch01_q02: { Component: Q02Stage, layout: 'square' },
  ch01_q03: { Component: Q03Restaurant, layout: 'wide' },
  ch01_q04: { Component: Q04Bookshelf, layout: 'square' },
  ch02_q01: { Component: Q01Software, layout: 'wide' },
  ch02_q02: { Component: Q02License, layout: 'wide' },
  ch02_q03: { Component: Q03Module, layout: 'wide' },
  ch02_q04: { Component: Q04Cloud, layout: 'square' },
  ch03_q01: { Component: Q01Test, layout: 'wide' },
  ch03_q02: { Component: Q02TddCycle, layout: 'wide' },
  ch03_q03: { Component: Q03CiCd, layout: 'wide' },
  ch03_q04: { Component: Q04Deploy, layout: 'wide' },
};

export function getDemoComponent(qaId: string): DemoComponentMeta | undefined {
  return DEMO_REGISTRY[qaId];
}
