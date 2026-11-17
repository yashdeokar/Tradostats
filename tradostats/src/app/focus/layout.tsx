import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Focus Companion — Tradostats',
  description: 'Ultra-compact live trading companion, risk rules checklist, playbook setups, and execution journal docked to charts.',
};

export default function FocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07080b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
