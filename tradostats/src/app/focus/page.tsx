'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FocusCompanion from '@/components/focus/FocusCompanion';

function FocusPageContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;
  const isPopout = searchParams.get('popout') === 'true';

  return (
    <FocusCompanion
      initialDate={dateParam}
      isPopoutWindow={isPopout}
    />
  );
}

export default function FocusPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%',
            background: '#0d0e12',
            color: '#DDA743',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Loading Focus Companion...
        </div>
      }
    >
      <FocusPageContent />
    </Suspense>
  );
}
