'use client';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainSidebar from '@/components/layout/MainSidebar';
import { Plus, Calendar, FileText, Clock, Bookmark, Trash2, Folder } from 'lucide-react';

export default function NotebooksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { trades, dailyNotes, stickyNotes, notebooks, addNotebook } = useStore();
  const isDailyNotes = pathname === '/notebooks/daily-notes';

  const mainItems = [
    { label: 'Daily Planner', href: '/notebooks/daily-notes', icon: <Calendar size={14} />, count: dailyNotes.length },
    { label: 'Trade Log', href: '/notebooks/trade-log', icon: <FileText size={14} />, count: trades.length },
    { label: 'Recent Notes', href: '/notebooks/recent-notes', icon: <Clock size={14} />, count: 0 },
  ];

  if (isDailyNotes) {
    return (
      <div className="app-shell">
        <MainSidebar />
        <div style={{ flex: 1, height: '100vh', overflow: 'hidden', minWidth: 0 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <MainSidebar />
      <div className="secondary-sidebar">
        <div style={{ padding: '0 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '10px 4px 4px' }}>
            NOTEBOOKS
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '0 4px' }}>
            Trading Journal &amp; Notes
          </div>
        </div>
        {mainItems.map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
            <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
            <span className="label">{item.label}</span>
            {item.count > 0 && <span className="count">{item.count}</span>}
          </Link>
        ))}

        <div style={{ padding: '14px 16px 4px', marginTop: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            COLLECTIONS
          </div>
        </div>

        <Link href="/notebooks/sticky-notes" className={`sidebar-item ${pathname === '/notebooks/sticky-notes' ? 'active' : ''}`}>
          <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bookmark size={14} /></span>
          <span className="label">Sticky Notes</span>
          {stickyNotes.length > 0 && <span className="count">{stickyNotes.length}</span>}
        </Link>

        {notebooks.map(nb => (
          <Link key={nb.id} href={`/notebooks/notebook/${nb.id}`} className={`sidebar-item ${pathname === `/notebooks/notebook/${nb.id}` ? 'active' : ''}`}>
            <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Folder size={14} /></span>
            <span className="label">{nb.name}</span>
            <span className="count">{nb.notes.length}</span>
          </Link>
        ))}

        <button
          className="sidebar-item"
          onClick={() => {
            const name = prompt('Notebook name:');
            if (name?.trim()) addNotebook(name.trim());
          }}
          style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12.5 }}
        >
          <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={13} /></span>
          <span className="label">Add Notebook</span>
        </button>

        <div style={{ marginTop: 'auto', padding: '8px 0 0', borderTop: '1px solid var(--border)' }}>
          <Link href="/notebooks/recently-deleted" className={`sidebar-item ${pathname === '/notebooks/recently-deleted' ? 'active' : ''}`}>
            <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={13} /></span>
            <span className="label">Recently Deleted</span>
          </Link>
        </div>
      </div>
      <div className="content-area">{children}</div>
    </div>
  );
}
