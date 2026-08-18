// 수업 사전점검 Tier2 — architecture 자급(自給) 핵심흐름 스모크.
//
// 역할: Phase1(HTTP 200)이 못 보는 "200 뒤에서 조용히 죽는" 유형을 야간 무인으로 밟고·지운다.
//   핵심흐름 = "교사 토큰 → 세션 생성 → 학생 join → 참여자 조회 → 교사 목록 → 종료 → 삭제".
//
// ⚠️ 대상 = 배포된 prod(architecture.teachermate.co.kr). 데이터 DB = **공유 메인** —
//   architecture 전용 DB 가 아니다. 그래서 teardown 은 절대 넓게 지우지 않는다(S2·S4).
//
// 계약(shared/qa/class-check/SAFETY-CONTRACT.md S0~S5 대조):
//   S0 교사 = prod 의 전용 QA 계정(POST /api/qa/auth/token, role=teacher 고정).
//      🔑 이 엔드포인트는 **임의 유저를 사칭할 수 없다** — 요청 본문에 email/uid 필드가 아예 없고
//         role 은 'teacher' 만 통과한다(구조적 차단). jery 계정으로 떨어질 길이 없다.
//      발급된 account_id 가 QA_ACCOUNT_TEACHER_ID 와 다르면 **SKIP 이 아니라 FAIL**.
//   S1 마커 = 세션 name 에 `[QA <runId>]`. 심은 뒤 **되읽어 확인**(잘리면 teardown 조건이
//      영원히 안 맞는다 — name 은 max 60자, 마커는 21자).
//   S2 삭제 = 세션 PK **그리고** 마커가 동시에 맞을 때만. like/prefix/시각범위 삭제 0건.
//   S3 격리 = 만든 세션의 소유자가 QA 교사이고, 교사 목록에 그 세션이 보인다.
//   S4 실패 = 잔존 ID 를 보고하고 멈춘다. "혹시 모르니 넓게" 금지.
//   S5 AI  = 모드가 둘이다. **기본 = 소비 0**(아래 AI_ROUTES 를 한 번도 치지 않는다) ·
//      **AI 모드(PRECLASS_AI_ROUTES=1) = 폐쇄 목록 각 정확히 1회**(축2-b 러너 전용).
//      기본 모드는 끝나고 DB 에서 우리 세션의 chat 행이 0인지 **되읽어 확인**한다.
//      🔑 "안 불렀다" 는 선언이 아니라 관측이어야 한다 — 흐름이 몰래 부르면 그게 사고다.
//      🚨 AI 모드는 **실제로 돈을 쓴다**(6라우트 — lab-submit 은 서버가 검증 2회를 재호출해
//         제공자 호출은 7회다). 손으로 켤 때는 그걸 알고 켤 것.
//
// 로드: set -a; source ~/.claude/.secrets/architecture-real-flow-qa.env; set +a
//       node ~/architecture/qa/preclass-flow-smoke.mjs                       # 기본(무료) — 밤샘
//       PRECLASS_AI_ROUTES=1 node ~/architecture/qa/preclass-flow-smoke.mjs  # 💸 축2-b
// 마지막 줄: `PRECLASS_FLOW=architecture RESULT=PASS|FAIL detail=...` (Tier2 bash 가 파싱)

import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const pexec = promisify(execFile);

/**
 * 앱 시크릿 자체 로드 — **env 가 이미 갖고 있으면 손대지 않는다**(brand loadDbSecret 선례).
 * 축2/축2-b 러너(shared/qa/class-check)는 공용 preclass-qa.env 만 싣기 때문에,
 * architecture 전용 키(QA_AUTH_SECRET 등)는 여기서 스스로 읽는다. 파일이 없으면 조용히
 * 넘어가고 판정은 S0 재료검사가 한다(스택트레이스에 묻히지 않게).
 */
