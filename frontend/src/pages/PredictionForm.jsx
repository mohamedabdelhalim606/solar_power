import { useState } from 'react';

const PRESET_LOCATIONS = [
  { name: 'Belo Horizonte, MG', lat: -19.92, lon: -43.94, state_code: 12 },
  { name: 'São Paulo, SP',       lat: -23.55, lon: -46.63, state_code: 24 },
  { name: 'Brasília, DF',        lat: -15.78, lon: -47.93, state_code: 6  },
  { name: 'Fortaleza, CE',       lat: -3.72,  lon: -38.54, state_code: 5  },
  { name: 'Salvador, BA',        lat: -12.97, lon: -38.50, state_code: 4  },
  { name: 'Recife, PE',          lat: -8.05,  lon: -34.88, state_code: 16 },
  { name: 'Manaus, AM',          lat: -3.10,  lon: -60.02, state_code: 3  },
  { name: 'Curitiba, PR',        lat: -25.43, lon: -49.27, state_code: 15 },
];

const DEFAULT_LOCATION = PRESET_LOCATIONS[0];

export default function PredictionForm({ onPredict }) {
  const [formData, setFormData] = useState({
    num_panels:           2500,
    panel_area_m2:        1.6,
    panel_efficiency_pct: 20.0,
    panel_temp_coeff:     -0.35,
    panel_bifaciality:    0.0,
    is_tracker:           0,
    state_code:           DEFAULT_LOCATION.state_code,
    latitude:             DEFAULT_LOCATION.lat,
    longitude:            DEFAULT_LOCATION.lon,
  });

  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION.name);
  const [showAdvanced, setShowAdvanced]         = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || '';

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleLocationSelect = (e) => {
    const name = e.target.value;
    setSelectedLocation(name);
    if (name === 'custom') return;
    const loc = PRESET_LOCATIONS.find(l => l.name === name);
    if (loc) {
      setFormData(prev => ({
        ...prev,
        latitude:   loc.lat,
        longitude:  loc.lon,
        state_code: loc.state_code,
      }));
    }
  };

  const handleTrackerToggle = (val) => {
    setFormData(prev => ({ ...prev, is_tracker: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        num_panels:           Number(formData.num_panels),
        panel_area_m2:        Number(formData.panel_area_m2),
        panel_efficiency_pct: Number(formData.panel_efficiency_pct),
        panel_temp_coeff:     Number(formData.panel_temp_coeff),
        panel_bifaciality:    Number(formData.panel_bifaciality),
        is_tracker:           Number(formData.is_tracker),
        state_code:           Number(formData.state_code),
        latitude:             Number(formData.latitude),
        longitude:            Number(formData.longitude),
      };

      const response = await fetch(`${apiBase}/api/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${response.status}`);
      }

      const result = await response.json();
      onPredict({ ...result, input: payload });
    } catch (err) {
      setError(err.message || 'Failed to connect to AI engine.');
    } finally {
      setLoading(false);
    }
  };

  const nominalMW = (
    (formData.num_panels * formData.panel_area_m2 * 1000 * formData.panel_efficiency_pct / 100) / 1e6
  ).toFixed(3);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h2 style={{ marginBottom: '6px' }}>New Forecast Prediction</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Configure your solar plant and location. Real-time weather is fetched automatically via Open-Meteo.
      </p>

      <form onSubmit={handleSubmit}>

        {/* ── Plant Configuration ──────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--accent-orange)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Plant Configuration
          </h3>

          <div className="input-group">
            <label>NUMBER OF PANELS</label>
            <input type="number" name="num_panels" value={formData.num_panels} min={1} onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>PANEL AREA (M²)</label>
              <input type="number" name="panel_area_m2" value={formData.panel_area_m2} step="0.01" min={0.1} onChange={handleChange} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>EFFICIENCY (%)</label>
              <input type="number" name="panel_efficiency_pct" value={formData.panel_efficiency_pct} step="0.1" min={1} max={50} onChange={handleChange} required />
            </div>
          </div>

          {/* Tracker Toggle */}
          <div className="input-group">
            <label>MOUNT TYPE</label>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px', gap: '4px' }}>
              {[{ val: 0, label: 'Fixed Tilt' }, { val: 1, label: 'Single-Axis Tracker' }].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleTrackerToggle(opt.val)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background:  formData.is_tracker === opt.val ? 'var(--accent-orange)' : 'transparent',
                    color:       formData.is_tracker === opt.val ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal Power Preview */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimated Capacity</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)', fontSize: '16px' }}>{nominalMW} MW</span>
          </div>
        </div>

        {/* ── Location ─────────────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--accent-orange)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
            Plant Location
          </h3>

          <div className="input-group">
            <label>PRESET LOCATION</label>
            <select value={selectedLocation} onChange={handleLocationSelect}>
              {PRESET_LOCATIONS.map(loc => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
              <option value="custom">Custom Coordinates</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>LATITUDE</label>
              <input
                type="number" name="latitude"
                value={formData.latitude} step="0.0001"
                onChange={(e) => { setSelectedLocation('custom'); handleChange(e); }}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>LONGITUDE</label>
              <input
                type="number" name="longitude"
                value={formData.longitude} step="0.0001"
                onChange={(e) => { setSelectedLocation('custom'); handleChange(e); }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', fontSize: '12px', color: '#1d4ed8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            Weather data auto-fetched from Open-Meteo for these coordinates
          </div>
        </div>

        {/* ── Advanced Settings (collapsible) ──────────────────────────── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}
          >
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Advanced Settings</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showAdvanced && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>TEMP. COEFFICIENT (%/°C)</label>
                  <input type="number" name="panel_temp_coeff" value={formData.panel_temp_coeff} step="0.01" onChange={handleChange} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>BIFACIALITY (0–1)</label>
                  <input type="number" name="panel_bifaciality" value={formData.panel_bifaciality} step="0.01" min={0} max={1} onChange={handleChange} />
                </div>
              </div>
              <div className="input-group">
                <label>STATE CODE (0–26)</label>
                <input type="number" name="state_code" value={formData.state_code} min={0} max={26} onChange={handleChange} />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Integer state index from the training dataset (auto-set by location preset).</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Fetching Weather & Running Model…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Generate AI Forecast
            </>
          )}
        </button>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </form>
    </div>
  );
}
