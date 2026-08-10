// 15장 A형 재생 데모 재료 생성기 — 두 짝을 실제로 실행해 저장한다.
// 수업 중에는 호출하지 않는다(저장본 재생 전용).
//  ① q02: 같은 기능을 «완성 판정 문장 없이» / «있게» 시켰을 때 돌아오는 물건의 차이
//  ② q05: 한 AI가 만든 결과를 «다른 대화»가 기준 문서만 들고 검사한 기록 (2단 연결 — 검사 쪽은 만든 과정을 모른다)
// 사용: node scripts/pregen-vibe-ch15.mjs <출력.json>  (키는 architecture/.env 의 ANTHROPIC_API_KEY)

import fs from 'node:fs';

const key = fs
  .readFileSync('/home/claude/architecture/.env', 'utf8')
  .match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\s]+)/)[1];

const MODEL = 'claude-haiku-4-5';
const HEAD = '초등·중등 학생이 보는 교육 자료용이다. 다음 부탁문에 응답하라.\n부탁문: ';

// 한 장 문서 — q05 에서 «검사하는 쪽»에게 기준으로 넘기는 것과 같은 내용.
const ONE_PAGER =
  '앱 이름: 우리책방 (학급문고 대출 앱)\n' +
  '주 사용자: 초등 5학년 학생\n' +
  '기능: ① 책 목록 보기 ② 책 빌리기 ③ 반납하기 ④ 내가 빌린 책 보기\n' +
  '정책: 한 사람이 동시에 가질 수 있는 책은 1권까지. 빌린 사람 이름이 남는다.\n' +
  '예외: 이미 빌려간 책은 빌릴 수 없고, 그 사실을 화면에 알려 준다.\n' +
  '안 만드는 것: 로그인, 연체료, 예약';

async function call(prompt, maxTokens = 900) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 1,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const j = await r.json();
  if (!j.content) {
    console.error('FAIL', JSON.stringify(j).slice(0, 300));
    process.exit(1);
  }
  return { text: j.content.map((c) => c.text || '').join(''), usage: j.usage };
}

const out = {};
const stamp = (key, prompt, res) => {
  out[key] = { model: MODEL, generatedAt: new Date().toISOString(), prompt, text: res.text };
  console.error(`${key} ok, ${res.usage.input_tokens}in/${res.usage.output_tokens}out`);
};

// ─── ① q02: 완성 판정 문장의 유/무 ───
const Q02_ASK = '"학급문고 대출 앱에 «책 빌리기» 버튼을 만들어 줘."';
const Q02_FORM =
  '\n형식: ## 만든 것(3~5개 불릿) / ## 이렇게 확인하세요(불릿). 250자 이내. 코드는 쓰지 말고 말로만 보고하라.';

const q02a = await call(HEAD + Q02_ASK + Q02_FORM);
stamp('ch15_q02_nocriteria', HEAD + Q02_ASK + Q02_FORM, q02a);

const Q02_WITH =
  HEAD +
  Q02_ASK.slice(0, -1) +
  '\n완성 판정: (1) 빌리면 내 현황에 그 책이 나타난다 (2) 이미 내가 1권을 빌린 상태에서 두 권째를 누르면 거절되고 이유가 화면에 뜬다 (3) 남이 빌려간 책은 빌리기 버튼이 눌리지 않는다."' +
  Q02_FORM;
const q02b = await call(Q02_WITH);
stamp('ch15_q02_withcriteria', Q02_WITH, q02b);

// ─── ② q05: 만든 쪽 → 검사하는 쪽 (2단 연결) ───
const Q05_BUILD =
  HEAD +
  '"위 한 장 문서를 보고 학급문고 대출 앱을 만들어 줘."\n한 장 문서:\n' +
  ONE_PAGER +
  '\n형식: ## 만든 화면(불릿) / ## 넣은 규칙(불릿) / ## 한마디. 300자 이내. 코드는 쓰지 말고 말로만 보고하라.';
const q05build = await call(Q05_BUILD);
stamp('ch15_q05_build', Q05_BUILD, q05build);

// 🔑 검사하는 쪽에는 «만드는 대화»의 맥락을 넘기지 않는다 — 기준 문서와 결과 보고만 준다.
const Q05_REVIEW =
  '초등·중등 학생이 보는 교육 자료용이다. 너는 이 앱을 만들지 않았다. 아래 기준 문서와 다른 사람의 완성 보고만 보고 검사하라.\n' +
  '기준 문서:\n' +
  ONE_PAGER +
  '\n\n완성 보고:\n' +
  q05build.text +
  '\n\n형식: ## 기준과 어긋난 것(불릿, 없으면 "없음") / ## 보고만으로는 확인할 수 없는 것(불릿) / ## 직접 눌러 볼 것(불릿 3개). 300자 이내.';
const q05review = await call(Q05_REVIEW);
stamp('ch15_q05_review', Q05_REVIEW, q05review);

fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
