'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { Tag, SortConfig } from '@/lib/types';
import { Plus, Search, Settings2, ChevronUp, ChevronDown, X, Tag as TagIcon } from 'lucide-react';

function TagModal({
  tag,
  onClose,
  onSave,
}: {
  tag?: Tag | null;
  onClose: () => void;
  onSave: (data: Omit<Tag, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState(tag?.name || '');
  const [sentiment, setSentiment] = useState<'positive' | 'negative'>(tag?.sentiment || 'positive');
  const [description, setDescription] = useState(tag?.description || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{tag ? 'Edit Tag' : 'New Tag'}</h3>
          <button className="btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Tag Name</label>
            <input className="input-base" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. A+, FOMO, Patient Entry" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Sentiment</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {(['positive', 'negative'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSentiment(s)}
                  className={`btn ${s === 'positive' && sentiment === 'positive' ? 'badge-positive' : s === 'negative' && sentiment === 'negative' ? 'badge-negative' : 'btn-secondary'}`}
                  style={{
                    padding: '7px 16px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {s === 'positive' ? '● Positive (Emerald)' : '● Negative (Ruby)'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {sentiment === 'positive'
                ? '✓ Positive tags represent behaviors and habits that improve your trading.'
                : '⚠️ Negative tags represent behaviors that hurt your trading performance.'}
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="input-base"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe when to apply this tag..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (name.trim()) { onSave({ name: name.trim(), sentiment, description }); onClose(); } }}
          >{tag ? 'Save Changes' : 'Create Tag'}</button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'green' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const cls = color === 'green' ? 'progress-green' : color === 'red' ? 'progress-red' : color === 'pink' ? 'progress-pink' : 'progress-blue';
  return (
    <div className="progress-bar" style={{ width: 80 }}>
      <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TagsPage() {
  const { tags, addTag, updateTag, deleteTag, getTagStats } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [modal, setModal] = useState<'new' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const maxTrades = useMemo(() => {
    return Math.max(...tags.map(t => getTagStats(t.id).trades), 1);
  }, [tags, getTagStats]);

  const rows = useMemo(() => {
    const withStats = tags.map(tag => ({ ...tag, stats: getTagStats(tag.id) }));
    const filtered = withStats.filter(t => {
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
      const matchSentiment = filterSentiment === 'all' || t.sentiment === filterSentiment;
      return matchSearch && matchSentiment;
    });

    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'sentiment': return dir * a.sentiment.localeCompare(b.sentiment);
        case 'trades': return dir * (a.stats.trades - b.stats.trades);
        case 'winRate': return dir * (a.stats.winRate - b.stats.winRate);
        case 'avgPnl': return dir * (a.stats.avgPnl - b.stats.avgPnl);
        default: return 0;
      }
    });
  }, [tags, search, sort, filterSentiment, getTagStats]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}<SortIcon col={col} /></div>
      </th>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TagIcon size={20} color="var(--vellum)" />
          <h1>Tags</h1>
        </div>
        <p className="page-subtitle">{tags.length} tags • Behavioral and execution attribution</p>
      </div>

      <div className="action-bar" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={14} /> New Tag</button>
        {(['all', 'positive', 'negative'] as const).map(f => (
          <button
            key={f}
            className={`btn ${filterSentiment === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterSentiment(f)}
            style={filterSentiment === f && f === 'negative' ? { background: 'var(--pink)', borderColor: 'var(--pink)' } : {}}
          >
            {f === 'all' ? 'All' : f === 'positive' ? '● Positive' : '● Negative'}
          </button>
        ))}
        <button className="btn btn-secondary"><Settings2 size={13} /> Columns</button>
        <div className="action-bar-right" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input className="search-input" placeholder="Search tags..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <Th col="name">Tag</Th>
                <Th col="sentiment">Sentiment</Th>
                <Th col="trades">Trades</Th>
                <Th col="winRate">Win Rate</Th>
                <Th col="avgPnl">Avg P&L</Th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {search ? 'No tags match your search' : 'No tags yet. Create your first tag!'}
                  </td>
                </tr>
              ) : rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: row.sentiment === 'positive' ? 'var(--accent)' : 'var(--pink)', fontSize: 16 }}>◆</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</span>
                    </div>
                    {row.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, paddingLeft: 22 }}>{row.description}</div>}
                  </td>
                  <td>
                    <span className={`badge ${row.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'}`}>
                      ● {row.sentiment}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontVariantNumeric: 'tabular-nums' }}>{row.stats.trades}</div>
                    <ProgressBar value={row.stats.trades} max={maxTrades} color="blue" />
                  </td>
                  <td>
                    {row.stats.trades > 0 ? (
                      <>
                        <div style={{ color: row.stats.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600 }}>
                          {formatPercent(row.stats.winRate)}
                        </div>
                        <ProgressBar value={row.stats.winRate} color={row.stats.winRate >= 50 ? 'green' : 'red'} />
                      </>
                    ) : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                  </td>
                  <td>
                    {row.stats.trades > 0
                      ? <span className={row.stats.avgPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>{formatCurrency(row.stats.avgPnl)}</span>
                      : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => { setEditing(row); setModal('edit'); }}>✏️</button>
                      {deleteConfirm === row.id ? (
                        <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }} onClick={() => { deleteTag(row.id); setDeleteConfirm(null); }}>Confirm</button>
                      ) : (
                        <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirm(row.id)}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'new' && <TagModal onClose={() => setModal(null)} onSave={data => addTag(data)} />}
      {modal === 'edit' && editing && (
        <TagModal tag={editing} onClose={() => { setModal(null); setEditing(null); }} onSave={data => updateTag(editing.id, data)} />
      )}
    </div>
  );
}
