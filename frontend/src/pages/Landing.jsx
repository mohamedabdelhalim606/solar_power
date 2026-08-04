export default function Landing({ onSignIn, onStart }) {
  return (
    <div style={{background: 'linear-gradient(180deg, #f8f9fa 0%, #e2e8f0 100%)', minHeight: '100vh'}}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
          <span style={{fontWeight: 'bold', fontSize: '18px', color: '#8b4513'}}>SolarAI Forecast</span>
        </div>
        <div style={{cursor: 'pointer'}} onClick={onSignIn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </header>

      <div style={{padding: '40px 20px', textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)'}}>
          LATEST: Global Solar Data Integrated
        </div>
        
        <h1 style={{fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px'}}>
          AI-Powered <span style={{color: 'var(--accent-orange)'}}>Solar Forecasting</span>
        </h1>
        
        <p style={{fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px'}}>
          Predict future solar generation with machine learning precision. Optimize grid stability and maximize renewable yields.
        </p>
        
        <button className="btn-primary" onClick={onStart} style={{marginBottom: '16px', padding: '16px'}}>Start Forecasting</button>
        <button style={{width: '100%', padding: '16px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)'}}>View Live Demo</button>
      </div>

      <div style={{padding: '40px 20px', background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px'}}>
        <h2 style={{textAlign: 'center', marginBottom: '8px', fontSize: '20px'}}>Engineered for Energy Professionals</h2>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px'}}>Precision-driven tools for sustainability officers, grid operators, and renewable energy traders.</p>

        <div className="card" style={{border: '1px solid var(--border-color)', boxShadow: 'none'}}>
          <div style={{background: '#fef3c7', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent-orange)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <h3 style={{marginBottom: '8px'}}>AI Predictions</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px'}}>Leverage transformer-based neural networks to predict solar irradiance with hyper-local granularity.</p>
          <ul style={{listStyle: 'none', padding: 0, fontSize: '12px', color: 'var(--text-secondary)'}}>
            <li style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}><svg width="14" height="14" stroke="var(--success-green)" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Minute-Level Analysis</li>
            <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="14" height="14" stroke="var(--success-green)" fill="none" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Global Weather Matching</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
