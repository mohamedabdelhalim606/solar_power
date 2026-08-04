export default function OperationalReport({ predictionData, onBack }) {
  const data = predictionData || {};

  // ── Derived display values ─────────────────────────────────────────────────
  const predictedKw   = typeof data.predicted_kw  === 'number' ? data.predicted_kw  : null;
  const predictedMwh  = typeof data.predicted_mwh === 'number' ? data.predicted_mwh : null;
  const horizonMin    = data.horizon_minutes ?? 1440;
  const horizonLabel  = horizonMin >= 60
    ? `${(horizonMin / 60).toFixed(0)}h ahead`
    : `${horizonMin}min ahead`;
  const nominalMw     = data.nominal_power_mw ? Number(data.nominal_power_mw) : null;
  const modelUsed     = data.model_used    ?? '—';
  const nightMasked   = data.night_masked  ?? false;
  const numPanels     = data.num_panels    ?? data.input?.num_panels ?? '—';
  const efficiency    = data.panel_efficiency_pct ?? data.input?.panel_efficiency_pct ?? '—';
  const latitude      = data.latitude     ?? data.input?.latitude  ?? '—';
  const longitude     = data.longitude    ?? data.input?.longitude ?? '—';

  // Capacity factor (predicted kW / nominal kW)
  const nominalKw      = nominalMw ? nominalMw * 1000 : null;
  const capacityFactor = predictedKw != null && nominalKw
    ? Math.min(100, (predictedKw / nominalKw) * 100).toFixed(1)
    : null;

  const formatKw = (v) => v != null ? `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} kW` : '—';
  const formatMwh = (v) => v != null ? `${(v * 1000).toFixed(4)} kWh` : '—';

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', cursor: 'pointer' }}
        onClick={onBack}
      >
        <span>Forecasts</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>AI Results</span>
      </div>

      <h2 style={{ color: 'var(--accent-blue)', fontSize: '24px', marginBottom: '4px' }}>Operational Report</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Forecast horizon: {horizonLabel} · Model: {modelUsed}
      </p>

      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: 'var(--accent-blue)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          New Forecast
        </button>
        <button
          style={{ flex: 1, padding: '12px', background: '#8b4513', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          View Analytics
        </button>
      </div>

      {/* ── Night-Masked Warning ───────────────────────────────────────── */}
      {nightMasked && (
        <div style={{ background: '#1e293b', color: '#94a3b8', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Night-time Period</div>
            <div style={{ fontSize: '12px' }}>Prediction suppressed — the forecast horizon falls within nighttime hours.</div>
          </div>
        </div>
      )}

      {/* ── Predicted Power ───────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Predicted Power Output
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
            {predictedKw != null ? predictedKw.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'}
            <span style={{ fontSize: '18px', color: 'var(--text-primary)', marginLeft: '4px' }}>kW</span>
          </div>
          {capacityFactor !== null && (
            <div style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
              {capacityFactor}% of capacity
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '15px' }}>
              {predictedMwh != null ? `${(predictedMwh * 1000).toFixed(2)} kWh` : '—'}
            </div>
            <div style={{ fontSize: '11px' }}>Energy this interval</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '15px' }}>
              {nominalMw != null ? `${(nominalMw * 1000).toFixed(1)} kW` : '—'}
            </div>
            <div style={{ fontSize: '11px' }}>Nominal capacity</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '15px' }}>{horizonLabel}</div>
            <div style={{ fontSize: '11px' }}>Forecast horizon</div>
          </div>
        </div>
      </div>

      {/* ── Capacity Factor Bar ───────────────────────────────────────── */}
      {capacityFactor !== null && (
        <div className="card" style={{ marginBottom: '16px', background: '#475569', color: 'white' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Capacity Factor
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{capacityFactor}%</div>
          <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${capacityFactor}%`, height: '100%', background: 'var(--accent-orange)', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            Predicted output as a fraction of nominal rated power
          </div>
        </div>
      )}

      {/* ── Model & Confidence ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--success-green)' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Model Details
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success-green)', textTransform: 'capitalize' }}>
              {modelUsed.replace('_', ' ')} LSTM
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Transfer-learned on 51 Brazilian PV plants</div>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ width: '4px', height: '16px', background: i <= 4 ? 'var(--success-green)' : '#cbd5e1', borderRadius: '2px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Plant Configuration Summary ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Plant Configuration Used
        </div>
        {[
          { label: 'Panels',       value: numPanels  ? numPanels.toLocaleString() : '—' },
          { label: 'Efficiency',   value: efficiency  ? `${efficiency}%` : '—' },
          { label: 'Capacity',     value: nominalMw   ? `${(nominalMw * 1000).toFixed(1)} kW` : '—' },
          { label: 'Latitude',     value: typeof latitude  === 'number' ? latitude.toFixed(4)  : latitude },
          { label: 'Longitude',    value: typeof longitude === 'number' ? longitude.toFixed(4) : longitude },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight: 'bold' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Weather Source ────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: '#dbeafe', color: 'var(--accent-blue)', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
        </div>
        <div>
          <h4 style={{ marginBottom: '4px' }}>Live Weather Data</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Weather sequence fetched in real-time from Open-Meteo for lat {typeof latitude === 'number' ? latitude.toFixed(2) : latitude}, lon {typeof longitude === 'number' ? longitude.toFixed(2) : longitude}
          </p>
        </div>
      </div>

      {/* ── Environmental Insights ────────────────────────────────────── */}
      <h3 style={{ fontSize: '18px', color: 'var(--accent-blue)', marginBottom: '16px' }}>Environmental Insights</h3>

      <div style={{ height: '140px', background: 'linear-gradient(to right, #4f46e5, #3b82f6)', borderRadius: '12px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', opacity: 0.9 }}>LSTM Architecture</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Bidirectional Temporal Attention</div>
        </div>
      </div>

      <div style={{ height: '140px', background: 'linear-gradient(to right, #1e293b, #0f172a)', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', opacity: 0.9 }}>Model Version</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>LSTM v4 Transfer Learning Engine</div>
        </div>
      </div>

    </div>
  );
}
