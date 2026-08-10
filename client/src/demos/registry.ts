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
import Q05PackageManager from './ch05/Q05PackageManager';
import Q06ComponentReuse from './ch05/Q06ComponentReuse';
import Q07BuildDeploy from './ch05/Q07BuildDeploy';
import Q01CpuCycle from './ch06/Q01CpuCycle';
import Q02MemoryHierarchy from './ch06/Q02MemoryHierarchy';
import Q03Process from './ch06/Q03Process';
import Q04CacheHit from './ch06/Q04CacheHit';
import Q05Interrupt from './ch06/Q05Interrupt';
import Q06Scheduler from './ch06/Q06Scheduler';
import Q07VirtualMemory from './ch06/Q07VirtualMemory';
import Q08FileSystem from './ch06/Q08FileSystem';
import Q09Driver from './ch06/Q09Driver';
import Q10BootSequence from './ch06/Q10BootSequence';
import Q01DbType from './ch07/Q01DbType';
import Q02Crud from './ch07/Q02Crud';
import Q03Acid from './ch07/Q03Acid';
import Q04Index from './ch07/Q04Index';
import Q05Normalization from './ch07/Q05Normalization';
import Q06IsolationLevel from './ch07/Q06IsolationLevel';
import Q01Protocol from './ch08/Q01Protocol';
import Q02Tls from './ch08/Q02Tls';
import Q03Dns from './ch08/Q03Dns';
import Q04Cdn from './ch08/Q04Cdn';
import Q05Firewall from './ch08/Q05Firewall';
import Q06Realtime from './ch08/Q06Realtime';
import Q07Security from './ch08/Q07Security';
import Q01Architecture from './ch09/Q01Architecture';
import Q02Layer from './ch09/Q02Layer';
import Q03Pattern from './ch09/Q03Pattern';
import Q04Cache from './ch09/Q04Cache';
import Q05Queue from './ch09/Q05Queue';
import Q06Scaling from './ch09/Q06Scaling';
import Q01CloudService from './ch10/Q01CloudService';
import Q02Container from './ch10/Q02Container';
import Q03K8s from './ch10/Q03K8s';
import Q04AiHierarchy from './ch10/Q04AiHierarchy';
import Q05Llm from './ch10/Q05Llm';
import Q06Cost from './ch10/Q06Cost';
import Q07AiSecurity from './ch10/Q07AiSecurity';
import Q01OneLineApp from './ch11/Q01OneLineApp';
import Q02TokenSlice from './ch11/Q02TokenSlice';
import Q03SameAskThrice from './ch11/Q03SameAskThrice';
import Q04ContextDesk from './ch11/Q04ContextDesk';
import Q01NoContext from './ch12/Q01NoContext';
import Q02ProblemSentence from './ch12/Q02ProblemSentence';
import Q03WhoUses from './ch12/Q03WhoUses';
import Q04FeatureCards from './ch12/Q04FeatureCards';
import Q05Priority from './ch12/Q05Priority';
import Q06Telephone from './ch12/Q06Telephone';
import Q07Measurable from './ch12/Q07Measurable';
import Q01WhoDecided from './ch13/Q01WhoDecided';
import Q02EdgeReplay from './ch13/Q02EdgeReplay';
import Q06PlanGaps from './ch13/Q06PlanGaps';
import Q01PlanFirst from './ch14/Q01PlanFirst';
import Q02DesignDoc from './ch14/Q02DesignDoc';
import Q03TaskOrder from './ch14/Q03TaskOrder';
import Q04HandoffNote from './ch14/Q04HandoffNote';
import Q05SameStack from './ch14/Q05SameStack';
import Q01ProveIt from './ch15/Q01ProveIt';
import Q02CriteriaFirst from './ch15/Q02CriteriaFirst';
import Q03GreenLie from './ch15/Q03GreenLie';
import Q04BreakIt from './ch15/Q04BreakIt';
import Q05CrossCheck from './ch15/Q05CrossCheck';
import Q06DiagnoseFirst from './ch15/Q06DiagnoseFirst';
import Q01PassFail from './ch16/Q01PassFail';
import Q02AskableItems from './ch16/Q02AskableItems';
import Q03ZeroReject from './ch16/Q03ZeroReject';
import Q04WhenItInvents from './ch16/Q04WhenItInvents';
import Q05RiskMap from './ch16/Q05RiskMap';
import Q06SignVsLock from './ch16/Q06SignVsLock';
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
  ch05_q05: { Component: Q05PackageManager, layout: 'wide' },
  ch05_q06: { Component: Q06ComponentReuse, layout: 'wide' },
  ch05_q07: { Component: Q07BuildDeploy, layout: 'wide' },
  ch06_q01: { Component: Q01CpuCycle, layout: 'wide' },
  ch06_q02: { Component: Q02MemoryHierarchy, layout: 'square' },
  ch06_q03: { Component: Q03Process, layout: 'wide' },
  ch06_q04: { Component: Q04CacheHit, layout: 'wide' },
  ch06_q05: { Component: Q05Interrupt, layout: 'wide' },
  ch06_q06: { Component: Q06Scheduler, layout: 'wide' },
  ch06_q07: { Component: Q07VirtualMemory, layout: 'wide' },
  ch06_q08: { Component: Q08FileSystem, layout: 'wide' },
  ch06_q09: { Component: Q09Driver, layout: 'wide' },
  ch06_q10: { Component: Q10BootSequence, layout: 'wide' },
  ch07_q01: { Component: Q01DbType, layout: 'square' },
  ch07_q02: { Component: Q02Crud, layout: 'wide' },
  ch07_q03: { Component: Q03Acid, layout: 'wide' },
  ch07_q04: { Component: Q04Index, layout: 'wide' },
  ch07_q05: { Component: Q05Normalization, layout: 'wide' },
  ch07_q06: { Component: Q06IsolationLevel, layout: 'wide' },
  ch08_q01: { Component: Q01Protocol, layout: 'wide' },
  ch08_q02: { Component: Q02Tls, layout: 'wide' },
  ch08_q03: { Component: Q03Dns, layout: 'wide' },
  ch08_q04: { Component: Q04Cdn, layout: 'square' },
  ch08_q05: { Component: Q05Firewall, layout: 'wide' },
  ch08_q06: { Component: Q06Realtime, layout: 'wide' },
  ch08_q07: { Component: Q07Security, layout: 'wide' },
  ch09_q01: { Component: Q01Architecture, layout: 'square' },
  ch09_q02: { Component: Q02Layer, layout: 'wide' },
  ch09_q03: { Component: Q03Pattern, layout: 'wide' },
  ch09_q04: { Component: Q04Cache, layout: 'wide' },
  ch09_q05: { Component: Q05Queue, layout: 'wide' },
  ch09_q06: { Component: Q06Scaling, layout: 'wide' },
  ch10_q01: { Component: Q01CloudService, layout: 'square' },
  ch10_q02: { Component: Q02Container, layout: 'wide' },
  ch10_q03: { Component: Q03K8s, layout: 'wide' },
  ch10_q04: { Component: Q04AiHierarchy, layout: 'square' },
  ch10_q05: { Component: Q05Llm, layout: 'wide' },
  ch10_q06: { Component: Q06Cost, layout: 'wide' },
  ch10_q07: { Component: Q07AiSecurity, layout: 'wide' },
  ch11_q01: { Component: Q01OneLineApp, layout: 'wide' },
  ch11_q02: { Component: Q02TokenSlice, layout: 'wide' },
  ch11_q03: { Component: Q03SameAskThrice, layout: 'wide' },
  ch11_q04: { Component: Q04ContextDesk, layout: 'wide' },
  ch12_q01: { Component: Q01NoContext, layout: 'wide' },
  ch12_q02: { Component: Q02ProblemSentence, layout: 'wide' },
  ch12_q03: { Component: Q03WhoUses, layout: 'wide' },
  ch12_q04: { Component: Q04FeatureCards, layout: 'wide' },
  ch12_q05: { Component: Q05Priority, layout: 'wide' },
  ch12_q06: { Component: Q06Telephone, layout: 'wide' },
  ch12_q07: { Component: Q07Measurable, layout: 'wide' },
  ch13_q01: { Component: Q01WhoDecided, layout: 'wide' },
  ch13_q02: { Component: Q02EdgeReplay, layout: 'wide' },
  ch13_q06: { Component: Q06PlanGaps, layout: 'wide' },
  ch14_q01: { Component: Q01PlanFirst, layout: 'wide' },
  ch14_q02: { Component: Q02DesignDoc, layout: 'wide' },
  ch14_q03: { Component: Q03TaskOrder, layout: 'wide' },
  ch14_q04: { Component: Q04HandoffNote, layout: 'wide' },
  ch14_q05: { Component: Q05SameStack, layout: 'wide' },
  ch15_q01: { Component: Q01ProveIt, layout: 'wide' },
  ch15_q02: { Component: Q02CriteriaFirst, layout: 'wide' },
  ch15_q03: { Component: Q03GreenLie, layout: 'wide' },
  ch15_q04: { Component: Q04BreakIt, layout: 'wide' },
  ch15_q05: { Component: Q05CrossCheck, layout: 'wide' },
  ch15_q06: { Component: Q06DiagnoseFirst, layout: 'wide' },
  ch16_q01: { Component: Q01PassFail, layout: 'wide' },
  ch16_q02: { Component: Q02AskableItems, layout: 'wide' },
  ch16_q03: { Component: Q03ZeroReject, layout: 'wide' },
  ch16_q04: { Component: Q04WhenItInvents, layout: 'wide' },
  ch16_q05: { Component: Q05RiskMap, layout: 'wide' },
  ch16_q06: { Component: Q06SignVsLock, layout: 'wide' },
};

export function getDemoComponent(qaId: string): DemoComponentMeta | undefined {
  return DEMO_REGISTRY[qaId];
}
