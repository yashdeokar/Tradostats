'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainSidebar from '@/components/layout/MainSidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ReportSection {
  id: string;
  label: string;
  items: { label: string; href: string }[];
}

const REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'general',
    label: 'General',
    items: [
      { label: 'Overview', href: '/reports/overview' },
      { label: 'Trade History', href: '/reports/trade-history' },
      { label: 'Wins & Losses', href: '/reports/wins-losses' },
    ],
  },
  {
    id: 'time-analysis',
    label: 'Time Analysis',
    items: [
      { label: 'Day of Week', href: '/reports/by-day' },
      { label: 'Weekly Trends', href: '/reports/by-week' },
      { label: 'Monthly Performance', href: '/reports/consecutive' },
      { label: 'Time of Day', href: '/reports/by-time' },
    ],
  },
  {
    id: 'trade-details',
    label: 'Trade Details',
    items: [
      { label: 'Trade Duration', href: '/reports/hold-times' },
      { label: 'Trade Volume', href: '/reports/volume' },
      { label: 'Symbols Comparison', href: '/reports/by-instrument' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { label: 'Pnl Simulator', href: '/reports/simulator' },
    ],
  },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="app-shell">
      <MainSidebar />
      <aside
        style={{
          width: 220,
          minWidth: 220,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        {/* Secondary Sidebar Title */}
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--border)' }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Statistical Reports
          </h2>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Audit &amp; Edge Analytics
          </div>
        </div>

        {/* Sections */}
        <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REPORT_SECTIONS.map(section => {
            const isCollapsed = collapsed[section.id];
            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-badge)',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12 }}>{section.label}</span>
                  {isCollapsed ? (
                    <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronDown size={13} style={{ color: 'var(--vellum)' }} />
                  )}
                </button>

                {/* Section Items */}
                {!isCollapsed && (
                  <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 2 }}>
                    {section.items.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-badge)',
                            background: isActive ? 'var(--bg-card)' : 'transparent',
                            borderLeft: `2px solid ${isActive ? 'var(--vellum)' : 'transparent'}`,
                            transition: 'all 0.12s ease',
                          }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'var(--text-primary)';
                              e.currentTarget.style.background = 'var(--bg-hover)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 1,
                              background: isActive ? 'var(--vellum)' : 'var(--border-hover)',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      <main className="content-area">
        {children}
      </main>
    </div>
  );
}
