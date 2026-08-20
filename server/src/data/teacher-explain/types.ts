import { z } from 'zod';

// 🔑 장 범위를 정규식에 박지 않는다. 「1~10장」 을 여기 적어 두면 11~17장이 조용히 404 가 되고,
//    그건 «없는 문항» 과 «있는데 막힌 문항» 을 구분할 수 없게 만든다.
//    모양만 본다 — 실재 여부는 아래 실제 데이터 조회가 판정한다.
const qaIdSchema = z.string().regex(/^ch\d{2}_q\d{2}$/);

export const teacherExplainPromptSchema = z.object({
  q: z.string().trim().min(1).max(80),
  a: z.string().trim().min(1).max(200),
});

export const teacherExplainAdvancedSchema = z.object({
  technicalSpec: z.string().trim().min(1).max(500),
  friendlyExplanation: z.string().trim().min(1).max(500),
});

export const teacherExplainDemoTipSchema = z.object({
  scenarioOrder: z.string().trim().min(1).max(300),
  studentReaction: z.string().trim().min(1).max(300),
});

// ── 📋 노트의 «층 3개» (2026-08-20 jery 승인) ────────────────────────────────
// 왜 층인가: 「길게」가 아니라 「층으로」다. 수업 중에 2페이지를 읽을 시간은 없고,
// 순서 없이 길기만 하면 짧은 것보다 나쁘다. 층 1=수업 중 · 층 2=수업 전 · 층 3=물어보는 학생이 있을 때만.
//
// 🚨 **전부 optional 이다.** «모든 노트에 층이 있다»를 계약으로 걸지 않는다 — 교안 계약 ⑯ 이
//    그것이었고, 새 장을 만들 때마다 CI 가 없는 글을 요구하게 만들었다. 없는 것은 없는 채로 두고
//    **있는 것이 성한지만** 본다. 층이 없는 노트는 화면이 지금까지의 카드 배치로 그대로 그린다.
//
// 🚨 여기에 «몇 분»·«다음은 무엇»·«어느 차시»를 담는 칸을 만들지 않는다 — 그건 「📋 교안」이고
//    2026-08-12 에 철거했다. 이어지는 강은 relatedQas 가 이미 맡는다(계약 ④ 가 실존을 본다).

/** 층 1 의 한 줄 — 학생이 화면에서 «하는 것» 하나와, 그 자리에서 교사가 짚을 한 마디. */
export const teacherExplainLiveStepSchema = z.object({
  /**
   * 학생이 치는(터미널) · 누르는(GitHub) · 짚는(견학) 것 하나.
   * 🔑 동사는 체험 부품을 따른다 — 구조는 같고 동사만 바뀐다(experience.ts 의 배정).
   */
  act: z.string().trim().min(1).max(120),
  /** 그 줄에서 교사가 짚을 한 마디. 설명이 아니라 «지금 무엇을 보라»다. */
  say: z.string().trim().min(1).max(300),
});

/** 층 1 · 지금 말할 것 — 수업 중 30초. */
export const teacherExplainLayer1Schema = z.object({
  /** 열기 한 마디. cue 의 승격판이라 층 1 이 있으면 화면은 cue 를 따로 그리지 않는다. */
  opening: z.string().trim().min(1).max(300),
  steps: z.array(teacherExplainLiveStepSchema).min(2).max(4),
  closing: z.string().trim().min(1).max(300),
});

/** 층 2 의 한 덩어리 — «왜 그런가» 하나. */
export const teacherExplainWhySchema = z.object({
  heading: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(1200),
});

/** 층 2 · 왜 그런가 — 수업 전 3분. 교사가 이해하지 못한 것을 학생에게 설명할 수는 없다. */
export const teacherExplainLayer2Schema = z.object({
  why: z.array(teacherExplainWhySchema).min(1).max(3),
  /**
   * 🚨 「여기서 끊으세요」 — 교사가 어디서 멈춰야 하는지.
   * 비유가 있는 문항이면 **비유의 한계**, 없으면 **오해의 경계**(misconception 승격)를 적는다.
   * 🔑 없는 비유를 만들어 넣지 않는다 — 그건 «비슷한 것»을 «그것»이라고 가르치는 실패의 반복이다.
   */
  stopHere: z.string().trim().min(1).max(800),
});

/** 층 3 · 더 깊이 — 물어보는 학생이 있을 때만 펼친다. */
export const teacherExplainLayer3Schema = z.object({
  /** 이 앱에서 실제로 있었던 일(⚡ 사례)과의 연결. 학생이 방금 겪은 것과 같은 모양임을 잇는다. */
  incidentLink: z.string().trim().min(1).max(800),
});

export const teacherExplainBlockSchema = z.object({
  qaId: qaIdSchema,
  tldr: z.string().trim().min(30).max(50),
  misconception: z.string().trim().min(1).max(250),
  relatedQas: z.array(qaIdSchema).min(1).max(3),
  goal: z.string().trim().min(1).max(200),
  cue: z.string().trim().min(1).max(150),
  concept: z.string().trim().min(1).max(300),
  mechanism: z.string().trim().min(1).max(300),
  realLife: z.string().trim().min(1).max(250),
  prompts: z.array(teacherExplainPromptSchema).min(3).max(5),
  beforeDemo: z.string().trim().min(1).max(200),
  note: z.string().trim().min(1).max(200),
  advanced: teacherExplainAdvancedSchema.optional(),
  demoTip: teacherExplainDemoTipSchema.optional(),
  layer1: teacherExplainLayer1Schema.optional(),
  layer2: teacherExplainLayer2Schema.optional(),
  layer3: teacherExplainLayer3Schema.optional(),
});

export type TeacherExplainPrompt = z.infer<typeof teacherExplainPromptSchema>;
export type TeacherExplainAdvanced = z.infer<typeof teacherExplainAdvancedSchema>;
export type TeacherExplainDemoTip = z.infer<typeof teacherExplainDemoTipSchema>;
export type TeacherExplainLiveStep = z.infer<typeof teacherExplainLiveStepSchema>;
export type TeacherExplainLayer1 = z.infer<typeof teacherExplainLayer1Schema>;
export type TeacherExplainWhy = z.infer<typeof teacherExplainWhySchema>;
export type TeacherExplainLayer2 = z.infer<typeof teacherExplainLayer2Schema>;
export type TeacherExplainLayer3 = z.infer<typeof teacherExplainLayer3Schema>;
export type TeacherExplainBlock = z.infer<typeof teacherExplainBlockSchema>;
