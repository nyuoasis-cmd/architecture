import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ServiceHeader from './components/layout/ServiceHeader';
import DevLoginPage from './pages/DevLoginPage';
import JoinPage from './pages/JoinPage';
import LandingPage from './pages/LandingPage';
import LearnPage from './pages/LearnPage';
import LibraryPage from './pages/LibraryPage';
import NotFoundPage from './pages/NotFoundPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherSessionPage from './pages/TeacherSessionPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell flex min-h-screen flex-col">
        <ServiceHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dev-login" element={<DevLoginPage />} />
          <Route path="/teacher" element={<TeacherDashboardPage />} />
          <Route path="/teacher/session/:id" element={<TeacherSessionPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:chapterId/:qaId" element={<LearnPage mode="self" />} />
          <Route path="/learn/:sessionId" element={<LearnPage mode="session" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
