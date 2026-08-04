import { useState } from 'react';

export default function SignIn({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-color)', padding: '20px', paddingTop: '60px'}}>
      
      <div style={{width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', background: 'white'}}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </div>

      <div className="card" style={{width: '100%', maxWidth: '400px', padding: '32px 24px'}}>
        <h1 style={{textAlign: 'center', fontSize: '24px', marginBottom: '8px'}}>Welcome Back</h1>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5'}}>
          Log in to manage your grid forecasting and energy distribution analytics.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <div style={{position: 'relative'}}>
              <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{paddingRight: '40px', background: 'transparent'}} />
              <svg style={{position: 'absolute', right: '12px', top: '14px', color: '#cbd5e1'}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
          </div>

          <div className="input-group" style={{marginBottom: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <label style={{marginBottom: 0}}>PASSWORD</label>
              <a href="#" style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-blue)', textDecoration: 'none'}}>Forgot Password?</a>
            </div>
            <div style={{position: 'relative', marginTop: '8px'}}>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{paddingRight: '40px', background: 'transparent'}} />
              <svg style={{position: 'absolute', right: '12px', top: '14px', color: '#cbd5e1'}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{padding: '14px'}}>Sign In</button>
        </form>

        <div style={{display: 'flex', alignItems: 'center', margin: '32px 0'}}>
          <hr style={{flex: 1, border: 'none', borderTop: '1px solid var(--border-color)'}} />
          <span style={{padding: '0 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>OR ENTERPRISE SSO</span>
          <hr style={{flex: 1, border: 'none', borderTop: '1px solid var(--border-color)'}} />
        </div>

        <div style={{display: 'flex', gap: '16px'}}>
          <button style={{flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
             Google
          </button>
          <button style={{flex: 1, padding: '12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V0H0v11h11zm13 0V0H13v11h11zM11 24V13H0v11h11zm13 0V13H13v11h11z"/></svg> Microsoft
          </button>
        </div>

        <p style={{textAlign: 'center', fontSize: '14px', marginTop: '32px'}}>
          New to SolarAI? <a href="#" style={{fontWeight: 'bold', color: 'var(--accent-blue)', textDecoration: 'none'}}>Create an Account</a>
        </p>
      </div>

      <div style={{textAlign: 'center', marginTop: '24px'}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#d97706', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          Secure Grid Protocol Active
        </div>
        <p style={{fontSize: '12px', color: '#94a3b8', maxWidth: '300px'}}>
          By continuing, you agree to our <a href="#" style={{color: '#94a3b8', textDecoration: 'underline'}}>Terms of Service</a> and <a href="#" style={{color: '#94a3b8', textDecoration: 'underline'}}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
