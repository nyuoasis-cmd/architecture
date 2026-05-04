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
