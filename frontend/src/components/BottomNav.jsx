export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'predict', label: 'HOME', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'analytics', label: 'ANALYTICS', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
    { id: 'trends', label: 'TRENDS', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'alerts', label: 'ALERTS', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '12px 16px',
      borderTop: '1px solid var(--border-color)',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
      zIndex: 100
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {tab.icon}
            <span style={{fontSize: '10px', fontWeight: 'bold'}}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}
