'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { X, Lock, Mail, User, Shield, Sparkles, TrendingUp } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithCreds, loadDemoData } = useStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    loginWithCreds({
      email: email.trim(),
      name: name.trim() || undefined,
      password: password.trim(),
    });
  };

  const handleDemoClick = () => {
    loadDemoData();
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal} style={{ zIndex: 100 }}>
      <div
        className="modal"
        style={{
          maxWidth: 440,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-card)',
          padding: 0,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card-hover)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--border)', position: 'relative', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-badge)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={15} color="var(--accent)" strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {tab === 'signin' ? 'Sign In to Journal' : 'Create Fresh Account'}
              </h3>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                PRIVATE &amp; AUDITED WORKSPACE
              </span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            style={{
              position: 'absolute',
              right: 18,
              top: 18,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <button
              onClick={() => { setTab('signin'); setError(''); }}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 'var(--radius-badge)',
                fontSize: 12,
                fontWeight: 600,
                background: tab === 'signin' ? 'var(--bg-card)' : 'transparent',
                border: `1px solid ${tab === 'signin' ? 'var(--border-hover)' : 'transparent'}`,
                color: tab === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 'var(--radius-badge)',
                fontSize: 12,
                fontWeight: 600,
                background: tab === 'signup' ? 'var(--bg-card)' : 'transparent',
                border: `1px solid ${tab === 'signup' ? 'var(--border-hover)' : 'transparent'}`,
                color: tab === 'signup' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Fresh Slate Guarantee Callout */}
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-card)',
              padding: '9px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <Shield size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>Clean Slate Guarantee:</strong> Real accounts start with <strong>0 trades</strong> and a completely fresh journal.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'signup' && (
              <div>
                <label className="form-label">
                  Trader Name / Handle (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Alex Trader"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-base"
                    style={{ paddingLeft: 30 }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="trader@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-base"
                  style={{ paddingLeft: 30 }}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base"
                  style={{ paddingLeft: 30 }}
                />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 11.5, color: 'var(--danger-light)', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', padding: '6px 10px', borderRadius: 'var(--radius-card)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px',
                fontSize: 12.5,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {tab === 'signin' ? 'Sign In (Start Fresh)' : 'Create Clean Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or test drive</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoClick}
            className="btn btn-gold"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '8px 12px',
              fontSize: 12,
            }}
          >
            <Sparkles size={13} />
            <span>Explore Demo Mode (Preloaded Sample Data)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
