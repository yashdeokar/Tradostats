'use client';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent, calcWinRate, calcProfitFactor, getRecentResults } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function RecentDots({ results }: { results: ('win' | 'loss')[] }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {results.map((r, i) => (
        <span key={i} className={`dot ${r === 'win' ? 'dot-win' : 'dot-loss'}`} />
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" style={{ width: 80 }}>
      <div className={`progress-fill ${value >= 50 ? 'progress-green' : 'progress-red'}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function BySetupPage() {
  const { setups, trades, getSetupStats } = useStore();

  const rows = useMemo(() => {
    return setups.map(setup => ({
      ...setup,
      stats: getSetupStats(setup.id),
    })).sort((a, b) => b.stats.totalPnl - a.stats.totalPnl);
  }, [setups, trades, getSetupStats]);

  const chartData = rows.map(r => ({
    name: r.name,
    pnl: Math.round(r.stats.totalPnl * 100) / 100,
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>🎯</span><h1>Performance by Setup</h1></div>
        <p className="page-subtitle">Which setups are driving your P&L</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="metric-card-title" style={{ marginBottom: 16 }}>P&L by Setup</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: '#7d8590', fontSize: 11 }} axisLine={false} />
            <YAxis tickFormatter={v => `$${v}`} tick={{ fill: '#7d8590', fontSize: 10 }} width={70} />
            <Tooltip formatter={(v: any) => [formatCurrency(Number(v) || 0), 'P&L']} contentStyle={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Setup</th>
              <th>Win Rate</th>
              <th>Trades</th>
              <th>Avg P&L</th>
              <th>Total P&L</th>
              <th>Profit Factor</th>
              <th>Recent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${row.color}22`, border: `1px solid ${row.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{row.icon}</div>
                    <span style={{ fontWeight: 600 }}>{row.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ color: row.stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{formatPercent(row.stats.winRate)}</div>
                  <ProgressBar value={row.stats.winRate} />
                </td>
                <td>{row.stats.trades}</td>
                <td className={row.stats.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.stats.avgPnl)}</td>
                <td className={row.stats.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.stats.totalPnl)}</td>
                <td style={{ color: row.stats.profitFactor >= 1 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>{isFinite(row.stats.profitFactor) ? row.stats.profitFactor.toFixed(2) : '∞'}</td>
                <td><RecentDots results={row.stats.recentTrades} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
