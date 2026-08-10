// 17장 A형 재생 데모 재료 생성기 — 실제로 실행해 저장한다(수업 중 호출 0회).
// q05 «출구 검사»용 3종: 정상 답 / 한도에 걸려 끊긴 답 / 없는 것을 지어낸 답.
// 🔑 세 답은 전부 같은 모양의 부탁에서 실제로 나온 것이다. 검사 없는 앱에서는 셋 다 «정상»으로 나간다.
// 사용: node scripts/pregen-vibe-ch17.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

import fs from 'node:fs';

const key = fs
  .readFileSync('/home/claude/architecture/.env', 'utf8')
  .match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\s]+)/)[1];

const MODEL = 'claude-haiku-4-5';

async function call(prompt, maxTokens) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature: 1, messages: [{ role: 'user', content: prompt }] }),
  });
  const j = await r.json();
  if (!j.content) {
    console.error('FAIL', JSON.stringify(j).slice(0, 300));
    process.exit(1);
  }
  return { text: j.content.map((c) => c.text || '').join(''), usage: j.usage, stop: j.stop_reason };
}

const out = {};
const run = async (name, prompt, maxTokens) => {
  const res = await call(prompt, maxTokens);
  out[name] = { model: MODEL, generatedAt: new Date().toISOString(), prompt, text: res.text };
  console.error(`${name} ok, ${res.usage.output_tokens}out, stop=${res.stop}`);
};

const HELPER = '너는 학급문고 대출 앱의 학생 도우미다. 학생 질문에 2~3문장으로 짧게 답하라.\n질문: ';

// ① 정상 — 검사를 통과해야 하는 답
await run('ch17_q05_ok', HELPER + '책을 빌리면 며칠 뒤에 반납해야 하나요? (이 앱의 규칙: 2주)', 400);
// ② 잘림 — 글자 수 한도에 걸려 문장 중간에서 끊긴 답
await run('ch17_q05_truncated', HELPER + '이 앱으로 책을 빌리는 방법을 처음부터 끝까지 자세히 알려 주세요.', 90);
// ③ 지어냄 — 앱에 없는 사실을 물었을 때
await run('ch17_q05_invented', HELPER + '우리 학교 도서관에서 제일 인기 있는 책 3권과 각각 몇 명이 빌렸는지 알려 주세요.', 400);

fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
