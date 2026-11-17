'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, X } from 'lucide-react';

const STICKY_COLORS = ['#131920', '#1a2332', '#1c2a1a', '#2a1c1c', '#1c1c2a', '#2a2a1c'];

export default function StickyNotesPage() {
  const { stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote } = useStore();
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title"><span style={{ fontSize: 22 }}>📌</span><h1>Sticky Notes</h1></div>
        <p className="page-subtitle">Quick notes and reminders — always accessible</p>
      </div>

      {/* Add new sticky */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>New Sticky Note</div>
        <textarea
          className="input-base"
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Quick note..."
          rows={3}
          style={{ resize: 'vertical', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {STICKY_COLORS.map(c => (
            <button key={c} onClick={() => setSelectedColor(c)} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: `2px solid ${selectedColor === c ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', outline: 'none' }} />
          ))}
          <button
            className="btn btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => { if (newContent.trim()) { addStickyNote(newContent.trim(), selectedColor); setNewContent(''); } }}
          >
            <Plus size={14} /> Add Note
          </button>
        </div>
      </div>

      {/* Grid of stickies */}
      {stickyNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📌</div>
          <p>No sticky notes yet. Add your first one above!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {stickyNotes.map(note => (
            <div key={note.id} style={{ background: note.color, border: '1px solid var(--border)', borderRadius: 10, padding: '14px', position: 'relative', minHeight: 120 }}>
              <button onClick={() => deleteStickyNote(note.id)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.6 }}>
                <X size={14} />
              </button>
              <textarea
                value={note.content}
                onChange={e => updateStickyNote(note.id, e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'inherit', paddingRight: 20 }}
                rows={4}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
