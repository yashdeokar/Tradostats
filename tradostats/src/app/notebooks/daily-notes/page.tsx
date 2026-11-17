'use client';
import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatDate, formatCurrency, formatPercent } from '@/lib/utils';
import {
  format, parseISO, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isValid
} from 'date-fns';
import {
  Plus, Calendar, Printer, Focus, Settings, X, Check, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DEFAULT_TEMPLATE_HTML, TEMPLATE_PRESETS } from '@/lib/templates';
import { openFocusPopout } from '@/lib/focusSync';

// Dynamic import to avoid SSR issues with Tiptap
const RichEditor = dynamic(() => import('@/components/notebooks/RichEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: 'var(--text-muted)' }}>Loading editor...</div>,
});

function DailyNotesContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const {
    dailyNotes, dailyNoteTemplate, addDailyNote, updateDailyNote, deleteDailyNote,
    setups, tags, goals, trades
  } = useStore();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return dateParam;
    return '2026-09-25'; // Default matching the user's reference screenshot date
  });

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    try {
      const parsed = parseISO('2026-09-25');
      return startOfWeek(isValid(parsed) ? parsed : new Date(), { weekStartsOn: 1 });
    } catch {
      return startOfWeek(new Date(), { weekStartsOn: 1 });
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [activePlanDropdown, setActivePlanDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // Find note for selectedDate
  const currentNote = useMemo(() => {
    return dailyNotes.find(n => n.date === selectedDate);
  }, [dailyNotes, selectedDate]);

  // Trades on selectedDate
  const dayTrades = useMemo(() => {
    return trades.filter(t => t.dateTime.startsWith(selectedDate));
  }, [trades, selectedDate]);

  const dayStats = useMemo(() => {
    if (dayTrades.length === 0) return null;
    const wins = dayTrades.filter(t => t.pnl > 0).length;
    const totalPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    return {
      tradesCount: dayTrades.length,
      wins,
      losses: dayTrades.length - wins,
      totalPnl,
      winRate: Math.round((wins / dayTrades.length) * 100),
    };
  }, [dayTrades]);

  // Setups traded on this day
  const daySetups = useMemo(() => {
    const setupIds = new Set(dayTrades.map(t => t.setupId).filter(Boolean));
    return setups.filter(s => setupIds.has(s.id));
  }, [dayTrades, setups]);

  // Ensure note exists when date is selected
  useEffect(() => {
    if (dateParam && dateParam !== selectedDate) {
      setSelectedDate(dateParam);
      try {
        const parsed = parseISO(dateParam);
        if (isValid(parsed)) setCurrentWeekStart(startOfWeek(parsed, { weekStartsOn: 1 }));
      } catch {}
    }
  }, [dateParam]);

  // Auto-create blank note or update existing
  const handleContentChange = useCallback(
    (content: string) => {
      if (currentNote) {
        setIsSaving(true);
        updateDailyNote(currentNote.id, content);
        setTimeout(() => setIsSaving(false), 500);
      } else {
        setIsSaving(true);
        addDailyNote({ date: selectedDate, content });
        setTimeout(() => setIsSaving(false), 500);
      }
    },
    [currentNote, selectedDate, updateDailyNote, addDailyNote]
  );

  function handleApplyTemplate(html: string) {
    if (currentNote) {
      updateDailyNote(currentNote.id, html);
    } else {
      addDailyNote({ date: selectedDate, content: html });
    }
    setEditorVersion(v => v + 1);
    setShowTemplateModal(false);
  }

  // Weekday items (Mon - Fri)
  const weekdays = useMemo(() => {
    return [0, 1, 2, 3, 4].map(dayOffset => {
      const dayDate = addDays(currentWeekStart, dayOffset);
      const dayStr = format(dayDate, 'yyyy-MM-dd');
      return {
        date: dayDate,
        dateStr: dayStr,
        dayName: format(dayDate, 'EEEE'),
        shortMonth: format(dayDate, 'MMM').toUpperCase(),
        dayNum: format(dayDate, 'd'),
        hasTrades: trades.some(t => t.dateTime.startsWith(dayStr)),
        hasNote: dailyNotes.some(n => n.date === dayStr),
      };
    });
  }, [currentWeekStart, trades, dailyNotes]);

  // Week range label e.g. "Sep 20 - Sep 26, 2026"
  const weekRangeLabel = useMemo(() => {
    const endOfWeek = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
  }, [currentWeekStart]);

  // Setup color mapping helper
  const setupColorStyles: Record<string, { bg: string; border: string; text: string }> = {
    'False breakout': { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#fef08a' },
    '1 Tick': { bg: 'rgba(75, 85, 99, 0.3)', border: '#4b5563', text: '#e5e7eb' },
    'Breakout': { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#a7f3d0' },
    'Moving train': { bg: 'rgba(6, 182, 212, 0.2)', border: '#06b6d4', text: '#a5f3fc' },
    'Range play': { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#bfdbfe' },
    'Volume Ledge': { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#e9d5ff' },
  };

  const positiveTags = useMemo(() => tags.filter(t => t.sentiment === 'positive'), [tags]);
  const negativeTags = useMemo(() => tags.filter(t => t.sentiment === 'negative'), [tags]);

  const parsedSelectedDate = useMemo(() => {
    try {
      const d = parseISO(selectedDate);
      return isValid(d) ? d : new Date();
    } catch {
      return new Date();
    }
  }, [selectedDate]);

  return (
    <div style={{ display: 'flex', height: '100%', margin: 0, overflow: 'hidden', background: '#070709' }}>
      {/* ============================================================ */}
      {/* LEFT PANEL: Daily Planner Sidebar (Screenshot 1 Match)       */}
      {/* ============================================================ */}
      <div
        style={{
          width: 320,
          minWidth: 320,
          background: '#09090c',
          borderRight: '1px solid #14141c',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Header: Daily Planner + All Plans Dropdown */}
        <div style={{ padding: '20px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: '#f0f2f5', margin: 0, letterSpacing: '-0.02em' }}>
            Daily Planner
          </h2>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setActivePlanDropdown(!activePlanDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#13131b',
                border: '1px solid #232330',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#b0b5c0',
                cursor: 'pointer',
              }}
            >
              <span>All Plans</span>
              <ChevronDown size={11} />
            </button>
          </div>
        </div>

        {/* View Switchers: Traded Days, Weekly, Monthly */}
        <div style={{ padding: '0 18px 14px', display: 'flex', gap: 6, alignItems: 'center' }}>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              background: '#13131b',
              border: '1px solid #1f202b',
              color: '#8b909d',
            }}
          >
            {trades.length} Traded Days
          </div>

          <button
            onClick={() => setViewMode('weekly')}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              background: viewMode === 'weekly' ? 'rgba(197, 160, 89, 0.12)' : 'transparent',
              border: `1px solid ${viewMode === 'weekly' ? 'rgba(197, 160, 89, 0.35)' : 'transparent'}`,
              color: viewMode === 'weekly' ? '#cca456' : '#777c8a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Weekly
          </button>

          <button
            onClick={() => setViewMode('monthly')}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              background: viewMode === 'monthly' ? 'rgba(197, 160, 89, 0.12)' : 'transparent',
              border: `1px solid ${viewMode === 'monthly' ? 'rgba(197, 160, 89, 0.35)' : 'transparent'}`,
              color: viewMode === 'monthly' ? '#cca456' : '#777c8a',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Monthly
          </button>
        </div>

        {/* Date Navigator: Sep 20 - Sep 26, 2026   ‹   ›   Today » */}
        <div style={{ padding: '0 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#888d9a' }}>
          <span>{weekRangeLabel}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              style={{ background: 'transparent', border: 'none', color: '#888d9a', cursor: 'pointer', padding: 2 }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              style={{ background: 'transparent', border: 'none', color: '#888d9a', cursor: 'pointer', padding: 2 }}
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
                setSelectedDate(format(now, 'yyyy-MM-dd'));
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cca456',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                padding: '0 4px',
              }}
            >
              Today »
            </button>
          </div>
        </div>

        {/* Weekday Column Cards (Mon - Fri) */}
        <div style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
          {weekdays.map(day => {
            const isSelected = day.dateStr === selectedDate;
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px 2px',
                  borderRadius: 6,
                  background: isSelected ? '#151520' : '#0d0d12',
                  border: `1px solid ${isSelected ? '#cca456' : '#171822'}`,
                  boxShadow: isSelected ? '0 0 12px rgba(197, 160, 89, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 9.5, color: isSelected ? '#cca456' : '#6f7482', fontWeight: 600, textTransform: 'uppercase' }}>
                  {day.dayName.slice(0, 3)}
                </span>
                <span style={{ fontSize: 10, color: '#8e93a0', marginTop: 2 }}>
                  {day.shortMonth}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : '#c8ccd6',
                    marginTop: 2,
                  }}
                  className="tabular-nums"
                >
                  {day.dayNum}
                </span>
                {day.hasTrades && (
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00e699', marginTop: 3 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Section: CONFIGURE SETUPS */}
        <div style={{ borderTop: '1px solid #14141c', padding: '16px 18px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c5a059', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💼</span> CONFIGURE SETUPS
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#777c8a', cursor: 'pointer' }}>Reorder</span>
              <button
                style={{ background: 'transparent', border: 'none', color: '#cca456', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  const name = prompt('New Setup Name:');
                  if (name?.trim()) useStore.getState().addSetup({ name: name.trim(), color: '#00e699', icon: '📊', description: '' });
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Setup Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {setups.map((setup, idx) => {
              const style = setupColorStyles[setup.name] || {
                bg: 'rgba(0, 230, 153, 0.15)',
                border: '#00e699',
                text: '#a7f3d0',
              };
              return (
                <div
                  key={setup.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid #161720',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = '#22232f';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.015)';
                    e.currentTarget.style.borderColor = '#161720';
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                    }}
                  >
                    {setup.icon || '📈'}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#e0e3eb' }}>
                    {setup.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: CONFIGURE TAGS */}
        <div style={{ borderTop: '1px solid #14141c', padding: '16px 18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c5a059', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏷️</span> CONFIGURE TAGS
            </span>
            <button
              style={{ background: 'transparent', border: 'none', color: '#cca456', cursor: 'pointer', padding: 0 }}
              onClick={() => {
                const name = prompt('New Tag Name:');
                if (name?.trim()) useStore.getState().addTag({ name: name.trim(), sentiment: 'positive', description: '' });
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Positive Glowing Pills (Emerald) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {positiveTags.map(tag => (
              <span
                key={tag.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(0, 230, 153, 0.08)',
                  border: '1px solid rgba(0, 230, 153, 0.4)',
                  color: '#00e699',
                  boxShadow: '0 0 8px rgba(0, 230, 153, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#00e699';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(0, 230, 153, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0, 230, 153, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 230, 153, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Negative Glowing Pills (Ruby) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {negativeTags.map(tag => (
              <span
                key={tag.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(255, 59, 87, 0.08)',
                  border: '1px solid rgba(255, 59, 87, 0.4)',
                  color: '#ff3b57',
                  boxShadow: '0 0 8px rgba(255, 59, 87, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ff3b57';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(255, 59, 87, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 59, 87, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 59, 87, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Main Journal & Planner Workspace               */}
      {/* ============================================================ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Workspace Top Header Bar */}
        <div
          style={{
            padding: '24px 32px 16px',
            borderBottom: '1px solid #14141c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#f0f2f5',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {format(parsedSelectedDate, 'EEEE, MMMM d, yyyy')}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: '#777c8a' }}>
                {dayTrades.length > 0 ? `${dayTrades.length} trades recorded` : 'No trades logged for this day.'}
              </span>
              {isSaving && <span style={{ fontSize: 11, color: '#cca456' }}>Saving note...</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowTemplateModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: '#13131b',
                border: '1px solid #232330',
                color: '#d0d4de',
                cursor: 'pointer',
              }}
            >
              <Calendar size={13} style={{ color: '#cca456' }} />
              <span>Template</span>
            </button>

            <button
              onClick={() => openFocusPopout(selectedDate)}
              title="Launch Live Trading Companion in dedicated 420px pop-out window"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: 'linear-gradient(135deg, rgba(221, 167, 67, 0.2) 0%, rgba(221, 167, 67, 0.08) 100%)',
                border: '1px solid rgba(221, 167, 67, 0.45)',
                color: '#cca456',
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(221, 167, 67, 0.2)',
              }}
            >
              <Focus size={13} />
              <span>Focus Sidebar</span>
            </button>

            <button
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: 'rgba(0, 230, 153, 0.1)',
                border: '1px solid rgba(0, 230, 153, 0.3)',
                color: '#00e699',
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              <span>Print</span>
            </button>

            {currentNote && (
              <button
                onClick={() => {
                  if (confirm('Delete this daily note?')) {
                    deleteDailyNote(currentNote.id);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 6,
                }}
                title="Delete note"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Content Body with Signature Gold Kickers */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
          {/* SECTION 1: 0 SETUPS TRADED */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c5a059',
                marginBottom: 8,
              }}
            >
              {daySetups.length} SETUPS TRADED
            </div>
            {daySetups.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {daySetups.map(s => (
                  <span
                    key={s.id}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#13131b',
                      border: '1px solid #232330',
                      color: '#00e699',
                    }}
                  >
                    {s.icon} {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#686d7c', margin: 0 }}>
                You did not trade on this day.
              </p>
            )}
          </div>

          {/* SECTION 2: DAILY GOALS */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c5a059',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>DAILY GOALS</span>
              <button
                onClick={() => {
                  const title = prompt('New Daily Goal:');
                  if (title?.trim()) useStore.getState().addGoal({ title: title.trim(), description: '', daysUsed: 1, successDays: 0, currentStreak: 0, bestStreak: 0 });
                }}
                style={{ background: 'transparent', border: 'none', color: '#c5a059', cursor: 'pointer', padding: 0 }}
              >
                ⊕
              </button>
            </div>
            {goals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {goals.slice(0, 3).map(goal => (
                  <label
                    key={goal.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12.5,
                      color: '#d0d4de',
                      cursor: 'pointer',
                    }}
                  >
                    <input type="checkbox" style={{ accentColor: '#00e699', cursor: 'pointer' }} />
                    <span>{goal.title}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#686d7c', margin: 0 }}>
                No daily goals for this day.
              </p>
            )}
          </div>

          {/* SECTION 3: DAILY TRADING STATS */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c5a059',
                marginBottom: 8,
              }}
            >
              DAILY TRADING STATS
            </div>
            {dayStats ? (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: '#0e0e14', border: '1px solid #1a1a24', borderRadius: 8, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: '#777c8a' }}>Net P&L</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: dayStats.totalPnl >= 0 ? '#00e699' : '#ff3b57',
                    }}
                    className="tabular-nums"
                  >
                    {formatCurrency(dayStats.totalPnl)}
                  </div>
                </div>
                <div style={{ background: '#0e0e14', border: '1px solid #1a1a24', borderRadius: 8, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: '#777c8a' }}>Win Rate</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#00e699' }} className="tabular-nums">
                    {dayStats.winRate}% ({dayStats.wins}W / {dayStats.losses}L)
                  </div>
                </div>
                <div style={{ background: '#0e0e14', border: '1px solid #1a1a24', borderRadius: 8, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: '#777c8a' }}>Trades</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f2f5' }} className="tabular-nums">
                    {dayStats.tradesCount}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#686d7c', margin: 0 }}>
                You did not trade on this day.
              </p>
            )}
          </div>

          {/* SECTION 4: DAILY JOURNAL */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c5a059',
                marginBottom: 8,
              }}
            >
              DAILY JOURNAL
            </div>

            {/* Rich Editor Box with Obsidian Background */}
            <div
              style={{
                flex: 1,
                border: '1px solid #1a1a24',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#09090d',
                boxShadow: '0 8px 30px -10px rgba(0,0,0,0.8)',
              }}
            >
              <RichEditor
                key={`${selectedDate}-${editorVersion}`}
                content={currentNote?.content || ''}
                onChange={handleContentChange}
                placeholder="Enter text, paste images, or type / for commands"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TEMPLATE PICKER MODAL                                         */}
      {/* ============================================================ */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" style={{ maxWidth: 560, background: '#0d0d12', border: '1px solid #232330' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>📑</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#f0f2f5' }}>Insert Journal Template</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#777c8a' }}>
                    Select a structured template for {format(parsedSelectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowTemplateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
              {TEMPLATE_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyTemplate(preset.html)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #1c1d28',
                    background: '#121218',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#cca456';
                    e.currentTarget.style.background = 'rgba(197, 160, 89, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1c1d28';
                    e.currentTarget.style.background = '#121218';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#ffffff' }}>{preset.name}</span>
                    <span style={{ fontSize: 11, color: '#cca456', fontWeight: 600 }}>Apply →</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#777c8a', margin: 0 }}>{preset.description}</p>
                </div>
              ))}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #1a1a24' }}>
              <button className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DailyNotesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--text-muted)' }}>Loading planner...</div>}>
      <DailyNotesContent />
    </Suspense>
  );
}
