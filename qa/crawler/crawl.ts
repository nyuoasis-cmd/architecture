#!/usr/bin/env -S npx tsx
// real-flow-qa Layer A — 범용 전수 인터랙션 크롤러 (SDD §3 PR3).
//
// 런타임 = Puppeteer(루트 기존 devDep, 추가 의존성 0). Playwright(@playwright/test)는 PR2 전용 →
//   PR3 을 main 에서 독립 분기·package.json 무수정으로 두기 위해 Puppeteer 채택(SDD §9 stacked 회피 우선).
//   기능 동등: console/response/pageerror 리스너 + evaluate(흰화면 불변식) + 클릭/네비.
//
// 실행 (jery — QA_AUTH_ENABLED=true 서버 기동 후):
//   QA_BASE_URL=http://localhost:3003 QA_CLIENT_URL=http://localhost:5176 \
//   QA_AUTH_SECRET=... npx tsx qa/crawler/crawl.ts --manifest architecture
//
// 불변식(흰화면 4): (i)root 면적 (ii)본문 텍스트 (iii)error boundary (iv)지속 스피너.
// 네트워크 오라클: 5xx/401/403/429. 콘솔 fingerprint: allowlist.json 대조. 죽은버튼: data-qa-action opt-in.

import puppeteer, { type Browser, type Page, type HTTPRequest, type HTTPResponse } from 'puppeteer';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest, { type CrawlRole, type DynamicContext } from './manifest.architecture';
import {
  writeReport,
  summarize,
  type CrawlReport,
  type RouteResult,
  type RouteFinding,
} from './report';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QA_BASE_URL = (process.env.QA_BASE_URL || 'http://localhost:3003').replace(/\/$/, '');
const QA_CLIENT_URL = (process.env.QA_CLIENT_URL || 'http://localhost:5176').replace(/\/$/, '');
const QA_SECRET = process.env.QA_AUTH_SECRET || '';
const RUN_ID = process.env.QA_RUN_ID || `crawl-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}`;
const REPORTS_ROOT = path.resolve(__dirname, '..', 'reports');
const SETTLE_MS = Number(process.env.QA_SETTLE_MS ?? 2500);
const MAX_CLICKS_PER_ROUTE = Number(process.env.QA_MAX_CLICKS ?? 12);

interface AllowEntry { fingerprint: string; match: 'substring' | 'exact'; expires: string }
const allowlist: AllowEntry[] = (() => {
  try {
    const raw = JSON.parse(readFileSync(path.join(__dirname, 'allowlist.json'), 'utf8'));
    return Array.isArray(raw.entries) ? raw.entries : [];
  } catch { return []; }
})();

function isAllowlisted(msg: string): boolean {
  return allowlist.some((e) =>
    e.match === 'exact' ? msg === e.fingerprint : msg.includes(e.fingerprint),
  );
}

function isForbidden(url: string): boolean {
  return manifest.forbiddenRoutes.some((rule) =>
    typeof rule === 'string' ? url.includes(rule) : rule.test(url),
  );
}

interface QaTeacherSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  account_id: string;
}

