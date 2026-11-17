'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

function calcStreaks(trades: { pnl: number }[]) {
  const results = trades.map(t => t.pnl > 0 ? 'win' : 'loss');
  let maxW = 0, maxL = 0, curW = 0, curL = 0, curType = '';
  const streakHistory: { type: string; count: number }[] = [];
  for (const r of results) {
    if (r === curType) {
      if (r === 'win') { curW++; if (curW > maxW) maxW = curW; }
      else { curL++; if (curL > maxL) maxL = curL; }
    } else {
      if (curType) streakHistory.push({ type: curType, count: curType === 'win' ? curW : curL });
      curType = r;
      if (r === 'win') { curW = 1; if (curW > maxW) maxW = curW; }
      else { curL = 1; if (curL > maxL) maxL = curL; }
    }
  }
  if (curType) streakHistory.push({ type: curType, count: curType === 'win' ? curW : curL });
  const current = streakHistory[streakHistory.length - 1];
  return { maxWin: maxW, maxLoss: maxL, current, streakHistory };
}

export default function ConsecutivePage() {
  const { trades } = useStore();
  const sorted = [...trades].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const { maxWin, maxLoss, current, streakHistory } = useMemo(() => calcStreaks(sorted), [sorted]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🔁</span><h1>Consecutive Wins & Losses</h1></div>
        <p className="page-subtitle">Streak analysis and consecutive trade patterns</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Max Consecutive Wins</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)' }}>🔥 {maxWin}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Max Consecutive Losses</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--danger)' }}>❄️ {maxLoss}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Current Streak</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: current?.type === 'win' ? 'var(--accent)' : 'var(--danger)' }}>
            {current?.type === 'win' ? '🔥' : '❄️'} {current?.count || 0}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{current?.type || '—'}</div>
        </div>
      </div>
      <div className="card">
        <div className="metric-card-title" style={{ marginBottom: 16 }}>Streak History</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {streakHistory.map((s, i) => (
            <div key={i} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: s.type === 'win' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: s.type === 'win' ? 'var(--accent)' : 'var(--danger)',
              border: `1px solid ${s.type === 'win' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {s.type === 'win' ? '▲' : '▼'} {s.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
