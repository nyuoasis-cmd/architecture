import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { clearDevUser, getDevUser, setDevUser } from '../lib/dev-auth';

export default function DevLoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const saved = getDevUser();
  const [id, setId] = useState(saved?.id ?? '');
  const [name, setName] = useState(saved?.name ?? 'DEV Teacher');

  const target = searchParams.get('from') ?? '/teacher';
  const isDevBuild = Boolean(import.meta.env.DEV);

  if (!isDevBuild) {
    return <Navigate replace to="/forbidden" />;
  }

  if (!auth.isLoading && auth.isAuthenticated) {
    return <Navigate replace to={target} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 items-center px-6 py-12">
      <section className="w-full rounded-[28px] border border-[var(--color-border)] bg-white p-7 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-400">DEV Auth</p>
        <h1 className="mt-3 text-3xl font-medium text-stone-900">DEV 로그인</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          PR #7 OAuth 전까지 교사 세션 검증용으로 `auth.users.id`에 존재하는 UUID를 직접 저장합니다.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">교사 UUID</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
              onChange={(event) => setId(event.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              value={id}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-700">표시 이름</span>
            <input
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50 px-4 py-3 outline-none focus:border-stone-400"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-2xl bg-stone-950 px-5 text-sm font-medium text-white"
            onClick={() => {
              setDevUser({ id: id.trim(), name: name.trim() || 'DEV Teacher' });
              navigate(target);
            }}
            type="button"
          >
            저장 후 이동
          </button>
          <button
            className="btn-ghost-sm"
            onClick={() => {
              clearDevUser();
              setId('');
            }}
            type="button"
          >
            저장값 지우기
          </button>
        </div>
      </section>
    </main>
  );
}
