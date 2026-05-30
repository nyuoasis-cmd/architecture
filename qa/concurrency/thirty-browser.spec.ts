// real-flow-qa Layer B — architecture 30 학생 동시 join burst verdict.
//
// 포팅 원본: sprint/qa/concurrency/thirty-browser.spec.ts.
// architecture 핵심 차이 (실측 — server/src/routes/{join,progress,sessions}.ts):
//   - 학생 흐름 = anon. POST /api/join {code, nickname} → arch_pt 쿠키 + participant_id.
//     이어서 PATCH /api/progress {qa_id, read_at} (arch_pt 쿠키). 토큰 발급/supabase-js 전부 불요.
//     teacher 토큰 1개만 발급. 학생 트래픽은 X-QA-Run-Id 헤더만 부착 → PR1 qa-context source B
//     (세션 스코프 상속: join body.code / progress 참가자토큰)로 태깅된다.
//   - sprint 의 members/teams/worksheets/ai-prototype 없음 → 누수 oracle 을 "세션 격리" 로 재설계:
//     각 학생 nickname(=sentinel)은 자기 세션 참가자 목록에만, 다른 세션엔 절대 없어야 한다.
//   - AI(채팅) Layer B 제외(세션무관 전역 Q&A + 단일 egress IP 동시 채팅 비현실적 + IP rate-limit).
//     → cost_usd = 0 (LLM 호출 없음). cost-cap 은 폭주 안전장치.
//   - join rate-limit = 30/min/IP (join.ts LIMIT=30). 단일 egress IP 30 동시 = 한도 경계.
//     실학생은 모바일데이터 IP 분산이라 무영향. N>30 이면 join 429 = rejection 으로 측정.
//
// 실행: `npx playwright test -c qa/playwright-slice2.config.ts`
// 모드: QA_BASELINE_MODE=true → 게이트 비활성, 측정만 (Round 0) / 미설정 → baseline 게이트화.

import { test, expect, type BrowserContext, type APIResponse } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE = (process.env.QA_BASE_URL || 'http://localhost:3003').replace(/\/$/, '');
const QA_SECRET = process.env.QA_AUTH_SECRET || '';
const RUN_ID =
  process.env.QA_RUN_ID ||
  `b2-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}`;
const N = Number(process.env.QA_MAX_CONCURRENCY ?? 30);
const BASELINE_MODE = process.env.QA_BASELINE_MODE === 'true';
// architecture Layer B 는 LLM 호출 0 → 비용 0. cap 은 폭주 감지 안전장치(보수적 $0.50).
const COST_CAP_USD = Number(process.env.QA_COST_CAP_USD ?? 0.5);

const SENTRY_HOST_RE = /(\.ingest\.sentry\.io|(^|\.)sentry\.io)/i;
const REPORTS_ROOT = path.resolve(__dirname, '..', 'reports', RUN_ID);
const TRACES_DIR = path.join(REPORTS_ROOT, 'traces');
const BASELINE_PATH = path.resolve(__dirname, '..', 'baseline', 'slice2-b3-p95.json');

interface BaselineFile {
  run_id: string;
  p95_ms: number;
  success_rate: number;
  rejection_rate: number;
  cost_usd: number;
  memory_peak_mb: number;
  captured_at: string;
}

/** RUN_ID seed RNG (재현 가능 표본 추출). mulberry32 변형. */
function makeRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 학생 nickname(sentinel) — 전역 유니크, join nickname 20자 제한 충족. */
function sentinelNick(idx: number, label: 'A' | 'B'): string {
  const frag = RUN_ID.replace(/[^a-zA-Z0-9]/g, '').slice(-4);
  return `Q${frag}${label}${String(idx).padStart(2, '0')}`.slice(0, 20);
}

