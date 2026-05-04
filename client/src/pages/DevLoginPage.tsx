import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabaseClient } from '../lib/supabase-client';

export default function DevLoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('nyuoasis@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const target = searchParams.get('from') ?? '/teacher';
  const isDevBuild = Boolean(import.meta.env.DEV);

  if (!isDevBuild) {
    return <Navigate replace to="/forbidden" />;
  }

  if (!auth.isLoading && auth.isAuthenticated) {
    return <Navigate replace to={target} />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!supabaseClient) {
      setError('Supabase 환경변수가 설정되지 않았습니다 (.env의 VITE_SUPABASE_URL/ANON_KEY 확인).');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate(target);
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-7 shadow-sm"
      >
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">DEV Auth</p>
        <h1 className="mt-3 text-3xl font-medium text-stone-900">DEV 로그인</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          운영자/QA 계정으로 빠르게 로그인해요. 이 화면은 개발 환경에서만 보여요.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">이메일</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">비밀번호</span>
            <input
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
            />
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white disabled:cursor-default disabled:bg-stone-400"
          >
            {loading ? '로그인 중…' : '로그인'}
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-stone-500">
          이 페이지는 개발 빌드(<code className="font-mono">npm run dev</code>)에서만 보여요.
          프로덕션 빌드에서는 카카오 로그인으로 자동 전환돼요.
        </p>
      </form>
    </main>
  );
}
