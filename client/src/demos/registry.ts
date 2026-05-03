import Q01Ramen from './ch01/Q01Ramen';
import Q02Stage from './ch01/Q02Stage';
import Q03Restaurant from './ch01/Q03Restaurant';
import Q04Bookshelf from './ch01/Q04Bookshelf';
import Q01Software from './ch02/Q01Software';
import Q02License from './ch02/Q02License';
import Q03Module from './ch02/Q03Module';
import Q04Cloud from './ch02/Q04Cloud';
import Q05Rollback from './ch03/Q05Rollback';
import Q06Monitor from './ch03/Q06Monitor';
import Q07CodeReview from './ch03/Q07CodeReview';
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
  ch03_q05: { Component: Q05Rollback, layout: 'wide' },
  ch03_q06: { Component: Q06Monitor, layout: 'wide' },
  ch03_q07: { Component: Q07CodeReview, layout: 'wide' },
};

export function getDemoComponent(qaId: string): DemoComponentMeta | undefined {
  return DEMO_REGISTRY[qaId];
}
