import { getTeacherAuthHeaders } from './auth';

export type SessionStatus = 'active' | 'ended';

export type SessionParticipant = {
  id: string;
  nickname: string;
  joined_at: string;
  progress_count: number;
  /**
   * 실습실에서 지금 서 있는 미션(0-based). 🚨 **실습에 들어온 학생에게만 온다** —
   * 없는 것을 0 으로 채우면 「실습 0/7」이 되고, 그건 실습을 안 연 학생에게 거짓이다(t1).
   */
  lab_mission_index?: number;
  /** 스스로 도달한 미션. `lab_mission_index` 보다 작으면 건너뛴 구간이 있다. */
  lab_earned_index?: number;
};

export type SessionProgressEntry = {
  read: boolean;
  quizScore?: number;
};

/** 카드 하단 활동 피드 1건. 서버가 진도 행에서 뽑아 준다(§4 Phase 2 스펙). */
export type SessionActivityEntry = {
  student_name: string;
  target_title: string;
  action: string;
  timestamp: string;
};

export type SessionRecord = {
  id: string;
  code: string;
  name: string;
  chapter_ids: number[];
  status: SessionStatus;
  max_participants: number;
  created_at: string;
  ended_at: string | null;
  /** 🚨 구 이름. student_count 와 같은 값이다 — 배포 시차 동안만 둘 다 온다. */
  participant_count?: number;
  student_count?: number;
  activity_count?: number;
  recent_students?: string[];
  last_activity?: SessionActivityEntry | null;
  /** 학생들이 연 문항 행의 총합. 「읽은」이 아니라 「열어 본」이다. */
  opened_qa_count?: number;
  in_progress_count?: number;
};

export type SessionDetail = SessionRecord & {
  participants: SessionParticipant[];
  viewer?: {
    participant_id: string;
    nickname: string;
    progress: Record<string, SessionProgressEntry>;
  };
};

export class SessionClientError extends Error {
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
    throw new SessionClientError(
      response.status,
      body.error ?? 'request_failed',
      body.message ?? '요청을 처리하지 못했습니다.',
    );
  }

  return body as T;
}

export async function listTeacherSessions(): Promise<SessionRecord[]> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch('/api/sessions', {
    headers,
  });
  return readJson<SessionRecord[]>(response);
}

export async function createSession(input: {
  name: string;
  chapterIds: number[];
  maxParticipants: 50 | 100 | 200;
}): Promise<SessionRecord> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      name: input.name,
      chapter_ids: input.chapterIds,
      max_participants: input.maxParticipants,
    }),
  });
  return readJson<SessionRecord>(response);
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch(`/api/sessions/${sessionId}`, {
    headers,
    credentials: 'include',
  });
  return readJson<SessionDetail>(response);
}

export async function getSessionParticipants(sessionId: string): Promise<{
  id: string;
  status: SessionStatus;
  participants: SessionParticipant[];
  /** 문항 id → 그 문항을 연 학생 수. 🚨 지금 이걸 그리는 화면은 없다(2026-08-12 교안 철거). */
  qa_completion?: Record<string, number>;
}> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch(`/api/sessions/${sessionId}/participants`, {
    headers,
  });
  return readJson(response);
}

export async function endSession(sessionId: string): Promise<SessionRecord> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch(`/api/sessions/${sessionId}/end`, {
    method: 'POST',
    headers,
  });
  return readJson<SessionRecord>(response);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const headers = await getTeacherAuthHeaders();
  const response = await fetch(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new SessionClientError(
      response.status,
      body.error ?? 'request_failed',
      body.message ?? '요청을 처리하지 못했습니다.',
    );
  }
}

export async function joinSession(input: { code: string; nickname: string }) {
  const response = await fetch('/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      code: input.code.trim().toUpperCase(),
      nickname: input.nickname.trim(),
    }),
  });
  return readJson<{ session_id: string; participant_id: string; nickname: string }>(response);
}

export async function patchProgress(input: {
  qaId: string;
  readAt?: string;
  quizScore?: number;
}) {
  const response = await fetch('/api/progress', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      qa_id: input.qaId,
      read_at: input.readAt,
      quiz_score: input.quizScore,
    }),
  });
  return readJson<{ ok: true }>(response);
}
