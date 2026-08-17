import { Router } from 'express';
import { z } from 'zod';
import { resolveActorId } from '../lib/actor-id';
import { classStatus, LabSubmitUnavailableError, latestSubmission, submit, toLabActor } from '../lib/lab-submissions';
import { LabArtifactsUnavailableError, latestArtifacts, saveArtifact } from '../lib/lab-artifacts';
import { getRequestUser } from '../lib/auth';
import { getSupabaseAdminClient } from '../lib/supabase';
import {
  askQuestion,
  interpretVoice,
  LabAbortedError,
  LabRateLimitError,
  LabUnavailableError,
  reviewDraft,
  takeVoiceToken,
  verifyWithRules,
} from '../lib/lab-ai';

/**
 * 12강 실습실의 AI 라우트 — 비평 · 검증 · 질문.
 *
 * 🚨 **학생당 횟수 한도도, 앱 안의 지출 천장도 없다**(2026-08-15 jery). 상한은 API 키 쪽에 있다.
 *    「중요한 건 수업이지 비용이 아니다」 — 앱 안의 천장은 수업을 멈출 자리를 하나 더 만드는 것이다.
 *
 * 🚨 **막힌 이유는 여전히 뭉치지 않는다.** 남은 둘은 조치가 다르다:
 *      429 = 지금 붐빈다 → 몇 초 뒤 다시 (횟수가 닳은 게 아니다)
 *      503 = 고장·미설정 → 교사에게 알린다
 */
const router = Router();

/**
 * 요청이 끊겼는지 알려 주는 신호.
 * 🚨 학생이 페이지를 닫아도 대기열에 남아 슬롯과 돈을 쓰던 자리다(2026-08-15 Codex 리뷰).
 * 🔑 Express 5 는 `req.signal` 을 준다. 없는 환경(테스트 등)에서도 죽지 않게 옵셔널로 읽는다.
 */
function abortSignalOf(req: import('express').Request): AbortSignal | undefined {
  return (req as { signal?: AbortSignal }).signal;
}

const reviewSchema = z.object({ draft: z.string().min(1).max(8000) });
const verifySchema = z.object({ rules: z.string().min(1).max(8000) });
const askSchema = z.object({ question: z.string().min(1).max(500) });
const voiceSchema = z.object({
  text: z.string().min(2).max(300),
  // 🔑 미션 문맥은 안내 품질을 위한 «표시용» 힌트다 — 권한·판정에 안 쓰인다. 길이만 자른다.
  missionGoal: z.string().max(200).default(''),
  nextCommand: z.string().max(40).default(''),
});
const submitSchema = z.object({ qaId: z.string().min(1).max(32), rules: z.string().min(1).max(8000) });
// 🔑 화면이 직접 쌓을 수 있는 계보 칸 — 'rules' 는 제출(/submit) 경로가, 'bundle' 은 23강 묶음 경로가 쓴다.
const artifactSchema = z.object({
  kind: z.enum(['skill', 'ac', 'promise', 'handoff']),
  content: z.string().min(1).max(8000),
});

function handle(caught: unknown, res: import('express').Response, tag: string): void {
  // 🔑 학생이 화면을 닫은 것은 «고장»이 아니다. 로그를 시끄럽게 만들지 않고, 답도 보내지 않는다
  //    (받을 사람이 없다). 이걸 502 로 세면 수업 중 오류 로그가 이탈로 가득 찬다.
  if (caught instanceof LabAbortedError) return;
  if (caught instanceof LabSubmitUnavailableError) {
    // 🚨 제출은 조용히 성공한 척하지 않는다 — 학생은 냈다고 믿고 교사는 아무것도 못 본다.
    console.error(`[lab/${tag}] submit unavailable`, caught.message);
    res.status(503).json({ error: 'unavailable', reason: 'submit_unavailable' });
    return;
  }
  if (caught instanceof LabRateLimitError) {
    res.status(429).json({ error: 'rate_limited', retryAfterSeconds: caught.retryAfterSeconds });
    return;
  }
  if (caught instanceof LabUnavailableError) {
    res.status(503).json({ error: 'unavailable', reason: caught.message });
    return;
  }
  // 🚨 여기까지 온 것은 우리 쪽 고장이다. 원인을 로그에 남긴다 —
  //    수업 중에 이 줄이 없으면 「왜 안 되는지」를 아무도 못 본다.
  console.error(`[lab/${tag}] failed`, caught instanceof Error ? caught.message : caught);
  res.status(502).json({ error: 'call_failed' });
}

// POST /api/lab/review — 내 초안의 어디가 애매한가 (초안을 대신 써 주지 않는다)
router.post('/review', async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    const review = await reviewDraft(parsed.data.draft, abortSignalOf(req));
    res.json({ review });
  } catch (caught) {
    handle(caught, res, 'review');
  }
});

// POST /api/lab/verify — 내 규칙대로 두 번 시켜 본다
// 🔑 판정은 여기서 안 한다. 결과 문자열만 돌려주고 결정적 검사기가 판정한다.
router.post('/verify', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    const outputs = await verifyWithRules(parsed.data.rules, abortSignalOf(req));
    res.json({ outputs });
  } catch (caught) {
    handle(caught, res, 'verify');
  }
});

