import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherSessionPage from './pages/TeacherSessionPage';
import ShowcasePage from './demos/_preview/ShowcasePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell flex min-h-screen flex-col">
        <ServiceHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
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
    </BrowserRouter>
  );
}
