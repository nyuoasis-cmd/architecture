import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './env';
import { buildCopyrightIndex } from './lib/copyright-index';
import chatRouter from './routes/chat';
import harnessSubmissionsRouter from './routes/harness-submissions';
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

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', ts: Date.now() });
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
app.use('/api/harness/submissions', harnessSubmissionsRouter);
app.use('/api/join', joinRouter);
app.use('/api/progress', progressRouter);
app.use('/api/quiz', quizRouter);
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
