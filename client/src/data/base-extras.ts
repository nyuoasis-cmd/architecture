import type { VibeExtras } from './vibe-stubs';
import { CH01_EXTRAS } from './base-extras-ch01';

// 기초 1~10장의 견학·사례. 장별 파일 하나씩 늘려 간다(장당 1 PR).
//
// 🔑 여기 등재된 장만 새 형판(탭형)으로 넘어간다 — 카테고리가 아니라 «데이터가 있는가»가 기준이라
//    한 장씩 옮겨 갈 수 있고, 문제가 생기면 그 장 파일만 되돌리면 원래 화면으로 돌아온다.
// 🚨 「내 차례」(myTurn)는 여기 넣지 않는다. AI 호출이 붙는 요소라 별도 결정·별도 PR 이다.

export const BASE_EXTRAS: Record<string, VibeExtras> = {
  ...CH01_EXTRAS,
};
