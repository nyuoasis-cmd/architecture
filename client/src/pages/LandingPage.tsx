/**
 * Architecture Academy 랜딩페이지 — 한결 v1.3 정합
 * mockup: architecture/mockups/hangyeol-landing.html
 * §9.F.1 hero 6요소 + §9.F.4 결과 서술형
 * §9-A2 학습형 CTA: Primary "학습 시작하기" / Secondary "이어 학습하기" / Ghost 미적용
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const LAST_QA_KEY = 'architecture:last-qa-id';

export default function LandingPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleStart = () => {
    // 학생: 라이브러리 진입. 교사: /teacher 진입.
    navigate(auth.isAuthenticated ? '/teacher' : '/library');
  };

  const handleResume = () => {
    // §9-A2.4: 마지막 학습 위치 = localStorage 또는 서버 진도 (현재 localStorage만)
    const lastQaId = (() => {
      try {
        return localStorage.getItem(LAST_QA_KEY);
      } catch {
        return null;
      }
    })();
    if (lastQaId) {
      // ch01_q01 형식 → /library/1/ch01_q01
      const match = lastQaId.match(/^ch(\d{2})_q(\d{2})$/);
      if (match) {
        const chapter = String(parseInt(match[1], 10));
        navigate(`/library/${chapter}/${lastQaId}`);
        return;
      }
    }
    navigate('/library');
  };

  const hasResume = (() => {
    try {
      return Boolean(localStorage.getItem(LAST_QA_KEY));
    } catch {
      return false;
    }
  })();

  return (
    <main
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: 'calc(100vh - 56px)',
        padding: '64px 32px',
        background: 'var(--color-surface)',
        textAlign: 'center',
      }}
    >
      <div className="w-full" style={{ maxWidth: '880px' }}>

        {/* 1. 영문 라벨 (§9.C-5) */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '24px',
            wordBreak: 'keep-all',
          }}
        >
          ARCHITECTURE ACADEMY
        </div>

        {/* 2. Hero 제목 — 결과 서술형 (§9.F.4) */}
        <h1
          style={{
            fontFamily: 'var(--font-heading, var(--font-body))',
            fontSize: 'clamp(48px, 7vw, 88px)',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            color: 'var(--color-text-primary)',
            wordBreak: 'keep-all',
            marginBottom: '28px',
          }}
        >
          낯선 IT 용어가<br />
          한눈에 들어오는 지도가 됩니다.
        </h1>

        {/* 3. 캡션 */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: 1.55,
            color: 'var(--color-text-body)',
            maxWidth: '640px',
            wordBreak: 'keep-all',
            margin: '0 auto 56px',
          }}
        >
          71개의 질문과 답으로 만든 학습 코스. 비전공자도 컴퓨터 · 개발 · 데이터베이스 · 네트워크 · 아키텍처를 한 흐름으로 이해해요.
        </p>

        {/* 4. CTA Cluster — Secondary 왼쪽 / Primary 오른쪽 (§9-A2.3) */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          role="group"
          aria-label="학습 시작 또는 이어 학습하기"
        >
          {hasResume && (
            <button
              type="button"
              onClick={handleResume}
              data-cta="secondary"
              className="cursor-pointer transition-colors"
              style={{
                height: '56px',
                padding: '0 32px',
                background: 'var(--color-surface)',
                color: 'var(--color-text-body)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn-landing, 9999px)',
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.005em',
              }}
            >
              이어 학습하기
            </button>
          )}
          <button
            type="button"
            onClick={handleStart}
            data-cta="primary"
            className="cursor-pointer transition-colors"
            style={{
              height: '56px',
              padding: '0 32px',
              background: 'var(--color-btn-primary, var(--color-text-primary))',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: 'var(--radius-btn-landing, 9999px)',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '-0.005em',
            }}
          >
            학습 시작하기
          </button>
        </div>

        {/* 5. Ghost CTA: §9-A2 학습형은 Ghost 미적용 */}

      </div>
    </main>
  );
}
