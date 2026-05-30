// QA 진단 엔드포인트 — 리포트 runner 가 서버 in-memory 상태를 회수.
// index.ts 가 QA_AUTH_ENABLED==='true' 일 때만 mount. X-QA-Secret 으로 보호.
// 포팅 원본: sprint/server/src/routes/qa-diagnostics.ts (architecture: usage_events 없음 → /usage 제외).
//
//   GET  /api/qa/run/:runId/effect-blocks        → EffectGate default-deny no-op 이벤트 목록
//   POST /api/qa/run/:runId/effect-blocks/clear  → 해당 run 블록 로그 비우기(런 간 격리)

import { Router, type Request, type Response } from 'express';
import { secretMatches } from './qa-auth';
import { getEffectGateBlocks, clearEffectGateBlocks } from '../lib/effect-gate';

const router = Router();

function requireSecret(req: Request, res: Response): boolean {
  if (!secretMatches(req.header('X-QA-Secret') ?? '')) {
    res.status(401).json({ error: 'INVALID_SECRET' });
    return false;
  }
  return true;
}

router.get('/run/:runId/effect-blocks', (req: Request, res: Response) => {
  if (!requireSecret(req, res)) return;
  const runId = String(req.params.runId);
  const browserIdQuery = typeof req.query.browser_id === 'string' ? req.query.browser_id : undefined;
  const blocks = browserIdQuery !== undefined
    ? getEffectGateBlocks(runId, browserIdQuery)
    : getEffectGateBlocks(runId);
  res.json({
    run_id: runId,
    blocks,
    ...(browserIdQuery !== undefined ? { browser_id: browserIdQuery } : {}),
  });
});

router.post('/run/:runId/effect-blocks/clear', (req: Request, res: Response) => {
  if (!requireSecret(req, res)) return;
  const runId = String(req.params.runId);
  clearEffectGateBlocks(runId);
  res.json({ run_id: runId, cleared: true });
});

export default router;
