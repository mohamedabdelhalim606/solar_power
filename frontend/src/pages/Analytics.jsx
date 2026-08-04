import { useState } from 'react';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('30');

  const history = [
    { date: 'Oct 24, 2023', forecast: '42.4 MWh', actual: '41.8 MWh' },
    { date: 'Oct 23, 2023', forecast: '38.1 MWh', actual: '39.5 MWh' },
    { date: 'Oct 22, 2023', forecast: '29.8 MWh', actual: '27.2 MWh' },
    { date: 'Oct 21, 2023', forecast: '45.0 MWh', actual: '44.9 MWh' },
  ];

  return (
    <div style={{paddingBottom: '80px'}}>
      <div style={{textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px'}}>Performance Overview</div>
      <h2 style={{fontSize: '28px', marginBottom: '24px'}}>Fleet Analytics</h2>

      <div style={{display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', marginBottom: '24px', alignItems: 'center'}}>
        <button 
          style={{padding: '8px 16px', background: timeframe === '30' ? 'white' : 'transparent', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', boxShadow: timeframe === '30' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', color: timeframe === '30' ? 'var(--text-primary)' : 'var(--text-secondary)'}}
          onClick={() => setTimeframe('30')}
        >
          30 Days
        </button>
        <button 
          style={{padding: '8px 16px', background: timeframe === '90' ? 'white' : 'transparent', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', boxShadow: timeframe === '90' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', color: timeframe === '90' ? 'var(--text-primary)' : 'var(--text-secondary)'}}
          onClick={() => setTimeframe('90')}
        >
          90 Days
        </button>
        <div style={{padding: '0 12px', color: 'var(--text-secondary)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Total Monthly Generation</div>
        <div style={{fontSize: '32px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '12px'}}>1.24 <span style={{fontSize: '20px'}}>GWh</span></div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success-green)" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          <span style={{color: 'var(--success-green)', fontWeight: 'bold'}}>+12.5%</span> vs last month
        </div>
      </div>

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Avg Efficiency</div>
        <div style={{fontSize: '32px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '12px'}}>94.2 <span style={{fontSize: '20px'}}>%</span></div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success-green)" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          <span style={{color: 'var(--success-green)', fontWeight: 'bold'}}>+0.8%</span> Fleet-wide optimization
        </div>
      </div>

      <div className="card" style={{marginBottom: '24px', borderLeft: '4px solid var(--accent-orange)'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Active Panels</div>
        <div style={{fontSize: '32px', fontWeight: '800', marginBottom: '12px'}}>14,802</div>
        <div style={{display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px'}}>
          99.1% Operational
        </div>
      </div>

      <div className="card" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px'}}>
          <div>
            <h3 style={{fontSize: '18px', marginBottom: '4px'}}>Generation Trends</h3>
            <p style={{fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px', lineHeight: '1.4'}}>Power output across primary solar farm clusters</p>
          </div>
          <div style={{display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 'bold'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)'}}></span> Forecast</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}><span style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)'}}></span> Actual</div>
          </div>
        </div>
        
        {/* Placeholder Chart */}
        <div style={{height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'space-between', marginBottom: '8px'}}>
          {[40, 60, 90, 70, 100, 50, 45].map((h, i) => (
            <div key={i} style={{width: '12%', height: `${h}%`, background: '#f1f5f9', borderRadius: '4px 4px 0 0'}}></div>
          ))}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>
          <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
        </div>
      </div>

      <div className="card" style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Cloud Cover Impact</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px'}}>
            Low <span style={{fontSize: '12px', color: 'var(--success-green)'}}>Optimum State</span>
          </div>
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fef3c7" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
      </div>

      <div className="card" style={{marginBottom: '32px'}}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Upcoming Peak</div>
        <div style={{fontSize: '24px', fontWeight: 'bold', color: '#8b4513', marginBottom: '8px'}}>12:45 <span style={{fontSize: '14px'}}>PM</span></div>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Estimated grid saturation: 88%</div>
      </div>

      <h3 style={{fontSize: '18px', marginBottom: '4px'}}>Historical Forecasts</h3>
      <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px'}}>Archived prediction performance logs</p>
      
      <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
        <button style={{padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filter
        </button>
        <button style={{padding: '8px 16px', background: '#8b4513', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export CSV
        </button>
      </div>

      <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'}}>
        <div style={{display: 'flex', padding: '16px', background: '#f8f9fa', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>
          <div style={{flex: 1}}>Date</div>
          <div style={{flex: 1}}>Forecasted<br/>Gen</div>
          <div style={{flex: 1}}>Actual<br/>Gen</div>
        </div>
        {history.map((row, index) => (
          <div key={index} style={{display: 'flex', padding: '16px', borderBottom: index < history.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '14px'}}>
            <div style={{flex: 1, color: 'var(--text-secondary)', paddingRight: '8px', fontSize: '12px'}}>{row.date.split(',').map((p,i) => <div key={i}>{p}{i===0?',':''}</div>)}</div>
            <div style={{flex: 1, fontWeight: '500'}}>{row.forecast}</div>
            <div style={{flex: 1, fontWeight: '500'}}>{row.actual}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
