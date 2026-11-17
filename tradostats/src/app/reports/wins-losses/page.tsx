'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="chart-tooltip-value" style={{ color: p.value >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
          {p.name}: {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function WinsLossesPage() {
  const { trades } = useStore();

  const stats = useMemo(() => {
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const maxWin = Math.max(...wins.map(t => t.pnl), 0);
    const maxLoss = Math.min(...losses.map(t => t.pnl), 0);
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;

    // Distribution buckets
    const winBuckets: Record<string, number> = {};
    const lossBuckets: Record<string, number> = {};
    for (const t of wins) {
      const bucket = `$0-$${Math.ceil(t.pnl / 100) * 100}`;
      winBuckets[bucket] = (winBuckets[bucket] || 0) + 1;
    }
    for (const t of losses) {
      const bucket = `-$${Math.ceil(Math.abs(t.pnl) / 100) * 100}`;
      lossBuckets[bucket] = (lossBuckets[bucket] || 0) + 1;
    }

    // Monthly W/L
    const monthlyData: Record<string, { wins: number; losses: number; pnl: number }> = {};
    for (const t of trades) {
      const month = format(parseISO(t.dateTime), 'MMM yy');
      if (!monthlyData[month]) monthlyData[month] = { wins: 0, losses: 0, pnl: 0 };
      if (t.pnl > 0) monthlyData[month].wins++;
      else monthlyData[month].losses++;
      monthlyData[month].pnl += t.pnl;
    }

    return {
      wins: wins.length,
      losses: losses.length,
      total: trades.length,
      winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
      grossProfit,
      grossLoss,
      maxWin,
      maxLoss,
      avgWin,
      avgLoss,
      monthlyData: Object.entries(monthlyData).map(([month, d]) => ({ month, ...d, pnl: Math.round(d.pnl * 100) / 100 })),
    };
  }, [trades]);

  const barData = [
    { name: 'Wins', count: stats.wins, pnl: stats.grossProfit, color: '#10b981' },
    { name: 'Losses', count: stats.losses, pnl: -stats.grossLoss, color: '#ef4444' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📊</span><h1>Wins & Losses</h1></div>
        <p className="page-subtitle">Breakdown of your winning vs losing trades</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Win Rate', value: formatPercent(stats.winRate), color: stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)' },
          { label: 'Total Wins', value: stats.wins.toString(), color: 'var(--accent)' },
          { label: 'Total Losses', value: stats.losses.toString(), color: 'var(--danger)' },
          { label: 'Gross Profit', value: formatCurrency(stats.grossProfit), color: 'var(--accent)' },
          { label: 'Gross Loss', value: formatCurrency(stats.grossLoss), color: 'var(--danger)' },
          { label: 'Avg Win', value: formatCurrency(stats.avgWin), color: 'var(--accent)' },
          { label: 'Avg Loss', value: formatCurrency(-stats.avgLoss), color: 'var(--danger)' },
          { label: 'Best Trade', value: formatCurrency(stats.maxWin), color: 'var(--accent)' },
          { label: 'Worst Trade', value: formatCurrency(stats.maxLoss), color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="metric-card-title">Win vs Loss Count & P&L</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#7d8590', fontSize: 12 }} axisLine={false} />
              <YAxis yAxisId="left" tickFormatter={v => v} tick={{ fill: '#7d8590', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="metric-card-title">Monthly P&L</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: '#7d8590', fontSize: 10 }} axisLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {stats.monthlyData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly W/L Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Monthly Breakdown</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win Rate</th>
              <th>Net P&L</th>
            </tr>
          </thead>
          <tbody>
            {stats.monthlyData.map(row => (
              <tr key={row.month}>
                <td style={{ fontWeight: 600 }}>{row.month}</td>
                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.wins}</td>
                <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{row.losses}</td>
                <td>{row.wins + row.losses > 0 ? formatPercent((row.wins / (row.wins + row.losses)) * 100) : '—'}</td>
                <td className={row.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
