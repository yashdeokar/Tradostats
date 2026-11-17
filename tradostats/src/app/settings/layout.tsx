'use client';
import MainSidebar from '@/components/layout/MainSidebar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <MainSidebar />
      <div className="content-area">{children}</div>
    </div>
  );
}
