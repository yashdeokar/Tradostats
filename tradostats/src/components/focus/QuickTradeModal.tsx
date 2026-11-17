'use client';

import React, { useState } from 'react';
import type { Setup, Tag, Direction } from '@/lib/types';
import { X, TrendingUp, TrendingDown, DollarSign, Check, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { broadcastSync } from '@/lib/focusSync';

interface QuickTradeModalProps {
  date: string;
  setups: Setup[];
  tags: Tag[];
  initialSetupId?: string;
  onClose: () => void;
  onSaveTrade: (trade: {
    dateTime: string;
    instrument: string;
    direction: Direction;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    pnl: number;
    setupId?: string;
    tagIds: string[];
    notes: string;
    screenshots: string[];
    goalIds: string[];
  }) => void;
}

export default function QuickTradeModal({
  date,
  setups,
  tags,
  initialSetupId,
  onClose,
  onSaveTrade,
}: QuickTradeModalProps) {
  const [instrument, setInstrument] = useState('ES');
  const [direction, setDirection] = useState<Direction>('Long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pnlOverride, setPnlOverride] = useState('');
  const [selectedSetupId, setSelectedSetupId] = useState(initialSetupId || (setups[0]?.id ?? ''));
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Quick instruments
  const commonInstruments = ['ES', 'NQ', 'MES', 'MNQ', 'CL', 'GC', 'ZB', 'BTC'];

  // Calculate projected PnL if prices entered
  const entryNum = parseFloat(entryPrice) || 0;
  const exitNum = parseFloat(exitPrice) || 0;
  const qtyNum = parseFloat(quantity) || 1;

  let calculatedPnl = 0;
  if (entryNum > 0 && exitNum > 0) {
    // ES point value: $50 per point, NQ $20 per point (simple multiplier heuristic)
    const multiplier = instrument.includes('NQ') ? 20 : instrument.includes('ES') ? 50 : 1;
    calculatedPnl = direction === 'Long'
      ? (exitNum - entryNum) * qtyNum * multiplier
      : (entryNum - exitNum) * qtyNum * multiplier;
  }

  const finalPnl = pnlOverride !== '' ? parseFloat(pnlOverride) || 0 : calculatedPnl;

  function toggleTag(tagId: string) {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const timeNow = format(new Date(), 'HH:mm:ss');
    const dateTime = `${date}T${timeNow}Z`;

    onSaveTrade({
      dateTime,
      instrument: instrument.trim().toUpperCase() || 'ES',
      direction,
      entryPrice: entryNum,
      exitPrice: exitNum,
      quantity: qtyNum,
      pnl: finalPnl,
      setupId: selectedSetupId || undefined,
      tagIds: selectedTagIds,
      notes: notes.trim(),
      screenshots: [],
      goalIds: [],
    });

    broadcastSync({ type: 'TRADE_LOGGED', date });
    onClose();
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
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
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
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
              <Plus size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Quick Log Trade
              </h3>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>Session: {date}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 11 }}>
          {/* Direction & Instrument */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
                Direction
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  style={{
                    padding: '6px',
                    borderRadius: 4,
                    border: direction === 'Long' ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: direction === 'Long' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                    color: direction === 'Long' ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  style={{
                    padding: '6px',
                    borderRadius: 4,
                    border: direction === 'Short' ? '1px solid var(--danger)' : '1px solid var(--border)',
                    background: direction === 'Short' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-input)',
                    color: direction === 'Short' ? 'var(--danger)' : 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Short
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Instrument
              </label>
              <input
                type="text"
                value={instrument}
                onChange={e => setInstrument(e.target.value.toUpperCase())}
                placeholder="ES / NQ"
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Quick Instrument Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {commonInstruments.map(inst => (
              <button
                key={inst}
                type="button"
                onClick={() => setInstrument(inst)}
                style={{
                  padding: '2px 7px',
                  borderRadius: 3,
                  border: instrument === inst ? '1px solid var(--vellum)' : '1px solid var(--border)',
                  background: instrument === inst ? 'rgba(212, 197, 160, 0.12)' : 'var(--bg-card-alt)',
                  color: instrument === inst ? 'var(--vellum)' : 'var(--text-secondary)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {inst}
              </button>
            ))}
          </div>

          {/* Entry, Exit, Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
                Entry
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={e => setEntryPrice(e.target.value)}
                placeholder="5730.00"
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 6,
                  border: '1px solid #282c3c',
                  background: '#181b26',
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
                Exit
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={e => setExitPrice(e.target.value)}
                placeholder="5737.50"
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 6,
                  border: '1px solid #282c3c',
                  background: '#181b26',
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
                Contracts
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="1"
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 6,
                  border: '1px solid #282c3c',
                  background: '#181b26',
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          </div>

          {/* PnL Override / Result */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase' }}>
                Trade P&L ($ USD)
              </label>
              {calculatedPnl !== 0 && (
                <span style={{ fontSize: 10, color: '#717680' }}>
                  Auto: ${calculatedPnl.toFixed(2)}
                </span>
              )}
            </div>
            <input
              type="number"
              step="any"
              value={pnlOverride}
              onChange={e => setPnlOverride(e.target.value)}
              placeholder={calculatedPnl !== 0 ? `${calculatedPnl}` : '+350.00 or -150.00'}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: finalPnl >= 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                background: finalPnl >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: finalPnl >= 0 ? '#10B981' : '#EF4444',
                fontSize: 14,
                fontWeight: 800,
                outline: 'none',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>

          {/* Setup Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Execution Setup
            </label>
            <select
              value={selectedSetupId}
              onChange={e => setSelectedSetupId(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #282c3c',
                background: '#181b26',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
              }}
            >
              <option value="">No setup specified</option>
              {setups.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Tags */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Mindset & Execution Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tags.slice(0, 10).map(t => {
                const isSelected = selectedTagIds.includes(t.id);
                const isPos = t.sentiment === 'positive';
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected
                        ? isPos ? '1px solid #10B981' : '1px solid #EF4444'
                        : '1px solid #282c3c',
                      background: isSelected
                        ? isPos ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'
                        : '#161924',
                      color: isSelected
                        ? isPos ? '#10B981' : '#EF4444'
                        : '#888f9e',
                    }}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trade Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9aa0a6', marginBottom: 4, textTransform: 'uppercase' }}>
              Quick Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Faded double top, took 2 targets cleanly..."
              rows={2}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 6,
                border: '1px solid #282c3c',
                background: '#181b26',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Footer Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                background: 'var(--bg-card-alt)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                background: 'var(--accent)',
                border: 'none',
                color: '#0c0e12',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
