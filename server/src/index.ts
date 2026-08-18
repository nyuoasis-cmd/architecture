import cors from 'cors';
import { classCheckBlock } from './lib/classCheck';
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './env';
import { buildCopyrightIndex } from './lib/copyright-index';
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
// 🚨 Render 프록시 뒤에서는 이게 없으면 req.ip 가 **내부 홉 IP(10.x, 요청마다 다름)** 가 된다 —
//    actor-id 의 ip: 갈래(자습 신원·«공유 통» 연타 한도)가 요청마다 새 통이 되어 전부 헛돌았다
//    (2026-08-18 prod 실측: 계보 저장 직후 되읽기가 빈 것으로 발각. pt: 참여자 갈래는 무관).
// 🔑 true 가 아니라 **홉 수** 다 — true 는 클라이언트가 지어낸 X-Forwarded-For 맨 앞을 믿어
//    남의 IP 통을 사칭해 읽는 문이 열린다. 숫자는 프록시가 붙인 항만 믿는다.
// 🔑 홉은 **2** 다(2026-08-18 prod 실측): Render 는 자체 엣지로 Cloudflare 를 쓴다 —
//    1 로 두면 req.ip 가 CF 엣지 IP(172.70/71.x, 요청마다 바뀔 수 있음)가 된다. 실측 순서:
//    미설정 → 10.x(내부 홉) / 1 → 172.7x(CF 엣지) / 2 → 클라이언트 공인 IP.
app.set('trust proxy', 2);
app.use(cors());
app.use(express.json());

// `classCheck` 블록: 수업점검이 「이 배포가 어떤 provider 키를 쓰는지」를 밖에서 확정할 수
//   없어(Render 배포 payload 에 env 스냅샷이 없다 — 2026-08-02 실측) 런타임이 직접 말한다.
//   이 앱은 앱 레벨 AI 캡이 없어 capPolicy='none' 으로 «없음» 을 명시한다 — 빈 객체를
//   「캡 없음」으로 추론하게 두면 버그로 빈 객체가 나온 경우와 구분되지 않는다.
//   나가는 것은 키 해시 앞 8자뿐이고 비밀 원문·env 전체는 없다. 이 예외를 넓히지 말 것.
app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', ts: Date.now(), classCheck: classCheckBlock() });
});

// QA test-only 인증·컨텍스트 — QA_AUTH_ENABLED==='true' 일 때만 mount (prod 기본 OFF).
// 비즈니스 라우터보다 먼저 마운트 → 태깅 핸들러 실행 시점에 QA 컨텍스트(ALS)가 설정됨.
if (process.env.QA_AUTH_ENABLED === 'true') {
  app.use('/api/qa', qaAuthRouter);          // POST /api/qa/auth/token
  app.use('/api/qa', qaDiagnosticsRouter);   // GET /api/qa/run/:runId/effect-blocks
  app.use('/api', qaContextMiddleware);       // 이후 /api/* 요청을 QA run 컨텍스트로 감쌈
  console.warn('[QA] QA_AUTH_ENABLED=true — test-only 인증/컨텍스트 활성 (prod 운영 시 OFF 확인)');
}

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
