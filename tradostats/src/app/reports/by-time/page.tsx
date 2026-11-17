'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO, getHours } from 'date-fns';

export default function ByTimePage() {
  const { trades } = useStore();

  const hourData = useMemo(() => {
    const hours: Record<number, { pnl: number; trades: number; wins: number }> = {};
    for (let h = 7; h <= 16; h++) hours[h] = { pnl: 0, trades: 0, wins: 0 };
    for (const t of trades) {
      const h = getHours(parseISO(t.dateTime));
      if (hours[h]) {
        hours[h].pnl += t.pnl;
        hours[h].trades++;
        if (t.pnl > 0) hours[h].wins++;
      }
    }
    return Object.entries(hours).map(([h, d]) => ({
      hour: `${h}:00`,
      pnl: Math.round(d.pnl * 100) / 100,
      trades: d.trades,
      winRate: d.trades ? Math.round((d.wins / d.trades) * 100) : 0,
    }));
  }, [trades]);

  const best = hourData.reduce((a, b) => a.pnl > b.pnl ? a : b, hourData[0]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>⏰</span><h1>Performance by Time</h1></div>
        <p className="page-subtitle">Which hours of the day are most profitable</p>
      </div>
      {best && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Best Hour</div>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{best.hour}</div>
            <div style={{ fontSize: 13, color: 'var(--accent)' }}>{formatCurrency(best.pnl)}</div>
          </div>
        </div>
      )}
      <div className="card">
        <div className="metric-card-title" style={{ marginBottom: 16 }}>Hourly P&L Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourData}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fill: '#7d8590', fontSize: 11 }} axisLine={false} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={65} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {hourData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
