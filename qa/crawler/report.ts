// real-flow-qa Layer A — 고장 리포트 (SDD §3 PR3).
// 라우트별 PASS/FAIL + 진단 번들. 산출: qa/reports/<runId>/crawl-report.{json,md}.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type CrawlStatus = 'PASS' | 'FAIL' | 'SKIPPED' | 'BLOCKED';

export interface RouteFinding {
  /** 흰화면·5xx·콘솔에러·죽은버튼·미처리거부 등. */
  kind: 'whitescreen' | 'http-error' | 'console-error' | 'dead-button' | 'page-error';
  detail: string;
  /** http-error 부가. */
  httpStatus?: number;
  url?: string;
  /** 콘솔 fingerprint(allowlist 대조용). */
  fingerprint?: string;
  /** 스크린샷 경로(흰화면 시). */
  screenshot?: string;
}

export interface RouteResult {
  path: string;
  resolvedUrl: string;
  role: string;
  status: CrawlStatus;
  findings: RouteFinding[];
  clicked: number;       // 클릭한 인터랙티브 요소 수
  deadButtons: number;   // data-qa-action 인데 무반응
  durationMs: number;
}

export interface CrawlReport {
  run_id: string;
  app: string;
  base_url: string;
  started_at: string;
  finished_at: string;
  routes: RouteResult[];
  skipped_forbidden: string[]; // forbiddenRoutes 로 스킵된 후보(silent cap 금지)
  effect_blocks: unknown[];    // EffectGate 차단 실증(부작용 버튼)
  summary: { total: number; pass: number; fail: number; skipped: number; hard_failures: number };
}

export function summarize(routes: RouteResult[]): CrawlReport['summary'] {
  let pass = 0, fail = 0, skipped = 0, hard = 0;
  for (const r of routes) {
    if (r.status === 'PASS') pass++;
    else if (r.status === 'FAIL') fail++;
    else if (r.status === 'SKIPPED' || r.status === 'BLOCKED') skipped++;
    // 하드실패 = 5xx 또는 page-error(크래시). SKIPPED/BLOCKED 는 검사 보류이므로
    // 그 진단 finding(예: teacher 인증 미주입 사유)을 하드실패로 세지 않는다.
    if (r.status !== 'SKIPPED' && r.status !== 'BLOCKED'
      && r.findings.some((f) => f.kind === 'page-error' || (f.kind === 'http-error' && (f.httpStatus ?? 0) >= 500))) hard++;
  }
  return { total: routes.length, pass, fail, skipped, hard_failures: hard };
}

export function writeReport(report: CrawlReport, reportsRoot: string): { jsonPath: string; mdPath: string } {
  const dir = path.join(reportsRoot, report.run_id);
  mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, 'crawl-report.json');
  const mdPath = path.join(dir, 'crawl-report.md');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const s = report.summary;
  const verdict = s.hard_failures > 0 || s.fail > 0 ? 'FAIL' : 'PASS';
  const lines = [
    `# Layer A 크롤 리포트 — \`${report.run_id}\` (${report.app})`,
    '',
    `**판정: ${verdict}** · PASS ${s.pass} / FAIL ${s.fail} / SKIPPED ${s.skipped} · 하드실패 ${s.hard_failures}`,
    `base_url: ${report.base_url}`,
    '',
    '| 라우트 | role | 상태 | 클릭 | 죽은버튼 | findings |',
    '|---|---|---|---|---|---|',
    ...report.routes.map(
      (r) => `| \`${r.path}\` | ${r.role} | ${r.status} | ${r.clicked} | ${r.deadButtons} | ${r.findings.length} |`,
    ),
    '',
    `## 스킵(forbiddenRoutes, ${report.skipped_forbidden.length})`,
    report.skipped_forbidden.length ? report.skipped_forbidden.map((u) => `- ${u}`).join('\n') : '- (없음)',
    '',
    `## EffectGate 차단 (${report.effect_blocks.length})`,
    report.effect_blocks.length ? '```json\n' + JSON.stringify(report.effect_blocks, null, 2) + '\n```' : '- (없음)',
  ];
  const failing = report.routes.filter((r) => r.status === 'FAIL' && r.findings.length);
  if (failing.length) {
    lines.push('', '## 실패 상세');
    for (const r of failing) {
      lines.push('', `### \`${r.path}\` (${r.role})`);
      for (const f of r.findings) lines.push(`- **${f.kind}**: ${f.detail}${f.httpStatus ? ` [${f.httpStatus}]` : ''}${f.url ? ` ${f.url}` : ''}`);
    }
  }
  writeFileSync(mdPath, lines.join('\n'), 'utf8');
  return { jsonPath, mdPath };
}
