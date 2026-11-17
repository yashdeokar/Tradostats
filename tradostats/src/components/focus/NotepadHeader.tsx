'use client';

import React, { useRef } from 'react';
import { format, parseISO, isValid, addDays, subDays } from 'date-fns';
import {
  ChevronLeft, ChevronRight, ExternalLink, Calendar,
  Clock, Award, Check, Sparkles, Home, FileImage, Download
} from 'lucide-react';
import Link from 'next/link';
import type { DRCGrade } from '@/lib/drcTypes';
import { DRC_GRADES, getGradeBadgeStyle } from '@/lib/drcTypes';
import { openFocusPopout } from '@/lib/focusSync';

interface NotepadHeaderProps {
  date: string;
  onSelectDate: (date: string) => void;
  grade: DRCGrade;
  onChangeGrade: (grade: DRCGrade) => void;
  saveStatus: 'saved' | 'saving' | 'idle';
  lastSavedTime: string;
  isPopoutWindow?: boolean;
  onInsertTimestamp: () => void;
  onOpenExportA4?: () => void;
}

export default function NotepadHeader({
  date,
  onSelectDate,
  grade,
  onChangeGrade,
  saveStatus,
  lastSavedTime,
  isPopoutWindow = false,
  onInsertTimestamp,
  onOpenExportA4,
}: NotepadHeaderProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Formatted date string e.g. "Fri, Sep 25, 2026"
  const formattedDate = (() => {
    try {
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        return format(parsed, 'EEE, MMM d, yyyy');
      }
    } catch {}
    return date;
  })();

  function handlePrevDay() {
    try {
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        onSelectDate(format(subDays(parsed, 1), 'yyyy-MM-dd'));
      }
    } catch {}
  }

  function handleNextDay() {
    try {
      const parsed = parseISO(date);
      if (isValid(parsed)) {
        onSelectDate(format(addDays(parsed, 1), 'yyyy-MM-dd'));
      }
    } catch {}
  }

  function handleToday() {
    onSelectDate(format(new Date(), 'yyyy-MM-dd'));
  }

  const gradeStyle = getGradeBadgeStyle(grade);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
        userSelect: 'none',
        flexShrink: 0,
        gap: 6,
      }}
    >
      {/* Left: Date Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <button
          onClick={handlePrevDay}
          title="Previous Day"
          aria-label="Previous day"
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-badge)',
            border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeft size={13} />
        </button>

        {/* Clickable Date with Hidden Native Date Picker */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.click()}
            title="Click to jump to a specific date"
            aria-label={`Jump to date, currently ${formattedDate}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 5px',
              borderRadius: 'var(--radius-badge)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: 11.5,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--vellum-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            <Calendar size={12} style={{ color: 'var(--vellum)' }} />
            <span>{formattedDate}</span>
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={e => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: 'none',
            }}
          />
        </div>

        <button
          onClick={handleNextDay}
          title="Next Day"
          aria-label="Next day"
          style={{
            width: 24,
            height: 24,
            borderRadius: 'var(--radius-badge)',
            border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronRight size={13} />
        </button>

        <button
          onClick={handleToday}
          title="Jump to today"
          aria-label="Jump to today"
          style={{
            padding: '2px 7px',
            borderRadius: 'var(--radius-badge)',
            border: '1px solid var(--vellum-border)',
            background: 'var(--vellum-subtle)',
            color: 'var(--vellum-light)',
            fontSize: 10.5,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 2,
            transition: 'all 0.12s',
          }}
        >
          Today
        </button>
      </div>

      {/* Center/Right: DRC Grade Selector + Save Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* DRC Grade Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            DRC:
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={grade}
              onChange={e => onChangeGrade(e.target.value as DRCGrade)}
              aria-label="Daily Report Card overall grade"
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '2px 7px',
                borderRadius: 'var(--radius-badge)',
                background: gradeStyle.bg,
                color: gradeStyle.color,
                border: `1px solid ${gradeStyle.border}`,
                boxShadow: 'none',
                fontSize: 10.5,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                outline: 'none',
                textAlign: 'center',
              }}
              title="Daily Report Card overall grade"
            >
              <option value="Unrated" style={{ background: '#12141c', color: 'var(--text-muted)' }}>Grade: —</option>
              {DRC_GRADES.map(g => (
                <option key={g} value={g} style={{ background: '#12141c', color: getGradeBadgeStyle(g).color }}>
                  Grade: {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-Save Status Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            fontFamily: "'JetBrains Mono', monospace",
            color: saveStatus === 'saving' ? 'var(--warning)' : 'var(--accent)',
            padding: '2px 4px',
          }}
          title={lastSavedTime ? `Last saved at ${lastSavedTime}` : 'All changes saved locally'}
          aria-live="polite"
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: saveStatus === 'saving' ? 'var(--warning)' : 'var(--accent)',
            }}
          />
        </div>

        {/* Quick Timestamp Button */}
        <button
          onClick={onInsertTimestamp}
          title="Insert current timestamp into notes"
          aria-label="Insert timestamp"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            borderRadius: 'var(--radius-badge)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--vellum)',
            fontSize: 10.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Clock size={11} />
          <span>Time</span>
        </button>

        {/* Export A4 Image Button */}
        {onOpenExportA4 && (
          <button
            onClick={onOpenExportA4}
            title="Export daily journal as high-resolution A4 image"
            aria-label="Export A4 image"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 7px',
              borderRadius: 'var(--radius-badge)',
              background: 'var(--vellum-subtle)',
              border: '1px solid var(--vellum-border)',
              color: 'var(--vellum-light)',
              fontSize: 10.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            <FileImage size={11} />
            <span>A4</span>
          </button>
        )}

        {/* Pop-Out Button */}
        {!isPopoutWindow && (
          <button
            onClick={() => openFocusPopout(date)}
            title="Open in slim standalone sidecar window (420px)"
            aria-label="Open popout window"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-badge)',
              background: 'var(--vellum-subtle)',
              border: '1px solid var(--vellum-border)',
              color: 'var(--vellum-light)',
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            <ExternalLink size={11} />
          </button>
        )}

        {/* Back to Full Dashboard (only when not in popout window) */}
        {!isPopoutWindow && (
          <Link
            href="/notebooks/daily-notes"
            title="Back to Full Notebooks"
            aria-label="Back to notebooks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-badge)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'all 0.12s',
            }}
          >
            <Home size={12} />
          </Link>
        )}
      </div>
    </header>
  );
}
