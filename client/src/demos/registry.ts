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
import Q05Rollback from './ch03/Q05Rollback';
import Q06Monitor from './ch03/Q06Monitor';
import Q07CodeReview from './ch03/Q07CodeReview';
import Q01DataShape from './ch04/Q01DataShape';
import Q02DataFormat from './ch04/Q02DataFormat';
import Q03DataDup from './ch04/Q03DataDup';
import Q04DataIndex from './ch04/Q04DataIndex';
import Q05Acid from './ch04/Q05Acid';
import Q06Backup from './ch04/Q06Backup';
import Q07Visualization from './ch04/Q07Visualization';
import Q01HallKitchen from './ch05/Q01HallKitchen';
import Q02WebStack from './ch05/Q02WebStack';
import Q03Rest from './ch05/Q03Rest';
import Q04SpaSsr from './ch05/Q04SpaSsr';
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
  ch03_q05: { Component: Q05Rollback, layout: 'wide' },
  ch03_q06: { Component: Q06Monitor, layout: 'wide' },
  ch03_q07: { Component: Q07CodeReview, layout: 'wide' },
  ch04_q01: { Component: Q01DataShape, layout: 'square' },
  ch04_q02: { Component: Q02DataFormat, layout: 'wide' },
  ch04_q03: { Component: Q03DataDup, layout: 'wide' },
  ch04_q04: { Component: Q04DataIndex, layout: 'wide' },
  ch04_q05: { Component: Q05Acid, layout: 'wide' },
  ch04_q06: { Component: Q06Backup, layout: 'wide' },
  ch04_q07: { Component: Q07Visualization, layout: 'wide' },
  ch05_q01: { Component: Q01HallKitchen, layout: 'square' },
  ch05_q02: { Component: Q02WebStack, layout: 'wide' },
  ch05_q03: { Component: Q03Rest, layout: 'wide' },
  ch05_q04: { Component: Q04SpaSsr, layout: 'wide' },
};

export function getDemoComponent(qaId: string): DemoComponentMeta | undefined {
  return DEMO_REGISTRY[qaId];
}
