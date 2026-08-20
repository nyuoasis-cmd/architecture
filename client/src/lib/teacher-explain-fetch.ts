import { getTeacherAuthHeaders } from './auth';

export interface TeacherExplainPrompt {
  q: string;
  a: string;
}

export interface TeacherExplainAdvanced {
  technicalSpec: string;
  friendlyExplanation: string;
}

export interface TeacherExplainDemoTip {
  scenarioOrder: string;
  studentReaction: string;
}

// ── 📋 노트의 «층 3개» (2026-08-20 jery 승인) ────────────────────────────────
// 🚨 서버 types.ts 의 스키마와 짝이다. 한쪽만 고치지 말 것 — 여기 없는 칸은 화면이 못 그린다.
// 🚨 전부 optional. 층이 없는 노트는 화면이 지금까지의 카드 배치로 그대로 그린다.

/** 층 1 의 한 줄 — 학생이 화면에서 «하는 것» 하나와, 그 자리에서 교사가 짚을 한 마디. */
export interface TeacherExplainLiveStep {
  /** 치는(터미널) · 누르는(GitHub) · 짚는(견학) 것 하나 — 동사는 체험 부품을 따른다. */
  act: string;
  say: string;
}

/** 층 1 · 지금 말할 것 (수업 중 · 30초) */
export interface TeacherExplainLayer1 {
  opening: string;
  steps: TeacherExplainLiveStep[];
  closing: string;
}

export interface TeacherExplainWhy {
  heading: string;
  body: string;
}

/** 층 2 · 왜 그런가 (수업 전 · 3분) */
export interface TeacherExplainLayer2 {
  why: TeacherExplainWhy[];
  /** 🚨 「여기서 끊으세요」 — 비유의 한계 또는 오해의 경계. */
  stopHere: string;
}

/** 층 3 · 더 깊이 (물어보는 학생이 있을 때만 펼침) */
export interface TeacherExplainLayer3 {
  incidentLink: string;
}

export interface TeacherExplainBlock {
  qaId: string;
  tldr: string;
  misconception: string;
  relatedQas: string[];
  goal: string;
  cue: string;
  concept: string;
  mechanism: string;
  realLife: string;
  prompts: TeacherExplainPrompt[];
  beforeDemo: string;
  note: string;
  advanced?: TeacherExplainAdvanced;
  demoTip?: TeacherExplainDemoTip;
  layer1?: TeacherExplainLayer1;
  layer2?: TeacherExplainLayer2;
  layer3?: TeacherExplainLayer3;
}

export class TeacherExplainClientError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!response.ok) {
    throw new TeacherExplainClientError(
      response.status,
      body.error ?? 'request_failed',
      body.message ?? '설명 노트를 불러오지 못했습니다.',
    );
  }

  return body as T;
}

export async function getTeacherExplain(qaId: string, sessionId: string): Promise<TeacherExplainBlock> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch(`/api/teacher-explain/${qaId}?sessionId=${sessionId}`, {
    credentials: 'include',
    headers,
  });

  return readJson<TeacherExplainBlock>(response);
}
