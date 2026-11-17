'use client';
import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  formatCurrency, formatPercent,
  calcMaxDrawdown, calcSharpeRatio, calcSortinoRatio, calcConsistencyScore,
  calcWinRate, calcProfitFactor, calcExpectancy
} from '@/lib/utils';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';
import { Info, Filter, Search, LayoutGrid, ChevronDown, Calendar, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// ---- Custom Chart Tooltip ----
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-card)', padding: '6px 10px', boxShadow: 'var(--shadow-card)' }}>
      <div className="chart-tooltip-label" style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-value tabular-nums" style={{ color: p.value >= 0 ? 'var(--accent)' : 'var(--danger)', fontWeight: 600, fontSize: 12.5 }}>
          {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

// ---- Clean Mathematical Semicircle Arc Gauge ----
function WinRateArcGauge({ winRate }: { winRate: number }) {
  const r = 52;
  const circ = Math.PI * r; // ~163.36
  const pct = Math.max(0, Math.min(100, winRate));
  const offset = circ * (1 - pct / 100);

  return (
    <div style={{ position: 'relative', width: 140, height: 72, margin: '6px auto 2px', display: 'flex', justifyContent: 'center' }}>
      <svg width="140" height="72" viewBox="0 0 140 72" style={{ overflow: 'visible' }}>
        {/* Background track */}
        <path
          d="M 16 66 A 52 52 0 0 1 124 66"
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Active credit emerald arc */}
        <path
          d="M 16 66 A 52 52 0 0 1 124 66"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
    </div>
  );
}

