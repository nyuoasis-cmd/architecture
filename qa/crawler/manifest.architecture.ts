// real-flow-qa Layer A — architecture 크롤 manifest.
//
// 범용 크롤러(crawl.ts)는 앱 비종속. 앱별 차이는 이 manifest 만으로 표현.
// 실 라우트 출처: client/src/App.tsx (실측). 학생/공개 = anon, 교사 = AuthGate(/teacher).
//
// architecture 동적 라우트는 세션 *id*(6자리 code 아님)로 라우팅: /teacher/session/:id, /learn/:sessionId.
//   → setup 이 QA 세션을 만들어 :id/:sessionId 를 session.id 로, :code 를 6자리 코드로 채운다.

export type CrawlRole = 'anon' | 'teacher' | 'participant';

export interface SeedUrl {
  /** 라우트 경로. `:id`/`:sessionId`/`:code` 등 동적 토큰은 dynamicRouteFactories 가 치환. */
  path: string;
  role: CrawlRole;
  /** 동적 토큰 포함 여부(setup 산출로 치환 필요). */
  dynamic?: boolean;
}

export interface DynamicContext {
  /** setup 이 만든 QA 세션 6자리 코드. */
  sessionCode: string;
  /** setup 이 /api/join 으로 미리 참가해 발급받은 `arch_pt` 쿠키(`name=value`). participant 롤 주입용.
   *  현재 시드에 participant 롤이 없어 setup 이 발급하지 않는다(하네스 철거, 2026-08-11). */
  participantCookie?: string;
  /** 동적 경로 토큰 치환 맵. */
  tokens: Record<string, string>;
}

export interface CrawlManifest {
  app: string;
  seedUrls: SeedUrl[];
  roles: CrawlRole[];
  forbiddenRoutes: Array<string | RegExp>;
  dynamicRouteFactories: {
    setup: (api: {
      issueTeacherToken: () => Promise<string>;
      apiBase: string;
      runId: string;
    }) => Promise<DynamicContext>;
    teardown: (ctx: DynamicContext) => Promise<void>;
    resolve: (path: string, ctx: DynamicContext) => string;
  };
}

