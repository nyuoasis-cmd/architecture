import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AuthGate from './components/auth/AuthGate';
import ServiceHeader from './components/layout/ServiceHeader';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AboutPage from './pages/AboutPage';
import DevLoginPage from './pages/DevLoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import JoinPage from './pages/JoinPage';
import LandingPage from './pages/LandingPage';
import LearnPage from './pages/LearnPage';
import LibraryPage from './pages/LibraryPage';
import NotFoundPage from './pages/NotFoundPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherSessionPage from './pages/TeacherSessionPage';
import ShowcasePage from './demos/_preview/ShowcasePage';

// 학생 진입/세션 라우트 = 교사 공통 네비(teachermate-nav) 미렌더 (DESIGN-POLICY §9.H-19 역방향 금지).
// 교사·공개 라우트(랜딩·/teacher·/library·about 등)는 네비 유지.
function isStudentRoute(pathname: string): boolean {
  return (
    pathname === '/join' ||
    pathname.startsWith('/learn/')
  );
}

/**
 * 학습 화면은 «문서가 아니라 작업대»다 — 세 컬럼이 각자 스크롤하고, 페이지 자체는 안 흐른다.
 * 🚨 그래서 이 라우트에서만 셸을 화면 높이에 **고정**한다(h-screen + overflow-hidden).
 *    예전에는 학습 화면이 «100dvh − 56px»로 제 높이를 손수 계산했는데, 공용 네비는 CDN 웹 컴포넌트라
 *    실제 높이가 103px 이었다. 47px 만큼 아래가 잘려 좌측 「이전 장/다음 장」과 하단 요소가
 *    화면 밖에 있었다. 셸이 높이를 정해 주면 헤더가 몇 px 이든 학습 화면은 알아서 남은 만큼 쓴다.
 */
function isFixedHeightRoute(pathname: string): boolean {
  return pathname.startsWith('/learn/') || /^\/library\/[^/]+\/[^/]+/.test(pathname);
}

function AppShell() {
  const { pathname } = useLocation();
  const hideNav = isStudentRoute(pathname);
  const fixedHeight = isFixedHeightRoute(pathname);
  return (
    <div
      className={`app-shell flex flex-col ${fixedHeight ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
    >
      {!hideNav && <ServiceHeader />}
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<Navigate to="/teacher" replace />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dev-login" element={<DevLoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/teacher"
            element={
              <AuthGate>
                <TeacherDashboardPage />
              </AuthGate>
            }
          />
          <Route
            path="/teacher/session/:id"
            element={
              <AuthGate>
                <TeacherSessionPage />
              </AuthGate>
            }
          />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:chapterId/:qaId" element={<LearnPage mode="self" />} />
          <Route path="/learn/:sessionId" element={<LearnPage mode="session" />} />
          <Route path="/demos-preview/showcase" element={<ShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
