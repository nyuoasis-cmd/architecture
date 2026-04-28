import { getDevUser } from './dev-auth';

export type SessionStatus = 'active' | 'ended';

export type SessionParticipant = {
  id: string;
  nickname: string;
  joined_at: string;
  progress_count: number;
};

export type SessionProgressEntry = {
  read: boolean;
  quizScore?: number;
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
  participant_count?: number;
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

function getTeacherHeaders() {
  const user = getDevUser();
  if (!user) {
    return {} as Record<string, string>;
  }

  return {
    'x-dev-teacher-id': user.id,
    'x-dev-teacher-name': user.name,
  } satisfies Record<string, string>;
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
  const response = await fetch('/api/sessions', {
    headers: getTeacherHeaders(),
  });
  return readJson<SessionRecord[]>(response);
}

export async function createSession(input: {
  name: string;
  chapterIds: number[];
  maxParticipants: 50 | 100 | 200;
}): Promise<SessionRecord> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getTeacherHeaders(),
    },
    body: JSON.stringify({
      name: input.name,
      chapter_ids: input.chapterIds,
      max_participants: input.maxParticipants,
    }),
  });
  return readJson<SessionRecord>(response);
}

export async function getSession(sessionId: string, options?: { teacher?: boolean }): Promise<SessionDetail> {
  const response = await fetch(`/api/sessions/${sessionId}`, {
    headers: options?.teacher ? getTeacherHeaders() : undefined,
    credentials: 'include',
  });
  return readJson<SessionDetail>(response);
}

export async function getSessionParticipants(sessionId: string): Promise<{
  id: string;
  status: SessionStatus;
  participants: SessionParticipant[];
}> {
  const response = await fetch(`/api/sessions/${sessionId}/participants`, {
    headers: getTeacherHeaders(),
  });
  return readJson(response);
}

export async function endSession(sessionId: string): Promise<SessionRecord> {
  const response = await fetch(`/api/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: getTeacherHeaders(),
  });
  return readJson<SessionRecord>(response);
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