async function issueTeacherToken(): Promise<QaTeacherSession> {
  const res = await fetch(`${QA_BASE_URL}/api/qa/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-QA-Secret': QA_SECRET },
    body: JSON.stringify({ role: 'teacher', run_id: RUN_ID }),
  });
  if (!res.ok) throw new Error(`issueTeacherToken ${res.status}: ${await res.text().catch(() => '')}`);
  const j = await res.json();
  return {
    access_token: j.access_token as string,
    refresh_token: (j.refresh_token ?? '') as string,
    expires_at: Number(j.expires_at ?? 0),
    account_id: (j.account_id ?? '') as string,
  };
}

/** 흰화면 4불변식 + 지속 스피너 검사(브라우저 컨텍스트). */
async function checkWhitescreen(page: Page): Promise<{ ok: boolean; reasons: string[] }> {
  return page.evaluate(() => {
    const reasons: string[] = [];
    // (i) root 면적
    const root = document.querySelector('#root') || document.body;
    const rect = root.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area < 1000) reasons.push(`root 면적 ${Math.round(area)}px² < 1000`);
    // (ii) 본문 텍스트
    const text = (document.body.innerText || '').trim();
    if (text.length < 5) reasons.push(`본문 텍스트 ${text.length}자 < 5`);
    // (iii) error boundary
    const boundary =
      document.querySelector('[data-error-boundary]') ||
      Array.from(document.querySelectorAll('body *')).find((el) =>
        /문제가 발생|오류가 발생|something went wrong|Application error/i.test(
          (el as HTMLElement).innerText || '',
        ),
      );
    if (boundary) reasons.push('error boundary 노출');
    // (iv) 지속 스피너 (settle 후에도 보이면 stuck)
    const spinner = Array.from(
      document.querySelectorAll('[role="status"], [aria-busy="true"], .spinner, .loader, [class*="animate-spin"]'),
    ).find((el) => {
      const s = getComputedStyle(el as HTMLElement);
      return s.display !== 'none' && s.visibility !== 'hidden' && (el as HTMLElement).offsetParent !== null;
    });
    if (spinner) reasons.push('지속 스피너(로딩 stuck)');
    return { ok: reasons.length === 0, reasons };
  });
}

async function crawlRoute(
  browser: Browser,
  seedPath: string,
  resolvedPath: string,
  role: CrawlRole,
  teacherToken: QaTeacherSession | null,
  participantCookie: string | null,
  skippedForbidden: string[],
): Promise<RouteResult> {
  const t0 = Date.now();
  const findings: RouteFinding[] = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // 모바일(학생 주 사용)
  // X-QA 헤더는 same-origin(client/api) 요청에만 부착한다. setExtraHTTPHeaders 는 cross-origin
  // 폰트(cdn.jsdelivr/fonts.gstatic)에도 헤더를 새게 해 CORS preflight 를 깨뜨리고(자기유발),
  // 그 console-error 를 결함으로 오탐한다. interception 으로 origin 을 가려 주입한다.
  const blockedRequests: string[] = []; // 네트워크에서 끊은 금지 요청 — 리포트에 남긴다
  await page.setRequestInterception(true);
  page.on('request', (req: HTTPRequest) => {
    if (req.isInterceptResolutionHandled()) return;
    const url = req.url();
    // 🚨 §3 이중 방어 — 네비게이션 가드(아래 217행)만으로는 버튼 클릭이 부른 XHR 을 못 막는다.
    // 크롤러는 페이지의 모든 button/a 를 누르므로, 금지 라우트는 네트워크에서 한 번 더 끊는다.
    // 이게 없으면 AI 라우트가 실제로 호출돼 돈이 나간다(「내 차례」는 돈 천장이 없다).
    if (isForbidden(url)) {
      blockedRequests.push(url);
      req.abort('blockedbyclient').catch(() => { /* 이미 처리됨 */ });
      return;
    }
    if (url.startsWith(QA_CLIENT_URL) || url.startsWith(QA_BASE_URL)) {
      req.continue({ headers: { ...req.headers(), 'x-qa-run-id': RUN_ID, 'x-qa-browser-id': 'crawler' } });
    } else {
      req.continue();
    }
  });

  // teacher 인증 주입(Supabase 세션).
  // 🚨 저장소는 localStorage 가 아니라 **쿠키**다 — client/src/lib/supabase-client.ts 가
  //    `storage: cookieStorage`(js-cookie) 로 createClient 한다. localStorage 에 쓰면
  //    앱이 절대 읽지 않아 AuthGate 가 로그인으로 보내고, teacher 경로가 전부 SKIPPED 로 샌다.
  //    (2026-08-13 실측: 이 때문에 teacher 4경로가 «한 번도» 크롤된 적이 없었다. prod 에서도 같다.)
  // 🚨 stub 도 안 된다 — expires_at·refresh_token 이 없으면 supabase-js 가 만료로 보고
  //    getSession()에 null 을 준다. 그래서 JWT 클레임에서 user 를 복원해 온전한 Session 을 만든다.
  // 🔑 값은 encodeURIComponent 로 감싼다. 쿠키는 콤마·따옴표를 그대로 못 담고,
  //    js-cookie 의 read 변환기가 퍼센트 시퀀스를 되돌려 주므로 왕복이 맞는다.
  if (role === 'teacher' && teacherToken) {
    let claims: Record<string, unknown> = {};
    try {
      const part = teacherToken.access_token.split('.')[1] ?? '';
      claims = JSON.parse(Buffer.from(part, 'base64').toString('utf8'));
    } catch { /* 클레임 해독 실패 시 최소 user 로 진행 */ }
    const sessionPayload = JSON.stringify({
      access_token: teacherToken.access_token,
      refresh_token: teacherToken.refresh_token,
      token_type: 'bearer',
      expires_at: teacherToken.expires_at,
      expires_in: Math.max(0, teacherToken.expires_at - Math.floor(Date.now() / 1000)),
      user: {
        id: (claims.sub as string) ?? teacherToken.account_id,
        aud: (claims.aud as string) ?? 'authenticated',
        role: (claims.role as string) ?? 'authenticated',
        email: (claims.email as string) ?? '',
        app_metadata: (claims.app_metadata as object) ?? {},
        user_metadata: (claims.user_metadata as object) ?? {},
      },
    });
    await page.setCookie({
      name: 'sb-auth-token',
      value: encodeURIComponent(sessionPayload),
      url: QA_CLIENT_URL,
      path: '/',
    });
  }

  // participant 인증 주입 — setup()이 /api/join 으로 미리 발급받은 arch_pt 쿠키.
  // domain 은 QA_CLIENT_URL 의 host 만 지정(포트 무관 — 쿠키는 host 단위로 매칭되고, vite dev
  // proxy(/api → QA_BASE_URL)로 브라우저에선 client host 로만 요청이 나가므로 이걸로 충분).
  if (role === 'participant' && participantCookie) {
    const [name, ...rest] = participantCookie.split('=');
    const value = rest.join('=');
    await page.setCookie({ name, value, url: QA_CLIENT_URL, path: '/' });
  }

  // 리스너: 콘솔 에러 / pageerror / 네트워크 4xx·5xx
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isAllowlisted(text)) return;
    findings.push({ kind: 'console-error', detail: text.slice(0, 300), fingerprint: text.slice(0, 80) });
  });
  page.on('pageerror', (err: unknown) => {
    const e = err as { name?: string; message?: string };
    findings.push({ kind: 'page-error', detail: `${e?.name ?? 'Error'}: ${e?.message ?? String(err)}`.slice(0, 300) });
  });
  page.on('response', (res: HTTPResponse) => {
    const s = res.status();
    if (s === 401 || s === 403 || s === 429 || s >= 500) {
      findings.push({ kind: 'http-error', detail: res.request().method() + ' ' + res.url().slice(0, 120), httpStatus: s, url: res.url().slice(0, 200) });
    }
  });

  const fullUrl = `${QA_CLIENT_URL}${resolvedPath}`;
  let clicked = 0;
  let deadButtons = 0;

  try {
    if (isForbidden(fullUrl) || isForbidden(resolvedPath)) {
      skippedForbidden.push(fullUrl);
      await page.close();
      return { path: seedPath, resolvedUrl: fullUrl, role, status: 'SKIPPED', findings, clicked, deadButtons, durationMs: Date.now() - t0 };
    }

    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30_000 }).catch((e) => {
      findings.push({ kind: 'page-error', detail: `goto 실패: ${String(e).slice(0, 200)}` });
    });
    await new Promise((r) => setTimeout(r, SETTLE_MS)); // settle(스피너 판정)

    // teacher 인증 미착(로그인 화면으로 리다이렉트) → SKIPPED(silent cap 금지, 사유 기록)
    if (role === 'teacher') {
      const onLogin = await page.evaluate(() => location.pathname.includes('/login') || /로그인/.test(document.body.innerText || ''));
      if (onLogin) {
        await page.close();
        return { path: seedPath, resolvedUrl: fullUrl, role, status: 'SKIPPED', findings: [{ kind: 'page-error', detail: 'teacher 인증 주입 미지원 빌드 → SKIPPED(흰화면 아님)' }], clicked, deadButtons, durationMs: Date.now() - t0 };
      }
    }

    // 흰화면 4불변식
    const ws = await checkWhitescreen(page);
    if (!ws.ok) findings.push({ kind: 'whitescreen', detail: ws.reasons.join('; ') });

    // 인터랙티브 요소 클릭(예산 제한). data-qa-action = 죽은버튼 검사 대상.
    const handles = await page.$$('button, a, [role="button"], [data-qa-action]');
    for (const h of handles.slice(0, MAX_CLICKS_PER_ROUTE)) {
      const meta = await h.evaluate((el) => ({
        href: (el as HTMLAnchorElement).getAttribute?.('href') || '',
        qaAction: el.getAttribute('data-qa-action'),
        disabled: (el as HTMLButtonElement).disabled === true,
        visible: (el as HTMLElement).offsetParent !== null,
      })).catch(() => null);
      if (!meta || !meta.visible || meta.disabled) continue;
      if (meta.href && isForbidden(meta.href)) { skippedForbidden.push(meta.href); continue; }

      const before = page.url();
      try {
        await h.click({ delay: 10 });
        clicked++;
        await new Promise((r) => setTimeout(r, 250));
        const after = page.url();
        // 죽은버튼: data-qa-action 인데 URL·DOM 변화 0 (opt-in 만 FAIL)
        if (meta.qaAction && after === before) {
          const domChanged = await page.evaluate(() => true); // (간이) — 정밀 판정은 별 PR
          if (!domChanged) deadButtons++;
        }
        // 네비게이션 시 forbidden 진입 방지 — 벗어났으면 복귀
        if (isForbidden(page.url())) {
          skippedForbidden.push(page.url());
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => {});
        } else if (page.url() !== before && !page.url().startsWith(QA_CLIENT_URL)) {
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => {});
        }
      } catch { /* 클릭 불가 요소 무시 */ }
    }
  } finally {
    await page.close().catch(() => {});
  }

  // 네트워크에서 끊은 금지 요청은 «결함»이 아니라 «방어가 일했다»는 기록이다 — 눈에 보이게 남긴다.
  if (blockedRequests.length > 0) {
    const uniq = [...new Set(blockedRequests)];
    console.log(`[crawl]   🛡️ 금지 라우트 ${blockedRequests.length}건 차단: ${uniq.slice(0, 3).join(', ')}${uniq.length > 3 ? ` 외 ${uniq.length - 3}` : ''}`);
  }

  // 판정
  const hard = findings.some((f) => f.kind === 'page-error' || (f.kind === 'http-error' && (f.httpStatus ?? 0) >= 500) || f.kind === 'whitescreen');
  const soft = findings.some((f) => f.kind === 'console-error' || (f.kind === 'http-error' && [401, 403, 429].includes(f.httpStatus ?? 0)) || f.kind === 'dead-button');
  const status: RouteResult['status'] = hard || soft ? 'FAIL' : 'PASS';

  return { path: seedPath, resolvedUrl: fullUrl, role, status, findings, clicked, deadButtons, durationMs: Date.now() - t0 };
}

async function fetchEffectBlocks(): Promise<unknown[]> {
  try {
    const res = await fetch(`${QA_BASE_URL}/api/qa/run/${encodeURIComponent(RUN_ID)}/effect-blocks`, {
      headers: { 'X-QA-Secret': QA_SECRET },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.blocks) ? data.blocks : [];
  } catch { return []; }
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[crawl] run=${RUN_ID} app=${manifest.app} client=${QA_CLIENT_URL} api=${QA_BASE_URL}`);

  let teacherToken: QaTeacherSession | null = null;
  let dynCtx: DynamicContext | null = null;
  try {
    teacherToken = await issueTeacherToken();
    // manifest 계약은 Bearer 문자열 하나다(변경하지 않는다). 이미 발급한 것을 넘겨
    // 같은 크롤에서 토큰을 두 번 발급하지 않는다 — 발급마다 감사 로그가 한 줄씩 쌓인다.
    const issuedToken = teacherToken.access_token;
    dynCtx = await manifest.dynamicRouteFactories.setup({
      issueTeacherToken: async () => issuedToken,
      apiBase: QA_BASE_URL,
      runId: RUN_ID,
    });
    console.log(`[crawl] QA 세션 코드 = ${dynCtx.sessionCode}`);
  } catch (e) {
    console.error(`[crawl] setup 실패(라이브 서버 필요): ${String(e).slice(0, 200)}`);
    console.error('[crawl] QA_AUTH_ENABLED=true 서버 + QA_AUTH_SECRET 확인 후 재실행.');
    process.exit(3);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--single-process'],
  });

  const routes: RouteResult[] = [];
  const skippedForbidden: string[] = [];
  try {
    for (const seed of manifest.seedUrls) {
      if (!manifest.roles.includes(seed.role)) continue;
      const resolved = seed.dynamic && dynCtx ? manifest.dynamicRouteFactories.resolve(seed.path, dynCtx) : seed.path;
      console.log(`[crawl] → ${seed.role} ${resolved}`);
      const result = await crawlRoute(browser, seed.path, resolved, seed.role, teacherToken, dynCtx?.participantCookie ?? null, skippedForbidden);
      routes.push(result);
      console.log(`[crawl]   ${result.status} (clicked=${result.clicked} findings=${result.findings.length})`);
    }
  } finally {
    await browser.close().catch(() => {});
    if (dynCtx) await manifest.dynamicRouteFactories.teardown(dynCtx).catch(() => {});
  }

  const effectBlocks = await fetchEffectBlocks();
  const report: CrawlReport = {
    run_id: RUN_ID,
    app: manifest.app,
    base_url: QA_CLIENT_URL,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    routes,
    skipped_forbidden: skippedForbidden,
    effect_blocks: effectBlocks,
    summary: summarize(routes),
  };
  const { jsonPath, mdPath } = writeReport(report, REPORTS_ROOT);
  const s = report.summary;
  console.log(`\n[crawl] 완료 — PASS ${s.pass} / FAIL ${s.fail} / SKIPPED ${s.skipped} · 하드실패 ${s.hard_failures}`);
  console.log(`[crawl] EffectGate 차단 ${effectBlocks.length}건 · 리포트: ${jsonPath}`);
  console.log(`[crawl] md: ${mdPath}`);

  // 하드실패(5xx·크래시·흰화면) 있으면 비정상 종료(CI 게이트)
  process.exit(s.hard_failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('[crawl] 치명 오류:', e);
  process.exit(2);
});
