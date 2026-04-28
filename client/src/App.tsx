import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ServiceHeader from './components/layout/ServiceHeader';
import LandingPage from './pages/LandingPage';
import LearnPage from './pages/LearnPage';
import LibraryPage from './pages/LibraryPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell flex min-h-screen flex-col">
        <ServiceHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:chapterId/:qaId" element={<LearnPage mode="self" />} />
          <Route path="/learn/:sessionId" element={<LearnPage mode="session" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
