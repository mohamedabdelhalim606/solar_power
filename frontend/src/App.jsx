import { useState } from 'react';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import PredictionForm from './pages/PredictionForm';
import Analytics from './pages/Analytics';
import OperationalReport from './pages/OperationalReport';
import BottomNav from './components/BottomNav';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, signin, app
  const [activeTab, setActiveTab] = useState('predict'); // predict, analytics, trends, alerts
  const [predictionData, setPredictionData] = useState(null);

  const handlePredict = (data) => {
    setPredictionData(data);
    setActiveTab('report'); // switch to report view internally
  };

  const handleBackToForm = () => {
    setPredictionData(null);
    setActiveTab('predict');
  };

  const login = () => {
    setCurrentView('app');
    setActiveTab('predict');
  };

  return (
    <div className="app-container">
      {currentView === 'landing' && <Landing onSignIn={() => setCurrentView('signin')} onStart={() => setCurrentView('signin')} />}
      
      {currentView === 'signin' && <SignIn onLogin={login} />}
      
      {currentView === 'app' && (
        <div className="container">
          <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <span style={{fontWeight: 'bold', fontSize: '18px', color: '#8b4513'}}>SolarAI Forecast</span>
            </div>
            <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b'}}></div>
            </div>
          </header>

          <main>
            {activeTab === 'predict' && <PredictionForm onPredict={handlePredict} />}
            {activeTab === 'report' && <OperationalReport predictionData={predictionData} onBack={handleBackToForm} />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'trends' && <div style={{textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)'}}>Trends dashboard coming soon</div>}
            {activeTab === 'alerts' && <div style={{textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)'}}>Alerts coming soon</div>}
          </main>

          <BottomNav activeTab={activeTab === 'report' ? 'predict' : activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
    </div>
  );
}

export default App;
