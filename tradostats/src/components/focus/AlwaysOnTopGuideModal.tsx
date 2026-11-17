'use client';

import React from 'react';
import { X, Pin, ExternalLink, Monitor, Sparkles, Check, Command } from 'lucide-react';
import { openFocusPopout } from '@/lib/focusSync';

interface AlwaysOnTopGuideModalProps {
  onClose: () => void;
  date: string;
}

export default function AlwaysOnTopGuideModal({
  onClose,
  date,
}: AlwaysOnTopGuideModalProps) {
  // Check if Document Picture-in-Picture is supported
  const hasDocumentPip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;

  async function handleLaunchDocumentPip() {
    if (typeof window !== 'undefined' && (window as any).documentPictureInPicture) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 420,
          height: 880,
        });

        // Copy styles
        Array.from(document.styleSheets).forEach((styleSheet: any) => {
          try {
            const cssRules = Array.from(styleSheet.cssRules)
              .map((rule: any) => rule.cssText)
              .join('');
            const style = pipWindow.document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch {
            if (styleSheet.href) {
              const link = pipWindow.document.createElement('link');
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        // Load focus iframe or content
        const iframe = pipWindow.document.createElement('iframe');
        iframe.src = `/focus?date=${encodeURIComponent(date)}&popout=true`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.overflow = 'hidden';
        pipWindow.document.body.appendChild(iframe);

        onClose();
      } catch (err) {
        console.warn('Document Picture-in-Picture error, falling back to popup', err);
        openFocusPopout(date);
        onClose();
      }
    } else {
      openFocusPopout(date);
      onClose();
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 6, 9, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#13151f',
          border: '1.5px solid #282c3c',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(221, 167, 67, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #232733',
            background: 'linear-gradient(180deg, #181b26 0%, #13151f 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 4,
                background: 'rgba(212, 197, 160, 0.1)',
                border: '1px solid rgba(212, 197, 160, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--vellum)',
              }}
            >
              <Pin size={15} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Always-on-Top & Docking Setup
              </h3>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pin next to TradingView & Charts</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888f9e',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Method 1: Popout Window / PiP */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              borderRadius: 4,
              border: '1px solid rgba(212, 197, 160, 0.3)',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--vellum)' }}>
                  {hasDocumentPip ? 'Native Picture-in-Picture (Always on Top)' : 'Dedicated Pop-Out Window'}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent)',
                    padding: '1px 5px',
                    borderRadius: 2,
                  }}
                >
                  RECOMMENDED
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Opens a minimal 420px vertical companion window that floats freely over all charts and desktop applications.
            </p>

            <div style={{ marginTop: 8 }}>
              <button
                onClick={handleLaunchDocumentPip}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 4,
                  background: 'var(--vellum)',
                  border: 'none',
                  color: '#0c0e12',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ExternalLink size={13} /> Launch Floating Pop-Out Window
              </button>
            </div>
          </div>

          {/* Method 2: Windows Docking & Snapping */}
          <div
            style={{
              background: '#161924',
              borderRadius: 8,
              border: '1px solid #232733',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Monitor size={14} color="#3B82F6" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                Side-by-Side Docking (Windows / macOS)
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Windows Snap:</strong> Press <code style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 2, color: 'var(--vellum)', fontFamily: 'monospace' }}>Win + Right Arrow</code> to dock companion to the right 25% of your screen.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>PowerToys Always on Top:</strong> Press <code style={{ background: 'var(--bg)', padding: '1px 4px', borderRadius: 2, color: 'var(--vellum)', fontFamily: 'monospace' }}>Win + Ctrl + T</code> to pin any window permanently on top of TradingView.
              </li>
            </ul>
          </div>

          {/* Sync indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#0e1017', borderRadius: 6, border: '1px solid #1f2330' }}>
            <Sparkles size={12} color="#10B981" />
            <span style={{ fontSize: 10, color: '#9aa0a6' }}>
              All edits in the pop-out window sync in real-time with your main dashboard via BroadcastChannel.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #232733', display: 'flex', justifyContent: 'flex-end', background: '#11131b' }}>
          <button
            onClick={onClose}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              background: '#1a1d28',
              border: '1px solid #2a2e3d',
              color: '#9aa0a6',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
