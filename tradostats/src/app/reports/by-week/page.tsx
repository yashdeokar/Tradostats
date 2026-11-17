'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, startOfWeek } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ByWeekPage() {
  const { trades } = useStore();

  const weekData = useMemo(() => {
    const weeks: Record<string, { pnl: number; trades: number; wins: number }> = {};
    for (const t of trades) {
      const week = format(startOfWeek(parseISO(t.dateTime), { weekStartsOn: 1 }), 'MMM d');
      if (!weeks[week]) weeks[week] = { pnl: 0, trades: 0, wins: 0 };
      weeks[week].pnl += t.pnl;
      weeks[week].trades++;
      if (t.pnl > 0) weeks[week].wins++;
    }
    return Object.entries(weeks).map(([week, d]) => ({
      week,
      pnl: Math.round(d.pnl * 100) / 100,
      trades: d.trades,
    }));
  }, [trades]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🗓️</span><h1>Performance by Week</h1></div>
        <p className="page-subtitle">Weekly P&L breakdown and trends</p>
      </div>
      <div className="card">
        <div className="metric-card-title" style={{ marginBottom: 16 }}>Weekly P&L</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekData}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fill: '#7d8590', fontSize: 10 }} axisLine={false} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={65} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {weekData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
        <table className="data-table">
          <thead><tr><th>Week of</th><th>Trades</th><th>Net P&L</th></tr></thead>
          <tbody>
            {weekData.map(row => (
              <tr key={row.week}>
                <td style={{ fontWeight: 600 }}>{row.week}</td>
                <td>{row.trades}</td>
                <td className={row.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
