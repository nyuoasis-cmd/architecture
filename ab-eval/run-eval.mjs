#!/usr/bin/env node
// A/B Eval Runner — Architecture Academy SDD §14.4
// 사용: ANTHROPIC_API_KEY=... node ab-eval/run-eval.mjs
// 결과: ab-eval/results-{timestamp}.md (블라인드 라벨 A/B 적용)

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();

// SDD §5.4.6 system prompt 핵심 (eval용 baseline, few-shot 5+5는 PR #5에서 보강)
const SYSTEM_PROMPT = `너는 IT 입문 학습 도구의 보조 챗봇이다. 비전공자(주로 초·중·고 학생)에게 컴퓨터·개발 개념을 설명한다.

규칙:
- 일상 비유로 설명. 학생이 이미 아는 것(요리, 학교, 게임, 카톡, 도로 등)에 빗대라.
- 한국어, 4문장 이하로 답하라. 4문장을 넘기지 마라.
- 코드, 명령어, CLI 예시는 절대 쓰지 마라. 개념 학습 도구다.
- 모르는 건 모른다고 솔직히 답해라. 추측해서 답하지 마라.
- 원작자(알렉)의 책 본문을 그대로 복원하지 마라. 너의 자체 표현으로만 답하라.`;

// 20문항 로드
const QUESTIONS_MD = readFileSync(join(__dirname, "questions.md"), "utf-8");
const QUESTIONS = [...QUESTIONS_MD.matchAll(/\| Q(\d+) \| (.+?) \|/g)].map(
  ([, n, q]) => ({ id: `Q${n.padStart(2, "0")}`, question: q.trim() }),
);

if (QUESTIONS.length !== 20) {
  console.error(`예상 20문항, 추출 ${QUESTIONS.length}개. questions.md 확인.`);
  process.exit(1);
}

const MODELS = {
  haiku: "claude-haiku-4-5-20251001",
  sonnet: "claude-sonnet-4-6",
};

