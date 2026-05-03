import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function LandingPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const teacherEntryPath = auth.isAuthenticated ? '/teacher' : '/login';

  return (
    <main className="hero-page" role="main">
      <div className="hero-inner">
        <div className="hero-label">ARCHITECTURE</div>

        <h1 className="hero-title">
          복잡한 IT 흐름이
          <br />
          한 화면 학습이 됩니다.
        </h1>

        <p className="hero-caption">
          10개 챕터 71문항으로 IT 전체 그림을 따라가요.<br />
          교사 세션 코드 하나로 반 전체가 함께 학습해요.
        </p>

        <div className="hero-cta-cluster" role="group" aria-label="수업 시작">
          <button
            className="cta cta-secondary"
            data-cta="secondary"
            onClick={() => navigate('/join')}
          >
            수업 참여하기
          </button>
          <button
            className="cta cta-primary"
            data-cta="primary"
            onClick={() => navigate(teacherEntryPath)}
          >
            수업 만들기
          </button>
        </div>
      </div>
    </main>
  );
}
