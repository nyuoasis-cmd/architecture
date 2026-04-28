const COOKIE_NAME = 'arch_session_hint';

export type SessionTokenHint = {
  sessionId: string;
  participantId: string;
  nickname: string;
};

export function setSessionTokenHint(value: SessionTokenHint) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=43200; SameSite=Lax`;
}

export function getSessionTokenHint(): SessionTokenHint | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';').map((item) => item.trim());
  const target = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`));
  if (!target) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(target.slice(COOKIE_NAME.length + 1))) as SessionTokenHint;
  } catch {
    return null;
  }
}

export function clearSessionTokenHint() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
