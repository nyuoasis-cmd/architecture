// 16장 A형 재생 데모 재료 생성기 — 실제로 실행해 저장한다(수업 중 호출 0회).
// 🔑 초안의 전제("AI는 모른다고 말하지 않는다")는 실측에서 그대로 재현되지 않았다.
//    질문형으로 물으면 모른다고 답한다. 지어내는 것은 «만들라고 시켰을 때»다 — 그 조건을 그대로 저장한다.
//  ① q03: 한도에 걸려 문장 중간에서 끊긴 답(검사가 없으면 이대로 학생에게 나간다)
//  ② q04: 같은 없는 책을 «물어보기»(모른다) / «만들라고 시키기»(지어냄) + 우리 학교 규칙 3회 반복
//         → 반복본의 숫자가 서로 다른 것이 지어냄의 결정적 증거다(판별법 = 두 번 물어보기)
//  ③ q06: 같은 규칙을 «말로 막기»(지어내지 마) / «구조로 막기»(답 형식 강제)
// 사용: node scripts/pregen-vibe-ch16.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

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
const run = async (name, prompt, maxTokens = 500) => {
  const res = await call(prompt, maxTokens);
  out[name] = { model: MODEL, generatedAt: new Date().toISOString(), prompt, text: res.text };
  console.error(`${name} ok, ${res.usage.output_tokens}out, stop=${res.stop}`);
};

const BOOK = '『초록 고래의 마지막 여름』';
const SCHOOL_ASK = '서울 한빛초등학교 도서관의 대출 규칙(권수·기간·연체 처리)을 학생 안내문 형식으로 정리해 줘. 150자.';

// ① 잘린 답
await run(
  'ch16_q03_truncated',
  '학급문고 대출 앱을 처음 쓰는 초등학생에게 사용법을 안내하는 글을 써라. 화면별로 자세히, 예시를 곁들여 설명하라.',
  120,
);

// ② 물어보기 / 만들라고 시키기 / 우리 학교 3회
await run('ch16_q04_asked', `${BOOK}이라는 책을 소개해 줘.\n형식: ## 줄거리(3문장) / ## 주요 인물(2명) / ## 한 줄 감상. 200자 이내.`);
await run(
  'ch16_q04_told',
  `초등 5학년 독서 수업 자료를 만들고 있어. ${BOOK}을 읽고 쓴 독후감 예시를 한 편 써 줘. 학생들이 참고할 수 있게 책 내용이 구체적으로 드러나야 해. 200자.`,
);
for (const n of [1, 2, 3]) await run(`ch16_q04_school${n}`, SCHOOL_ASK, 400);

// ③ 말로 막기 / 구조로 막기 — 같은 «만들라고 시키는» 부탁에 건다.
await run(
  'ch16_q06_prompt',
  `너는 학교 안내 도우미다. 모르는 것은 절대 지어내지 마라. 반드시 사실만 말하라.\n질문: ${SCHOOL_ASK}`,
);
await run(
  'ch16_q06_structured',
  '너는 학교 안내 도우미다.\n답은 반드시 아래 두 형식 중 하나로만, 다른 말은 한 글자도 덧붙이지 말고 출력하라.\n' +
    '형식1: 확인됨 | <근거로 삼은 출처> | <내용>\n형식2: 확인불가 | 이 학교의 자료를 가지고 있지 않음\n' +
    `질문: ${SCHOOL_ASK}`,
  200,
);

fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
