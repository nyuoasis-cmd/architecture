// 12장 A형 재생 데모 재료 생성기 — «정보를 담기 전/후»를 짝으로 실행해 저장한다.
// 수업 중에는 호출하지 않는다(저장본 재생 전용).
// 짝(pair)이 핵심 교보재다 — 같은 AI인데 부탁문에 담긴 정보만으로 결과가 갈리는 것을 보여 준다.
// 사용: node scripts/pregen-vibe-ch12.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

import fs from 'node:fs';

const key = fs
  .readFileSync('/home/claude/architecture/.env', 'utf8')
  .match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\s]+)/)[1];

const HEAD =
  '초등·중등 학생이 보는 교육 자료용이다. 다음 부탁문으로 만들 앱의 화면을 아주 짧게 요약하라.\n부탁문: ';
const FORM_BARE =
  '\n형식: ## 앱 이름 / ## 화면 요소(3~5개 불릿) / ## 규칙(3~5개 불릿, 각 줄 끝에 [내가 정함] 표시). 200자 이내로 간결하게.';
const FORM_USER =
  '\n형식: ## 앱 이름 / ## 화면 요소(3~5개 불릿, 각 줄에 글자 크기·버튼 수 같은 화면 성격을 한 마디로) / ## 규칙(3개 불릿). 200자 이내로 간결하게.';

const JOBS = [
  {
    key: 'ch12_q01_bare',
    prompt: HEAD + '"앱 만들어줘."' + FORM_BARE,
  },
  {
    key: 'ch12_q02_without',
    prompt: HEAD + '"학급문고 대출 앱 만들어줘."' + FORM_BARE,
  },
  {
    key: 'ch12_q02_with',
    prompt:
      HEAD +
      '"학급문고 대출 앱 만들어줘.\n문제: 학급문고 책이 누구한테 갔는지 몰라서 자꾸 사라진다."' +
      FORM_BARE,
  },
  {
    key: 'ch12_q03_unspecified',
    prompt: HEAD + '"학급문고 대출 앱 만들어줘."' + FORM_USER,
  },
  {
    key: 'ch12_q03_grade1',
    prompt:
      HEAD +
      '"학급문고 대출 앱 만들어줘.\n주 사용자: 초등학교 1학년 학생이 혼자 쓴다."' +
      FORM_USER,
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
