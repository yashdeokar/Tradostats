'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ByInstrumentPage() {
  const { trades } = useStore();

  const rows = useMemo(() => {
    const byInstrument: Record<string, { pnl: number; trades: number; wins: number }> = {};
    for (const t of trades) {
      if (!byInstrument[t.instrument]) byInstrument[t.instrument] = { pnl: 0, trades: 0, wins: 0 };
      byInstrument[t.instrument].pnl += t.pnl;
      byInstrument[t.instrument].trades++;
      if (t.pnl > 0) byInstrument[t.instrument].wins++;
    }
    return Object.entries(byInstrument).map(([instrument, d]) => ({
      instrument,
      pnl: Math.round(d.pnl * 100) / 100,
      trades: d.trades,
      wins: d.wins,
      winRate: d.trades ? (d.wins / d.trades) * 100 : 0,
      avgPnl: d.trades ? d.pnl / d.trades : 0,
    })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📈</span><h1>Performance by Instrument</h1></div>
        <p className="page-subtitle">P&L and win rate broken down by traded symbol</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="metric-card-title" style={{ marginBottom: 16 }}>P&L by Instrument</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={rows}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="instrument" tick={{ fill: '#7d8590', fontSize: 12 }} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={65} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {rows.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Instrument</th><th>Trades</th><th>Win Rate</th><th>Avg P&L</th><th>Total P&L</th></tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.instrument}>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.instrument}</td>
                <td>{row.trades}</td>
                <td style={{ color: row.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{formatPercent(row.winRate)}</td>
                <td className={row.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.avgPnl)}</td>
                <td className={row.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
