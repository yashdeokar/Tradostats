'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function ByDayPage() {
  const { trades } = useStore();

  const dayData = useMemo(() => {
    const days: Record<string, { pnl: number; trades: number; wins: number }> = {
      Monday: { pnl: 0, trades: 0, wins: 0 },
      Tuesday: { pnl: 0, trades: 0, wins: 0 },
      Wednesday: { pnl: 0, trades: 0, wins: 0 },
      Thursday: { pnl: 0, trades: 0, wins: 0 },
      Friday: { pnl: 0, trades: 0, wins: 0 },
    };
    for (const t of trades) {
      const day = format(parseISO(t.dateTime), 'EEEE');
      if (days[day]) {
        days[day].pnl += t.pnl;
        days[day].trades++;
        if (t.pnl > 0) days[day].wins++;
      }
    }
    return Object.entries(days).map(([day, d]) => ({
      day: day.slice(0, 3),
      pnl: Math.round(d.pnl * 100) / 100,
      trades: d.trades,
      winRate: d.trades ? Math.round((d.wins / d.trades) * 100) : 0,
    }));
  }, [trades]);

  const best = dayData.reduce((a, b) => a.pnl > b.pnl ? a : b, dayData[0]);
  const worst = dayData.reduce((a, b) => a.pnl < b.pnl ? a : b, dayData[0]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📅</span><h1>Performance by Day</h1></div>
        <p className="page-subtitle">Which days of the week are most profitable</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {best && <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Best Day</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--accent)' }}>{best.day}</div>
          <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(best.pnl)}</div>
        </div>}
        {worst && <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Worst Day</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--danger)' }}>{worst.day}</div>
          <div style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(worst.pnl)}</div>
        </div>}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Total Trades</div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{trades.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="metric-card-title" style={{ marginBottom: 16 }}>P&L by Day of Week</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dayData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: '#7d8590', fontSize: 13 }} axisLine={false} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={65} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']} labelStyle={{ color: 'var(--text-muted)' }} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
              {dayData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Trades</th>
              <th>Win Rate</th>
              <th>Net P&L</th>
              <th>Avg P&L</th>
            </tr>
          </thead>
          <tbody>
            {dayData.map(row => (
              <tr key={row.day}>
                <td style={{ fontWeight: 600 }}>{row.day}</td>
                <td>{row.trades}</td>
                <td style={{ color: row.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{row.trades ? formatPercent(row.winRate) : '—'}</td>
                <td className={row.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.pnl)}</td>
                <td className={row.trades && row.pnl / row.trades >= 0 ? 'pnl-positive' : 'pnl-negative'}>{row.trades ? formatCurrency(row.pnl / row.trades) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
