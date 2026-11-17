import type { Metadata } from 'next';
import './globals.css';
import StoreHydrator from '@/components/StoreHydrator';

export const metadata: Metadata = {
  title: 'Tradostats — Professional Trading Journal',
  description: 'Track trades, analyze performance, and optimize your trading strategies with Tradostats — the professional trader\'s journal.',
  keywords: 'trading journal, trade log, performance analytics, day trading, forex, futures',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
