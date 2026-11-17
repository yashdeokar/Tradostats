'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileText,
  BarChart2,
  TrendingUp,
  Settings,
  LogIn,
  LogOut,
  Sparkles,
  Trash2,
  ChevronDown,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import AuthModal from '@/components/auth/AuthModal';
import { openFocusPopout } from '@/lib/focusSync';

const navSections = [
  {
    label: 'Workspace',
    items: [
      {
        icon: <Home size={15} strokeWidth={1.75} />,
        label: 'Home',
        href: '/',
        match: '/',
        exact: true,
      },
      {
        icon: <BookOpen size={15} strokeWidth={1.75} />,
        label: 'Playbook',
        href: '/playbook/setups',
        match: '/playbook',
      },
      {
        icon: <FileText size={15} strokeWidth={1.75} />,
        label: 'Notebooks',
        href: '/notebooks/daily-notes',
        match: '/notebooks',
      },
      {
        icon: <BarChart2 size={15} strokeWidth={1.75} />,
        label: 'Reports',
        href: '/reports/overview',
        match: '/reports',
      },
      {
        icon: <Zap size={15} strokeWidth={1.75} />,
        label: 'Focus Companion',
        href: '/focus',
        match: '/focus',
        isPopout: true,
      },
    ],
  },
];

export default function MainSidebar() {
  const pathname = usePathname();
  const { currentUser, isDemoMode, openAuthModal, logout, loadDemoData, clearToFreshAccount } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="main-sidebar">
      {/* Logo links to Home */}
      <Link href="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <div className="sidebar-logo-icon">
          <TrendingUp size={15} color="var(--accent)" strokeWidth={2} />
        </div>
        <div>
          <span className="sidebar-logo-text" style={{ display: 'block', lineHeight: 1.15 }}>
            Tradostats
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ACTUARIAL JOURNAL
          </span>
        </div>
      </Link>

      {/* Nav Sections */}
      {navSections.map((section) => (
        <div key={section.label} className="sidebar-section">
          <div className="sidebar-section-label">
            {section.label}
          </div>
          {section.items.map((item) => {
            const isActive = item.exact
              ? pathname === '/' || pathname === '/home'
              : pathname.startsWith(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  fontWeight: isActive ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span className="label" style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
                {item.isPopout && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openFocusPopout();
                    }}
                    title="Open standalone 420px pop-out window"
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--vellum-subtle)',
                      border: '1px solid var(--vellum-border)',
                      borderRadius: 3,
                      color: 'var(--vellum-light)',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={10} />
                  </button>
                )}
                {isActive && !item.isPopout && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 1,
                      background: 'var(--vellum)',
                      marginLeft: 'auto',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom section with User Account & Settings */}
      <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 'var(--radius-card)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span>Audited Account</span>
                </div>
              </div>
              <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-card)',
                  padding: 5,
                  boxShadow: 'var(--shadow-card-hover)',
                  zIndex: 30,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', marginBottom: 3 }}>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Signed in as</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </div>
                </div>

                <button
                  onClick={() => { clearToFreshAccount(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 8px',
                    borderRadius: 3,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                  <span>Clear to Fresh Slate</span>
                </button>

                <button
                  onClick={() => { loadDemoData(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 8px',
                    borderRadius: 3,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--vellum-light)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Sparkles size={12} />
                  <span>Load Demo Sample Data</span>
                </button>

                <button
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 8px',
                    borderRadius: 3,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderTop: '1px solid var(--border)',
                    marginTop: 2,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : isDemoMode ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 'var(--radius-card)',
                background: 'var(--vellum-subtle)',
                border: '1px solid var(--vellum-border)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  background: 'var(--bg-input)',
                  border: '1px solid var(--vellum-border)',
                  color: 'var(--vellum-light)',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                DM
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Demo Trader</div>
                <div style={{ fontSize: 10, color: 'var(--vellum)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--vellum)' }} />
                  <span>Demo Mode</span>
                </div>
              </div>
              <ChevronDown size={12} style={{ color: 'var(--vellum)' }} />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 6,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-card)',
                  padding: 5,
                  boxShadow: 'var(--shadow-card-hover)',
                  zIndex: 30,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <button
                  onClick={() => { openAuthModal(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 8px',
                    borderRadius: 3,
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                    color: 'var(--accent)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogIn size={12} />
                  <span>Sign In with Creds (Fresh)</span>
                </button>

                <button
                  onClick={() => { clearToFreshAccount(); setShowUserMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 8px',
                    borderRadius: 3,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                  <span>Clear All (Start Fresh)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 11.5,
              padding: '6px 10px',
            }}
          >
            <LogIn size={13} />
            <span>Sign In / Demo</span>
          </button>
        )}

        <Link
          href="/settings"
          className={`sidebar-item ${pathname.startsWith('/settings') ? 'active' : ''}`}
          style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--radius-card)' }}
        >
          <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={14} strokeWidth={1.75} />
          </span>
          <span className="label">Settings</span>
        </Link>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, letterSpacing: '0.04em' }}>
          TRADOSTATS <span style={{ color: 'var(--vellum)' }}>v2.0</span>
        </div>
      </div>

      <AuthModal />
    </nav>
  );
}
