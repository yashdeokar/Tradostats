export default function VolumePage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📦</span><h1>Volume Distribution</h1></div>
        <p className="page-subtitle">P&L breakdown by position size and contract volume</p>
      </div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Coming Soon</h3>
        <p>Volume distribution analytics will be available soon.</p>
      </div>
    </div>
  );
}
