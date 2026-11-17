'use client';

import React, { useState } from 'react';
import type { Setup } from '@/lib/types';
import { SETUP_PLAYBOOK_DETAILS } from '@/lib/setupPlaybook';
import { BookOpen, Plus, ArrowUpDown, ChevronRight, Info, CheckCircle2, AlertTriangle, Target } from 'lucide-react';

interface AllowedSetupsProps {
  setups: Setup[];
  onSelectSetup: (setup: Setup) => void;
  onOpenCreateSetup: () => void;
}

export default function AllowedSetups({
  setups,
  onSelectSetup,
  onOpenCreateSetup,
}: AllowedSetupsProps) {
  const [expandedSetupId, setExpandedSetupId] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);

  const displaySetups = isReversed ? [...setups].reverse() : setups;

  function toggleAccordion(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedSetupId(expandedSetupId === id ? null : id);
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        margin: '6px 14px',
        padding: '12px 14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <BookOpen size={13} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--vellum)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ALLOWED PLAYBOOK SETUPS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setIsReversed(!isReversed)}
            title="Reorder Setups"
            style={{
              background: 'var(--bg-card-alt)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ArrowUpDown size={12} />
          </button>
          <button
            onClick={onOpenCreateSetup}
            title="Add Setup"
            style={{
              background: 'rgba(212, 197, 160, 0.08)',
              border: '1px solid rgba(212, 197, 160, 0.3)',
              borderRadius: 4,
              color: 'var(--vellum)',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212, 197, 160, 0.08)')}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Setups Grid/List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {displaySetups.map(s => {
          const isExpanded = expandedSetupId === s.id;
          const playbookInfo = SETUP_PLAYBOOK_DETAILS[s.name];

          return (
            <div
              key={s.id}
              style={{
                borderRadius: 4,
                background: isExpanded ? 'var(--bg-card-alt)' : 'var(--bg-subtle)',
                border: isExpanded ? '1px solid var(--vellum)' : '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Setup Row */}
              <div
                onClick={() => onSelectSetup(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 15 }}>{s.icon || '📊'}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                      {playbookInfo && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: 2,
                            background: `${s.color || '#10B981'}15`,
                            color: s.color || 'var(--accent)',
                            border: `1px solid ${s.color || '#10B981'}30`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {playbookInfo.category}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 220,
                      }}
                    >
                      {s.description || playbookInfo?.description || 'View execution criteria'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {playbookInfo && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: 'var(--accent)',
                        padding: '1px 5px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 2,
                      }}
                    >
                      {playbookInfo.winRateTarget}
                    </span>
                  )}
                  <button
                    onClick={e => toggleAccordion(s.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isExpanded ? 'var(--vellum)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'flex',
                      alignItems: 'center',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                    title="Toggle details"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Expandable Criteria Accordion */}
              {isExpanded && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg)',
                    fontSize: 11,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {playbookInfo ? (
                    <>
                      <div>
                        <div style={{ color: 'var(--vellum)', fontWeight: 600, fontSize: 10, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11} color="var(--accent)" /> ENTRY CONFIRMATION
                        </div>
                        <ul style={{ paddingLeft: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {playbookInfo.entryChecklist.map((rule, idx) => (
                            <li key={idx} style={{ marginBottom: 2 }}>{rule}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 2 }}>
                        <div style={{ background: 'var(--bg-card)', padding: '5px 7px', borderRadius: 3, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <AlertTriangle size={10} /> INVALIDATION
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'block', marginTop: 1 }}>
                            {playbookInfo.invalidation}
                          </span>
                        </div>

                        <div style={{ background: 'var(--bg-card)', padding: '5px 7px', borderRadius: 3, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Target size={10} /> TARGET (R:R)
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'block', marginTop: 1 }}>
                            {playbookInfo.riskReward}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      {s.description || 'No detailed criteria configured for this setup.'}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      onClick={() => onSelectSetup(s)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 3,
                        background: 'rgba(212, 197, 160, 0.08)',
                        border: '1px solid rgba(212, 197, 160, 0.3)',
                        color: 'var(--vellum)',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Open Full Criteria Modal »
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
