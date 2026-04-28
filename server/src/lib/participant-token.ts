import type { Request } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../env';

const COOKIE_NAME = 'arch_pt';

type ParticipantTokenPayload = {
  participant_id: string;
  session_id: string;
  iat: number;
  exp: number;
};

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string): string {
  if (!env.HMAC_SECRET) {
    throw new Error('hmac_not_configured');
  }

  return createHmac('sha256', env.HMAC_SECRET).update(value).digest('base64url');
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.get('cookie');
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((acc, chunk) => {
    const [rawKey, ...rest] = chunk.trim().split('=');
    if (!rawKey || rest.length === 0) {
      return acc;
    }

    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

export function getParticipantTokenFromRequest(req: Request): string | null {
  return parseCookies(req)[COOKIE_NAME] ?? null;
}

export function signParticipantToken(input: {
  participantId: string;
  sessionId: string;
  expiresInSeconds?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ParticipantTokenPayload = {
    participant_id: input.participantId,
    session_id: input.sessionId,
    iat: now,
    exp: now + (input.expiresInSeconds ?? 43_200),
  };
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encode(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyParticipantToken(token: string): ParticipantTokenPayload | null {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) {
    return null;
  }

  try {
    const unsigned = `${header}.${body}`;
    const expected = sign(unsigned);
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(decode(body)) as ParticipantTokenPayload;
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const participantCookieName = COOKIE_NAME;
