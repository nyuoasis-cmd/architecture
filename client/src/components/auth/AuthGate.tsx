import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { setPostLoginRedirect, useAuth } from '../../lib/auth';

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[920px] items-center justify-center px-6 py-10">
        <section className="w-full rounded-xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-sm font-medium text-stone-500">인증 확인 중</p>
          <p className="text-sm text-stone-600">로그인 상태를 확인하고 있습니다.</p>
        </section>
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    const target = `${location.pathname}${location.search}${location.hash}`;
    setPostLoginRedirect(target);
    return <Navigate replace to={`/login?from=${encodeURIComponent(target)}`} />;
  }

  return <>{children}</>;
}
