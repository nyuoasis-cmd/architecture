import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { getPostLoginRedirect, signInKakao, useAuth } from '../lib/auth';

const isDevBuild = Boolean(import.meta.env.DEV);
const hasSupabaseEnv = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const target = searchParams.get('from') ?? getPostLoginRedirect() ?? '/teacher';

  if (!auth.isLoading && auth.isAuthenticated) {
    return <Navigate replace to={target} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid w-full gap-8 rounded-[32px] border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_380px] lg:p-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">Teacher Access</p>
          <h1 className="mt-3 text-4xl font-medium text-stone-950">교사로 시작</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            카카오 OAuth 또는 개발용 DEV 로그인으로 교사 대시보드에 진입합니다. 로그인 후에는 내 세션 생성,
            진행 현황 확인, 세션 종료까지 같은 계정으로 이어집니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#FEE500] px-6 text-sm font-semibold text-[#191600] transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={!hasSupabaseEnv || isSubmitting}
              onClick={async () => {
                setError(null);
                setIsSubmitting(true);

                try {
                  await signInKakao(target);
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : '카카오 로그인을 시작하지 못했습니다.');
                  setIsSubmitting(false);
                }
              }}
              type="button"
            >
              {isSubmitting ? '카카오로 이동 중...' : '카카오로 로그인'}
            </button>

            {isDevBuild ? (
              <Link
                className="flex w-full min-h-12 items-center justify-center rounded-2xl border border-[var(--color-border)] px-5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 sm:w-auto"
                to={`/dev-login?from=${encodeURIComponent(target)}`}
              >
                DEV 로그인
              </Link>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
          {!hasSupabaseEnv ? (
            <p className="mt-4 text-sm text-amber-700">VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 비어 있습니다.</p>
          ) : null}
        </div>

        <aside className="rounded-[28px] bg-stone-50 p-6">
          <p className="text-sm font-medium text-stone-900">진입 경로</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            로그인 완료 후 <span className="font-mono text-stone-900">{target}</span> 로 이동합니다.
          </p>
          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <p>1. 카카오 OAuth는 Supabase Auth Provider 설정을 사용합니다.</p>
            <p>2. DEV 로그인은 개발 빌드에서만 노출됩니다.</p>
            <p>3. 권한이 없는 세션은 `/forbidden`으로 이동합니다.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
