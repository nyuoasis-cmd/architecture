// 11장 A형 재생 데모 재료 생성기 — 같은 부탁문을 3회 실행해 저장한다.
// 수업 중에는 호출하지 않는다(저장본 재생 전용). 재생성하면 결과가 달라지는 것이 정상이며,
// 그 «달라짐» 자체가 3문의 교보재다.
// 사용: node scripts/pregen-vibe-ch11.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

import fs from 'node:fs';
const key = fs.readFileSync('/home/claude/architecture/.env','utf8').match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\s]+)/)[1];
const PROMPT = '초등·중등 학생이 보는 교육 자료용이다. 다음 부탁문으로 만들 앱의 화면을 아주 짧게 요약하라.\n부탁문: "우리 반 급식 메뉴 투표 앱 만들어줘."\n형식: ## 앱 이름 / ## 화면 요소(3~5개 불릿) / ## 투표 규칙(3~5개 불릿, 각 줄 끝에 [내가 정함] 표시). 200자 이내로 간결하게.';
const out = {};
for (let i = 1; i <= 3; i++) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 900, temperature: 1, messages: [{ role: 'user', content: PROMPT }] }),
  });
  const j = await r.json();
  if (!j.content) { console.error('FAIL', JSON.stringify(j).slice(0,300)); process.exit(1); }
  out[`ch11_q03_run${i}`] = {
    model: 'claude-haiku-4-5',
    generatedAt: new Date().toISOString(),
    prompt: PROMPT,
    text: j.content.map(c => c.text || '').join(''),
  };
  console.error(`run${i} ok, ${j.usage.input_tokens}in/${j.usage.output_tokens}out`);
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
