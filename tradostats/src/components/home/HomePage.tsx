'use client';
import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import MainSidebar from '@/components/layout/MainSidebar';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { Trade, Direction } from '@/lib/types';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  BookOpen,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Award,
  CheckSquare,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  FileText,
  ShieldCheck,
  Compass,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import DemoBanner from '@/components/common/DemoBanner';

export default function HomePage() {
  const { trades, setups, tags, goals, addTrade, deleteTrade, loadDemoData } = useStore();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 8, 1)); // Default to Sep 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date(2026, 8, 25)); // Default to active session
  const [modalMode, setModalMode] = useState<'summary' | 'log' | null>(null);

  // Form State for Click-to-Log Trade Modal
  const [form, setForm] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    instrument: 'ES',
    customInstrument: '',
    direction: 'Long' as Direction,
    entryPrice: '',
    exitPrice: '',
    contracts: '1',
    setupId: '',
    tagIds: [] as string[],
    notes: '',
    screenshot: '',
    goalIds: [] as string[],
  });

  const now = new Date();

  // -------------------------------------------------------------
  // 1. EXECUTIVE PERFORMANCE METRICS
  // -------------------------------------------------------------
  const quickStats = useMemo(() => {
    const todayStr = format(now, 'yyyy-MM-dd');
    const todayTrades = trades.filter(t => t.dateTime.startsWith(todayStr));

    const todayPnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);
    const todayWins = todayTrades.filter(t => t.pnl > 0).length;
    const todayWinRate = todayTrades.length > 0 ? (todayWins / todayTrades.length) * 100 : 0;

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weeklyTrades = trades.filter(t => {
      try {
        const d = parseISO(t.dateTime);
        return d >= weekStart && d <= weekEnd;
      } catch {
        return false;
      }
    });
    const weeklyPnl = weeklyTrades.reduce((sum, t) => sum + t.pnl, 0);

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthlyTrades = trades.filter(t => {
      try {
        const d = parseISO(t.dateTime);
        return d >= monthStart && d <= monthEnd;
      } catch {
        return false;
      }
    });
    const monthlyPnl = monthlyTrades.reduce((sum, t) => sum + t.pnl, 0);

    const overallPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalWins = trades.filter(t => t.pnl > 0).length;
    const overallWinRate = trades.length > 0 ? (totalWins / trades.length) * 100 : 0;

    return {
      todayPnl,
      todayWinRate,
      todayTradesCount: todayTrades.length,
      weeklyPnl,
      weeklyTradesCount: weeklyTrades.length,
      monthlyPnl,
      monthlyTradesCount: monthlyTrades.length,
      overallPnl,
      overallWinRate,
      totalTradesCount: trades.length,
    };
  }, [trades, now]);

  // -------------------------------------------------------------
  // 2. INTERACTIVE CALENDAR MATRIX DATA
  // -------------------------------------------------------------
  const { calendarWeeks, monthStats } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

    const allCalendarDays = allDays.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayTrades = trades.filter(t => t.dateTime.startsWith(dateStr));
      const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      const isCurrentMonth = isSameMonth(d, currentMonth);
      const isToday = isSameDay(d, now);

      let status: 'profit' | 'loss' | 'neutral' = 'neutral';
      if (dayTrades.length > 0) {
        if (pnl > 0) status = 'profit';
        else if (pnl < 0) status = 'loss';
      }

      const tradedInstruments = Array.from(new Set(dayTrades.map(t => t.instrument)));

      return {
        date: d,
        dateStr,
        dayNum: format(d, 'd'),
        isCurrentMonth,
        isToday,
        trades: dayTrades,
        tradeCount: dayTrades.length,
        pnl,
        status,
        tradedInstruments,
      };
    });

    // Group into 7-day rows (Mon-Sun)
    const weeks = [];
    for (let i = 0; i < allCalendarDays.length; i += 7) {
      const weekDays = allCalendarDays.slice(i, i + 7);
      const weekTrades = weekDays.flatMap(d => d.trades);
      const weekPnl = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
      const weekWins = weekTrades.filter(t => t.pnl > 0).length;
      const weekWinRate = weekTrades.length > 0 ? (weekWins / weekTrades.length) * 100 : 0;
      const weekNumber = format(weekDays[0].date, 'w');

      weeks.push({
        weekNumber,
        days: weekDays,
        weekPnl,
        tradesCount: weekTrades.length,
        winRate: weekWinRate,
      });
    }

    // Month metrics
    const monthActiveDays = allCalendarDays.filter(d => d.isCurrentMonth && d.tradeCount > 0);
    const greenDays = monthActiveDays.filter(d => d.pnl > 0).length;
    const redDays = monthActiveDays.filter(d => d.pnl < 0).length;
    const totalTradedDays = monthActiveDays.length;
    const winDayRate = totalTradedDays > 0 ? (greenDays / totalTradedDays) * 100 : 0;
    const monthTrades = monthActiveDays.flatMap(d => d.trades);
    const monthPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);

    const winningTradesPnl = monthTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const losingTradesPnl = Math.abs(monthTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = losingTradesPnl > 0 ? (winningTradesPnl / losingTradesPnl).toFixed(2) : winningTradesPnl > 0 ? '99.9' : '0.00';

    return {
      calendarWeeks: weeks,
      monthStats: {
        greenDays,
        redDays,
        totalTradedDays,
        winDayRate,
        monthPnl,
        tradesCount: monthTrades.length,
        profitFactor,
      },
    };
  }, [currentMonth, trades, now]);

  // Selected Day Details for the Session Ledger
  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    const dayTrades = trades.filter(t => t.dateTime.startsWith(dateStr));
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = dayTrades.filter(t => t.pnl > 0).length;
    const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;

    return {
      date: selectedDay,
      dateStr,
      formattedDate: format(selectedDay, 'EEEE, MMM d, yyyy'),
      trades: dayTrades,
      pnl,
      tradeCount: dayTrades.length,
      winRate,
      longs: dayTrades.filter(t => t.direction === 'Long').length,
      shorts: dayTrades.filter(t => t.direction === 'Short').length,
    };
  }, [selectedDay, trades]);

  function handlePrevMonth() {
    setCurrentMonth(prev => subMonths(prev, 1));
  }
  function handleNextMonth() {
    setCurrentMonth(prev => addMonths(prev, 1));
  }
  function handleToday() {
    setCurrentMonth(now);
    setSelectedDay(now);
  }

  function handleDayClick(dayDate: Date) {
    setSelectedDay(dayDate);
  }

  function openLogModalForDate(dayDate: Date) {
    setSelectedDay(dayDate);
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    setForm({
      dateTime: `${dateStr}T09:30`,
      instrument: 'ES',
      customInstrument: '',
      direction: 'Long',
      entryPrice: '',
      exitPrice: '',
      contracts: '1',
      setupId: setups[0]?.id || '',
      tagIds: [],
      notes: '',
      screenshot: '',
      goalIds: [],
    });
    setModalMode('log');
  }

  const formEntry = parseFloat(form.entryPrice) || 0;
  const formExit = parseFloat(form.exitPrice) || 0;
  const formQty = parseFloat(form.contracts) || 1;
  const formPnl =
    formEntry > 0 && formExit > 0
      ? form.direction === 'Long'
        ? (formExit - formEntry) * formQty
        : (formEntry - formExit) * formQty
      : 0;

  function toggleTag(id: string) {
    setForm(f => ({
      ...f,
      tagIds: f.tagIds.includes(id) ? f.tagIds.filter(t => t !== id) : [...f.tagIds, id],
    }));
  }

  function toggleGoal(id: string) {
    setForm(f => ({
      ...f,
      goalIds: f.goalIds.includes(id) ? f.goalIds.filter(g => g !== id) : [...f.goalIds, id],
    }));
  }

  function handleSaveTrade() {
    const finalInstrument = (form.instrument === 'CUSTOM' ? form.customInstrument : form.instrument).trim().toUpperCase();
    if (!finalInstrument || !formEntry || !formExit) {
      alert('Please fill in Instrument, Entry Price, and Exit Price.');
      return;
    }

    addTrade({
      dateTime: new Date(form.dateTime).toISOString(),
      instrument: finalInstrument,
      direction: form.direction,
      entryPrice: formEntry,
      exitPrice: formExit,
      quantity: formQty,
      pnl: formPnl,
      setupId: form.setupId || undefined,
      tagIds: form.tagIds,
      notes: form.notes,
      screenshots: form.screenshot ? [form.screenshot] : [],
      goalIds: form.goalIds,
      holdTime: 15,
    });

    setModalMode(null);
  }

  const instruments = ['ES', 'NQ', 'YM', 'RTY', 'CL', 'GC', 'SI', 'ZB', 'ZN', 'BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA', 'SPY', 'QQQ', 'CUSTOM'];

  return (
    <div className="app-shell spatial-canvas">
      {/* Ambient Top Lighting Beam */}
      <div className="ambient-light-beam" />

      <MainSidebar />

      <div className="content-area" style={{ position: 'relative', zIndex: 1, padding: '24px 28px 48px' }}>
        <DemoBanner />

        {/* ------------------------------------------------------------- */}
        {/* TOP HERO HEADER: EDITORIAL TYPOGRAPHY & TACTILE CONTROLS      */}
        {/* ------------------------------------------------------------- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span
                className="glass-pill"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--vellum)',
                  padding: '3px 12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span className="pulsing-indicator">
                  <span className="pulsing-indicator-ping" />
                  <span className="pulsing-indicator-dot" />
                </span>
                INSTITUTIONAL TELEMETRY
              </span>
            </div>

            {/* High-Contrast Editorial Headline Pairing: Bold Geometric Display Sans + Elegant Italic Serif */}
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                margin: 0,
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '8px',
                textWrap: 'balance',
              }}
            >
              <span>Institutional Precision</span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: 'var(--vellum)',
                  fontSize: 34,
                }}
              >
                for
              </span>
              <span>Every Session</span>
            </h1>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, margin: 0, textWrap: 'pretty' }}>
              Spatial telemetry and mathematical execution discipline for active futures and equity operators.
            </p>
          </div>

          {/* Tactile Full-Radius Controls & Circular Glass Action Triggers */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="glass-pill-control glass-pill-primary"
              onClick={() => openLogModalForDate(selectedDay || now)}
            >
              <Plus size={14} /> Quick Log Trade
            </button>
            <Link href="/focus" className="glass-pill-control">
              <Activity size={14} color="var(--vellum)" /> Focus Companion
            </Link>
            <Link href="/notebooks/daily-notes" className="glass-pill-control">
              Explore Journal <ArrowRight size={13} color="var(--vellum)" />
            </Link>
            <div
              className="glass-circle-trigger"
              title="Return to Current Session Date"
              onClick={handleToday}
              aria-label="Current date calibration"
            >
              <Compass size={16} color="var(--vellum)" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. SPATIAL TELEMETRY DECK WITH FLOATING CALLOUT PILLS          */}
        {/* ------------------------------------------------------------- */}
        <div style={{ position: 'relative', marginBottom: 24, paddingTop: 16 }}>
          {/* Floating Callout Pill 1: Zero Revenge Trades */}
          <div
            className="floating-telemetry-pill"
            style={{
              position: 'absolute',
              top: 0,
              left: 28,
              zIndex: 10,
            }}
          >
            <span className="pulsing-indicator">
              <span className="pulsing-indicator-ping" />
              <span className="pulsing-indicator-dot" />
            </span>
            <span>⚡ Zero Revenge Trades</span>
          </div>

          {/* Hairline Leader Line Connector: Pill 1 */}
          <svg style={{ position: 'absolute', top: 22, left: 160, width: 44, height: 20, zIndex: 5, pointerEvents: 'none' }}>
            <path d="M 0 0 L 22 18 L 40 18" fill="none" stroke="rgba(212, 197, 160, 0.45)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="40" cy="18" r="2" fill="var(--vellum)" />
          </svg>

          {/* Floating Callout Pill 2: Risk Shield Active */}
          <div
            className="floating-telemetry-pill"
            style={{
              position: 'absolute',
              top: 0,
              right: 28,
              zIndex: 10,
            }}
          >
            <span className="pulsing-indicator">
              <span className="pulsing-indicator-ping" />
              <span className="pulsing-indicator-dot" />
            </span>
            <span>🛡️ Risk Shield Active</span>
          </div>

          {/* Hairline Leader Line Connector: Pill 2 */}
          <svg style={{ position: 'absolute', top: 22, right: 155, width: 44, height: 20, zIndex: 5, pointerEvents: 'none' }}>
            <path d="M 44 0 L 22 18 L 4 18" fill="none" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="4" cy="18" r="2" fill="var(--accent)" />
          </svg>

          {/* Master Glass Telemetry Panel */}
          <div
            className="glass-panel"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 2fr 1.6fr',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            {/* Segment 1: Cumulative Net Balance */}
            <div
              style={{
                padding: '18px 24px',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <DollarSign size={14} color="var(--vellum)" /> Cumulative Balance
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '8px 0 4px' }}>
                <span
                  className="num-font ledger-double-rule"
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: quickStats.overallPnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                    paddingBottom: 3,
                  }}
                >
                  {quickStats.overallPnl >= 0 ? '+' : ''}
                  {formatCurrency(quickStats.overallPnl)}
                </span>
                <span
                  className="glass-pill"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '2px 8px',
                    color: quickStats.overallPnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                    background: quickStats.overallPnl >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    borderColor: quickStats.overallPnl >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {quickStats.overallWinRate.toFixed(1)}% WR
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                Total Executions: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{quickStats.totalTradesCount} trades</span>
              </div>
            </div>

            {/* Segment 2: Session Cadence (Today / Week / Month) */}
            <div
              style={{
                padding: '18px 22px',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                alignItems: 'center',
              }}
            >
              {/* Today */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>
                  Today
                </div>
                <div
                  className="num-font"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 6,
                    color: quickStats.todayPnl > 0 ? 'var(--accent)' : quickStats.todayPnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {quickStats.todayPnl > 0 ? '+' : ''}
                  {formatCurrency(quickStats.todayPnl)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  {quickStats.todayTradesCount} trade{quickStats.todayTradesCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* This Week */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>
                  This Week
                </div>
                <div
                  className="num-font"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 6,
                    color: quickStats.weeklyPnl > 0 ? 'var(--accent)' : quickStats.weeklyPnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {quickStats.weeklyPnl > 0 ? '+' : ''}
                  {formatCurrency(quickStats.weeklyPnl)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  WTD Return
                </div>
              </div>

              {/* Month-to-Date */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>
                  September
                </div>
                <div
                  className="num-font"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 6,
                    color: monthStats.monthPnl > 0 ? 'var(--accent)' : monthStats.monthPnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  {monthStats.monthPnl > 0 ? '+' : ''}
                  {formatCurrency(monthStats.monthPnl)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  MTD Return
                </div>
              </div>
            </div>

            {/* Segment 3: Discipline & Execution Quality */}
            <div
              style={{
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Award size={14} color="var(--vellum)" /> Execution Quality
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 4px' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Profit Factor: </span>
                  <span className="num-font" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {monthStats.profitFactor}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Win Days: </span>
                  <span className="num-font" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    {monthStats.winDayRate.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                Active Sessions: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{monthStats.greenDays}W – {monthStats.redDays}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. TWO-COLUMN SPATIAL WORKSPACE: CALENDAR + ACTIVE LEDGER     */}
        {/* ------------------------------------------------------------- */}
        <div className="calendar-workspace-grid">
          {/* LEFT: CALENDAR WITH WEEKLY SUMMARIES */}
          <div className="calendar-card glass-panel" style={{ padding: '20px 22px' }}>
            {/* Calendar Controls & Month Telemetry */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 9999,
                    padding: '3px 6px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <button
                    className="glass-circle-trigger"
                    onClick={handlePrevMonth}
                    title="Previous Month"
                    aria-label="Previous month"
                    style={{ width: 28, height: 28 }}
                  >
                    <ChevronLeft size={14} color="var(--text-secondary)" />
                  </button>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '0 12px',
                      minWidth: 140,
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    className="glass-circle-trigger"
                    onClick={handleNextMonth}
                    title="Next Month"
                    aria-label="Next month"
                    style={{ width: 28, height: 28 }}
                  >
                    <ChevronRight size={14} color="var(--text-secondary)" />
                  </button>
                </div>

                <button
                  className="glass-pill-control"
                  onClick={handleToday}
                  style={{ padding: '5px 14px', fontSize: 12 }}
                >
                  Today
                </button>
              </div>

              {/* Month Session Statistics & Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Month Balance:</span>
                  <span className="num-font" style={{ fontWeight: 700, color: monthStats.monthPnl >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                    {monthStats.monthPnl >= 0 ? '+' : ''}
                    {formatCurrency(monthStats.monthPnl)}
                  </span>
                </div>
                <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.12)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Credit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--danger)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Debit</span>
                </div>
              </div>
            </div>

            {/* Calendar Table Grid with Week Total Column */}
            <div className="calendar-pro-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="calendar-header-day" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {day}
                </div>
              ))}
              <div className="calendar-header-day week-summary-col" style={{ color: 'var(--text-muted)', textAlign: 'right', paddingRight: 8, fontSize: 12, fontWeight: 700 }}>
                Week Total
              </div>

              {calendarWeeks.map(week => (
                <div key={week.weekNumber} style={{ display: 'contents' }}>
                  {week.days.map(item => {
                    const isSelected = selectedDay && isSameDay(item.date, selectedDay);
                    const cellClasses = [
                      'calendar-cell',
                      item.status === 'profit' ? 'profit' : '',
                      item.status === 'loss' ? 'loss' : '',
                      !item.isCurrentMonth ? 'dimmed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <div
                        key={item.dateStr}
                        className={cellClasses}
                        onClick={() => handleDayClick(item.date)}
                        style={{
                          outline: isSelected ? '1.5px solid var(--vellum)' : item.isToday ? '1px solid rgba(255, 255, 255, 0.25)' : 'none',
                          outlineOffset: -1,
                          background: isSelected ? 'rgba(212, 197, 160, 0.08)' : undefined,
                        }}
                        title={`${item.dateStr}: ${item.tradeCount} trades, ${formatCurrency(item.pnl)}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: item.isToday || isSelected ? 700 : 500,
                              color: isSelected ? 'var(--vellum-light)' : item.isToday ? 'var(--vellum)' : 'var(--text-primary)',
                            }}
                          >
                            {item.dayNum}
                          </span>
                          {item.isToday && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 3,
                                background: 'var(--vellum-subtle)',
                                color: 'var(--vellum-light)',
                                border: '1px solid var(--vellum-border)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              Today
                            </span>
                          )}
                        </div>

                        {/* Trade Instrument Tags */}
                        {item.tradedInstruments.length > 0 && (
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 }}>
                            {item.tradedInstruments.map(inst => (
                              <span
                                key={inst}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  fontFamily: "'JetBrains Mono', monospace",
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                {inst}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                          {item.tradeCount > 0 ? (
                            <>
                              <div
                                className="num-font"
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: item.pnl > 0 ? 'var(--accent)' : item.pnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                                  marginBottom: 1,
                                }}
                              >
                                {item.pnl > 0 ? '+' : ''}
                                {formatCurrency(item.pnl)}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.01em', fontFamily: "'JetBrains Mono', monospace" }}>
                                {item.tradeCount} trade{item.tradeCount > 1 ? 's' : ''}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--text-disabled)', opacity: 0 }}>—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* WEEK TOTAL CELL */}
                  <div className="week-summary-cell week-summary-col">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                        W{week.weekNumber}
                      </span>
                      {week.tradesCount > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: week.weekPnl >= 0 ? 'var(--accent)' : 'var(--danger)', fontFamily: "'JetBrains Mono', monospace" }}>
                          {week.winRate.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                      {week.tradesCount > 0 ? (
                        <>
                          <div
                            className="num-font"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: week.weekPnl > 0 ? 'var(--accent)' : week.weekPnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                            }}
                          >
                            {week.weekPnl > 0 ? '+' : ''}
                            {formatCurrency(week.weekPnl)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {week.tradesCount} trade{week.tradesCount > 1 ? 's' : ''}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>$0.00</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: SELECTED DAY SESSION LEDGER PANEL */}
          <div className="session-ledger-panel glass-panel" style={{ padding: '20px 22px' }}>
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Session Ledger
                </h2>
                <div style={{ fontSize: 13, color: 'var(--vellum)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif", marginTop: 2 }}>
                  {selectedDayData?.formattedDate || 'Select a Date'}
                </div>
              </div>

              {selectedDayData && selectedDayData.tradeCount > 0 && (
                <span
                  className="num-font glass-pill"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '3px 10px',
                    color: selectedDayData.pnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                    background: selectedDayData.pnl >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    borderColor: selectedDayData.pnl >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {selectedDayData.pnl >= 0 ? '+' : ''}
                  {formatCurrency(selectedDayData.pnl)}
                </span>
              )}
            </div>

            {/* Quick Session Stats */}
            {selectedDayData && selectedDayData.tradeCount > 0 ? (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Trades</div>
                    <div className="num-font" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedDayData.tradeCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Win Rate</div>
                    <div className="num-font" style={{ fontSize: 15, fontWeight: 700, color: selectedDayData.winRate >= 50 ? 'var(--accent)' : 'var(--danger)', marginTop: 2 }}>
                      {selectedDayData.winRate.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Long/Short</div>
                    <div className="num-font" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      {selectedDayData.longs}L · {selectedDayData.shorts}S
                    </div>
                  </div>
                </div>

                {/* List of Executed Trade Tickets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedDayData.trades.map((t, idx) => {
                    const setupObj = setups.find(s => s.id === t.setupId);
                    const tradeTime = (() => {
                      try {
                        return format(parseISO(t.dateTime), 'hh:mm a');
                      } catch {
                        return 'Live';
                      }
                    })();

                    return (
                      <div
                        key={t.id || idx}
                        className="trade-ticket-card"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 3,
                                background: t.direction === 'Long' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                color: t.direction === 'Long' ? 'var(--accent)' : 'var(--danger)',
                                border: `1px solid ${t.direction === 'Long' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {t.direction.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.instrument}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({t.quantity}ct)</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className="num-font"
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: t.pnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                              }}
                            >
                              {t.pnl >= 0 ? '+' : ''}
                              {formatCurrency(t.pnl)}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('Delete this trade?')) deleteTrade(t.id);
                              }}
                              title="Delete trade"
                              aria-label="Delete trade"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 2 }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          <div>
                            Entry: <span className="num-font" style={{ color: 'var(--text-primary)' }}>{t.entryPrice}</span> → Exit:{' '}
                            <span className="num-font" style={{ color: 'var(--text-primary)' }}>{t.exitPrice}</span>
                          </div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tradeTime}</div>
                        </div>

                        {setupObj && (
                          <div style={{ fontSize: 11.5, color: 'var(--vellum)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <span>{setupObj.icon}</span>
                            <span>{setupObj.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <CalendarIcon size={22} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div>No trades recorded for this date.</div>
                <button
                  className="glass-pill-control"
                  onClick={() => openLogModalForDate(selectedDay || now)}
                  style={{ marginTop: 12, fontSize: 12 }}
                >
                  <Plus size={13} /> Log Trade on This Date
                </button>
              </div>
            )}

            {/* Quick Actions at Bottom of Ledger: Tactile Full-Radius Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Link
                href={`/focus?date=${selectedDayData?.dateStr || format(now, 'yyyy-MM-dd')}`}
                className="glass-pill-control"
                style={{ justifyContent: 'center', fontSize: 12 }}
              >
                <Activity size={14} color="var(--vellum)" /> Open Focus Notes for Date
              </Link>
              <button
                className="glass-pill-control glass-pill-primary"
                onClick={() => openLogModalForDate(selectedDay || now)}
                style={{ justifyContent: 'center', fontSize: 12 }}
              >
                <Plus size={14} /> Add Trade to Date
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. THREE-COLUMN MICRO-FEATURE STRIP (HIGH-END HARDWARE LUXURY)*/}
        {/* ------------------------------------------------------------- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 26 }}>
          {/* Feature 1 */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div className="glass-circle-trigger" style={{ width: 44, height: 44, flexShrink: 0 }}>
              <ShieldCheck size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Algorithmic Risk Bounds
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Strict mathematical max-loss thresholds and intraday drawdown circuit breakers enforced on every execution.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div className="glass-circle-trigger" style={{ width: 44, height: 44, flexShrink: 0 }}>
              <Activity size={20} color="var(--vellum)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Spatial Focus Sidecar
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Ultra-compact floating companion with native picture-in-picture docking beside TradingView &amp; DOM.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div className="glass-circle-trigger" style={{ width: 44, height: 44, flexShrink: 0 }}>
              <TrendingUp size={20} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Tag-Correlated Expectancy
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Deep performance attribution cross-referencing execution setups with emotional mindset states.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS: DAY SUMMARY & CLICK-TO-LOG TRADE                   */}
      {/* ------------------------------------------------------------- */}

      {/* A. Day Summary Modal */}
      {modalMode === 'summary' && selectedDayData && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal glass-panel" style={{ maxWidth: 620, border: '1px solid rgba(255, 255, 255, 0.16)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDayData.formattedDate}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Daily Trade Log Summary</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="num-font glass-pill"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: selectedDayData.pnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                    padding: '4px 12px',
                    background: selectedDayData.pnl >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderColor: selectedDayData.pnl >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  Balance: {selectedDayData.pnl >= 0 ? '+' : ''}
                  {formatCurrency(selectedDayData.pnl)}
                </span>
                <button className="glass-circle-trigger" style={{ width: 30, height: 30 }} onClick={() => setModalMode(null)}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 130px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedDayData.trades.map((t, idx) => {
                  const setupObj = setups.find(s => s.id === t.setupId);
                  const tradeTags = tags.filter(tag => t.tagIds.includes(tag.id));
                  return (
                    <div
                      key={t.id || idx}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 11,
                              padding: '2px 6px',
                              borderRadius: 3,
                              background: t.direction === 'Long' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: t.direction === 'Long' ? 'var(--accent)' : 'var(--danger)',
                              border: `1px solid ${t.direction === 'Long' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {t.direction.toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{t.instrument}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({t.quantity} contracts)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            className="num-font"
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: t.pnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                            }}
                          >
                            {t.pnl >= 0 ? '+' : ''}
                            {formatCurrency(t.pnl)}
                          </span>
                          <button
                            className="glass-circle-trigger"
                            onClick={() => {
                              if (confirm('Delete this trade?')) deleteTrade(t.id);
                            }}
                            title="Delete Trade"
                            style={{ width: 26, height: 26 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <div>
                          Entry: <span className="num-font" style={{ color: 'var(--text-primary)' }}>{t.entryPrice}</span> → Exit:{' '}
                          <span className="num-font" style={{ color: 'var(--text-primary)' }}>{t.exitPrice}</span>
                        </div>
                        {setupObj && (
                          <div style={{ color: 'var(--vellum)' }}>
                            Setup: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{setupObj.icon} {setupObj.name}</span>
                          </div>
                        )}
                      </div>

                      {tradeTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                          {tradeTags.map(tg => (
                            <span
                              key={tg.id}
                              className={`badge ${tg.sentiment === 'positive' ? 'badge-positive' : 'badge-negative'}`}
                            >
                              {tg.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {t.notes && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 10px', borderRadius: 6, marginTop: 4, borderLeft: '2px solid var(--vellum)' }}>
                          {t.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Link href={`/notebooks/daily-notes?date=${selectedDayData.dateStr}`} className="glass-pill-control">
                <FileText size={13} /> View Daily Note
              </Link>
              <button className="glass-pill-control glass-pill-primary" onClick={() => openLogModalForDate(selectedDayData.date)}>
                <Plus size={13} /> Add Another Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. Click-to-Log Trade Modal */}
      {modalMode === 'log' && selectedDay && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal glass-panel" style={{ maxWidth: 600, border: '1px solid rgba(255, 255, 255, 0.16)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Quick Log Trade</h3>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {formEntry > 0 && formExit > 0 && (
                  <span
                    className="num-font glass-pill"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: formPnl >= 0 ? 'var(--accent)' : 'var(--danger)',
                      background: formPnl >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      borderColor: formPnl >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      padding: '4px 12px',
                    }}
                  >
                    Balance: {formPnl >= 0 ? '+' : ''}
                    {formatCurrency(formPnl)}
                  </span>
                )}
                <button className="glass-circle-trigger" style={{ width: 30, height: 30 }} onClick={() => setModalMode(null)}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 130px)', overflowY: 'auto' }}>
              {/* Instrument & Custom */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Instrument</label>
                  <select
                    className="input-base"
                    style={{ fontSize: 13 }}
                    value={form.instrument}
                    onChange={e => setForm(f => ({ ...f, instrument: e.target.value }))}
                  >
                    {instruments.map(inst => (
                      <option key={inst} value={inst}>
                        {inst === 'CUSTOM' ? 'Other / Custom...' : inst}
                      </option>
                    ))}
                  </select>
                  {form.instrument === 'CUSTOM' && (
                    <input
                      className="input-base"
                      style={{ marginTop: 6, fontSize: 13 }}
                      placeholder="Enter ticker (e.g. AAPL, MES)"
                      value={form.customInstrument}
                      onChange={e => setForm(f => ({ ...f, customInstrument: e.target.value }))}
                    />
                  )}
                </div>

                {/* Direction (Long/Short Toggle) */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Direction</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['Long', 'Short'] as const).map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, direction: dir }))}
                        className="glass-pill-control"
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          padding: '8px',
                          border: `1.5px solid ${form.direction === dir ? (dir === 'Long' ? 'var(--accent)' : 'var(--danger)') : 'rgba(255, 255, 255, 0.12)'}`,
                          background: form.direction === dir ? (dir === 'Long' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(255, 255, 255, 0.03)',
                          color: form.direction === dir ? (dir === 'Long' ? 'var(--accent)' : 'var(--danger)') : 'var(--text-muted)',
                        }}
                      >
                        {dir === 'Long' ? '▲ Long' : '▼ Short'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Contracts */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Entry Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-base num-font"
                    style={{ fontSize: 13 }}
                    placeholder="0.00"
                    value={form.entryPrice}
                    onChange={e => setForm(f => ({ ...f, entryPrice: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Exit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-base num-font"
                    style={{ fontSize: 13 }}
                    placeholder="0.00"
                    value={form.exitPrice}
                    onChange={e => setForm(f => ({ ...f, exitPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Contracts / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="input-base num-font"
                    style={{ fontSize: 13 }}
                    value={form.contracts}
                    onChange={e => setForm(f => ({ ...f, contracts: e.target.value }))}
                  />
                </div>

                {/* Auto Calculated P&L Display */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Calculated P&amp;L</label>
                  <div
                    className="num-font"
                    style={{
                      height: 38,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      color: formPnl > 0 ? 'var(--accent)' : formPnl < 0 ? 'var(--danger)' : 'var(--text-muted)',
                    }}
                  >
                    {formPnl > 0 ? '+' : ''}
                    {formatCurrency(formPnl)}
                  </div>
                </div>
              </div>

              {/* Setup Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Playbook Setup</label>
                <select
                  className="input-base"
                  style={{ fontSize: 13 }}
                  value={form.setupId}
                  onChange={e => setForm(f => ({ ...f, setupId: e.target.value }))}
                >
                  <option value="">— Select Setup —</option>
                  {setups.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags (Multi-select) */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Playbook Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {tags.map(t => {
                    const isSelected = form.tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`badge ${isSelected ? (t.sentiment === 'positive' ? 'badge-positive' : 'badge-negative') : 'badge-muted'}`}
                        style={{ cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, padding: '4px 12px' }}
                      >
                        {isSelected ? '✓ ' : ''}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Goals Checklist */}
              {goals.length > 0 && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>Daily Goals Checklist</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {goals.map(g => {
                      const isSelected = form.goalIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGoal(g.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            border: `1px solid ${isSelected ? 'var(--vellum-border)' : 'rgba(255, 255, 255, 0.12)'}`,
                            background: isSelected ? 'var(--vellum-subtle)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? 'var(--vellum-light)' : 'var(--text-muted)',
                            transition: 'all 0.12s',
                          }}
                        >
                          <CheckSquare size={13} color={isSelected ? 'var(--vellum)' : 'var(--text-disabled)'} />
                          {g.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trade Notes */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Notes &amp; Observations</label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Market profile thesis, key levels, emotional state..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical', fontSize: 13 }}
                />
              </div>

              {/* Screenshot Attachment */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: 12 }}>Chart Screenshot Attachment</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-base"
                    style={{ fontSize: 13 }}
                    placeholder="https://... chart image URL"
                    value={form.screenshot}
                    onChange={e => setForm(f => ({ ...f, screenshot: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="glass-pill-control"
                    onClick={() => setForm(f => ({ ...f, screenshot: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800' }))}
                    title="Insert sample chart screenshot"
                    style={{ padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
                  >
                    <ImageIcon size={13} /> Sample
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="glass-pill-control" onClick={() => setModalMode(null)}>
                Cancel
              </button>
              <button
                className="glass-pill-control glass-pill-primary"
                onClick={handleSaveTrade}
                disabled={!formEntry || !formExit || !(form.instrument === 'CUSTOM' ? form.customInstrument : form.instrument)}
              >
                Log Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
