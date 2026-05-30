#!/usr/bin/env node
// real-flow-qa Layer B — teacher QA 계정 is_qa 마커 셋업 (architecture 는 teacher 만 — 학생 anon).
//
// GoTrue Admin REST API 직접 호출(추가 의존성 없음).
// 키 없으면 대체: psql "$DATABASE_URL" -c "update auth.users set raw_app_meta_data =
//   coalesce(raw_app_meta_data,'{}')||'{\"is_qa\":true}' where id='<teacher uuid>'" (멱등, 검증됨)
//
// 실행 (master/jery):
//   SUPABASE_URL=<...> SUPABASE_SERVICE_ROLE_KEY=<...> QA_ACCOUNT_TEACHER_EMAIL=<...> \
//     node qa/scripts/seed-qa-accounts.mjs
//
// 멱등: 기존 teacher 계정의 app_metadata.is_qa 만 true 로 보강(없으면 안내 후 종료).
// 참조: server/src/routes/qa-auth.ts (teacher = QA_ACCOUNT_TEACHER_ID 매칭 + is_qa 재확인).

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_EMAIL = process.env.QA_ACCOUNT_TEACHER_EMAIL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[seed-qa] SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 필수 (키 없으면 psql UPDATE 대체 — 헤더 주석 참조)');
  process.exit(1);
}
if (!TEACHER_EMAIL) {
  console.error('[seed-qa] QA_ACCOUNT_TEACHER_EMAIL 필수 (teacher QA 계정 이메일)');
  process.exit(1);
}

const BASE = SUPABASE_URL.replace(/\/$/, '');
const adminHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

// 1) 이메일로 기존 유저 조회 (GoTrue admin list 후 매칭 — ?filter 미지원 버전 호환)
async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${BASE}/auth/v1/admin/users?page=${page}&per_page=200`, { headers: adminHeaders });
    if (!res.ok) throw new Error(`admin list users ${res.status}: ${await res.text().catch(() => '')}`);
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
    if (users.length === 0) break;
    const match = users.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

const teacher = await findUserByEmail(TEACHER_EMAIL);
if (!teacher) {
  console.error(`[seed-qa] teacher 계정(${TEACHER_EMAIL}) 미발견. 먼저 카카오/이메일로 1회 로그인해 계정을 생성하세요.`);
  process.exit(2);
}

// 2) app_metadata.is_qa = true 보강 (멱등)
const res = await fetch(`${BASE}/auth/v1/admin/users/${teacher.id}`, {
  method: 'PUT',
  headers: adminHeaders,
  body: JSON.stringify({ app_metadata: { ...(teacher.app_metadata ?? {}), is_qa: true } }),
});
if (!res.ok) {
  console.error(`[seed-qa] is_qa 마커 set 실패 ${res.status}: ${await res.text().catch(() => '')}`);
  process.exit(2);
}

console.log('=== seed-qa-accounts 완료 ===');
console.log(`  teacher: ${TEACHER_EMAIL} (id=${teacher.id})`);
console.log(`  app_metadata.is_qa = true ✅`);
console.log('');
console.log('다음 단계:');
console.log('  1. Render env: QA_ACCOUNT_TEACHER_ID=' + teacher.id + ' (qa-auth.ts teacher 매칭)');
console.log('  2. QA_ACCOUNT_TEACHER_PW 설정 (qa-auth signInWithPassword) + SUPABASE_ANON_KEY');
console.log('  3. QA_BASELINE_MODE=true npx playwright test -c qa/playwright-slice2.config.ts (Round 0)');
