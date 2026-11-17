'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatPercent } from '@/lib/utils';
import type { Goal, SortConfig } from '@/lib/types';
import { Plus, Search, Settings2, ChevronUp, ChevronDown, X, Target, FileText, LayoutGrid, Table } from 'lucide-react';
import { goalTemplates } from '@/lib/data';
import AnimatedTaskBoard from '@/components/tasks/AnimatedTaskBoard';

function GoalModal({
  goal,
  onClose,
  onSave,
}: {
  goal?: Goal | null;
  onClose: () => void;
  onSave: (data: Omit<Goal, 'id' | 'createdAt'>) => void;
}) {
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{goal ? 'Edit Goal' : 'New Daily Goal'}</h3>
          <button className="btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Goal Title</label>
            <input className="input-base" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. No revenge trading" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-base"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe how you'll track and achieve this goal..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-warning"
            onClick={() => {
              if (title.trim()) {
                onSave({ title: title.trim(), description, daysUsed: goal?.daysUsed ?? 0, successDays: goal?.successDays ?? 0, currentStreak: goal?.currentStreak ?? 0, bestStreak: goal?.bestStreak ?? 0 });
                onClose();
              }
            }}
          >{goal ? 'Save Changes' : 'Create Goal'}</button>
        </div>
      </div>
    </div>
  );
}

function TemplateModal({ onClose, onSelect }: { onClose: () => void; onSelect: (title: string, description: string) => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📋 Goal Templates</h3>
          <button className="btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <p style={{ marginBottom: 16 }}>Click a template to create a goal based on it:</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {goalTemplates.map(t => (
              <button
                key={t.title}
                onClick={() => { onSelect(t.title, t.description); onClose(); }}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '12px 14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--warning)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'green' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const cls = color === 'green' ? 'progress-green' : color === 'red' ? 'progress-red' : color === 'amber' ? 'progress-amber' : 'progress-blue';
  return (
    <div className="progress-bar" style={{ width: 80 }}>
      <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ key: 'title', direction: 'asc' });
  const [modal, setModal] = useState<'new' | 'edit' | 'template' | null>(null);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<{ title: string; description: string } | null>(null);

  const rows = useMemo(() => {
    const withStats = goals.map(g => ({
      ...g,
      successRate: g.daysUsed > 0 ? (g.successDays / g.daysUsed) * 100 : 0,
    }));
    const filtered = search
      ? withStats.filter(g => g.title.toLowerCase().includes(search.toLowerCase()))
      : withStats;
    return [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      switch (sort.key) {
        case 'title': return dir * a.title.localeCompare(b.title);
        case 'daysUsed': return dir * (a.daysUsed - b.daysUsed);
        case 'successRate': return dir * (a.successRate - b.successRate);
        case 'currentStreak': return dir * (a.currentStreak - b.currentStreak);
        case 'bestStreak': return dir * (a.bestStreak - b.bestStreak);
        default: return 0;
      }
    });
  }, [goals, search, sort]);

  const maxDays = useMemo(() => Math.max(...goals.map(g => g.daysUsed), 1), [goals]);

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
          <Target size={20} color="var(--vellum)" />
          <h1>Daily Goals</h1>
        </div>
        <p className="page-subtitle">{goals.length} daily goals • Process adherence and accountability</p>
      </div>

      <div className="action-bar" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => { setTemplateData(null); setModal('new'); }}><Plus size={14} /> New Goal</button>
        <button className="btn btn-secondary" onClick={() => setModal('template')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={13} /> Browse Templates</button>
        
        {/* View Mode Toggle: Board (In Progress / Done) vs Table */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 2,
            marginLeft: 4,
          }}
        >
          <button
            onClick={() => setViewMode('board')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'board' ? 'rgba(212, 197, 160, 0.18)' : 'transparent',
              color: viewMode === 'board' ? 'var(--vellum)' : 'var(--text-muted)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutGrid size={13} /> Execution Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: viewMode === 'table' ? 'rgba(212, 197, 160, 0.18)' : 'transparent',
              color: viewMode === 'table' ? 'var(--vellum)' : 'var(--text-muted)',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Table size={13} /> All Goals Table
          </button>
        </div>

        {viewMode === 'table' && <button className="btn btn-secondary"><Settings2 size={13} /> Columns</button>}

        <div className="action-bar-right" style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
          <input className="search-input" placeholder="Search goals..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
        </div>
      </div>

      {viewMode === 'board' ? (
        <AnimatedTaskBoard />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <Th col="title">Goal</Th>
                  <Th col="daysUsed">Days Used</Th>
                  <Th col="successRate">Success Rate</Th>
                  <Th col="currentStreak">Current Streak</Th>
                  <Th col="bestStreak">Best Streak</Th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      {search ? 'No goals match your search' : 'No goals yet. Create your first daily goal!'}
                    </td>
                  </tr>
                ) : rows.map(row => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{row.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{row.description}</div>
                    </td>
                    <td>
                      <div style={{ fontVariantNumeric: 'tabular-nums' }}>{row.daysUsed}</div>
                      <ProgressBar value={row.daysUsed} max={maxDays} color="amber" />
                    </td>
                    <td>
                      {row.daysUsed > 0 ? (
                        <>
                          <div style={{ color: row.successRate >= 60 ? 'var(--accent)' : row.successRate >= 30 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                            {formatPercent(row.successRate)}
                          </div>
                          <ProgressBar value={row.successRate} color={row.successRate >= 60 ? 'green' : row.successRate >= 30 ? 'amber' : 'red'} />
                        </>
                      ) : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                    </td>
                    <td>
                      {row.currentStreak > 0
                        ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>🔥 {row.currentStreak}</span>
                        : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                    </td>
                    <td>
                      {row.bestStreak > 0
                        ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}>🏆 {row.bestStreak}</span>
                        : <span style={{ color: 'var(--text-disabled)' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditing(row); setModal('edit'); }}>✏️</button>
                        {deleteConfirm === row.id ? (
                          <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }} onClick={() => { deleteGoal(row.id); setDeleteConfirm(null); }}>Confirm</button>
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
      )}

      {modal === 'new' && (
        <GoalModal
          goal={templateData ? { id: '', title: templateData.title, description: templateData.description, createdAt: '', daysUsed: 0, successDays: 0, currentStreak: 0, bestStreak: 0 } : null}
          onClose={() => { setModal(null); setTemplateData(null); }}
          onSave={data => addGoal(data)}
        />
      )}
      {modal === 'edit' && editing && (
        <GoalModal goal={editing} onClose={() => { setModal(null); setEditing(null); }} onSave={data => updateGoal(editing.id, data)} />
      )}
      {modal === 'template' && (
        <TemplateModal
          onClose={() => setModal(null)}
          onSelect={(title, description) => { setTemplateData({ title, description }); setModal('new'); }}
        />
      )}
    </div>
  );
}