// POST /api/lab/ask — 모르는 것 물어보기 (미션 횟수와 별도)
router.post('/ask', async (req, res) => {
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    const answer = await askQuestion(parsed.data.question, abortSignalOf(req));
    res.json({ answer });
  } catch (caught) {
    handle(caught, res, 'ask');
  }
});

// POST /api/lab/voice — 터미널 AI 목소리 2단: 로컬이 못 알아들은 자유 문장만 온다 (SDD 결정 6).
// 🚨 자동 실행 금지 — suggest 는 제안일 뿐이고, 화면은 절대 대신 실행하지 않는다.
// 🔑 연타 방지(takeVoiceToken)는 돈이 아니라 폭주를 막는다 — 1분 지나면 그냥 다시 된다.
router.post('/voice', async (req, res) => {
  const parsed = voiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  const throttled = takeVoiceToken(resolveActorId(req));
  if (!throttled.ok) {
    res.status(429).json({ error: 'rate_limited', retryAfterSeconds: throttled.retryAfterSeconds });
    return;
  }
  try {
    const voice = await interpretVoice(parsed.data, abortSignalOf(req));
    res.json({ reply: voice.reply, suggestedCommand: voice.suggest });
  } catch (caught) {
    handle(caught, res, 'voice');
  }
});

// POST /api/lab/submit — 낸다. 🚨 판정은 **저장된 본문으로 서버가** 낸다.
//    화면이 보낸 판정은 받지도 저장하지도 않는다 — 그건 근거가 아니다.
router.post('/submit', async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  const actor = toLabActor(resolveActorId(req));
  try {
    const result = await submit(actor, parsed.data.qaId, parsed.data.rules, (rules) =>
      verifyWithRules(rules, abortSignalOf(req)),
    );
    // 🔑 계보 사본(규칙 한 장) — SDD 결정 15. 🚨 **비치명**: 계보 테이블이 아직 없어도
    //    제출은 성공해야 한다(5f6ed39 선례 — 배포 순서가 수업을 멈추지 않게). 로그만 남긴다.
    try {
      await saveArtifact(actor, 'rules', parsed.data.rules);
    } catch (artifactError) {
      console.error(
        '[lab/submit] artifact_save_skipped',
        artifactError instanceof Error ? artifactError.message : artifactError,
      );
    }
    res.json(result);
  } catch (caught) {
    handle(caught, res, 'submit');
  }
});

// POST /api/lab/artifact — 체험이 만든 산출물 한 장을 계보에 쌓는다 (SDD 결정 15).
router.post('/artifact', async (req, res) => {
  const parsed = artifactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    const revision = await saveArtifact(toLabActor(resolveActorId(req)), parsed.data.kind, parsed.data.content);
    res.json({ revision });
  } catch (caught) {
    if (caught instanceof LabArtifactsUnavailableError) {
      res.status(503).json({ error: 'unavailable', reason: 'artifacts_unavailable' });
      return;
    }
    handle(caught, res, 'artifact');
  }
});

// GET /api/lab/artifacts — 이 학생의 산출물 계보 지금 (23강 bundle 이 읽는다).
// 🚨 테이블 부재·DB 없음은 빈 결과가 아니라 503 이다 — 빈 200 으로 답하면
//    «아직 안 만들었네요»라는 거짓말이 화면에 나간다.
router.get('/artifacts', async (req, res) => {
  try {
    res.json({ artifacts: await latestArtifacts(toLabActor(resolveActorId(req))) });
  } catch (caught) {
    if (caught instanceof LabArtifactsUnavailableError) {
      res.status(503).json({ error: 'unavailable', reason: 'artifacts_unavailable' });
      return;
    }
    handle(caught, res, 'artifacts');
  }
});

// GET /api/lab/submission?qaId= — 내가 낸 마지막 판. 화면이 «이어서 고치기»를 하려고 읽는다.
router.get('/submission', async (req, res) => {
  const qaId = typeof req.query.qaId === 'string' ? req.query.qaId : '';
  if (!qaId) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }
  try {
    res.json({ submission: await latestSubmission(toLabActor(resolveActorId(req)), qaId) });
  } catch (caught) {
    handle(caught, res, 'submission');
  }
});

// GET /api/lab/class?sessionId=&qaId= — 이 수업의 실습 현황 (교사 전용)
//
// 🚨 **교사 확인이 없으면 학생 작업물이 열린다.** 로그인한 사람이 이 수업의 교사인지까지 본다 —
//    로그인만 보면 남의 수업을 들여다볼 수 있다.
router.get('/class', async (req, res) => {
  const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : '';
  const qaId = typeof req.query.qaId === 'string' ? req.query.qaId : '';
  if (!sessionId || !qaId) {
    res.status(400).json({ error: 'invalid_request' });
    return;
  }

  const user = await getRequestUser(req);
  if (!user?.id) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) throw new LabSubmitUnavailableError('no_database');
    const { data: session, error } = await supabase
      .from('architecture_sessions')
      .select('id, teacher_id')
      .eq('id', sessionId)
      .maybeSingle();
    if (error) throw new LabSubmitUnavailableError(error.message);
    // 🚨 «이 수업의 교사인가»까지 본다. 없는 수업과 남의 수업을 같은 답으로 돌려준다 —
    //    갈라 답하면 어떤 수업이 존재하는지가 새어 나간다.
    if (!session || session.teacher_id !== user.id) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    res.json(await classStatus(sessionId, qaId));
  } catch (caught) {
    handle(caught, res, 'class');
  }
});

export default router;