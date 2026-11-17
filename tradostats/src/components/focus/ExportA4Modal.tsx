'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import {
  X,
  Download,
  Copy,
  Check,
  Printer,
  FileImage,
  FileText,
  Sparkles,
  Calendar,
  Award,
  ShieldCheck,
  Brain,
  Loader2,
  Maximize2,
  Minimize2,
  CheckCircle2,
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
  const [exportType, setExportType] = useState<'pdf' | 'png' | 'copy' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAutofit, setIsAutofit] = useState(true);
  const [autofitScale, setAutofitScale] = useState(1);

  const a4PageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // -------------------------------------------------------------
  // DYNAMIC A4 AUTOFIT CALCULATION
  // Standard A4: 794px width x 1123px height at 96 DPI
  // If content is bigger, dynamically scale it so it fits on 1 A4 page
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isAutofit || !a4PageRef.current || !contentRef.current) {
      setAutofitScale(1);
      return;
    }

    function calculateAutofit() {
      if (!a4PageRef.current || !contentRef.current) return;

      const targetA4Height = 1123;
      const headerEl = a4PageRef.current.querySelector('.a4-doc-header') as HTMLElement | null;
      const footerEl = a4PageRef.current.querySelector('.a4-doc-footer') as HTMLElement | null;

      const headerHeight = headerEl ? headerEl.offsetHeight : 120;
      const footerHeight = footerEl ? footerEl.offsetHeight : 50;
      const paddingAndGaps = 84 + 32; // 42px top + 42px bottom padding + margin gaps
      const availableContentHeight = targetA4Height - headerHeight - footerHeight - paddingAndGaps;

      // Measure unconstrained natural scroll height of the inner content
      const naturalHeight = contentRef.current.scrollHeight;

      if (naturalHeight > availableContentHeight && availableContentHeight > 100) {
        const scale = Math.max(0.35, Math.min(1, availableContentHeight / naturalHeight));
        setAutofitScale(Number(scale.toFixed(3)));
      } else {
        setAutofitScale(1);
      }
    }

    calculateAutofit();
    const timer1 = setTimeout(calculateAutofit, 120);
    const timer2 = setTimeout(calculateAutofit, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAutofit, htmlContent, drcData, dayTrades]);

  // -------------------------------------------------------------
  // 1. DOWNLOAD AS PDF (Auto-fits or Multi-Page Slicing)
  // -------------------------------------------------------------
  async function handleDownloadPdf() {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    setExportType('pdf');

    try {
      const element = a4PageRef.current;
      const originalScrollTop = element.scrollTop;

      // Capture high-resolution render (2x pixel ratio for print sharpness)
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        width: 794,
        height: isAutofit ? 1123 : element.scrollHeight,
        filter: (node: HTMLElement) => !node.classList?.contains('no-export'),
      });

      element.scrollTop = originalScrollTop;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      if (isAutofit) {
        // Fits perfectly on single A4 sheet
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      } else {
        // Natural multi-page slicing if user opted out of single-page autofit
        const imgProps = pdf.getImageProperties(dataUrl);
        const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;

        if (imgHeightInMm <= pdfHeight) {
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeightInMm, undefined, 'FAST');
        } else {
          let heightLeft = imgHeightInMm;
          let position = 0;

          pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeightInMm;
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeightInMm, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        }
      }

      pdf.save(`tradostats-journal-${date}-A4.pdf`);
    } catch (err) {
      console.error('Failed to export A4 PDF', err);
      alert('Unable to generate PDF. Please try again or use Print / Save as PDF.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }

  // -------------------------------------------------------------
  // 2. DOWNLOAD AS PNG (Fixed to never cut out extended content)
  // -------------------------------------------------------------
  async function handleDownloadPng() {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    setExportType('png');

    try {
      const element = a4PageRef.current;
      const targetWidth = 794;
      const targetHeight = isAutofit ? 1123 : element.scrollHeight;

      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        width: targetWidth,
        height: targetHeight,
        filter: (node: HTMLElement) => !node.classList?.contains('no-export'),
      });

      const link = document.createElement('a');
      link.download = `tradostats-journal-${date}-A4.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export A4 PNG', err);
      alert('Unable to generate PNG image. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }

  // -------------------------------------------------------------
  // 3. COPY IMAGE TO CLIPBOARD
  // -------------------------------------------------------------
  async function handleCopyToClipboard() {
    if (!a4PageRef.current) return;
    setIsExporting(true);
    setExportType('copy');

    try {
      const element = a4PageRef.current;
      const targetWidth = 794;
      const targetHeight = isAutofit ? 1123 : element.scrollHeight;

      const blob = await toBlob(element, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        width: targetWidth,
        height: targetHeight,
        filter: (node: HTMLElement) => !node.classList?.contains('no-export'),
      });

      if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Clipboard image copy not supported in this browser. Please use Download PNG or Download PDF.');
      }
    } catch (err) {
      console.error('Failed to copy A4 image to clipboard', err);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  }

  // -------------------------------------------------------------
  // 4. PRINT / BROWSER NATIVE SAVE AS PDF
  // -------------------------------------------------------------
  function handlePrint() {
    window.print();
  }

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 6, 9, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 16px',
      }}
      onClick={onClose}
    >
      {/* ======================================================== */}
      {/* TOP MODAL CONTROL BAR                                    */}
      {/* ======================================================== */}
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '8px 8px 0 0',
          padding: '10px 18px',
          flexWrap: 'wrap',
          gap: 10,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'rgba(212, 197, 160, 0.12)',
              border: '1px solid rgba(212, 197, 160, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum)',
            }}
          >
            <FileText size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Export Journal as A4 Document
              </h3>
              {isAutofit && autofitScale < 1 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--accent)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                  title="Content automatically scaled to fit perfectly within single A4 page"
                >
                  Autofit: {Math.round(autofitScale * 100)}%
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Actuarial export for audit review, prop archives, and sharing
            </span>
          </div>
        </div>

        {/* Action Controls & Format Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Autofit Toggle */}
          <button
            onClick={() => setIsAutofit(!isAutofit)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: 4,
              border: isAutofit ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: isAutofit ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
              color: isAutofit ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isAutofit ? 'Content auto-fits within single A4 page' : 'Full natural length without scaling'}
          >
            {isAutofit ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isAutofit ? 'Autofit A4' : 'Full Length'}</span>
          </button>

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
                fontSize: 10.5,
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
                fontSize: 10.5,
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
              padding: '5px 9px',
              borderRadius: 4,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: copied ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 11,
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
            title="Copy high-res image to clipboard"
          >
            {copied ? <Check size={12} color="var(--accent)" /> : <Copy size={12} />}
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
              padding: '5px 11px',
              borderRadius: 4,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
            title="Download unclipped high-res PNG"
          >
            {isExporting && exportType === 'png' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <FileImage size={12} />
            )}
            <span>Download PNG</span>
          </button>

          {/* PRIMARY: Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 14px',
              borderRadius: 4,
              background: 'var(--vellum)',
              border: 'none',
              color: '#0c0e12',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(212, 197, 160, 0.3)',
            }}
            title="Download true A4 PDF document"
          >
            {isExporting && exportType === 'pdf' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>Download PDF</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 4,
              cursor: 'pointer',
              padding: '5px 8px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title="Print or Native PDF Save"
          >
            <Printer size={12} />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888f9e',
              cursor: 'pointer',
              padding: 4,
              marginLeft: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* A4 SCROLLABLE VIEWPORT CONTAINER                         */}
      {/* ======================================================== */}
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: 'calc(88vh - 60px)',
          overflowY: 'auto',
          background: '#07080b',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* THE RENDERED A4 DOCUMENT CANVAS                          */}
        {/* Standard A4 Ratio: 794px width x 1123px height           */}
        {/* ======================================================== */}
        <div
          ref={a4PageRef}
          style={{
            width: '794px',
            minHeight: '1123px',
            height: isAutofit ? '1123px' : 'auto',
            maxHeight: isAutofit ? '1123px' : 'none',
            overflow: isAutofit ? 'hidden' : 'visible',
            background: isDark ? '#0d0e12' : '#FFFFFF',
            color: isDark ? '#E5E7EB' : '#111827',
            padding: '40px 46px',
            boxSizing: 'border-box',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          {/* Document Header */}
          <div
            className="a4-doc-header"
            style={{
              borderBottom: isDark ? '2px solid #232733' : '2px solid #E5E7EB',
              paddingBottom: 14,
              marginBottom: 18,
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

          {/* Document Content Render with Autofit Scale */}
          <div
            ref={contentRef}
            className="a4-export-content"
            style={{
              flex: 1,
              fontSize: '13px',
              lineHeight: 1.7,
              color: isDark ? '#D1D5DB' : '#1F2937',
              transform: isAutofit && autofitScale < 1 ? `scale(${autofitScale})` : 'none',
              transformOrigin: 'top left',
              width: isAutofit && autofitScale < 1 ? `${(100 / autofitScale).toFixed(1)}%` : '100%',
              transition: 'transform 0.2s ease, width 0.2s ease',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Document Footer */}
          <div
            className="a4-doc-footer"
            style={{
              borderTop: isDark ? '1px solid #232733' : '1px solid #E5E7EB',
              paddingTop: 12,
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10,
              color: isDark ? '#6B7280' : '#9CA3AF',
            }}
          >
            <span>Tradostats Professional Trading Journal &amp; Execution Blueprint</span>
            <span>
              {isAutofit ? 'Verified Daily Record • Page 1 of 1 (A4 Autofit)' : 'Verified Daily Record • Complete Multi-Page Record'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
