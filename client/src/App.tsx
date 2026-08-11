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

function AppShell() {
  const { pathname } = useLocation();
  const hideNav = isStudentRoute(pathname);
  return (
    <div className="app-shell flex min-h-screen flex-col">
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
