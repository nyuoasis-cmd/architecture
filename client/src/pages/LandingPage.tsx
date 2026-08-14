/**
 * Architecture Academy 랜딩페이지 — 한결 v1.4 수치 봉인
 * URL: architecture.teachermate.co.kr
 * 정책: shared/DESIGN-POLICY.md §9.F.1·§9.F.3·§9.F.4·§9.F.6
 * 표준 목업: shared/mockups/landing-standard-v2-2026-05-03.html
 *
 * 카피 유지 (이미 §9.F.4 톤 정합): "복잡한 IT 흐름이 / 한 화면 학습이 됩니다."
 * 6요소 (Ghost = "혼자 학습해볼게요 →" → /library 자율학습 진입)
 * 신규 className `landing-hero-*` (기존 index.css의 .hero-* 의존성 회피)
 * design-tokens.css는 demos 전용이라 hex 직접 사용
 */
import { useNavigate } from 'react-router-dom';
import { CHAPTERS } from '../data/qa-stubs';

// 🚨 손으로 적은 문항 수는 콘텐츠가 늘고 줄어도 안 따라온다 — 실제와 어긋난 채 학생에게 보여졌다.
//
// 🔑 2026-08-11: 여기 «1~10장» 상한이 있었고 근거는 «수업 세션은 서버가 1~10장으로 막으므로»였다.
//    그 상한은 #142 로 풀렸는데(등록부 전체 허용) 이 줄만 남아, 랜딩은 «10개 챕터»라 말하고
//    학생은 17장을 받는 상태였다 — 사문이 된 근거가 학생에게 앱을 작아 보이게 하고 있었다.
//    jery 결정(2026-08-11) = **학생도 모든 챕터에 접근한다.** 그래서 상한 없이 등록부 전체를 센다.
const LANDING_CHAPTERS = CHAPTERS;
const LANDING_CHAPTER_COUNT = LANDING_CHAPTERS.length;
const LANDING_QA_COUNT = LANDING_CHAPTERS.reduce((sum, chapter) => sum + chapter.qaCount, 0);

export default function LandingPage() {
  const navigate = useNavigate();
  // 허브 직행 통일: 항상 /teacher 진입 — 미인증이면 AuthGate가 중앙 허브로 bounce
  const teacherEntryPath = '/teacher';

  return (
    <>
      <style>{`
        .landing-hero-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 32px;
          text-align: center;
          background: #ffffff;
        }
        .landing-hero-inner {
          width: 100%;
          max-width: 880px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .landing-hero-label {
          margin: 0 0 28px;
          color: #78716c;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.16em;
          line-height: 1;
          text-transform: uppercase;
        }
        .landing-hero-title {
          margin: 0 0 24px;
          color: #1c1917;
          font-size: 76px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          word-break: keep-all;
          overflow-wrap: anywhere;
        }
        .landing-hero-caption {
          margin: 0 0 44px;
          max-width: 560px;
          color: #57534e;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: -0.005em;
          line-height: 1.65;
          word-break: keep-all;
        }
        .landing-cta-cluster {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .landing-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 32px;
          border-radius: 9999px;
          border: 1px solid transparent;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.005em;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition:
            background-color 160ms ease,
            border-color 160ms ease,
            color 160ms ease;
        }
        .landing-cta-primary {
          background: #1c1917;
          color: #ffffff;
        }
        .landing-cta-primary:hover {
          background: #292524;
        }
        .landing-cta-secondary {
          background: #ffffff;
          border-color: #d6d3d1;
          color: #44403c;
        }
        .landing-cta-secondary:hover {
          background: #fafaf9;
          border-color: #a8a29e;
        }
        .landing-cta-ghost {
          margin-top: 8px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 14px;
          color: #78716c;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          text-decoration: none;
        }
        .landing-cta-ghost:hover {
          color: #1c1917;
        }

        @media (max-width: 639px) {
          .landing-hero-page { padding: 72px 24px; }
          .landing-hero-inner {
            max-width: none;
            align-items: stretch;
          }
          .landing-hero-label {
            margin-bottom: 20px;
            font-size: 12px;
            letter-spacing: 0.14em;
          }
          .landing-hero-title {
            margin-bottom: 18px;
            font-size: 36px;
            letter-spacing: -0.025em;
            line-height: 1.22;
          }
          .landing-hero-caption {
            margin-bottom: 36px;
            max-width: none;
            font-size: 16px;
            line-height: 1.6;
          }
          .landing-hero-caption br {
            display: contents;
          }
          .landing-cta-cluster {
            flex-direction: column;
            width: 100%;
          }
          .landing-cta {
            width: 100%;
            height: 52px;
            padding: 0 24px;
          }
        }
      `}</style>
      <main className="landing-hero-page" role="main">
        <section className="landing-hero-inner" aria-labelledby="landing-hero-title">
          <p className="landing-hero-label">ARCHITECTURE</p>
          <h1 id="landing-hero-title" className="landing-hero-title">
            복잡한 IT 흐름이
            <br />
            한 화면 학습이 됩니다.
          </h1>
          <p className="landing-hero-caption">
            {LANDING_CHAPTER_COUNT}개 챕터 {LANDING_QA_COUNT}문항으로 IT 전체 그림을 따라가요.
            <br />
            교사가 만든 수업 코드 하나로 반 전체가 함께 학습해요.
          </p>

          <div className="landing-cta-cluster" role="group" aria-label="수업 시작">
            <button
              type="button"
              className="landing-cta landing-cta-secondary"
              onClick={() => navigate('/join')}
            >
              수업 참여하기
            </button>
            <button
              type="button"
              className="landing-cta landing-cta-primary"
              onClick={() => navigate(teacherEntryPath)}
            >
              수업 만들기
            </button>
          </div>

          <button
            type="button"
            className="landing-cta-ghost"
            onClick={() => navigate('/library')}
          >
            혼자 학습해볼게요 →
          </button>
        </section>
      </main>
    </>
  );
}
