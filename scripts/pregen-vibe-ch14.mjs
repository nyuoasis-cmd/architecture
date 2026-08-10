// 14장 A형 재생 데모 재료 생성기 — «통짜로 시키기»와 «계획부터 시키기»를 짝으로 실행해 저장한다.
// 수업 중에는 호출하지 않는다(저장본 재생 전용).
// 짝(pair)이 교보재다 — 같은 AI·같은 앱인데, 부탁문에 «아직 만들지 마» 한 줄이 붙으면
// 돌아오는 물건의 «종류»가 바뀐다(완성품 → 읽고 고칠 수 있는 계획).
// 사용: node scripts/pregen-vibe-ch14.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

import fs from 'node:fs';

const key = fs
  .readFileSync('/home/claude/architecture/.env', 'utf8')
  .match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\s]+)/)[1];

const HEAD = '초등·중등 학생이 보는 교육 자료용이다. 다음 부탁문에 응답하라.\n부탁문: ';
const SHARED =
  '"학급문고 대출 앱 만들어줘.\n문제: 학급문고 책이 누구한테 갔는지 몰라서 자꾸 사라진다.\n주 사용자: 초등 5학년 학생."';

const JOBS = [
  {
    key: 'ch14_q01_bulk',
    prompt:
      HEAD +
      SHARED +
      '\n형식: 만든 결과를 요약해 보고하라. ## 앱 이름 / ## 화면(3~5개 불릿) / ## 들어간 기능(5~7개 불릿). 250자 이내.',
  },
  {
    key: 'ch14_q01_staged',
    prompt:
      HEAD +
      SHARED +
      '\n아직 만들지 말고, 어떻게 만들지 계획을 먼저 보여줘.' +
      '\n형식: ## 화면 목록(3~5개 불릿) / ## 저장할 데이터 표(열 이름만) / ## 작업 순서(번호 목록 5~7개). 250자 이내.',
  },
];

const out = {};
for (const job of JOBS) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 900,
      temperature: 1,
      messages: [{ role: 'user', content: job.prompt }],
    }),
  });
  const j = await r.json();
  if (!j.content) {
    console.error('FAIL', job.key, JSON.stringify(j).slice(0, 300));
    process.exit(1);
  }
  out[job.key] = {
    model: 'claude-haiku-4-5',
    generatedAt: new Date().toISOString(),
    prompt: job.prompt,
    text: j.content.map((c) => c.text || '').join(''),
  };
  console.error(`${job.key} ok, ${j.usage.input_tokens}in/${j.usage.output_tokens}out`);
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
