export default function OperationalReport({ predictionData, onBack }) {
  return (
    <div style={{paddingBottom: '80px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', cursor: 'pointer'}} onClick={onBack}>
        <span>Forecasts</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>Results #82941</span>
      </div>

      <h2 style={{color: 'var(--accent-blue)', fontSize: '24px', marginBottom: '8px'}}>Operational Report</h2>
      <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px'}}>Generation window: Oct 24 - Oct 25, 2023</p>

      <div style={{display: 'flex', gap: '12px', marginBottom: '32px'}}>
        <button style={{flex: 1, padding: '12px', background: '#e2e8f0', color: 'var(--accent-blue)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Report
        </button>
        <button style={{flex: 1, padding: '12px', background: '#8b4513', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          View Analytics
        </button>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px'}}>Predicted Energy Output</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px'}}>
          <div style={{fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-blue)'}}>420.5 <span style={{fontSize: '16px', color: 'var(--text-primary)'}}>MWh</span></div>
          <div style={{display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px'}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            +12.4% vs Avg
          </div>
        </div>

        <div style={{display: 'flex', gap: '16px', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width: '8px', height: '8px', borderRadius: '50%', background: '#8b4513'}}></span> Forecasted</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)'}}></span> Historical</div>
          <div style={{marginLeft: 'auto'}}>Resolution: 15m</div>
        </div>
        
        {/* Chart Placeholder */}
        <div style={{height: '120px', position: 'relative', borderBottom: '1px solid var(--border-color)', marginBottom: '8px', display: 'flex', alignItems: 'flex-end'}}>
          <svg width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', top: 0, left: 0}}>
             <path d="M0,80 Q20,80 40,60 T80,20 T150,100 T200,60 T300,50" fill="none" stroke="#8b4513" strokeWidth="2" />
             <path d="M0,100 Q30,100 50,80 T100,50 T150,110 T200,80 T300,70" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
          </svg>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>
          <span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
        </div>
      </div>

      <div className="card" style={{marginBottom: '16px', borderLeft: '4px solid var(--success-green)'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Forecast Confidence</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <div style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--success-green)'}}>High</div>
          <div style={{display: 'flex', gap: '2px'}}>
            {[1,2,3,4].map(i => <div key={i} style={{width: '4px', height: '16px', background: 'var(--success-green)', borderRadius: '2px'}}></div>)}
            <div style={{width: '4px', height: '16px', background: '#cbd5e1', borderRadius: '2px'}}></div>
          </div>
        </div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Variance margin within ±2.4% based on satellite clarity.</div>
      </div>

      <div className="card" style={{marginBottom: '16px', background: '#475569', color: 'white'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Efficiency Score</div>
        <div style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '12px'}}>94 %</div>
        <div style={{width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden'}}>
          <div style={{width: '94%', height: '100%', background: 'var(--accent-orange)'}}></div>
        </div>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Peak Production Time</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b4513" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          <span style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-blue)'}}>13:45</span>
          <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>LST</span>
        </div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Expected yield at peak: <span style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>52.1 MW</span></div>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
          <div>
            <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>Grid Stability</div>
            <div style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-blue)'}}>Optimal</div>
          </div>
          <div style={{background: '#d1fae5', padding: '8px', borderRadius: '8px', color: '#065f46'}}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
        </div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Local grid frequency remaining stable at 60.02 Hz. No curtailment risks predicted for the forecast window.</div>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
          <div>
            <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>Weather Impact</div>
            <div style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-blue)'}}>Scattered</div>
          </div>
          <div style={{background: '#fef3c7', padding: '8px', borderRadius: '8px', color: '#d97706'}}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/></svg>
          </div>
        </div>
        <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
          <span style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>CLOUD 12%</span>
          <span style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>WIND 5KM/H</span>
        </div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Low atmospheric aerosol levels contributing to high PV transmittance scores.</div>
      </div>

      <div className="card" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
          <div>
            <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px'}}>System Status</div>
            <div style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-blue)'}}>Active</div>
          </div>
          <div style={{background: '#e0e7ff', padding: '8px', borderRadius: '8px', color: 'var(--accent-blue)'}}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
          <span style={{color: 'var(--text-secondary)'}}>Inverters Online</span>
          <span style={{fontWeight: 'bold'}}>48/48</span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
          <span style={{color: 'var(--text-secondary)'}}>Sync Latency</span>
          <span style={{fontWeight: 'bold', color: 'var(--success-green)'}}>14ms</span>
        </div>
      </div>

      <h3 style={{fontSize: '18px', color: 'var(--accent-blue)', marginBottom: '16px'}}>Forecast Environmental Insights</h3>
      
      <div style={{height: '140px', background: 'linear-gradient(to right, #4f46e5, #3b82f6)', borderRadius: '12px', marginBottom: '16px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', bottom: '16px', left: '16px', color: 'white'}}>
          <div style={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', opacity: 0.9}}>Site View: Alpha Sector</div>
          <div style={{fontSize: '16px', fontWeight: 'bold'}}>Optimal Zenith Alignment</div>
        </div>
      </div>

      <div style={{height: '140px', background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '12px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', bottom: '16px', left: '16px', color: 'white'}}>
          <div style={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', opacity: 0.9}}>Algorithmic Update</div>
          <div style={{fontSize: '16px', fontWeight: 'bold'}}>V4.2 Engine Active</div>
        </div>
      </div>

    </div>
  );
}
