// real-flow-qa Layer B — 30 학생 동시 join burst verdict 전용 Playwright config.
// 포팅 원본: sprint/qa/playwright-slice2.config.ts (architecture 서버 포트 3003 로 교체).
//
// 실행: QA_AUTH_ENABLED=true 서버(포트 3003) + sql/004 적용 + teacher QA 계정(is_qa) 후
//   QA_BASE_URL=http://localhost:3003 QA_AUTH_SECRET=... QA_MAX_CONCURRENCY=30 \
//   QA_BASELINE_MODE=true|미설정 \
//   npx playwright test -c qa/playwright-slice2.config.ts
//
// architecture: 학생 anon → SUPABASE_*/학생 비번 불필요 (teacher 토큰만).
//
// OOM 방지: launchOptions args 4종 (단일 test 안 30 컨텍스트 burst).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './concurrency',
  testMatch: ['**/thirty-browser.spec.ts'],
  timeout: 600_000, // 30 동시 부하 + 누수 oracle 표본 여유
  fullyParallel: false, // 단일 test 안에서 30 컨텍스트를 Promise.all 로 burst
  workers: 1,
  retries: 0, // 누수·하드실패는 즉시 드러낸다 (0 건 절대선)
  reporter: [['list'], ['json', { outputFile: 'reports/playwright-slice2-last.json' }]],
  use: {
    baseURL: (process.env.QA_BASE_URL || 'http://localhost:3003').replace(/\/$/, ''),
    // trace = spec 의 setupContext 가 명시 context.tracing.start/stop 호출 (config trace:'on' 중복 회피).
    trace: 'off',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: [
        '--single-process',           // chromium renderer 단일 프로세스 (메모리 절감)
        '--disable-gpu',              // GPU 0
        '--no-sandbox',               // sandbox overhead 0 (WSL2 안전)
        '--disable-dev-shm-usage',    // /dev/shm 회피 (WSL2 안정성)
      ],
    },
  },
});
