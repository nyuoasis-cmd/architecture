// real-flow-qa — 수동 리포트 아티팩트 (Layer B). 포팅 원본: ai-app-builder/qa/lib/report.mjs.
// 각 체크를 4분류 + PASS 로 라벨, 실패엔 진단 번들, EffectGate 차단 목록 포함.
// 산출: qa/reports/<run_id>/report.json + report.md (qa/reports 는 .gitignore).

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STATUS = Object.freeze({
  PASS: 'PASS',
  FAIL: 'FAIL',       // 진짜 결함
  FLAKY: 'FLAKY',     // 재시도 통과
  INFRA: 'INFRA',     // provider·네트워크 일시
  BLOCKED: 'BLOCKED', // 선행 미충족
});

const REPORTS_DIR = path.resolve(fileURLToPath(new URL('../reports', import.meta.url)));

/** 응답/에러를 4분류로 라벨링(명시 status 우선). 5xx·timeout→INFRA, 기대불일치→FAIL. */
export function classify({ explicit, httpStatus, errorName } = {}) {
  if (explicit && STATUS[explicit]) return explicit;
  if (errorName === 'AbortError' || errorName === 'FetchError') return STATUS.INFRA;
  if (typeof httpStatus === 'number' && httpStatus >= 500) return STATUS.INFRA;
  return STATUS.FAIL;
}

/** 진단 번들 (없는 값은 null). API 레벨은 console/network/screenshot 가 N/A. */
export function buildDiagnostic({ input, responseRaw, stopReason, outputTokens, errorName, cause, console: consoleLogs, network, artifact } = {}) {
  return {
    input: input ?? null,
    response_raw: typeof responseRaw === 'string' ? responseRaw.slice(0, 8000) : (responseRaw ?? null),
    stop_reason: stopReason ?? null,
    output_tokens: outputTokens ?? null,
    error_name: errorName ?? null,
    cause: cause ? String(cause).slice(0, 2000) : null,
    console: consoleLogs ?? null,
    network: network ?? null,
    artifact: artifact ?? null,
  };
}

/** effect-blocks 를 browser_id 별 그룹화. */
export function groupByBrowser(events) {
  const out = {};
  for (const e of events ?? []) {
    const key = e?.browser_id ?? e?.browserId ?? '(null)';
    (out[key] ||= []).push(e);
  }
  return out;
}

export function createReport(runId) {
  const checks = [];
  let effectBlocks = [];
  let browserSummaries = [];
  const startedAt = new Date().toISOString();

  return {
    runId,
    addCheck(check) {
      checks.push({ at: new Date().toISOString(), ...check });
      return check;
    },
    setEffectBlocks(blocks) { effectBlocks = Array.isArray(blocks) ? blocks : []; },
    setBrowserSummaries(summaries) { browserSummaries = Array.isArray(summaries) ? summaries : []; },
    summary() {
      const counts = { PASS: 0, FAIL: 0, FLAKY: 0, INFRA: 0, BLOCKED: 0 };
      for (const c of checks) counts[c.status] = (counts[c.status] ?? 0) + 1;
      const verdict = counts.FAIL > 0 || counts.BLOCKED > 0 ? STATUS.FAIL
        : counts.INFRA > 0 ? STATUS.INFRA
        : STATUS.PASS;
      return { counts, verdict, total: checks.length };
    },
    toJSON() {
      return {
        run_id: runId,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        summary: this.summary(),
        checks,
        effect_blocks: effectBlocks,
        browser_summaries: browserSummaries,
      };
    },
    toMarkdown() {
      const s = this.summary();
      const lines = [
        `# QA 리포트 — run \`${runId}\``,
        '',
        `**판정: ${s.verdict}** · PASS ${s.counts.PASS} / FAIL ${s.counts.FAIL} / FLAKY ${s.counts.FLAKY} / INFRA ${s.counts.INFRA} / BLOCKED ${s.counts.BLOCKED}`,
        '',
        '| # | 체크 | 상태 | 상세 |',
        '|---|------|------|------|',
        ...checks.map((c, i) => `| ${i + 1} | ${c.name} | ${c.status} | ${(c.detail ?? '').toString().replace(/\n/g, ' ').slice(0, 120)} |`),
        '',
        `## EffectGate 차단 (${effectBlocks.length})`,
        effectBlocks.length
          ? effectBlocks.map((b) => `- \`${b.effect}\` @ ${b.at}${b.browser_id ? ` [browser_id=${b.browser_id}]` : ''}`).join('\n')
          : '- (없음)',
      ];
      if (browserSummaries.length) {
        lines.push(
          '',
          '## per-session breakdown (Layer B)',
          '| browser_id | session | duration_ms | success | rejection | cost_usd | trace |',
          '|---|---|---|---|---|---|---|',
          ...browserSummaries.map((b) =>
            `| ${b.browser_id ?? '-'} | ${b.session ?? '-'} | ${b.duration_ms ?? '-'} | ${b.success ?? '-'} | ${b.rejection ?? '-'} | ${b.cost_usd ?? '-'} | ${b.trace_path ?? '-'} |`,
          ),
        );
      }
      const failures = checks.filter((c) => c.status === STATUS.FAIL || c.status === STATUS.BLOCKED);
      if (failures.length) {
        lines.push('', '## 실패 진단 번들');
        for (const f of failures) {
          lines.push('', `### ${f.name} — ${f.status}`, '```json', JSON.stringify(f.diagnostic ?? {}, null, 2), '```');
        }
      }
      return lines.join('\n');
    },
    async write() {
      const dir = path.join(REPORTS_DIR, runId);
      await mkdir(dir, { recursive: true });
      const jsonPath = path.join(dir, 'report.json');
      const mdPath = path.join(dir, 'report.md');
      await writeFile(jsonPath, JSON.stringify(this.toJSON(), null, 2), 'utf8');
      await writeFile(mdPath, this.toMarkdown(), 'utf8');
      return { jsonPath, mdPath, summary: this.summary() };
    },
  };
}
