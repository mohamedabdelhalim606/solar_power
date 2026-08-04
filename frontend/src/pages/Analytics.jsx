import { useState, useEffect } from 'react';

const apiBase = import.meta.env.VITE_API_BASE || '';

function formatTimestamp(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts.replace(' ', 'T') + 'Z');
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ts; }
}

function formatKw(v) {
  if (v == null) return '—';
  return `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })} kW`;
}

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('30');
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Fetch real history from backend ─────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${apiBase}/api/history?limit=50`)
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then(data => {
        setHistory(data.history || []);
      })
      .catch(err => {
        setError(err.message);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Derived summary stats ─────────────────────────────────────────────
  const totalPredictions = history.length;
  const avgKw = totalPredictions > 0
    ? history.reduce((s, h) => s + (h.predicted_kw || 0), 0) / totalPredictions
    : 0;
  const maxKw = totalPredictions > 0
    ? Math.max(...history.map(h => h.predicted_kw || 0))
    : 0;
  const nightCount = history.filter(h => h.night_masked).length;

  // ── Bar chart data (last 7 entries) ──────────────────────────────────
  const chartData = history.slice(0, 7).reverse();
  const chartMax  = chartData.length > 0 ? Math.max(...chartData.map(h => h.predicted_kw || 0), 1) : 1;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>Performance Overview</div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Fleet Analytics</h2>

      {/* Timeframe toggle */}
      <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px', marginBottom: '24px', alignItems: 'center' }}>
        {['30', '90'].map(tf => (
          <button
            key={tf}
            style={{ padding: '8px 16px', background: timeframe === tf ? 'white' : 'transparent', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', boxShadow: timeframe === tf ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', color: timeframe === tf ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            onClick={() => setTimeframe(tf)}
          >
            {tf} Days
          </button>
        ))}
        <div style={{ padding: '0 12px', color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <p style={{ marginTop: '12px' }}>Loading history from backend…</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#dc2626', fontSize: '13px' }}>
          <strong>Could not load history:</strong> {error}
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#991b1b' }}>Make sure the backend is running and CORS is configured correctly.</div>
        </div>
      ) : (
        <>
          {/* Total Predictions */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Predictions Made</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '8px' }}>
              {totalPredictions}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {nightCount > 0 && `${nightCount} night-masked · `}Live from database
            </div>
          </div>

          {/* Average Power */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Average Predicted Power</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-blue)', marginBottom: '8px' }}>
              {formatKw(avgKw)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Across all recorded forecasts</div>
          </div>

          {/* Peak Prediction */}
          <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--accent-orange)' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Peak Forecast</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>{formatKw(maxKw)}</div>
            <div style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
              Highest recorded prediction
            </div>
          </div>

          {/* ── Bar Chart ─────────────────────────────────────────────── */}
          {chartData.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Recent Forecasts</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last {chartData.length} predictions</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)', display: 'inline-block' }}></span> Predicted kW
                  </div>
                </div>
              </div>

              <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', justifyContent: 'space-between', marginBottom: '8px' }}>
                {chartData.map((h, i) => {
                  const heightPct = chartMax > 0 ? ((h.predicted_kw || 0) / chartMax) * 100 : 0;
                  return (
                    <div key={h.id ?? i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        title={`${formatKw(h.predicted_kw)}\n${formatTimestamp(h.timestamp)}`}
                        style={{
                          width: '100%',
                          height: `${Math.max(heightPct, 2)}%`,
                          background: h.night_masked
                            ? '#94a3b8'
                            : 'linear-gradient(to top, var(--accent-orange), #f97316)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.6s ease',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                {chartData.map((h, i) => (
                  <span key={i}>{formatTimestamp(h.timestamp).split(',')[0]}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── History Table ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Prediction Log</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Real-time data from backend database</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.4 }}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/><circle cx="9" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></svg>
              <p>No predictions yet. Run your first forecast!</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '12px 16px', background: '#f8f9fa', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <div>Timestamp</div>
                <div>Predicted</div>
                <div>Horizon</div>
                <div>Status</div>
              </div>

              {history.map((row, index) => (
                <div
                  key={row.id ?? index}
                  style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: index < history.length - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '13px', alignItems: 'center' }}
                >
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {formatTimestamp(row.timestamp)}
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>
                    {formatKw(row.predicted_kw)}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {row.horizon_min ? `${row.horizon_min}min` : '—'}
                  </div>
                  <div>
                    {row.night_masked ? (
                      <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>Night</span>
                    ) : (
                      <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>OK</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
