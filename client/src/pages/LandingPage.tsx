import { Link } from 'react-router-dom';

type ClientEnv = ImportMeta & {
  env: Record<string, string | undefined>;
};

const clientEnv = import.meta as ClientEnv;

const hasSupabaseEnv = Boolean(
  clientEnv.env.VITE_SUPABASE_URL && clientEnv.env.VITE_SUPABASE_ANON_KEY,
);

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <p className="landing-kicker">Architecture Academy</p>
        <h1 className="landing-title">Architecture Academy</h1>
        <p className="landing-subtitle">
          비전공자도 IT 전체 그림을 30분 안에 이해할 수 있도록, 책 『기술노트』 기반 학습
          흐름을 단계별로 정리하는 티처메이트 학습 서비스입니다.
        </p>
        <div className="landing-actions">
          <button className="primary-button" type="button" disabled>
            카카오 로그인 준비 중
          </button>
          <div className="landing-action-links">
            <a className="secondary-link" href="/dev-login">
              DEV 로그인 바로가기
            </a>
            <Link className="secondary-link" to="/library">
              라이브러리 시작
            </Link>
          </div>
        </div>
        <p className="landing-caption">
          이번 PR은 스캐폴드 단계입니다. 본 학습 화면과 세션 기능은 후속 PR에서 연결됩니다.
        </p>
        {!hasSupabaseEnv ? (
          <p className="landing-note">VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 아직 설정되지 않았습니다.</p>
        ) : null}
      </section>
    </main>
  );
}