export const manifest: CrawlManifest = {
  app: 'architecture',

  seedUrls: [
    // ── anon (학생·공개) ──
    { path: '/', role: 'anon' },
    { path: '/about', role: 'anon' },
    { path: '/login', role: 'anon' },
    { path: '/dev-login', role: 'anon' },
    { path: '/forbidden', role: 'anon' },
    { path: '/join', role: 'anon' },
    { path: '/library', role: 'anon' },
    { path: '/library/1/ch01_q01', role: 'anon' }, // self-learn = LearnPage(mode=self) 정적 렌더(인증·세션 불요)
    { path: '/demos-preview/showcase', role: 'anon' },
    // 🎯 L1↔L2 커버리지 diff 가 지목한 사각지대 — 데모(demos/chNN/*)는 그 문항 화면에서만 렌더된다.
    //    이 22개가 없으면 L1 분모의 demos 38개가 «미도달»로 남는다(2026-08-13 실측).
    //    목록의 근거 = shared/qa/inventory/reports/coverage-diff.architecture.json 의 unreached 버킷.
    { path: '/library/11/ch11_q04', role: 'anon' },
    { path: '/library/12/ch12_q01', role: 'anon' },
    { path: '/library/12/ch12_q04', role: 'anon' },
    { path: '/library/12/ch12_q06', role: 'anon' },
    { path: '/library/12/ch12_q07', role: 'anon' },
    { path: '/library/13/ch13_q06', role: 'anon' },
    { path: '/library/14/ch14_q02', role: 'anon' },
    { path: '/library/14/ch14_q03', role: 'anon' },
    { path: '/library/14/ch14_q04', role: 'anon' },
    { path: '/library/14/ch14_q05', role: 'anon' },
    { path: '/library/15/ch15_q01', role: 'anon' },
    { path: '/library/15/ch15_q03', role: 'anon' },
    { path: '/library/15/ch15_q04', role: 'anon' },
    { path: '/library/15/ch15_q06', role: 'anon' },
    { path: '/library/16/ch16_q01', role: 'anon' },
    { path: '/library/16/ch16_q02', role: 'anon' },
    { path: '/library/16/ch16_q04', role: 'anon' },
    { path: '/library/16/ch16_q06', role: 'anon' },
    { path: '/library/17/ch17_q01', role: 'anon' },
    { path: '/library/17/ch17_q02', role: 'anon' },
    { path: '/library/17/ch17_q04', role: 'anon' },
    { path: '/library/17/ch17_q05', role: 'anon' },
    // ── teacher (AuthGate) — best-effort(인증 주입 가능 시, 아니면 SKIPPED) ──
    { path: '/teacher', role: 'teacher' },
    { path: '/teacher/demo', role: 'teacher' }, // 🎬 시연작 B형(2026-08-12) — 강 목록부터 고르는 화면
    { path: '/teacher/session/:id', role: 'teacher', dynamic: true },
    // 학생 세션-학습 화면: teacher-preview(?role=teacher)로 best-effort 크롤(참가자 쿠키 주입은 별 PR).
    { path: '/learn/:sessionId?role=teacher', role: 'teacher', dynamic: true },
  ],

  roles: ['anon', 'teacher'],

  // 부작용·비가역 진입 금지. /api/qa(QA 제어), DELETE 계열, 세션 종료(상태 변경), OAuth 콜백.
  forbiddenRoutes: [
    '/auth/callback',           // OAuth 콜백(외부 리다이렉트)
    /\/api\/qa(\/|$)/,          // QA 제어 엔드포인트
    /method=DELETE/i,           // DELETE 계열
    /\/sessions\/[^/]+\/end/,   // POST /api/sessions/:id/end (세션 종료 — 상태 변경)
    // 🚨 앱 AI 라우트 2개 — 크롤러는 모든 버튼을 누르므로 여기를 막지 않으면 실제 과금이 난다.
    // 「내 차례」(/api/vibe/my-turn)는 CHAT_MONTHLY_BUDGET_USD 가 세지 않아 돈 천장 자체가 없다.
    /\/api\/chat(\/|$)/,          // 학생 챗봇
    /\/api\/vibe\/my-turn(\/|$)/, // ✋ 「내 차례」 판정
  ],

  dynamicRouteFactories: {
    async setup({ issueTeacherToken, apiBase, runId }) {
      const token = await issueTeacherToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-QA-Run-Id': runId,
        'X-QA-Browser-Id': 'crawler',
      };

      // 기존 learn-mode 세션 — /teacher/session/:id, /learn/:sessionId 등 기존 동적 경로용(변경 없음).
      const res = await fetch(`${apiBase}/api/sessions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: `QA LayerA ${runId}`, chapter_ids: [1], max_participants: 200 }),
      });
      if (!res.ok) throw new Error(`크롤 setup 세션 생성 실패 ${res.status}: ${await res.text().catch(() => '')}`);
      const j = await res.json();
      const sessionId = j.id as string;
      const sessionCode = j.code as string;

      return {
        sessionCode,
        tokens: { ':sessionId': sessionId, ':id': sessionId, ':code': sessionCode },
      };
    },
    async teardown() {
      // QA 세션은 created_by_qa 태깅 → sql/004_qa_cleanup.sql 로 일괄 회수. 개별 삭제 불필요.
    },
    resolve(path, ctx) {
      let out = path;
      // 긴 토큰부터 치환(:sessionId 가 :s.. 로 부분매칭되지 않도록 길이 내림차순).
      for (const [tok, val] of Object.entries(ctx.tokens).sort((a, b) => b[0].length - a[0].length)) {
        out = out.split(tok).join(val);
      }
      return out;
    },
  },
};

export default manifest;
