export default function RecentNotesPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🕐</span><h1>Recent Notes</h1></div>
        <p className="page-subtitle">Your most recently viewed and edited notes</p>
      </div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🕐</div>
        <p>No recently visited notes.</p>
      </div>
    </div>
  );
}
