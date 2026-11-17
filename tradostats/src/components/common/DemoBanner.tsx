'use client';
import { useStore } from '@/lib/store';
import { Sparkles, ArrowRight, X, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DemoBanner() {
  const { isDemoMode, openAuthModal, clearToFreshAccount } = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  return (
    <div
      style={{
        background: 'var(--vellum-subtle)',
        borderBottom: '1px solid var(--vellum-border)',
        padding: '6px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--vellum-light)',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={13} style={{ color: 'var(--vellum)' }} />
        <span>
          <strong style={{ color: 'var(--vellum-light)', fontWeight: 600 }}>Demo Mode Active:</strong> Auditing preloaded sample trades &amp; performance data.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={openAuthModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--vellum)',
            color: '#0c0e12',
            border: 'none',
            borderRadius: 'var(--radius-card)',
            padding: '3px 10px',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>Sign In to Start Fresh</span>
          <ArrowRight size={11} />
        </button>

        <button
          onClick={clearToFreshAccount}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: '3px 9px',
            fontSize: 11.5,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Trash2 size={11} style={{ color: 'var(--danger)' }} />
          <span>Clear Slate</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Dismiss banner"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