(function loadAppSecrets() {
  const KEYS = ['QA_AUTH_SECRET', 'QA_ACCOUNT_TEACHER_ID', 'DATABASE_URL', 'QA_BASE_URL'];
  if (KEYS.every((k) => process.env[k])) return;
  let raw = '';
  try { raw = readFileSync(join(homedir(), '.claude', '.secrets', 'architecture-real-flow-qa.env'), 'utf8'); } catch { return; }
  for (const line of raw.split('\n')) {
    const m = /^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.+?)\s*$/u.exec(line);
    if (!m || !KEYS.includes(m[1]) || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/gu, '');
  }
})();

const BASE = (process.env.QA_BASE_URL || 'https://architecture.teachermate.co.kr').replace(/\/$/u, '');
const SECRET = process.env.QA_AUTH_SECRET || '';
const EXPECT_TEACHER = process.env.QA_ACCOUNT_TEACHER_ID || '';
const DB = process.env.DATABASE_URL || '';
// 🔑 축2-b 모드 — 러너(shared/qa/class-check/axis2b.mjs)가 PRECLASS_AI_ROUTES=1 을 실어 켠다.
const AI_MODE = process.env.PRECLASS_AI_ROUTES === '1';
// AI 모드는 실호출 7회(순차)라 기본 90s 로는 «느림» 이 «죽음» 으로 둔갑한다.
const TIMEOUT_MS = Number(process.env.PRECLASS_FLOW_TIMEOUT_MS || (AI_MODE ? '300000' : '90000'));

const RUN_ID = randomUUID().replace(/-/gu, '').slice(0, 16);
const MARKER = `[QA ${RUN_ID}]`;
const NICK = `qa-${RUN_ID.slice(0, 8)}`;   // max 20자 계약

const steps = [];
let createdSessionId = '';
let tearingDown = false;   // teardown 재진입 방지 — done() 이 두 번 지우지 않게

