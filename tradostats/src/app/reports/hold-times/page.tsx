'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, holdTimeLabel } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

export default function HoldTimesPage() {
  const { trades } = useStore();

  const stats = useMemo(() => {
    const withHold = trades.filter(t => t.holdTime);
    const holds = withHold.map(t => t.holdTime!);
    if (!holds.length) return null;
    const avg = holds.reduce((a, b) => a + b, 0) / holds.length;
    const sorted = [...holds].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const buckets: Record<string, { count: number; pnl: number }> = {
      '0-5m': { count: 0, pnl: 0 },
      '5-15m': { count: 0, pnl: 0 },
      '15-30m': { count: 0, pnl: 0 },
      '30-60m': { count: 0, pnl: 0 },
      '1h+': { count: 0, pnl: 0 },
    };
    for (const t of withHold) {
      const h = t.holdTime!;
      const key = h <= 5 ? '0-5m' : h <= 15 ? '5-15m' : h <= 30 ? '15-30m' : h <= 60 ? '30-60m' : '1h+';
      buckets[key].count++;
      buckets[key].pnl += t.pnl;
    }
    const bucketData = Object.entries(buckets).map(([label, d]) => ({
      label, count: d.count, avgPnl: d.count ? Math.round((d.pnl / d.count) * 100) / 100 : 0,
    }));
    return { avg, median, bucketData, total: withHold.length };
  }, [trades]);

  if (!stats) return (
    <div className="animate-fade-in">
      <div className="page-header"><div className="page-title"><span style={{ fontSize: 22 }}>⏱️</span><h1>Hold Times</h1></div></div>
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No hold time data available yet.</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>⏱️</span><h1>Hold Times</h1></div>
        <p className="page-subtitle">Distribution and P&L correlation with trade duration</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Average Hold Time</div><div style={{ fontWeight: 700, fontSize: 22 }}>{holdTimeLabel(Math.round(stats.avg))}</div></div>
        <div className="card" style={{ padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Median Hold Time</div><div style={{ fontWeight: 700, fontSize: 22 }}>{holdTimeLabel(stats.median)}</div></div>
        <div className="card" style={{ padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Trades Analyzed</div><div style={{ fontWeight: 700, fontSize: 22 }}>{stats.total}</div></div>
      </div>
      <div className="card">
        <div className="metric-card-title" style={{ marginBottom: 16 }}>Avg P&L by Hold Time</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.bucketData}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#7d8590', fontSize: 12 }} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={60} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'Avg P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="avgPnl" radius={[4, 4, 0, 0]}>
              {stats.bucketData.map((d, i) => <Cell key={i} fill={d.avgPnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
