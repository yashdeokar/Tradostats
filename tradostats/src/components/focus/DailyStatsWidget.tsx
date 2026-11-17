'use client';

import React, { useState } from 'react';
import type { Trade, Setup } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown, Layers, ChevronDown, ChevronUp, Plus, Activity } from 'lucide-react';

interface DailyStatsWidgetProps {
  date: string;
  trades: Trade[];
  setups: Setup[];
  onOpenQuickTrade: () => void;
}

export default function DailyStatsWidget({
  date,
  trades,
  setups,
  onOpenQuickTrade,
}: DailyStatsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tradesCount = trades.length;
  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl < 0).length;
  const breakeven = trades.filter(t => t.pnl === 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = tradesCount > 0 ? Math.round((wins / tradesCount) * 100) : 0;

  // Setups traded today
  const setupIdsTraded = Array.from(new Set(trades.map(t => t.setupId).filter(Boolean)));
  const tradedSetups = setups.filter(s => setupIdsTraded.includes(s.id));

  const isProfitable = totalPnl > 0;
  const isLoss = totalPnl < 0;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        margin: '10px 14px 6px',
        overflow: 'hidden',
      }}
    >
      {/* Banner Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          background: isProfitable
            ? 'rgba(16, 185, 129, 0.05)'
            : isLoss
            ? 'rgba(239, 68, 68, 0.05)'
            : 'var(--bg-card)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
        }}
      >
        {/* Left: Setups count & Quick Log */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: isProfitable
                ? 'rgba(16, 185, 129, 0.12)'
                : isLoss
                ? 'rgba(239, 68, 68, 0.12)'
                : 'var(--bg-card-alt)',
              border: isProfitable
                ? '1px solid rgba(16, 185, 129, 0.25)'
                : isLoss
                ? '1px solid rgba(239, 68, 68, 0.25)'
                : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isProfitable ? 'var(--accent)' : isLoss ? 'var(--danger)' : 'var(--text-muted)',
            }}
          >
            {isProfitable ? <TrendingUp size={15} /> : isLoss ? <TrendingDown size={15} /> : <Activity size={15} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SESSION PERFORMANCE
              </span>
              {tradesCount > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--vellum)',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: '1px 4px',
                  }}
                >
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {tradesCount === 0
                  ? 'No trades logged yet'
                  : `${tradesCount} trade${tradesCount > 1 ? 's' : ''} (${wins}W - ${losses}L)`}
              </span>
              {tradedSetups.length > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    background: 'var(--bg-card-alt)',
                    color: 'var(--vellum)',
                    padding: '1px 6px',
                    borderRadius: 3,
                    border: '1px solid var(--border-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title={tradedSetups.map(s => s.name).join(', ')}
                >
                  <Layers size={10} /> {tradedSetups.length} Setup{tradedSetups.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: P&L pill + Win Rate pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {tradesCount > 0 ? (
            <>
              {/* Win Rate Pill */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: winRate >= 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: winRate >= 60 ? 'var(--accent)' : 'var(--danger)',
                  border: winRate >= 60 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {winRate}% WR
              </div>

              {/* P&L Pill */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: 3,
                  background: isProfitable
                    ? 'rgba(16, 185, 129, 0.12)'
                    : isLoss
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'var(--bg-card-alt)',
                  color: isProfitable ? 'var(--accent)' : isLoss ? 'var(--danger)' : 'var(--text-secondary)',
                  border: isProfitable
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : isLoss
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : '1px solid var(--border)',
                }}
              >
                {totalPnl >= 0 ? `+${formatCurrency(totalPnl)}` : formatCurrency(totalPnl)}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenQuickTrade}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 9px',
                borderRadius: 4,
                background: 'rgba(212, 197, 160, 0.08)',
                border: '1px solid rgba(212, 197, 160, 0.3)',
                color: 'var(--vellum)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.08)')}
            >
              <Plus size={12} /> Log Trade
            </button>
          )}
        </div>
      </div>

      {/* Expandable Trade List Drawer */}
      {isExpanded && tradesCount > 0 && (
        <div style={{ background: 'var(--bg-subtle)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              TODAY'S EXECUTIONS ({trades.length})
            </span>
            <button
              onClick={onOpenQuickTrade}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--vellum)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Plus size={12} /> New
            </button>
          </div>

          {trades.map((t, idx) => {
            const setup = setups.find(s => s.id === t.setupId);
            const isWin = t.pnl > 0;
            const timeStr = t.dateTime.includes('T') ? t.dateTime.split('T')[1].slice(0, 5) : '';

            return (
              <div
                key={t.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: 4,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  fontSize: 11,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      padding: '1px 5px',
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 10,
                      fontFamily: 'monospace',
                      background: t.direction === 'Long' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: t.direction === 'Long' ? 'var(--accent)' : 'var(--danger)',
                    }}
                  >
                    {t.direction}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.instrument}</span>
                  {timeStr && <span style={{ color: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}>{timeStr}</span>}
                  {setup && (
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: 2,
                        fontSize: 10,
                        background: 'var(--bg-card-alt)',
                        color: setup.color || 'var(--vellum)',
                      }}
                    >
                      {setup.icon} {setup.name}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: isWin ? 'var(--accent)' : 'var(--danger)',
                  }}
                >
                  {t.pnl >= 0 ? `+${formatCurrency(t.pnl)}` : formatCurrency(t.pnl)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