function log(name, detail = '') {
  steps.push(name);
  console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`);
}

/**
 * 판정 출력 + 종료. 🚨 **실패로 끝날 때도 반드시 지우고 나간다.**
 * 예전 판은 흐름 중간의 `done(false, …)` 가 teardown 없이 process.exit 해서, 검사가 제 일을
 * 한 날(=FAIL 한 날)마다 prod 에 세션이 한 줄씩 쌓였다 — 실패는 드물어서 오래 안 보인다.
 * (2026-08-11 변이시험에서 실측: 참여자 노출 검사를 변이시키자 세션 1건이 그대로 남았다.)
 * teardown 이 이미 돈 뒤(S4 경로)면 tearingDown 이 막아 두 번 지우지 않는다.
 */
async function done(pass, detail) {
  let extra = '';
  if (!pass && createdSessionId && !tearingDown) {
    try {
      const purge = await teardown();
      extra = purge.leftover.length ? ` · 🚨잔존 ${purge.leftover.join(',')}` : ' · 잔존 0';
    } catch (err) {
      extra = ` · teardown 실패:${redact(err?.message || err)}`;
    }
  }
  console.log(`PRECLASS_FLOW=architecture RESULT=${pass ? 'PASS' : 'FAIL'} detail=${redact(detail)}${extra}`);
  process.exit(pass ? 0 : 1);
}

/**
 * psql 1줄 조회.
 *
 * 🚨 접속문자열을 **argv 에 싣지 않는다.** psql 은 실패하면 에러 메시지에 자기 argv 를 통째로
 *    되뱉는데, 그 출력은 그대로 밤샘 리포트에 실린다 — 2026-08-11 첫 실행에서 실제로 DB
 *    비밀번호가 리포트 본문에 찍혔다. argv 에 없으면 `ps` 로도 안 보인다(같은 구멍의 다른 문).
 *    그래서 DATABASE_URL 을 PG* 환경변수로 풀어 넘긴다.
 * 🔑 그래도 «혹시» 를 대비해 출력에서 비밀번호를 한 번 더 지운다 — 방어는 겹쳐야 한다.
 */
const PG_ENV = (() => {
  // 🚨 DB 가 비면 `new URL('')` 이 **import 시점에** 터진다 — 그러면 아래 S0 재료 검사가
  //    말할 기회조차 없이 스택트레이스만 남는다(「무엇이 없어서 못 했다」가 사라진다).
  //    빈 껍데기를 돌려주고, 판정은 S0 이 하게 둔다.
  if (!DB) return { PGPASSWORD: '' };
  const u = new URL(DB);
  return {
    PGHOST: u.hostname,
    PGPORT: u.port || '5432',
    PGUSER: decodeURIComponent(u.username),
    PGPASSWORD: decodeURIComponent(u.password),
    PGDATABASE: u.pathname.replace(/^\//u, '') || 'postgres',
  };
})();

/** 어떤 문자열에서든 비밀번호를 지운다(에러 메시지·detail 공통). */
function redact(text) {
  const pw = PG_ENV.PGPASSWORD;
  let out = String(text ?? '');
  if (pw) out = out.split(pw).join('<redacted>');
  return out.replace(/postgres(?:ql)?:\/\/[^\s]*/giu, '<redacted-dsn>');
}

async function q(sql) {
  try {
    const { stdout } = await pexec('psql', ['-tAc', sql], {
      timeout: 30000,
      env: { ...process.env, ...PG_ENV, PGCONNECT_TIMEOUT: '15' },
    });
    return stdout.trim();
  } catch (err) {
    throw new Error(redact(err?.stderr || err?.message || err));
  }
}

async function api(path, { method = 'GET', body, bearer, cookie } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { _raw: text.slice(0, 160) }; }
  // 🔑 join 이 arch_pt 참여자 쿠키를 Set-Cookie 로 준다 — AI 모드가 학생 신원으로 치려면 필요하다.
  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  return { status: res.status, body: parsed, setCookies };
}

// 🚨 유료 경로(폐쇄 목록 — shared/qa/class-check/manifests/ai-routes.architecture.json 과 1:1).
//    기본 모드는 **한 번도** 이 목록을 치지 않는다(S5). AI 모드는 각 정확히 1회 친다.
//    새 AI 라우트가 생기면 여기 추가할 것 — 목록에 없으면 «안 쳤다» 를 주장할 근거도 없다.
//    🔑 2026-08-18 체험 재구조화: /api/chat 철거 → 목록에서 제거. 실습실 5종(voice 포함) 추가.
//    🔑 2026-08-18 「내 차례」 철거: /api/vibe/my-turn 도 라우트째 사라져 목록에서 제거(6→5).
//       🚨 지워도 S5 는 약해지지 않는다 — 없는 라우트를 «안 쳤다» 고 말해 봐야 세는 것이 없다.
const AI_ROUTES = [
  '/api/lab/review',
  '/api/lab/verify',
  '/api/lab/ask',
  '/api/lab/submit',
  '/api/lab/voice',
];

async function teardown() {
  tearingDown = true;
  if (!createdSessionId) return { removed: [], leftover: [] };
  // S2 — PK **그리고** 마커가 동시에 맞을 때만. 마커 없는 행은 우리 것이 아니다.
  const mine = await q(
    `select count(*) from architecture_sessions where id = '${createdSessionId}' and name like '%${RUN_ID}%'`,
  );
  if (mine !== '1') {
    return { removed: [], leftover: [createdSessionId], reason: `마커 불일치(count=${mine}) — 넓게 지우지 않는다` };
  }
  await api(`/api/sessions/${createdSessionId}`, { method: 'DELETE', bearer: token });
  const left = await q(
    `select count(*) from architecture_sessions where id = '${createdSessionId}'`,
  );
  const parts = await q(
    `select count(*) from architecture_participants where session_id = '${createdSessionId}'`,
  );
  // 🔑 AI 모드의 lab-submit 이 만든 제출·계보 행도 participant cascade 로 함께 사라져야 한다.
  //    participants 가 이미 지워졌으므로 스모크가 잡아 둔 참여자 UUID 로 직접 센다.
  let labRows = '0';
  if (participantId) {
    labRows = await q(
      `select (select count(*) from architecture_lab_submissions where participant_id = '${participantId}') + ` +
        `(select count(*) from architecture_lab_artifacts where participant_id = '${participantId}')`,
    );
  }
  return {
    removed: [
      `architecture_sessions:${left === '0' ? 1 : 0}`,
      `architecture_participants:${parts === '0' ? 'cascade' : parts}`,
      `lab_rows:${labRows === '0' ? 'cascade' : labRows}`,
    ],
    leftover: left === '0' && parts === '0' && labRows === '0' ? [] : [createdSessionId],
  };
}

let token = '';
let participantId = '';

/**
 * 💸 축2-b — 매니페스트 폐쇄 목록(ai-routes.architecture.json)과 1:1 인 6라우트를 각 1회 친다.
 *
 * 🚨 학생 신원(arch_pt 쿠키)으로 친다 — ip: 신원으로 치면 lab-submit 의 제출·계보 행이
 *    참여자 cascade 밖(owner_token)에 남아 S4 잔존이 된다.
 * 🚨 반환 문자열에서 `aiusage=` 가 `ai=` **앞** 이어야 한다 — 공용 파서의 `fail:(.*)$` 가
 *    줄 끝까지 삼키기 때문(axis2b.mjs parseAiField).
 * 🔑 이 앱은 토큰 사용량을 **어디에도 적재하지 않는다**(2026-08-18 실측: lib/lab-ai.ts ·
 *    lib/lab-ai.ts 에 supabase/usage 적재 코드 0건). 그래서 tokRows/tokIn/tokOut 은
 *    «0 이 측정됐다» 가 아니라 «셀 원장이 없다» 는 뜻으로 0 을 적는다(brand 선례).
 *    출력 상계는 매니페스트의 max_tokens 상수로 러너가 잡는다.
 */
async function runAiRoutes(ptCookie) {
  const ok = [];
  const fail = [];
  const routeCalls = new Map();
  const mark = (id, passed, why) => (passed ? ok.push(id) : fail.push(`${id}:${why}`));
  const hit = (id) => routeCalls.set(id, (routeCalls.get(id) || 0) + 1);
  const startedAt = Date.now();
  // 실행마다 문장을 가른다 — 캐시 히트로 «키가 죽어도 200» 이 나는 것을 막는다(aab 실측 선례).
  const salt = RUN_ID.slice(0, 6);
  const draft = `대상: 우리 반 안내문 (${salt}). 규칙: 존댓말을 쓴다. 날짜를 맨 위에 적는다. 준비물을 목록으로 적는다. 예외: 우천 시 별도 공지. 안 하는 것: 개인 연락처를 싣지 않는다.`;

  const call = async (id, path, body) => {
    hit(id);
    try {
      const r = await api(path, { method: 'POST', body, cookie: ptCookie });
      return r;
    } catch (err) {
      mark(id, false, redact(err?.message || err).slice(0, 70));
      return null;
    }
  };

  let r = await call('lab-review', '/api/lab/review', { draft });
  if (r) mark('lab-review', r.status === 200 && !!r.body?.review, r.status !== 200 ? `HTTP ${r.status}` : '응답에 review 없음');

  r = await call('lab-verify', '/api/lab/verify', { rules: draft });
  if (r) mark('lab-verify', r.status === 200 && Array.isArray(r.body?.outputs), r.status !== 200 ? `HTTP ${r.status}` : '응답에 outputs 없음');

  r = await call('lab-ask', '/api/lab/ask', { question: `파서가 뭐예요 (${salt})` });
  if (r) mark('lab-ask', r.status === 200 && typeof r.body?.answer === 'string', r.status !== 200 ? `HTTP ${r.status}` : '응답에 answer 없음');

  // 🚨 submit 은 서버가 검증(모델 2회)을 재호출한다 — 폐쇄 목록에서 빠뜨리기 쉬운 자리(매니페스트 why 참조).
  r = await call('lab-submit', '/api/lab/submit', { qaId: 'ch18_q04', rules: draft });
  if (r) mark('lab-submit', r.status === 200 && Number.isInteger(r.body?.revision), r.status !== 200 ? `HTTP ${r.status}` : '응답에 revision 없음');

  r = await call('lab-voice', '/api/lab/voice', {
    text: `이제 뭘 하면 돼? (${salt})`,
    missionGoal: 'ls 로 어떤 파일이 있는지 확인해 보세요.',
    nextCommand: 'ls',
  });
  if (r) mark('lab-voice', r.status === 200 && Array.isArray(r.body?.reply) && r.body.reply.length > 0, r.status !== 200 ? `HTTP ${r.status}` : '응답에 reply 없음');

  const spanSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`[ai] 폐쇄 목록 ${ok.length}/${ok.length + fail.length} 성공${fail.length ? ` — 실패: ${fail.join(' | ')}` : ''}`);

  const parts = [
    `calls:${[...routeCalls.values()].reduce((a, b) => a + b, 0)}`,
    `routes:${[...routeCalls.entries()].map(([id, n]) => `${id}=${n}`).join(',')}`,
    `spanSec:${spanSec}`,
    'maxInflight:1', // 순차 호출 — 실측 동시 in-flight 는 항상 1이다.
    'tokRows:0;tokIn:0;tokOut:0', // 🚨 «측정된 0» 이 아니라 «셀 원장이 없다» — 위 doc 주석 참조.
    'tokByModel:없음',
    'tokModels:없음',
  ];
  // 🚨 출력 상한이 env 라 **런타임 실효값**을 중계한다(§1-C, aab 선례) — 레포 기본값만 믿으면
  //    수업 당일 무배포 상향을 놓친다. 못 얻으면 적지 않는다(빈 값은 «모름»과 «없음»을 섞는다).
  try {
    const health = await api('/api/health');
    const caps = health.body?.classCheck?.tokenCaps;
    if (caps && typeof caps === 'object') {
      const field = Object.entries(caps)
        .filter(([, v]) => Number.isFinite(v) && v > 0)
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
      if (field) parts.push(`caps:${field}`);
    }
  } catch { /* 상한 중계 실패는 판정을 바꾸지 않는다 — 러너가 «원장 미적재» 로 정직하게 말한다 */ }
  return ` aiusage=${parts.join(';')} ai=ok:${ok.join(',') || '없음'}|fail:${fail.join(';') || '없음'}`;
}

async function main() {
  // ── S0 재료 ───────────────────────────────────────────────────────────────
  for (const [k, v] of Object.entries({ QA_AUTH_SECRET: SECRET, QA_ACCOUNT_TEACHER_ID: EXPECT_TEACHER, DATABASE_URL: DB })) {
    if (!v) await done(false, `S0-재료누락:${k} (architecture-real-flow-qa.env source 확인 — 대체 계정으로 떨어지지 않는다)`);
  }

  // ── S0 교사 토큰 ──────────────────────────────────────────────────────────
  const mint = await fetch(`${BASE}/api/qa/auth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-QA-Secret': SECRET },
    body: JSON.stringify({ role: 'teacher', run_id: `preclass-${RUN_ID}` }),
  });
  const grant = await mint.json().catch(() => ({}));
  if (!grant.access_token) await done(false, `S0-토큰실패:${mint.status} ${JSON.stringify(grant).slice(0, 120)}`);
  if (grant.account_id !== EXPECT_TEACHER) {
    await done(false, `S0-계정불일치: 발급 ${String(grant.account_id).slice(0, 8)} ≠ 기대 ${EXPECT_TEACHER.slice(0, 8)} (jery 계정으로 대체하지 않는다)`);
  }
  token = grant.access_token;
  log('S0-teacher-token', `role=${grant.role} uid ${String(grant.account_id).slice(0, 8)}`);

  // ── 가드 — 무토큰 세션 생성은 거부되어야 한다 ────────────────────────────
  const noAuth = await api('/api/sessions', { method: 'POST', body: { name: 'guard', chapter_ids: [1] } });
  if (noAuth.status !== 401) await done(false, `guard-401 실패: 무토큰인데 ${noAuth.status} (교사 게이트가 열려 있다)`);
  log('guard-401', '무토큰 세션 생성 거부');

  // ── S1 세션 생성 + 마커 되읽기 ────────────────────────────────────────────
  const created = await api('/api/sessions', {
    method: 'POST',
    bearer: token,
    body: { name: `${MARKER} preclass`, mode: 'learn', chapter_ids: [1], max_participants: 50 },
  });
  if (created.status !== 200 && created.status !== 201) {
    await done(false, `session-create 실패:${created.status} ${JSON.stringify(created.body).slice(0, 140)}`);
  }
  const session = created.body?.session ?? created.body;
  createdSessionId = session?.id || '';
  const code = session?.code || '';
  if (!createdSessionId || !code) await done(false, `session-create 응답에 id/code 없음: ${JSON.stringify(created.body).slice(0, 140)}`);
  log('session-create', `code ${code}`);

  const storedName = await q(`select name from architecture_sessions where id = '${createdSessionId}'`);
  if (!storedName.includes(RUN_ID)) {
    await done(false, `S1-마커유실: 저장된 name="${storedName}" 에 ${RUN_ID} 없음 (teardown 조건이 영원히 안 맞는다)`);
  }
  log('S1-marker', `name 에 ${MARKER} 온전 저장`);

  // ── S3a 소유자 격리 ───────────────────────────────────────────────────────
  const owner = await q(`select teacher_id from architecture_sessions where id = '${createdSessionId}'`);
  if (owner !== EXPECT_TEACHER) {
    await done(false, `S3a-소유자오염: ${owner} ≠ QA 교사 (jery 대시보드에 유령 세션이 뜬다)`);
  }
  log('S3a-owner-isolated', '세션 소유자 = 전용 QA 교사');

  // ── 학생 join ─────────────────────────────────────────────────────────────
  const joined = await api('/api/join', { method: 'POST', body: { code, nickname: NICK } });
  if (joined.status !== 200 && joined.status !== 201) {
    await done(false, `join 실패:${joined.status} ${JSON.stringify(joined.body).slice(0, 140)}`);
  }
  // AI 모드가 «학생 한 명» 신원(pt:)으로 치기 위한 참여자 쿠키. 기본 모드에서는 안 쓴다.
  const ptCookie = (joined.setCookies || [])
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('arch_pt='));
  log('join', `학생 ${NICK} 입장`);

  // ── 교사 모니터링 — 참여자가 실제로 보이는가 ─────────────────────────────
  const parts = await api(`/api/sessions/${createdSessionId}/participants`, { bearer: token });
  if (parts.status !== 200) await done(false, `participants 조회 실패:${parts.status}`);
  const list = Array.isArray(parts.body) ? parts.body : (parts.body?.participants ?? []);
  if (!list.some((p) => p?.nickname === NICK)) {
    await done(false, `참여자 미노출: join 은 201 인데 교사 화면에 ${NICK} 이 없다 (200 뒤에서 끊긴 구간)`);
  }
  participantId = list.find((p) => p?.nickname === NICK)?.id || '';
  log('teacher-participants', `${list.length}명 · 방금 들어온 학생 노출 확인`);

  // ── 💸 축2-b — 폐쇄 목록 각 1회 실호출 (PRECLASS_AI_ROUTES=1 에서만) ─────────
  let aiField = '';
  if (AI_MODE) aiField = await runAiRoutes(ptCookie);

  // ── S3b 교사 목록에 내 세션이 보이는가 ───────────────────────────────────
  const mine = await api('/api/sessions', { bearer: token });
  if (mine.status !== 200) await done(false, `세션 목록 실패:${mine.status}`);
  const rows = Array.isArray(mine.body) ? mine.body : (mine.body?.sessions ?? []);
  if (!rows.some((s) => s?.id === createdSessionId)) {
    await done(false, 'S3b-목록누락: 방금 만든 세션이 교사 목록에 없다');
  }
  log('S3b-teacher-list', `내 세션 ${rows.length}건 중 노출 확인`);

  // ── 세션 종료 ─────────────────────────────────────────────────────────────
  const ended = await api(`/api/sessions/${createdSessionId}/end`, { method: 'POST', bearer: token });
  if (ended.status !== 200 && ended.status !== 204) await done(false, `session-end 실패:${ended.status}`);
  const status = await q(`select status from architecture_sessions where id = '${createdSessionId}'`);
  if (status === 'active') await done(false, `session-end 이 200 인데 status 가 여전히 active (조용히 안 끝났다)`);
  log('session-end', `status=${status}`);

  // ── S5 AI 소비 0 — 선언이 아니라 되읽기 ──────────────────────────────────
  // 🔑 architecture_chats 에는 session_id 가 **없다**(2026-08-11 실측 컬럼: participant_id·qa_id·
  //    qa_run_id …). 참여자를 거쳐 물어야 한다 — 컬럼을 짐작해 쓴 첫 판은 여기서 터졌다.
  const chats = await q(
    `select count(*) from architecture_chats c ` +
      `join architecture_participants p on p.id = c.participant_id ` +
      `where p.session_id = '${createdSessionId}'`,
  );
  if (!AI_MODE && chats !== '0') {
    await done(false, `S5-AI누수: 유료 경로를 한 번도 안 쳤는데 chat 행이 ${chats}건 (흐름이 몰래 부른다)`);
  }
  if (AI_MODE) {
    // 🔑 AI 모드의 S5 는 «0 소비» 가 아니라 «폐쇄 목록 각 1회» 다 — 결과는 ai= 필드가 보고한다.
    //    chats 되읽기는 유지한다: 재구조화 후 어떤 경로도 chats 를 쓰지 않으므로 여기서도 0 이어야
    //    한다(0 이 아니면 몰래 쓰는 경로가 생긴 것).
    if (chats !== '0') await done(false, `S5-chats유령: AI 모드에서도 chats 는 0 이어야 하는데 ${chats}건`);
    log('S5-ai-mode', `폐쇄 목록 ${AI_ROUTES.length}종 각 1회 실호출 — 결과는 ai= 필드`);
  } else {
    log('S5-ai-zero', `유료 경로 ${AI_ROUTES.length}종 미호출 · chat 행 0건 되읽기 확인`);
  }

  // ── teardown ──────────────────────────────────────────────────────────────
  const purge = await teardown();
  if (purge.leftover.length) {
    await done(false, `S4-잔존: ${purge.leftover.join(',')} ${purge.reason ?? ''} (넓게 지우지 않고 멈춘다)`);
  }
  log('teardown', `잔존 0 (${JSON.stringify(purge.removed)})`);

  await done(true, `steps=${steps.length} runId=${RUN_ID}${aiField}`);
}

const guard = setTimeout(async () => {
  const purge = await teardown().catch(() => ({ leftover: [createdSessionId] }));
  await done(false, `하드타임아웃(${TIMEOUT_MS}ms) — 잔존 ${purge.leftover?.length ? purge.leftover.join(',') : 0}`);
}, TIMEOUT_MS);
guard.unref?.();

main().catch(async (err) => {
  const purge = await teardown().catch(() => ({ leftover: [createdSessionId] }));
  await done(false, `예외:${err?.message || err} · 잔존 ${purge.leftover?.length ? purge.leftover.join(',') : 0}`);
});
