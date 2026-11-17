'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent, getRecentResults, calcWinRate, calcProfitFactor } from '@/lib/utils';
import type { Setup, SortConfig } from '@/lib/types';
import { Plus, Search, Settings2, BarChart2, ChevronUp, ChevronDown, X } from 'lucide-react';

// ---- Modal ----
function SetupModal({
  setup,
  onClose,
  onSave,
}: {
  setup?: Setup | null;
  onClose: () => void;
  onSave: (data: Omit<Setup, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState(setup?.name || '');
  const [icon, setIcon] = useState(setup?.icon || '📊');
  const [color, setColor] = useState(setup?.color || '#10b981');
  const [description, setDescription] = useState(setup?.description || '');

  const icons = ['📊', '📈', '📉', '🔄', '🚀', '💡', '🎯', '⚡', '🔥', '💰', '🏹', '🎲'];
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{setup ? 'Edit Setup' : 'New Setup'}</h3>
          <button className="btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Setup Name</label>
            <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. False Breakout" autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {icons.map(i => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    style={{
                      width: 36, height: 36, borderRadius: 6, border: `2px solid ${icon === i ? color : 'var(--border)'}`,
                      background: icon === i ? `${color}22` : 'var(--bg-input)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >{i}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c,
                      border: `3px solid ${color === c ? '#fff' : 'transparent'}`, cursor: 'pointer', outline: 'none',
                      boxShadow: color === c ? '0 0 0 2px ' + c : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-base"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your setup criteria..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (name.trim()) { onSave({ name: name.trim(), icon, color, description }); onClose(); } }}
          >{setup ? 'Save Changes' : 'Create Setup'}</button>
        </div>
      </div>
    </div>
  );
}

// ---- Recent Dots ----
function RecentDots({ results }: { results: ('win' | 'loss')[] }) {
  return (
    <div className="recent-dots">
      {results.map((r, i) => (
        <span key={i} className={`dot ${r === 'win' ? 'dot-win' : 'dot-loss'}`} title={r} />
      ))}
    </div>
  );
}

// ---- Progress Bar ----
function ProgressBar({ value, max = 100, color = 'green' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const cls = color === 'green' ? 'progress-green' : color === 'red' ? 'progress-red' : 'progress-blue';
  return (
    <div className="progress-bar" style={{ width: 80 }}>
      <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ---- Main Page ----
export default function SetupsPage() {
  const { setups, trades, addSetup, updateSetup, deleteSetup, getSetupStats } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Setup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    const setupsWithStats = setups.map(setup => ({
      ...setup,
      stats: getSetupStats(setup.id),
    }));

    const filtered = search
      ? setupsWithStats.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      : setupsWithStats;

    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'winRate': return dir * (a.stats.winRate - b.stats.winRate);
        case 'trades': return dir * (a.stats.trades - b.stats.trades);
        case 'avgPnl': return dir * (a.stats.avgPnl - b.stats.avgPnl);
        case 'totalPnl': return dir * (a.stats.totalPnl - b.stats.totalPnl);
        case 'pf': return dir * (a.stats.profitFactor - b.stats.profitFactor);
        default: return 0;
      }
    });
  }, [setups, trades, search, sort, getSetupStats]);

  function toggleSort(key: string) {
    setSort(prev => prev.key === key
      ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'desc' }
    );
  }

  function SortIcon({ col }: { col: string }) {
    if (sort.key !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sort.direction === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent)' }} /> : <ChevronDown size={12} style={{ color: 'var(--accent)' }} />;
  }

  function Th({ col, children }: { col: string; children: React.ReactNode }) {
    return (
      <th onClick={() => toggleSort(col)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {children}
          <SortIcon col={col} />
        </div>
      </th>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={20} color="var(--vellum)" />
          <h1>Setups</h1>
        </div>
        <p className="page-subtitle">{setups.length} setups • Audited rule-based execution strategies</p>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={14} /> New Setup
        </button>
        <button className="btn btn-secondary">All</button>
        <button className="btn btn-secondary"><Settings2 size={13} /> Columns</button>
        <div className="action-bar-right" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input
            className="search-input"
            placeholder="Search setups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <Th col="name">Setup</Th>
                <Th col="winRate">Win Rate</Th>
                <Th col="trades">Trades</Th>
                <Th col="avgPnl">Avg P&L</Th>
                <Th col="totalPnl">Total P&L</Th>
                <Th col="pf">PF</Th>
                <th>Recent</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {search ? 'No setups match your search' : 'No setups yet. Create your first setup!'}
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 7, background: `${row.color}22`,
                        border: `1px solid ${row.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                      }}>{row.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</div>
                        {row.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, color: row.stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)' }}>
                      {formatPercent(row.stats.winRate)}
                    </div>
                    <ProgressBar value={row.stats.winRate} color={row.stats.winRate >= 50 ? 'green' : 'red'} />
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.stats.trades}</td>
                  <td className={row.stats.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {formatCurrency(row.stats.avgPnl)}
                  </td>
                  <td className={row.stats.totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {formatCurrency(row.stats.totalPnl)}
                  </td>
                  <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: row.stats.profitFactor >= 1 ? 'var(--accent)' : 'var(--danger)' }}>
                    {isFinite(row.stats.profitFactor) ? row.stats.profitFactor.toFixed(2) : '∞'}
                  </td>
                  <td><RecentDots results={row.stats.recentTrades} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => { setEditing(row); setModal('edit'); }}
                        title="Edit"
                      >✏️</button>
                      {deleteConfirm === row.id ? (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                          onClick={() => { deleteSetup(row.id); setDeleteConfirm(null); }}
                        >Confirm</button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => setDeleteConfirm(row.id)}
                          title="Delete"
                        >🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      {rows.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Setups', value: setups.length },
            { label: 'Total Trades', value: rows.reduce((s, r) => s + r.stats.trades, 0) },
            { label: 'Overall P&L', value: formatCurrency(rows.reduce((s, r) => s + r.stats.totalPnl, 0)), pnl: true, raw: rows.reduce((s, r) => s + r.stats.totalPnl, 0) },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ flex: 1, minWidth: 120, padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.pnl ? (stat.raw! >= 0 ? 'var(--accent)' : 'var(--danger)') : 'var(--text-primary)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'new' && (
        <SetupModal
          onClose={() => setModal(null)}
          onSave={(data) => addSetup(data)}
        />
      )}
      {modal === 'edit' && editing && (
        <SetupModal
          setup={editing}
          onClose={() => { setModal(null); setEditing(null); }}
          onSave={(data) => updateSetup(editing.id, data)}
        />
      )}
    </div>
  );
}