async function ask(modelId, question) {
  const t0 = Date.now();
  const res = await client.messages.create({
    model: modelId,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return {
    text,
    output_tokens: res.usage.output_tokens,
    input_tokens: res.usage.input_tokens,
    duration_ms: Date.now() - t0,
  };
}

function countSentences(text) {
  // 한국어 문장 종결: . ! ? + 줄바꿈
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;
}

async function main() {
  console.log(`A/B Eval 시작: ${QUESTIONS.length}문항 × 2 모델 = ${QUESTIONS.length * 2}회 호출`);
  const results = [];

  for (const { id, question } of QUESTIONS) {
    console.log(`  ${id} 진행 중...`);
    const [haiku, sonnet] = await Promise.all([
      ask(MODELS.haiku, question),
      ask(MODELS.sonnet, question),
    ]);

    // 블라인드 라벨 A/B 랜덤
    const haikuIsA = Math.random() < 0.5;
    const A = haikuIsA ? haiku : sonnet;
    const B = haikuIsA ? sonnet : haiku;
    const aLabel = haikuIsA ? "haiku" : "sonnet";
    const bLabel = haikuIsA ? "sonnet" : "haiku";

    results.push({
      id,
      question,
      A: { text: A.text, sentences: countSentences(A.text), tokens: A.output_tokens, ms: A.duration_ms, _truth: aLabel },
      B: { text: B.text, sentences: countSentences(B.text), tokens: B.output_tokens, ms: B.duration_ms, _truth: bLabel },
    });
  }

  // 통계
  const haikuStats = { sentences: [], tokens: [], ms: [], over4: 0 };
  const sonnetStats = { sentences: [], tokens: [], ms: [], over4: 0 };
  for (const r of results) {
    for (const slot of ["A", "B"]) {
      const s = r[slot];
      const target = s._truth === "haiku" ? haikuStats : sonnetStats;
      target.sentences.push(s.sentences);
      target.tokens.push(s.tokens);
      target.ms.push(s.ms);
      if (s.sentences > 4) target.over4 += 1;
    }
  }

  const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

  // Markdown 결과 (평가자 시트)
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const sheetMd = renderSheet(results, haikuStats, sonnetStats, avg);
  const truthMd = renderTruth(results, haikuStats, sonnetStats, avg);

  writeFileSync(join(__dirname, `results-${ts}-blind.md`), sheetMd);
  writeFileSync(join(__dirname, `results-${ts}-truth.md`), truthMd);

  console.log(`\n완료. 평가자에게 전달: results-${ts}-blind.md`);
  console.log(`정답표 (평가 후 공개): results-${ts}-truth.md`);
  console.log(`\n자동 통계 (4문장 준수율):`);
  console.log(`  Haiku: ${20 - haikuStats.over4}/20 (${((1 - haikuStats.over4 / 20) * 100).toFixed(0)}%)`);
  console.log(`  Sonnet: ${20 - sonnetStats.over4}/20 (${((1 - sonnetStats.over4 / 20) * 100).toFixed(0)}%)`);
  console.log(`평균 latency: Haiku ${avg(haikuStats.ms)}ms / Sonnet ${avg(sonnetStats.ms)}ms`);
}

function renderSheet(results, hStats, sStats, avg) {
  let md = `# A/B Eval 평가 시트 (블라인드)\n\n`;
  md += `> 평가자: 모델명을 모른 채 A/B 응답을 비교하세요. rubric.md 참조.\n`;
  md += `> 각 문항에서 A·B 두 응답에 대해 (1) 이해 용이성 1~5점, (2) 비유 자연스러움 1~5점 매기기.\n\n`;
  md += `## 자동 통계 (참고용)\n\n`;
  md += `| 지표 | Model A 평균 | Model B 평균 |\n|---|---|---|\n`;
  md += `| 문장 수 | ${avg(results.map((r) => r.A.sentences))} | ${avg(results.map((r) => r.B.sentences))} |\n`;
  md += `| 출력 토큰 | ${avg(results.map((r) => r.A.tokens))} | ${avg(results.map((r) => r.B.tokens))} |\n`;
  md += `| latency ms | ${avg(results.map((r) => r.A.ms))} | ${avg(results.map((r) => r.B.ms))} |\n\n`;
  md += `---\n\n`;
  for (const r of results) {
    md += `## ${r.id}: ${r.question}\n\n`;
    md += `**Model A 응답** (문장 ${r.A.sentences} / 토큰 ${r.A.tokens}):\n\n> ${r.A.text.replace(/\n/g, "\n> ")}\n\n`;
    md += `**Model B 응답** (문장 ${r.B.sentences} / 토큰 ${r.B.tokens}):\n\n> ${r.B.text.replace(/\n/g, "\n> ")}\n\n`;
    md += `**평가**:\n\n`;
    md += `- 이해 용이성: A = __/5  B = __/5\n`;
    md += `- 비유 자연스러움: A = __/5  B = __/5\n`;
    md += `- 정답성 (운영자만): A = PASS/FAIL  B = PASS/FAIL\n`;
    md += `- 메모: \n\n---\n\n`;
  }
  return md;
}

function renderTruth(results, hStats, sStats, avg) {
  let md = `# A/B Eval 정답표 (평가 후 공개)\n\n`;
  md += `## 모델 라벨\n\n`;
  for (const r of results) {
    md += `- ${r.id}: A=${r.A._truth.toUpperCase()} / B=${r.B._truth.toUpperCase()}\n`;
  }
  md += `\n## 자동 지표\n\n`;
  md += `| | Haiku | Sonnet |\n|---|---|---|\n`;
  md += `| 4문장 이하 준수 | ${20 - hStats.over4}/20 | ${20 - sStats.over4}/20 |\n`;
  md += `| 평균 문장 수 | ${avg(hStats.sentences)} | ${avg(sStats.sentences)} |\n`;
  md += `| 평균 출력 토큰 | ${avg(hStats.tokens)} | ${avg(sStats.tokens)} |\n`;
  md += `| 평균 latency ms | ${avg(hStats.ms)} | ${avg(sStats.ms)} |\n`;
  return md;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
