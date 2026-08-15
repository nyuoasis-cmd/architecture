import cors from 'cors';
import { classCheckBlock } from './lib/classCheck';
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './env';
import { buildCopyrightIndex } from './lib/copyright-index';
import chatRouter from './routes/chat';
import { initSpendLedger, spendSnapshot } from './lib/ai-spend';
import labRouter from './routes/lab';
import vibeRouter from './routes/vibe';
import joinRouter from './routes/join';
import progressRouter from './routes/progress';
import quizRouter from './routes/quiz';
import sessionsRouter from './routes/sessions';
import teacherExplainRouter from './routes/teacher-explain';
import qaAuthRouter from './routes/qa-auth';
import qaDiagnosticsRouter from './routes/qa-diagnostics';
import { qaContextMiddleware } from './middleware/qa-context';

const app = express();
const clientDistPath = resolve(__dirname, '../../client/dist');
const copyrightIndex = buildCopyrightIndex();

app.disable('x-powered-by');
app.set('etag', false);
app.use(cors());
app.use(express.json());

// `classCheck` 블록: 수업점검이 「이 배포가 어떤 provider 키를 쓰는지」를 밖에서 확정할 수
//   없어(Render 배포 payload 에 env 스냅샷이 없다 — 2026-08-02 실측) 런타임이 직접 말한다.
//   이 앱은 앱 레벨 AI 캡이 없어 capPolicy='none' 으로 «없음» 을 명시한다 — 빈 객체를
//   「캡 없음」으로 추론하게 두면 버그로 빈 객체가 나온 경우와 구분되지 않는다.
//   나가는 것은 키 해시 앞 8자뿐이고 비밀 원문·env 전체는 없다. 이 예외를 넓히지 말 것.
app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  // 💸 지출 장부를 밖에서 볼 수 있게 붙인다. 🚨 «얼마 썼다»만이 아니라 **`persisted`** 를 같이 낸다 —
  //    그 값이 거짓이면 지금 세고 있는 것은 «프로세스가 뜬 뒤로»뿐이고, 그러면 «월 상한»이 아니다.
  //    안 내보내면 장부가 조용히 메모리로 떨어져도 아무도 모른다(밤샘 감시가 이 줄을 본다).
  res.json({
    status: 'ok',
    ts: Date.now(),
    classCheck: classCheckBlock(),
    aiSpend: { chat: spendSnapshot('chat'), lab: spendSnapshot('lab') },
  });
});

// QA test-only 인증·컨텍스트 — QA_AUTH_ENABLED==='true' 일 때만 mount (prod 기본 OFF).
// 비즈니스 라우터보다 먼저 마운트 → 태깅 핸들러 실행 시점에 QA 컨텍스트(ALS)가 설정됨.
if (process.env.QA_AUTH_ENABLED === 'true') {
  app.use('/api/qa', qaAuthRouter);          // POST /api/qa/auth/token
  app.use('/api/qa', qaDiagnosticsRouter);   // GET /api/qa/run/:runId/effect-blocks
  app.use('/api', qaContextMiddleware);       // 이후 /api/* 요청을 QA run 컨텍스트로 감쌈
  console.warn('[QA] QA_AUTH_ENABLED=true — test-only 인증/컨텍스트 활성 (prod 운영 시 OFF 확인)');
}

app.use('/api/chat', chatRouter);
app.use('/api/join', joinRouter);
app.use('/api/progress', progressRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/vibe', vibeRouter);
app.use('/api/lab', labRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/teacher-explain', teacherExplainRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

if (env.NODE_ENV === 'production') {
  if (existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(resolve(clientDistPath, 'index.html'));
    });
  } else {
    console.warn(`[startup] client dist not found at ${clientDistPath}; SPA fallback disabled`);
  }
}

// 💸 이 달 AI 지출 누계를 DB 에서 읽어 온다. 🚨 실패해도 서버는 뜬다(수업이 먼저다) —
//    대신 /health 의 `persisted:false` 가 «지금은 프로세스 기준으로만 세고 있다»고 말한다.
initSpendLedger();

const server = app.listen(env.PORT, () => {
  if (copyrightIndex.corpusEmpty) {
    console.log(`copyright index built (corpus empty) in ${copyrightIndex.durationMs}ms`);
  } else {
    console.log(
      `copyright index built (sentences=${copyrightIndex.sentenceCount}, ngrams=${copyrightIndex.ngramCount}) in ${copyrightIndex.durationMs}ms`,
    );
  }
  console.log(`Architecture server listening on ${env.PORT}`);
});

const shutdown = () => {
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
