'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function StoreHydrator() {
  useEffect(() => {
    // Rehydrate the store from localStorage on mount
    useStore.persist.rehydrate();
    const state = useStore.getState();
    // Only inject sample demo trades if explicitly in Demo Mode
    if (state.isDemoMode) {
      state.ensureCurrentMonthTrades();
    }
  }, []);

  return null;
}
