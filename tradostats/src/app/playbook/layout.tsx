'use client';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainSidebar from '@/components/layout/MainSidebar';
import { BarChart2, Tag, Target } from 'lucide-react';

export default function PlaybookLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setups, tags, goals } = useStore();

  const items = [
    { label: 'Setups', href: '/playbook/setups', icon: <BarChart2 size={14} />, count: setups.length },
    { label: 'Tags', href: '/playbook/tags', icon: <Tag size={14} />, count: tags.length },
    { label: 'Goals', href: '/playbook/goals', icon: <Target size={14} />, count: goals.length },
  ];

  return (
    <div className="app-shell">
      <MainSidebar />
      <div className="secondary-sidebar">
        <div style={{ padding: '0 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '10px 4px 4px' }}>
            PLAYBOOK
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '0 4px' }}>
            Setups, Tags &amp; Goals
          </div>
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              <span className="label">{item.label}</span>
              <span className="count">{item.count}</span>
            </Link>
          );
        })}
      </div>
      <div className="content-area">{children}</div>
    </div>
  );
}