// ---- Metric Card Container ----
function MetricCard({
  title,
  headerRight,
  children,
  fullWidth,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gridColumn: fullWidth ? '1 / -1' : undefined,
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h3>
        {headerRight || <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ---- Main Overview Page ----
export default function OverviewPage() {
  const { trades } = useStore();
  const [activeAccount, setActiveAccount] = useState('All');
  const [activeTimeframe, setActiveTimeframe] = useState('All Time');
  const [activeTabTfd, setActiveTabTfd] = useState<'focus' | 'insights'>('focus');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? grossLoss / losses.length : 0;
    const winRate = calcWinRate(wins.length, trades.length);
    const profitFactor = calcProfitFactor(grossProfit, grossLoss);
    const expectancy = calcExpectancy(avgWin, winRate, -avgLoss);
    const maxDrawdown = calcMaxDrawdown(trades);
    const sharpe = calcSharpeRatio(trades);
    const sortino = calcSortinoRatio(trades);
    const consistency = calcConsistencyScore(trades);
    const recoveryFactor = maxDrawdown !== 0 ? totalPnl / Math.abs(maxDrawdown) : 0;

    // Equity curve data
    const sorted = [...trades].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    let cumulative = 0;
    const equityCurve = sorted.map(t => {
      cumulative += t.pnl;
      return {
        date: format(parseISO(t.dateTime), 'M/d'),
        cumulative: Math.round(cumulative * 100) / 100,
        zero: 0,
      };
    });

    // Peak & trough
    let peak = 0;
    let peakDate = sorted[0]?.dateTime || 'May 26';
    let trough = 0;
    let troughDate = sorted[sorted.length - 1]?.dateTime || 'Aug 21';
    let runningPnl = 0;
    for (const t of sorted) {
      runningPnl += t.pnl;
      if (runningPnl > peak) {
        peak = runningPnl;
        peakDate = t.dateTime;
      }
      if (runningPnl - peak < trough) {
        trough = runningPnl - peak;
        troughDate = t.dateTime;
      }
    }

    // P&L by day of week
    const dayPnl: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    for (const t of trades) {
      const day = format(parseISO(t.dateTime), 'EEE');
      if (dayPnl[day] !== undefined) dayPnl[day] += t.pnl;
    }
    const dayData = Object.entries(dayPnl).map(([day, pnl]) => ({ day, pnl: Math.round(pnl * 100) / 100 }));

    // TFD Score calculation (0-100)
    const tfdScore = Math.max(10, Math.min(99, Math.round(
      (Math.min(profitFactor / 2, 1) * 20) +
      (winRate / 100 * 20) +
      (Math.max(0, Math.min(1, (expectancy + 100) / 200)) * 20) +
      (Math.max(0, 1 - Math.abs(maxDrawdown) / 10000) * 20) +
      (consistency / 100 * 20)
    )));

    return {
      totalTrades: trades.length,
      totalPnl,
      grossProfit,
      grossLoss,
      winRate,
      wins: wins.length,
      losses: losses.length,
      profitFactor,
      expectancy,
      maxDrawdown,
      sharpe,
      sortino,
      consistency,
      recoveryFactor,
      equityCurve,
      peak,
      peakDate,
      trough,
      troughDate,
      dayData,
      avgWin,
      avgLoss,
      tfdScore,
    };
  }, [trades]);

  const radarData = [
    { subject: 'Profit Factor', value: Math.min(Math.round(stats.profitFactor * 35), 100) },
    { subject: 'Recovery Factor', value: Math.max(10, Math.min(100, Math.round((stats.recoveryFactor + 2) * 25))) },
    { subject: 'Win Rate', value: Math.round(stats.winRate) },
    { subject: 'Max Drawdown', value: Math.max(15, Math.round(100 - Math.abs(stats.maxDrawdown) / 90)) },
    { subject: 'Consistency', value: Math.max(10, Math.round(stats.consistency)) },
    { subject: 'Expectancy', value: Math.max(10, Math.min(100, Math.round(stats.expectancy + 50))) },
  ];

  const accountFilters = ['All', 'Active', 'Practice', 'Passed', 'Cancelled'];
  const timeframeFilters = ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month', 'Last Month'];
  const dropdownFilters = ['Setups (0)', 'Tags (0)', 'Daily Goals (0)', 'Daily Grades (0)', 'Direction (0)', 'Days (0)'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 1. TOP FILTER BAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Row 1: Accounts & Timeframe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 500 }}>
            <Filter size={13} style={{ color: 'var(--text-muted)' }} />
            <span>Accounts:</span>
          </div>

          {/* Account Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            {accountFilters.map(acc => {
              const isActive = activeAccount === acc;
              return (
                <button
                  key={acc}
                  onClick={() => setActiveAccount(acc)}
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                >
                  {acc}
                </button>
              );
            })}
            <button className="filter-pill">
              <span>More</span>
              <ChevronDown size={11} />
            </button>
          </div>

          <span style={{ color: 'var(--border-light)', fontSize: 13 }}>•</span>

          {/* Timeframe Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            {timeframeFilters.map(tf => {
              const isActive = activeTimeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`filter-pill ${isActive ? 'active' : ''}`}
                >
                  {tf}
                </button>
              );
            })}
            <button className="filter-pill">
              <span>More</span>
              <Calendar size={11} />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {dropdownFilters.map(filter => (
            <button
              key={filter}
              className="filter-pill"
              style={{ background: 'var(--bg-card)' }}
            >
              <span>{filter}</span>
              <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* 2. SUBHEADER: Performance Overview + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Performance Overview
          </h1>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
            Audited Window: {activeTimeframe}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-base"
              style={{
                padding: '5px 10px 5px 28px',
                fontSize: 11.5,
                width: 160,
              }}
            />
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: 11.5, padding: '5px 10px' }}
          >
            <LayoutGrid size={12} style={{ color: 'var(--text-muted)' }} />
            <span>Cards (16/16)</span>
            <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* 3. METRIC CARDS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 14,
        }}
      >
        {/* CARD 1: TFD Score */}
        <MetricCard
          title="TFD Score"
          headerRight={
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="tabular-nums">{stats.tfdScore.toFixed(1)}</span>
              <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            </span>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 10, alignItems: 'center' }}>
            {/* Left: Radar Chart */}
            <div style={{ width: 110, height: 110 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={false} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="var(--vellum)"
                    fill="var(--vellum)"
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: 'var(--vellum-light)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Middle: Stats 2x3 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: 10.5 }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Profit Factor</div>
                <div style={{ fontWeight: 600, color: 'var(--vellum-light)', fontSize: 11.5 }} className="tabular-nums">
                  {stats.profitFactor.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Win Rate</div>
                <div style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 11.5 }} className="tabular-nums">
                  {stats.winRate.toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Expectancy</div>
                <div style={{ fontWeight: 600, color: stats.expectancy >= 0 ? 'var(--accent)' : 'var(--danger)', fontSize: 11.5 }} className="tabular-nums">
                  {formatCurrency(stats.expectancy)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Max Drawdown</div>
                <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: 11.5 }} className="tabular-nums">
                  {stats.maxDrawdown !== 0 ? `-${Math.abs((stats.maxDrawdown / (stats.peak || 10000)) * 100).toFixed(1)}%` : '0.0%'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Recovery Factor</div>
                <div style={{ fontWeight: 600, color: stats.recoveryFactor >= 0 ? 'var(--accent)' : 'var(--danger)', fontSize: 11.5 }} className="tabular-nums">
                  {stats.recoveryFactor.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Consistency</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 11.5 }} className="tabular-nums">
                  {stats.consistency.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Right: Focus Area / Insights Box */}
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '8px 10px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <button
                  onClick={() => setActiveTabTfd('focus')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: activeTabTfd === 'focus' ? 'var(--vellum-light)' : 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Sparkles size={9} /> Focus
                </button>
                <span style={{ color: 'var(--border)' }}>|</span>
                <button
                  onClick={() => setActiveTabTfd('insights')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 9.5,
                    fontWeight: 600,
                    color: activeTabTfd === 'insights' ? 'var(--vellum-light)' : 'var(--text-muted)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Lightbulb size={9} /> Insights
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)' }}>Consistency</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--danger)' }} className="tabular-nums">
                  {Math.round(stats.consistency)}%
                </span>
              </div>
              <p style={{ fontSize: 9.5, color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 4px' }}>
                Execute the playbook with mathematical discipline.
              </p>
            </div>
          </div>

          {/* Bottom Score Bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'var(--border)' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${Math.max(0, Math.min(100, stats.tfdScore))}%`,
                  height: '100%',
                  background: stats.tfdScore >= 60 ? 'var(--accent)' : 'var(--danger)',
                  borderRadius: 2,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>
              <span>0</span>
              <span>50</span>
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{stats.tfdScore.toFixed(1)}</span>
            </div>
          </div>
        </MetricCard>

        {/* CARD 2: Profit Factor */}
        <MetricCard
          title="Profit Factor"
          headerRight={
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="tabular-nums">{stats.profitFactor.toFixed(2)}</span>
              <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div>
              <div style={{ height: 4, width: '100%', background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(10, (stats.profitFactor / 2) * 100))}%`,
                    background: stats.profitFactor >= 1.5 ? 'var(--accent)' : stats.profitFactor >= 1 ? 'var(--warning)' : 'var(--danger)',
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: stats.profitFactor >= 1.5 ? 'var(--accent)' : stats.profitFactor >= 1 ? 'var(--warning)' : 'var(--danger)' }}>
                  {stats.profitFactor >= 1.5 ? 'Profitable Edge' : stats.profitFactor >= 1 ? 'Breakeven' : 'Sub-optimal'}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  Gross profit multiple over aggregate debit
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 }}>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Gross Credit</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }} className="tabular-nums">
                  {formatCurrency(stats.grossProfit)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Gross Debit</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--danger)' }} className="tabular-nums">
                  {formatCurrency(stats.grossLoss)}
                </div>
              </div>
            </div>
          </div>
        </MetricCard>

        {/* CARD 3: Win Rate */}
        <MetricCard
          title="Win Rate"
          headerRight={
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="tabular-nums">{stats.winRate.toFixed(1)}%</span>
              <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <WinRateArcGauge winRate={stats.winRate} />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 10, fontSize: 12, fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>
                Wins: <span className="tabular-nums" style={{ color: 'var(--accent)' }}>{stats.wins}</span>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                Losses: <span className="tabular-nums" style={{ color: 'var(--danger)' }}>{stats.losses}</span>
              </span>
            </div>
          </div>
        </MetricCard>

        {/* CARD 4: Cumulative P&L */}
        <MetricCard
          title="Cumulative Net Balance"
          headerRight={
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: stats.totalPnl >= 0 ? 'var(--accent)' : 'var(--danger)',
              }}
              className="tabular-nums"
            >
              {formatCurrency(stats.totalPnl)}
            </span>
          }
        >
          <div style={{ width: '100%', height: 150, minWidth: 0, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={v => `$${v}`}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="var(--accent)"
                  strokeWidth={1.75}
                  fill="var(--accent-subtle)"
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--accent)', stroke: '#ffffff', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MetricCard>

        {/* CARD 5: Recovery Factor */}
        <MetricCard
          title="Recovery Factor"
          headerRight={
            <span style={{ fontSize: 13, fontWeight: 700, color: stats.recoveryFactor >= 0 ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="tabular-nums">{stats.recoveryFactor.toFixed(2)}</span>
              <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Max Drawdown</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--danger)', marginTop: 2 }} className="tabular-nums">
                  {formatCurrency(stats.maxDrawdown)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Breakeven Multiple</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }} className="tabular-nums">
                  {formatCurrency(Math.abs(stats.totalPnl))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-badge)', padding: '6px 10px' }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Factor</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: stats.recoveryFactor >= 0 ? 'var(--accent)' : 'var(--danger)', marginTop: 1 }} className="tabular-nums">
                  {stats.recoveryFactor.toFixed(2)}
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', border: `1px solid ${stats.recoveryFactor >= 1 ? 'var(--accent-border)' : 'var(--danger-border)'}`, borderRadius: 'var(--radius-badge)', padding: '6px 10px' }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Rating</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: stats.recoveryFactor >= 1 ? 'var(--accent)' : 'var(--danger)', marginTop: 1 }}>
                  {stats.recoveryFactor >= 1 ? 'Disciplined' : 'Compromised'}
                </div>
              </div>
            </div>
          </div>
        </MetricCard>

        {/* CARD 6: Current Drawdown */}
        <MetricCard
          title="Current Drawdown"
          headerRight={
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="tabular-nums">{formatCurrency(stats.maxDrawdown)}</span>
              <Info size={12} style={{ color: 'var(--text-muted)', cursor: 'help' }} />
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '10px 14px' }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PEAK BALANCE</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }} className="tabular-nums">
                  {formatCurrency(stats.peak || 11477.18)}
                </div>
              </div>

              <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TROUGH</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--danger)', marginTop: 2 }} className="tabular-nums">
                  {formatCurrency(stats.peak + stats.trough || 4936.97)}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Drawdown Span</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }} className="tabular-nums">
                  {formatCurrency(stats.maxDrawdown)}
                </span>
              </div>
              <div style={{ height: 4, width: '100%', background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '57%', background: 'var(--danger)', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </MetricCard>

        {/* CARD 7: Consistency Score */}
        <MetricCard title="Consistency Score">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: stats.consistency >= 60 ? 'var(--accent)' : stats.consistency >= 30 ? 'var(--warning)' : 'var(--danger)' }} className="tabular-nums">
              {stats.consistency}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>/100</div>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${stats.consistency}%`,
                height: '100%',
                borderRadius: 2,
                background: stats.consistency >= 60 ? 'var(--accent)' : stats.consistency >= 30 ? 'var(--warning)' : 'var(--danger)',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {stats.consistency >= 60 ? 'Consistent adherence to edge' : 'Moderate execution variance'}
          </div>
        </MetricCard>

        {/* CARD 8: Expectancy per Trade */}
        <MetricCard title="Expectancy per Trade">
          <div style={{ fontSize: 28, fontWeight: 700, color: stats.expectancy >= 0 ? 'var(--accent)' : 'var(--danger)' }} className="tabular-nums">
            {formatCurrency(stats.expectancy)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {stats.expectancy >= 0 ? 'Positive mathematical expectation per execution' : 'Negative expectancy — review stop rules'}
          </div>
          <div style={{ marginTop: 10 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 'var(--radius-badge)',
                fontSize: 10.5,
                fontWeight: 600,
                background: stats.expectancy >= 0 ? 'var(--accent-subtle)' : 'var(--danger-subtle)',
                border: `1px solid ${stats.expectancy >= 0 ? 'var(--accent-border)' : 'var(--danger-border)'}`,
                color: stats.expectancy >= 0 ? 'var(--accent)' : 'var(--danger)',
              }}
            >
              {stats.expectancy >= 20 ? 'Optimal Edge' : stats.expectancy >= 0 ? 'Positive Edge' : 'Negative Expectancy'}
            </span>
          </div>
        </MetricCard>

        {/* CARD 9: P&L by Day of Week */}
        <MetricCard title="Balance by Day of Week">
          <div style={{ width: '100%', minWidth: 0, height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dayData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                  {stats.dayData.map((entry, index) => (
                    <Cell key={index} fill={entry.pnl >= 0 ? 'var(--accent)' : 'var(--danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricCard>
      </div>
    </div>
  );
}
