import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { consumePostLoginRedirect, useAuth } from '../lib/auth';
import { supabaseClient } from '../lib/supabase-client';

function parseHashParams(hash: string) {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(fragment);
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowToast(true);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!supabaseClient) {
      setError('Supabase 클라이언트가 설정되지 않았습니다.');
      return;
    }

    const params = parseHashParams(window.location.hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      if (auth.isAuthenticated) {
        navigate(consumePostLoginRedirect() ?? '/teacher', { replace: true });
        return;
      }

      setError('OAuth 콜백 토큰을 찾지 못했습니다.');
      return;
    }

    void supabaseClient.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        navigate(consumePostLoginRedirect() ?? '/teacher', { replace: true });
      });
  }, [auth.isAuthenticated, navigate]);

  if (!auth.isLoading && auth.isAuthenticated && !window.location.hash) {
    return <Navigate replace to={consumePostLoginRedirect() ?? '/teacher'} />;
  }

  return (
    <>
      <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
        <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-quaternary)]">OAuth Callback</p>
          <h1 className="mt-3 text-3xl font-medium text-[var(--color-text-primary)]">로그인 정보를 확인하는 중입니다</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-body)]">
            카카오 인증 결과를 Supabase 세션으로 저장한 뒤 교사 화면으로 이동합니다.
          </p>
          {error ? <p className="mt-5 text-sm text-rose-700">{error}</p> : null}
        </section>
      </main>

      {showToast ? (
        <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--color-btn-primary-hover)] px-4 py-2 text-sm text-white shadow-lg">
          {error
            ? '인증 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.'
            : '인증 처리에 시간이 걸리면 브라우저가 자동으로 이동할 때까지 기다려주세요.'}
        </div>
      ) : null}
    </>
  );
}
