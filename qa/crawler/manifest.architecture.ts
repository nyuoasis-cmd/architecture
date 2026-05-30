// real-flow-qa Layer A — architecture 크롤 manifest.
//
// 범용 크롤러(crawl.ts)는 앱 비종속. 앱별 차이는 이 manifest 만으로 표현.
// 실 라우트 출처: client/src/App.tsx (실측). 학생/공개 = anon, 교사 = AuthGate(/teacher).
//
// architecture 동적 라우트는 세션 *id*(6자리 code 아님)로 라우팅: /teacher/session/:id, /learn/:sessionId.
//   → setup 이 QA 세션을 만들어 :id/:sessionId 를 session.id 로, :code 를 6자리 코드로 채운다.

export type CrawlRole = 'anon' | 'teacher';

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
    // ── teacher (AuthGate) — best-effort(인증 주입 가능 시, 아니면 SKIPPED) ──
    { path: '/teacher', role: 'teacher' },
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
  ],

  dynamicRouteFactories: {
    async setup({ issueTeacherToken, apiBase, runId }) {
      const token = await issueTeacherToken();
      const res = await fetch(`${apiBase}/api/sessions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-QA-Run-Id': runId,
          'X-QA-Browser-Id': 'crawler',
        },
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
