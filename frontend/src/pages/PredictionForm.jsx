import { useState } from 'react';

export default function PredictionForm({ onPredict }) {
  const [formData, setFormData] = useState({
    daily_temperature: 25,
    solar_panel_type: 'Monocrystalline Silicon',
    panel_area: 1.6,
    farm_area: 5000,
    num_panels: 2500
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const apiBase = import.meta.env.VITE_API_BASE || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${apiBase}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          daily_temperature: Number(formData.daily_temperature),
          panel_area: Number(formData.panel_area),
          farm_area: Number(formData.farm_area),
          num_panels: Number(formData.num_panels)
        }),
      });
      
      const result = await response.json();
      onPredict(result);
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Failed to connect to AI engine. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{marginBottom: '8px'}}>New Forecast Prediction</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px'}}>
        Input your local parameters to generate a high-precision solar energy output forecast powered by our proprietary AI modeling engine.
      </p>

      <div className="card">
        <h3 style={{fontSize: '16px', color: 'var(--accent-orange)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          Configuration Parameters
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>DAILY TEMPERATURE (°C)</label>
            <input 
              type="number" 
              name="daily_temperature"
              value={formData.daily_temperature}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>SOLAR PANEL TYPE</label>
            <select name="solar_panel_type" value={formData.solar_panel_type} onChange={handleChange}>
              <option value="Monocrystalline Silicon">Monocrystalline Silicon</option>
              <option value="Polycrystalline Silicon">Polycrystalline Silicon</option>
              <option value="Thin-Film">Thin-Film</option>
            </select>
          </div>

          <div className="input-group">
            <label>PANEL AREA (M²)</label>
            <input 
              type="number" 
              step="0.1"
              name="panel_area"
              value={formData.panel_area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>FARM AREA (M²)</label>
            <input 
              type="number" 
              name="farm_area"
              value={formData.farm_area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>NUM PANELS</label>
            <input 
              type="number" 
              name="num_panels"
              value={formData.num_panels}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: '24px'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            {loading ? 'Processing AI Models...' : 'Predict Future Output'}
          </button>
        </form>
      </div>

      <div className="card" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
        <div style={{background: '#dbeafe', color: 'var(--accent-blue)', padding: '12px', borderRadius: '12px'}}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div>
          <h4 style={{marginBottom: '4px'}}>Real-time Weather</h4>
          <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Sync temperature data directly from global meteorological APIs.</p>
        </div>
      </div>
    </div>
  );
}