/** teacher QA 토큰 발급 (architecture 는 teacher 만 — 학생 anon). */
async function issueTeacherToken(): Promise<string> {
  const res = await fetch(`${BASE}/api/qa/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-QA-Secret': QA_SECRET },
    body: JSON.stringify({ role: 'teacher', run_id: RUN_ID }),
  });
  if (!res.ok) throw new Error(`issueTeacherToken ${res.status}: ${await res.text().catch(() => '')}`);
  return (await res.json()).access_token as string;
}

async function setupContext(
  context: BrowserContext,
  runId: string,
  browserIdx: number,
): Promise<{ sentryBlocked: () => number; tracePath: string }> {
  let blocked = 0;
  // 학생 트래픽 = anon. Authorization 헤더 부재. X-QA-Run-Id 만 부착 → 미들웨어 source B.
  await context.setExtraHTTPHeaders({
    'X-QA-Run-Id': runId,
    'X-QA-Browser-Id': String(browserIdx).padStart(2, '0'),
  });
  await context.route('**/*', (route) => {
    const url = route.request().url();
    try {
      if (SENTRY_HOST_RE.test(new URL(url).host)) {
        blocked++;
        return route.abort();
      }
    } catch {
      /* relative url */
    }
    return route.continue();
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
  const tracePath = path.join(TRACES_DIR, `${String(browserIdx).padStart(2, '0')}.zip`);
  return { sentryBlocked: () => blocked, tracePath };
}

function loadBaseline(): BaselineFile | null {
  try {
    const data = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as BaselineFile;
    if (!data.p95_ms || data.p95_ms <= 0) return null; // placeholder
    return data;
  } catch {
    return null;
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[idx];
}

test(`Layer B — ${30} 학생 동시 join verdict (${RUN_ID})`, async ({ browser, request }) => {
  test.setTimeout(540_000); // 9분 (30 동시 부하 여유)
  mkdirSync(TRACES_DIR, { recursive: true });

  // ── (1) teacher 토큰 발급 (학생은 anon — 토큰 없음) ──
  const teacherToken = await issueTeacherToken();

  // ── (2) QA 세션 2개 생성 (교사) — A=15, B=15. POST /api/sessions → { id, code } ──
  const mkSession = async (label: string): Promise<{ id: string; code: string }> => {
    const r = await request.post(`${BASE}/api/sessions`, {
      headers: {
        Authorization: `Bearer ${teacherToken}`,
        'X-QA-Run-Id': RUN_ID,
        'X-QA-Browser-Id': '00', // teacher 트랙
      },
      data: { name: `QA LayerB ${RUN_ID} ${label}`, chapter_ids: [1], max_participants: 200 },
    });
    expect(r.ok(), `세션 ${label} 생성 ${r.status()}: ${await r.text().catch(() => '')}`).toBeTruthy();
    const j = await r.json();
    return { id: j.id as string, code: j.code as string };
  };
  const sessionA = await mkSession('A');
  const sessionB = await mkSession('B');

  const half = Math.floor(N / 2);
  const students = Array.from({ length: N }, (_, i) => {
    const idx = i + 1;
    const inA = idx <= half;
    const label = (inA ? 'A' : 'B') as 'A' | 'B';
    return {
      idx,
      label,
      nick: sentinelNick(idx, label),
      sessionId: inA ? sessionA.id : sessionB.id,
      code: inA ? sessionA.code : sessionB.code,
    };
  });

  // ── (3) 30 burst: join(anon) → progress PATCH(arch_pt 쿠키) ──
  const contexts: BrowserContext[] = [];
  const tracePaths: string[] = [];
  const sentryCounters: Array<() => number> = [];
  const hardFailures: string[] = [];

  type StudentResult = {
    idx: number;
    label: 'A' | 'B';
    code: string;
    sessionId: string;
    nick: string;
    participantId: string | null;
    duration_ms: number;
    success: boolean;
    rejection: boolean; // join 429 (단일 IP rate-limit 경계) 또는 progress 실패
  };

  const burst = students.map(async (stu): Promise<StudentResult> => {
    const t0 = Date.now();
    const ctx = await browser.newContext();
    contexts.push(ctx);
    const { sentryBlocked, tracePath } = await setupContext(ctx, RUN_ID, stu.idx);
    sentryCounters.push(sentryBlocked);
    tracePaths.push(tracePath);
    const api = ctx.request; // anon — context 헤더만(X-QA-Run-Id/Browser-Id), Authorization 없음. arch_pt 쿠키 자동 보존.
    let participantId: string | null = null;
    let success = false;
    let rejection = false;

    // (3-1) join (anon). 429 = join rate-limit(단일 egress IP 경계, 설계 의도 측정). 5xx = 하드실패.
    const joinRes = await api.post(`${BASE}/api/join`, {
      data: { code: stu.code, nickname: stu.nick },
    });
    if (joinRes.status() === 429) {
      rejection = true;
    } else if (joinRes.status() >= 500 || joinRes.status() === 0) {
      hardFailures.push(`join s${stu.idx} ${joinRes.status()}`);
    } else {
      try { participantId = (await joinRes.json()).participant_id ?? null; } catch { /* */ }
    }

    // (3-2) progress PATCH (arch_pt 쿠키 자동 첨부 → 미들웨어 source B 로 architecture_progress 태깅)
    if (participantId) {
      const prog = await api.patch(`${BASE}/api/progress`, {
        data: { qa_id: 'ch01', read_at: new Date(t0).toISOString() },
      });
      if (prog.status() >= 500 || prog.status() === 0) {
        hardFailures.push(`progress s${stu.idx} ${prog.status()}`);
      } else if (prog.ok()) {
        success = !rejection;
      }
    }

    const duration_ms = Date.now() - t0;
    return {
      idx: stu.idx,
      label: stu.label,
      code: stu.code,
      sessionId: stu.sessionId,
      nick: stu.nick,
      participantId,
      duration_ms,
      success,
      rejection,
    };
  });

  const results = await Promise.all(burst);

  // ── (4) 누수 oracle = 세션 격리 (교사가 A/B 참가자 목록 조회 → nickname 교차오염 0) ──
  const leaks: string[] = [];
  const listParticipants = async (sessionId: string): Promise<string[]> => {
    const r = await request.get(`${BASE}/api/sessions/${sessionId}/participants`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    if (!r.ok()) {
      hardFailures.push(`participants ${sessionId} ${r.status()}`);
      return [];
    }
    try {
      const j = await r.json();
      return (j.participants ?? []).map((p: { nickname: string }) => p.nickname);
    } catch {
      return [];
    }
  };
  const nicksInA = new Set(await listParticipants(sessionA.id));
  const nicksInB = new Set(await listParticipants(sessionB.id));

  for (const r of results) {
    if (!r.participantId) continue; // join 거부/실패한 학생은 oracle 대상 외
    const ownSet = r.label === 'A' ? nicksInA : nicksInB;
    const otherSet = r.label === 'A' ? nicksInB : nicksInA;
    // 자기 세션엔 자기 nickname 보여야 (영속·가시성 진단). 없으면 BLOCKED 성격이나 누수 아님.
    if (!ownSet.has(r.nick)) {
      hardFailures.push(`persist s${r.idx} nick=${r.nick} absent from own session ${r.label}`);
    }
    // 다른 세션엔 자기 nickname 절대 없어야 (누수 절대선).
    if (otherSet.has(r.nick)) {
      leaks.push(`s${r.idx} nick=${r.nick} leaked into session ${r.label === 'A' ? 'B' : 'A'}`);
    }
  }

  // 공개 세션 표면 (GET /api/sessions/:id) — 다른 세션 nickname 부재 (anon 표면 노출 검사)
  const bodyOf = async (res: APIResponse) => (res.ok() ? await res.text() : '');
  for (const sess of [sessionA, sessionB]) {
    const surface = await bodyOf(await request.get(`${BASE}/api/sessions/${sess.id}`));
    for (const r of results) {
      if (r.sessionId !== sess.id && r.participantId && surface.includes(r.nick)) {
        leaks.push(`session ${sess.id} surface exposed s${r.idx} nick=${r.nick}`);
      }
    }
  }

  // ── (5) trace 회수 + context close ──
  for (let i = 0; i < contexts.length; i++) {
    await contexts[i].tracing.stop({ path: tracePaths[i] }).catch(() => {});
    await contexts[i].close().catch(() => {});
  }

  // ── (6) 측정·게이트 ──
  const durations = results.map((r) => r.duration_ms).sort((a, b) => a - b);
  const successCount = results.filter((r) => r.success).length;
  const rejectionCount = results.filter((r) => r.rejection).length;
  const successRate = successCount / N;
  const rejectionRate = rejectionCount / N;
  const p95 = percentile(durations, 0.95);
  const costUsd = 0; // Layer B 는 LLM 호출 0
  const totalSentryAttempts = sentryCounters.reduce((a, f) => a + f(), 0);

  const summary = {
    run_id: RUN_ID,
    mode: BASELINE_MODE ? 'baseline' : 'verdict',
    N,
    success_rate: successRate,
    rejection_rate: rejectionRate,
    p95_ms: p95,
    cost_usd: costUsd,
    leaks: leaks.length,
    hard_failures: hardFailures.length,
    sentry_blocked_attempts: totalSentryAttempts,
    per_browser: results.map((r) => ({
      browser_id: String(r.idx).padStart(2, '0'),
      session: r.code,
      session_label: r.label,
      duration_ms: r.duration_ms,
      success: r.success ? 1 : 0,
      rejection: r.rejection ? 1 : 0,
      cost_usd: 0,
      trace_path: tracePaths[r.idx - 1],
    })),
    captured_at: new Date().toISOString(),
  };
  mkdirSync(REPORTS_ROOT, { recursive: true });
  writeFileSync(
    path.join(REPORTS_ROOT, BASELINE_MODE ? 'slice2-baseline.json' : 'slice2-verdict.json'),
    JSON.stringify(summary, null, 2),
    'utf8',
  );

  if (BASELINE_MODE) {
    const baselineOut: BaselineFile = {
      run_id: RUN_ID,
      p95_ms: p95,
      success_rate: successRate,
      rejection_rate: rejectionRate,
      cost_usd: costUsd,
      memory_peak_mb: 0, // 별 터미널 free -h 모니터링에서 jery 보고
      captured_at: new Date().toISOString(),
    };
    writeFileSync(
      path.join(REPORTS_ROOT, 'slice2-b3-p95.candidate.json'),
      JSON.stringify(baselineOut, null, 2),
      'utf8',
    );
    console.log(
      `[LayerB] BASELINE run=${RUN_ID} N=${N} success=${(successRate * 100).toFixed(1)}% rej=${(rejectionRate * 100).toFixed(1)}% p95=${p95}ms cost=$${costUsd.toFixed(4)} leaks=${leaks.length} hardFails=${hardFailures.length}`,
    );
    // baseline 도 절대선 (누수·하드실패·비용)만 즉시 FAIL
    expect(leaks, `누수 (baseline 도 절대선): ${leaks.join(' | ')}`).toHaveLength(0);
    expect(hardFailures, `하드실패 (baseline 도 절대선): ${hardFailures.join(' | ')}`).toHaveLength(0);
    expect(costUsd, `비용 cap 초과: $${costUsd.toFixed(4)} > $${COST_CAP_USD}`).toBeLessThanOrEqual(COST_CAP_USD);
    return;
  }

  console.log(
    `[LayerB] VERDICT run=${RUN_ID} N=${N} success=${(successRate * 100).toFixed(1)}% rej=${(rejectionRate * 100).toFixed(1)}% p95=${p95}ms cost=$${costUsd.toFixed(4)} leaks=${leaks.length} hardFails=${hardFailures.length}`,
  );

  // 절대선
  expect(leaks, `누수 (절대선=0): ${leaks.join(' | ')}`).toHaveLength(0);
  expect(hardFailures, `하드실패 (절대선=0): ${hardFailures.join(' | ')}`).toHaveLength(0);
  expect(costUsd, `비용 cap 초과: $${costUsd.toFixed(4)} > $${COST_CAP_USD}`).toBeLessThanOrEqual(COST_CAP_USD);

  // 4지표 (baseline 게이트화)
  const baseline = loadBaseline();
  if (!baseline) {
    throw new Error(
      `verdict mode 인데 baseline 미설정. Round 0 (QA_BASELINE_MODE=true) 선행 + qa/baseline/slice2-b3-p95.json commit 필요.`,
    );
  }
  expect(successRate, `성공률 < 95% (실측=${(successRate * 100).toFixed(1)}%)`).toBeGreaterThanOrEqual(0.95);
  const p95Cap = baseline.p95_ms * 1.2;
  expect(p95, `P95 회귀 20% 초과 (실측=${p95}ms > baseline×1.20=${p95Cap}ms)`).toBeLessThanOrEqual(p95Cap);
  // 거부율 5% 초과 = WARN (FAIL 아님). 단일 egress IP join rate-limit 경계 — 실학생 IP 분산이라 무관.
  if (rejectionRate > 0.05) {
    console.warn(`[LayerB] WARN: 거부율 ${(rejectionRate * 100).toFixed(1)}% > 5% — 단일 egress IP join rate-limit 경계(실학생 무관) 검토`);
  }
});
