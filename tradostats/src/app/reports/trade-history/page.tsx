'use client';
import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function TradeHistoryPage() {
  const { trades, setups } = useStore();
  const [search, setSearch] = useState('');

  const setupMap = useMemo(() => Object.fromEntries(setups.map(s => [s.id, s])), [setups]);

  const filtered = [...trades]
    .filter(t => !search || t.instrument.toLowerCase().includes(search.toLowerCase()) || t.notes.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📋</span><h1>Trade History</h1></div>
        <p className="page-subtitle">Complete record of all {trades.length} trades</p>
      </div>
      <div className="action-bar" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input className="search-input" placeholder="Search trades..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-secondary">⬇️ Export CSV</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Date/Time</th><th>Symbol</th><th>Dir.</th><th>Entry</th><th>Exit</th><th>Qty</th><th>P&L</th><th>Setup</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const setup = t.setupId ? setupMap[t.setupId] : null;
                return (
                  <tr key={t.id}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDateTime(t.dateTime)}</td>
                    <td style={{ fontWeight: 700 }}>{t.instrument}</td>
                    <td><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: t.direction === 'Long' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: t.direction === 'Long' ? 'var(--accent)' : 'var(--danger)' }}>{t.direction === 'Long' ? '▲' : '▼'}</span></td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{t.entryPrice.toFixed(2)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{t.exitPrice.toFixed(2)}</td>
                    <td>{t.quantity}</td>
                    <td className={t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(t.pnl)}</td>
                    <td>{setup && <span style={{ fontSize: 12 }}>{setup.icon} {setup.name}</span>}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
