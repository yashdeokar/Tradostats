'use client';

import React, { useRef, useState } from 'react';
import { toPng, toBlob } from 'html-to-image';
import {
  X, Download, Copy, Check, Printer, FileImage,
  Sparkles, Calendar, Award, ShieldCheck, Brain, Loader2
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import type { DailyReportCardData } from '@/lib/drcTypes';
import { getGradeBadgeStyle } from '@/lib/drcTypes';
import type { Trade } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ExportA4ModalProps {
  date: string;
  drcData: DailyReportCardData;
  htmlContent: string;
  trades: Trade[];
  onClose: () => void;
}

export default function ExportA4Modal({
  date,
  drcData,
  htmlContent,
  trades,
  onClose,
}: ExportA4ModalProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const a4PageRef = useRef<HTMLDivElement>(null);

  // Formatted date string
  const formattedDate = (() => {
    try {
      const parsed = parseISO(date);
      if (isValid(parsed)) return format(parsed, 'EEEE, MMMM d, yyyy');
    } catch {}
    return date;
  })();

  const gradeStyle = getGradeBadgeStyle(drcData.grade);

  // Trade stats for this day
  const dayTrades = trades.filter(t => t.dateTime && t.dateTime.startsWith(date));
  const totalPnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = dayTrades.filter(t => t.pnl > 0).length;

  async function handleDownloadPng() {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(a4PageRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true, // CRITICAL: Fixes cssRules SecurityError from external stylesheets
        filter: (node: HTMLElement) => {
          return !node.classList?.contains('no-export');
        },
      });
      const link = document.createElement('a');
      link.download = `tradostats-journal-${date}-A4.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export A4 image', err);
      alert('Unable to generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCopyToClipboard() {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    try {
      const blob = await toBlob(a4PageRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true, // CRITICAL: Fixes cssRules SecurityError from external stylesheets
        filter: (node: HTMLElement) => {
          return !node.classList?.contains('no-export');
        },
      });
      if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Clipboard image copy not supported in this browser. Please use Download PNG.');
      }
    } catch (err) {
      console.error('Failed to copy A4 image to clipboard', err);
    } finally {
      setIsExporting(false);
    }
  }

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 6, 9, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Top Modal Control Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '6px 6px 0 0',
          padding: '10px 16px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: 'rgba(212, 197, 160, 0.1)',
              border: '1px solid rgba(212, 197, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum)',
            }}
          >
            <FileImage size={14} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Export Journal as A4 Image
            </h3>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Actuarial export for audit review, archives, and reporting
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle (Dark vs Print Light) */}
          <div style={{ display: 'flex', background: 'var(--bg)', padding: 2, borderRadius: 4, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                padding: '3px 8px',
                borderRadius: 3,
                border: 'none',
                background: isDark ? 'var(--vellum)' : 'transparent',
                color: isDark ? '#0c0e12' : 'var(--text-muted)',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ledger Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              style={{
                padding: '3px 8px',
                borderRadius: 3,
                border: 'none',
                background: !isDark ? 'var(--vellum)' : 'transparent',
                color: !isDark ? '#0c0e12' : 'var(--text-muted)',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Print Light
            </button>
          </div>

          {/* Copy Image Button */}
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 4,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: copied ? 'var(--accent)' : 'var(--text-primary)',
              fontSize: 11,
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 4,
              background: 'var(--vellum)',
              border: 'none',
              color: '#0c0e12',
              fontSize: 11,
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
          >
            {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
          </button>

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
      </div>

      {/* A4 Scrollable Viewport Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: 'calc(88vh - 60px)',
          overflowY: 'auto',
          background: '#07080b',
          border: '1px solid #232733',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* THE RENDERED A4 DOCUMENT CANVAS */}
        {/* Standard A4 Aspect Ratio: 794px width x 1123px min-height */}
        {/* ======================================================== */}
        <div
          ref={a4PageRef}
          style={{
            width: '794px',
            minHeight: '1123px',
            background: isDark ? '#0d0e12' : '#FFFFFF',
            color: isDark ? '#E5E7EB' : '#111827',
            padding: '42px 48px',
            boxSizing: 'border-box',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          {/* Document Header */}
          <div
            style={{
              borderBottom: isDark ? '2px solid #232733' : '2px solid #E5E7EB',
              paddingBottom: 16,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: isDark ? '#fff' : '#0d0e12',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Tradostats
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#d4c5a0',
                    border: '1px solid rgba(212, 197, 160, 0.4)',
                    padding: '1px 6px',
                    borderRadius: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  AUDITED LEDGER
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark ? '#d4c5a0' : '#8a7342',
                  marginTop: 4,
                  fontFamily: 'monospace',
                }}
              >
                {formattedDate}
              </div>
            </div>

            {/* Scorecard Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {drcData.grade !== 'Unrated' && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: gradeStyle.bg,
                      color: gradeStyle.color,
                      border: `1.5px solid ${gradeStyle.border}`,
                    }}
                  >
                    GRADE {drcData.grade}
                  </span>
                )}
                {dayTrades.length > 0 && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: totalPnl >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: totalPnl >= 0 ? '#10B981' : '#EF4444',
                      border: totalPnl >= 0 ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    {totalPnl >= 0 ? `+${formatCurrency(totalPnl)}` : formatCurrency(totalPnl)} ({wins}W / {dayTrades.length - wins}L)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: isDark ? '#181b26' : '#F3F4F6',
                    color: isDark ? '#9aa0a6' : '#4B5563',
                    border: isDark ? '1px solid #282c3c' : '1px solid #E5E7EB',
                  }}
                >
                  Rules: {drcData.ruleAdherence}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: isDark ? '#181b26' : '#F3F4F6',
                    color: isDark ? '#9aa0a6' : '#4B5563',
                    border: isDark ? '1px solid #282c3c' : '1px solid #E5E7EB',
                  }}
                >
                  Mindset: {drcData.mindset}
                </span>
              </div>
            </div>
          </div>

          {/* Document Content Render */}
          <div
            className="a4-export-content"
            style={{
              flex: 1,
              fontSize: '13px',
              lineHeight: 1.7,
              color: isDark ? '#D1D5DB' : '#1F2937',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Document Footer */}
          <div
            style={{
              borderTop: isDark ? '1px solid #232733' : '1px solid #E5E7EB',
              paddingTop: 12,
              marginTop: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10,
              color: isDark ? '#6B7280' : '#9CA3AF',
            }}
          >
            <span>Tradostats Professional Trading Journal & Execution Blueprint</span>
            <span>Verified Daily Record • Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
