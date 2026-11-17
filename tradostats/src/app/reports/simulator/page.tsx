export default function SimulatorPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🎮</span><h1>Simulator</h1></div>
        <p className="page-subtitle">Paper trading and what-if scenario modeling</p>
      </div>
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Simulator — Coming Soon</h3>
        <p>Paper trading and what-if scenario analysis will be available in a future release.</p>
      </div>
    </div>
  );
}
