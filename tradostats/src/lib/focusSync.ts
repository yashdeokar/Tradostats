'use client';

// BroadcastChannel for instant cross-tab / cross-window synchronization
const CHANNEL_NAME = 'tradostats_focus_sync_channel';

export type SyncMessage =
  | { type: 'NOTE_UPDATED'; date: string; content: string }
  | { type: 'GOALS_UPDATED'; date: string }
  | { type: 'TAGS_UPDATED'; date: string; tags: string[] }
  | { type: 'TRADE_LOGGED'; date: string }
  | { type: 'SETUPS_UPDATED' }
  | { type: 'REHYDRATE_REQUEST' };

let channel: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported or failed to initialize', e);
    }
  }
  return channel;
}

export function broadcastSync(message: SyncMessage) {
  const ch = getSyncChannel();
  if (ch) {
    try {
      ch.postMessage(message);
    } catch (e) {
      console.warn('Failed to broadcast sync message', e);
    }
  }
}

// Window pop-out utility for focus mode
export function openFocusPopout(date?: string) {
  if (typeof window === 'undefined') return;

  const targetDate = date || new Date().toISOString().slice(0, 10);
  const width = 420;
  const height = 900;
  
  // Center or dock to right side of screen
  const left = Math.max(20, window.screen.availWidth - width - 30);
  const top = 50;

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
    'toolbar=no',
    'menubar=no',
    'location=no',
    'directories=no',
  ].join(',');

  const popout = window.open(`/focus?date=${encodeURIComponent(targetDate)}&popout=true`, 'tradostats_focus_companion', features);
  if (popout) {
    popout.focus();
  }
}
