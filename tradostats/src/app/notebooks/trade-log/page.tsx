'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDateTime, calcPnl } from '@/lib/utils';
import type { Trade, SortConfig } from '@/lib/types';
import { Plus, Search, ChevronUp, ChevronDown, X, Filter } from 'lucide-react';

// ---- Trade Form Modal ----
function TradeModal({
  trade,
  onClose,
  onSave,
}: {
  trade?: Trade | null;
  onClose: () => void;
  onSave: (data: Omit<Trade, 'id'>) => void;
}) {
  const { setups, tags, goals } = useStore();
  const [form, setForm] = useState({
    dateTime: trade?.dateTime || new Date().toISOString().slice(0, 16),
    instrument: trade?.instrument || '',
    direction: trade?.direction || 'Long' as 'Long' | 'Short',
    entryPrice: trade?.entryPrice?.toString() || '',
    exitPrice: trade?.exitPrice?.toString() || '',
    quantity: trade?.quantity?.toString() || '1',
    setupId: trade?.setupId || '',
    tagIds: trade?.tagIds || [] as string[],
    notes: trade?.notes || '',
    goalIds: trade?.goalIds || [] as string[],
  });

  const entry = parseFloat(form.entryPrice) || 0;
  const exit = parseFloat(form.exitPrice) || 0;
  const qty = parseFloat(form.quantity) || 1;
  const pnl = form.direction === 'Long' ? (exit - entry) * qty : (entry - exit) * qty;

  function toggleTag(id: string) {
    setForm(f => ({ ...f, tagIds: f.tagIds.includes(id) ? f.tagIds.filter(t => t !== id) : [...f.tagIds, id] }));
  }
  function toggleGoal(id: string) {
    setForm(f => ({ ...f, goalIds: f.goalIds.includes(id) ? f.goalIds.filter(g => g !== id) : [...f.goalIds, id] }));
  }

  function handleSave() {
    if (!form.instrument || !form.entryPrice || !form.exitPrice) return;
    onSave({
      dateTime: new Date(form.dateTime).toISOString(),
      instrument: form.instrument.toUpperCase(),
      direction: form.direction,
      entryPrice: entry,
      exitPrice: exit,
      quantity: qty,
      pnl,
      setupId: form.setupId || undefined,
      tagIds: form.tagIds,
      notes: form.notes,
      screenshots: trade?.screenshots || [],
      goalIds: form.goalIds,
      holdTime: trade?.holdTime || 15,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{trade ? 'Edit Trade' : 'Log New Trade'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {entry > 0 && exit > 0 && (
              <span style={{ fontSize: 14, fontWeight: 700, color: pnl >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                P&L: {formatCurrency(pnl)}
              </span>
            )}
            <button className="btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="input-base" value={form.dateTime} onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Instrument</label>
              <input className="input-base" placeholder="e.g. ES, NQ, ZB" value={form.instrument} onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Direction</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Long', 'Short'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, direction: d }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      border: `1px solid ${form.direction === d ? (d === 'Long' ? 'var(--accent)' : 'var(--danger)') : 'var(--border)'}`,
                      background: form.direction === d ? (d === 'Long' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'var(--bg-input)',
                      color: form.direction === d ? (d === 'Long' ? 'var(--accent)' : 'var(--danger)') : 'var(--text-muted)',
                      fontFamily: 'inherit',
                    }}
                  >{d === 'Long' ? '▲ Long' : '▼ Short'}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="number" className="input-base" value={form.quantity} min={1} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Entry Price</label>
              <input type="number" step="0.01" className="input-base" value={form.entryPrice} onChange={e => setForm(f => ({ ...f, entryPrice: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Exit Price</label>
              <input type="number" step="0.01" className="input-base" value={form.exitPrice} onChange={e => setForm(f => ({ ...f, exitPrice: e.target.value }))} placeholder="0.00" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Setup</label>
            <select className="input-base" value={form.setupId} onChange={e => setForm(f => ({ ...f, setupId: e.target.value }))}>
              <option value="">— Select Setup —</option>
              {setups.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {tags.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`badge ${form.tagIds.includes(t.id) ? (t.sentiment === 'positive' ? 'badge-positive' : 'badge-negative') : 'badge-muted'}`}
                  style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: 12, padding: '4px 10px' }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Goals Met Today</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                    border: `1px solid ${form.goalIds.includes(g.id) ? 'var(--warning)' : 'var(--border)'}`,
                    background: form.goalIds.includes(g.id) ? 'rgba(245,158,11,0.15)' : 'var(--bg-input)',
                    color: form.goalIds.includes(g.id) ? 'var(--warning)' : 'var(--text-muted)',
                  }}
                >
                  {form.goalIds.includes(g.id) ? '✓ ' : ''}{g.title}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="input-base"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add trade notes, observations, lessons..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.instrument || !form.entryPrice || !form.exitPrice}>
            {trade ? 'Save Changes' : 'Log Trade'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Trade Log ----
export default function TradeLogPage() {
  const { trades, setups, addTrade, updateTrade, deleteTrade } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'dateTime', direction: 'desc' });
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [filterDirection, setFilterDirection] = useState<'all' | 'Long' | 'Short'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const setupMap = useMemo(() => Object.fromEntries(setups.map(s => [s.id, s])), [setups]);

  const rows = useMemo(() => {
    let filtered = trades;
    if (search) filtered = filtered.filter(t =>
      t.instrument.toLowerCase().includes(search.toLowerCase()) ||
      t.notes.toLowerCase().includes(search.toLowerCase())
    );
    if (filterDirection !== 'all') filtered = filtered.filter(t => t.direction === filterDirection);

    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'dateTime': return dir * (new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
        case 'instrument': return dir * a.instrument.localeCompare(b.instrument);
        case 'pnl': return dir * (a.pnl - b.pnl);
        case 'quantity': return dir * (a.quantity - b.quantity);
        default: return 0;
      }
    });
  }, [trades, search, sort, filterDirection]);

  const stats = useMemo(() => {
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    return {
      total: trades.length,
      totalPnl: trades.reduce((s, t) => s + t.pnl, 0),
      wins: wins.length,
      winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
      avgWin: wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0,
      avgLoss: losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0,
    };
  }, [trades]);

  function toggleSort(key: string) {
    setSort(prev => prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'desc' });
  }

  function SortIcon({ col }: { col: string }) {
    if (sort.key !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sort.direction === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent)' }} /> : <ChevronDown size={12} style={{ color: 'var(--accent)' }} />;
  }

  function Th({ col, children }: { col: string; children: React.ReactNode }) {
    return (
      <th onClick={() => toggleSort(col)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}<SortIcon col={col} /></div>
      </th>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title">
          <span style={{ fontSize: 22 }}>📝</span>
          <h1>Trade Log</h1>
        </div>
        <p className="page-subtitle">{trades.length} trades • Complete record of all your trades</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total P&L', value: formatCurrency(stats.totalPnl), color: stats.totalPnl >= 0 ? 'var(--accent)' : 'var(--danger)' },
          { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)' },
          { label: 'Total Trades', value: stats.total.toString(), color: 'var(--text-primary)' },
          { label: 'Avg Win', value: formatCurrency(stats.avgWin), color: 'var(--accent)' },
          { label: 'Avg Loss', value: formatCurrency(stats.avgLoss), color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="action-bar" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> Log Trade</button>
        {(['all', 'Long', 'Short'] as const).map(d => (
          <button key={d} className={`btn ${filterDirection === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterDirection(d)}
            style={filterDirection === d && d === 'Short' ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : {}}>
            {d === 'all' ? 'All' : d === 'Long' ? '▲ Long' : '▼ Short'}
          </button>
        ))}
        <div className="action-bar-right" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input className="search-input" placeholder="Search trades..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <Th col="dateTime">Date/Time</Th>
                <Th col="instrument">Symbol</Th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Exit</th>
                <Th col="quantity">Qty</Th>
                <Th col="pnl">P&L</Th>
                <th>Setup</th>
                <th>Tags</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {search ? 'No trades match your search' : 'No trades logged yet. Log your first trade!'}
                  </td>
                </tr>
              ) : rows.map(row => {
                const setup = row.setupId ? setupMap[row.setupId] : null;
                return (
                  <tr key={row.id} onClick={() => { setEditing(row); setModal('edit'); }}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDateTime(row.dateTime)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.instrument}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: row.direction === 'Long' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: row.direction === 'Long' ? 'var(--accent)' : 'var(--danger)',
                      }}>
                        {row.direction === 'Long' ? '▲' : '▼'} {row.direction}
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{row.entryPrice.toFixed(2)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{row.exitPrice.toFixed(2)}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.quantity}</td>
                    <td className={row.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'} style={{ fontSize: 13 }}>{formatCurrency(row.pnl)}</td>
                    <td>
                      {setup && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{setup.icon}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{setup.name}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {row.tagIds.slice(0, 2).map(tid => {
                          const tag = useStore.getState().tags.find(t => t.id === tid);
                          return tag ? (
                            <span key={tid} className={`badge ${tag.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'}`} style={{ fontSize: 10 }}>
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                        {row.tagIds.length > 2 && <span className="badge badge-muted" style={{ fontSize: 10 }}>+{row.tagIds.length - 2}</span>}
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditing(row); setModal('edit'); }}>✏️</button>
                        {deleteConfirm === row.id ? (
                          <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }} onClick={() => { deleteTrade(row.id); setDeleteConfirm(null); }}>Confirm</button>
                        ) : (
                          <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(row.id)}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'new' && <TradeModal onClose={() => setModal(null)} onSave={data => addTrade(data)} />}
      {modal === 'edit' && editing && (
        <TradeModal trade={editing} onClose={() => { setModal(null); setEditing(null); }} onSave={data => updateTrade(editing.id, data)} />
      )}
    </div>
  );
}
