'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ByTagPage() {
  const { tags, trades, getTagStats } = useStore();

  const rows = useMemo(() => {
    return tags.map(tag => ({
      ...tag,
      stats: getTagStats(tag.id),
    })).filter(r => r.stats.trades > 0).sort((a, b) => b.stats.totalPnl - a.stats.totalPnl);
  }, [tags, trades, getTagStats]);

  const chartData = rows.map(r => ({
    name: r.name,
    pnl: Math.round(r.stats.avgPnl * 100) / 100,
    sentiment: r.sentiment,
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🏷️</span><h1>Performance by Tag</h1></div>
        <p className="page-subtitle">How different behavioral tags correlate with performance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="metric-card-title" style={{ marginBottom: 12 }}>Top Positive Tags</div>
          {rows.filter(r => r.sentiment === 'positive').slice(0, 5).map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--accent)' }}>◆</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.stats.trades} trades</span>
              </div>
              <span className="pnl-positive">{formatCurrency(r.stats.avgPnl)}/trade</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="metric-card-title" style={{ marginBottom: 12 }}>Negative Pattern Tags</div>
          {rows.filter(r => r.sentiment === 'negative').slice(0, 5).map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--pink)' }}>◆</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.stats.trades} trades</span>
              </div>
              <span className={r.stats.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(r.stats.avgPnl)}/trade</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="metric-card-title" style={{ marginBottom: 16 }}>Average P&L per Tag</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#7d8590', fontSize: 11 }} width={80} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'Avg P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Sentiment</th>
              <th>Trades</th>
              <th>Win Rate</th>
              <th>Avg P&L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: row.sentiment === 'positive' ? 'var(--accent)' : 'var(--pink)' }}>◆</span><span style={{ fontWeight: 600 }}>{row.name}</span></div></td>
                <td><span className={`badge ${row.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'}`}>● {row.sentiment}</span></td>
                <td>{row.stats.trades}</td>
                <td style={{ color: row.stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{formatPercent(row.stats.winRate)}</td>
                <td className={row.stats.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.stats.avgPnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
