import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './env';
import { buildCopyrightIndex } from './lib/copyright-index';
import chatRouter from './routes/chat';
import joinRouter from './routes/join';
import progressRouter from './routes/progress';
import quizRouter from './routes/quiz';
import sessionsRouter from './routes/sessions';

const app = express();
const clientDistPath = resolve(__dirname, '../../client/dist');
const copyrightIndex = buildCopyrightIndex();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', ts: Date.now() });
});

app.use('/api/chat', chatRouter);
app.use('/api/join', joinRouter);
app.use('/api/progress', progressRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/sessions', sessionsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

if (env.NODE_ENV === 'production' && existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(resolve(clientDistPath, 'index.html'));
  });
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
