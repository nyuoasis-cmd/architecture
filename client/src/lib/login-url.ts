const LOGIN_BASE_LOCAL = 'http://localhost:5000/login';
const LOGIN_BASE_PROD = 'https://teachermate.co.kr/login';
const ARCHITECTURE_CANONICAL_ORIGIN = 'https://architecture.teachermate.co.kr';

export function getReturnOrigin(): string {
  const { hostname, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }

  if (hostname.endsWith('.teachermate.co.kr')) {
    return origin;
  }

  return ARCHITECTURE_CANONICAL_ORIGIN;
}

export function getServiceLoginUrl(relativePath?: string): string {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? LOGIN_BASE_LOCAL : LOGIN_BASE_PROD;
  const returnPath = relativePath ?? `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const returnUrl = encodeURIComponent(`${getReturnOrigin()}${returnPath}`);
  return `${base}?returnUrl=${returnUrl}`;
}
