import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateSessionCode(length = 6): string {
  return Array.from({ length }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join('');
}
