import LandingPage from './pages/LandingPage';
import ServiceHeader from './components/layout/ServiceHeader';

export default function App() {
  return (
    <div className="app-shell">
      <ServiceHeader />
      <LandingPage />
    </div>
  );
}
