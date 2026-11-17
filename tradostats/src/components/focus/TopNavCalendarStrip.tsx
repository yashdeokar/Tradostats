'use client';

import React, { useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, addWeeks, subWeeks, isValid, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';

interface TopNavCalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tradesDates: Set<string>;
  notesDates: Set<string>;
  viewFilter: 'All Plans' | 'Weekly' | 'Monthly';
  onChangeViewFilter: (filter: 'All Plans' | 'Weekly' | 'Monthly') => void;
}

export default function TopNavCalendarStrip({
  selectedDate,
  onSelectDate,
  tradesDates,
  notesDates,
  viewFilter,
  onChangeViewFilter,
}: TopNavCalendarStripProps) {
  const currentWeekStart = useMemo(() => {
    try {
      const parsed = parseISO(selectedDate);
      if (isValid(parsed)) {
        return startOfWeek(parsed, { weekStartsOn: 1 });
      }
    } catch {}
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }, [selectedDate]);

  // Weekdays Mon - Fri
  const weekDays = useMemo(() => {
    return [0, 1, 2, 3, 4].map(offset => {
      const day = addDays(currentWeekStart, offset);
      const dateStr = format(day, 'yyyy-MM-dd');
      const isSelected = dateStr === selectedDate;
      const isToday = isSameDay(day, new Date());
      const hasTrades = tradesDates.has(dateStr);
      const hasNotes = notesDates.has(dateStr);

      return {
        dateStr,
        dayAbbr: format(day, 'EEE').toUpperCase(),
        dayNum: format(day, 'd'),
        isSelected,
        isToday,
        hasTrades,
        hasNotes,
      };
    });
  }, [currentWeekStart, selectedDate, tradesDates, notesDates]);

  // Range label e.g. "Sep 21 – 25, 2026"
  const rangeLabel = useMemo(() => {
    const endDay = addDays(currentWeekStart, 4);
    return `${format(currentWeekStart, 'MMM d')} – ${format(endDay, 'MMM d, yyyy')}`;
  }, [currentWeekStart]);

  function handlePrevWeek() {
    const prev = subWeeks(currentWeekStart, 1);
    onSelectDate(format(prev, 'yyyy-MM-dd'));
  }

  function handleNextWeek() {
    const next = addWeeks(currentWeekStart, 1);
    onSelectDate(format(next, 'yyyy-MM-dd'));
  }

  function handleToday() {
    const today = new Date();
    // If today is weekend, jump to latest active seed/workday or today
    onSelectDate(format(today, 'yyyy-MM-dd'));
  }

  return (
    <div
      style={{
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* Top row: Date Range Navigator + View Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handlePrevWeek}
            title="Previous Week"
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ChevronLeft size={14} />
          </button>

          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--vellum)',
              letterSpacing: '0.04em',
              padding: '0 6px',
              fontFamily: 'monospace',
            }}
          >
            {rangeLabel}
          </span>

          <button
            onClick={handleNextWeek}
            title="Next Week"
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ChevronRight size={14} />
          </button>

          <button
            onClick={handleToday}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid rgba(212, 197, 160, 0.3)',
              background: 'rgba(212, 197, 160, 0.08)',
              color: 'var(--vellum)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 4,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.08)')}
          >
            Today
          </button>
        </div>

        {/* Quick Filter Selector ("All Plans", "Weekly", "Monthly") */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 4, padding: 2, border: '1px solid var(--border)' }}>
          {(['All Plans', 'Weekly', 'Monthly'] as const).map(filter => {
            const isActive = viewFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onChangeViewFilter(filter)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  border: 'none',
                  background: isActive ? 'var(--vellum)' : 'transparent',
                  color: isActive ? '#0c0e12' : 'var(--text-muted)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {filter === 'All Plans' ? 'All' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Day Selector Tabs (MON 21, TUE 22, WED 23, THU 24, FRI 25) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {weekDays.map(day => {
          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 4px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: day.isSelected
                  ? '1px solid var(--vellum)'
                  : '1px solid var(--border)',
                background: day.isSelected
                  ? 'rgba(212, 197, 160, 0.08)'
                  : 'var(--bg-card)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: day.isSelected ? 'var(--vellum)' : 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {day.dayAbbr}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: day.isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  marginTop: 1,
                }}
              >
                {day.dayNum}
              </span>

              {/* Status indicators (dots for notes/trades) */}
              <div style={{ display: 'flex', gap: 3, marginTop: 4, height: 4 }}>
                {day.hasTrades && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                    }}
                    title="Trades executed"
                  />
                )}
                {day.hasNotes && (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--vellum)',
                    }}
                    title="Notes logged"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
