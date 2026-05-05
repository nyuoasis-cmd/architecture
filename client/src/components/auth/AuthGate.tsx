import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../lib/auth';
import { getServiceLoginUrl } from '../../lib/login-url';

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      if (import.meta.env.DEV) {
        window.location.href = `/dev-login?returnUrl=${encodeURIComponent(window.location.href)}`;
        return;
      }

      window.location.href = getServiceLoginUrl();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

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
    return null;
  }

  return <>{children}</>;
}
