'use client';

import React from 'react';
import type { Setup } from '@/lib/types';
import { SETUP_PLAYBOOK_DETAILS } from '@/lib/setupPlaybook';
import { X, CheckCircle2, AlertTriangle, Target, Clock, Activity, ShieldCheck, Zap } from 'lucide-react';

interface SetupDetailModalProps {
  setup: Setup | null;
  onClose: () => void;
  onLogTradeWithSetup: (setupId: string) => void;
}

export default function SetupDetailModal({
  setup,
  onClose,
  onLogTradeWithSetup,
}: SetupDetailModalProps) {
  if (!setup) return null;

  const playbook = SETUP_PLAYBOOK_DETAILS[setup.name];

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
          maxWidth: 420,
          background: '#13151f',
          border: '1.5px solid #282c3c',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(221, 167, 67, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
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
            borderBottom: '1px solid #232733',
            background: 'linear-gradient(180deg, #181b26 0%, #13151f 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{setup.icon || '📊'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>
                  {setup.name}
                </h3>
                {playbook && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    {playbook.category}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#9aa0a6' }}>Playbook Execution Blueprint</span>
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
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Overview text */}
          <p style={{ margin: 0, fontSize: 12, color: '#c5c9d3', lineHeight: 1.5 }}>
            {setup.description || playbook?.description}
          </p>

          {/* Quick Metrics Bar */}
          {playbook && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ background: '#181b26', padding: '8px 10px', borderRadius: 6, border: '1px solid #232733' }}>
                <span style={{ fontSize: 10, color: '#717680', display: 'block', fontWeight: 600 }}>TIMEFRAME</span>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{playbook.timeframe}</span>
              </div>
              <div style={{ background: '#181b26', padding: '8px 10px', borderRadius: 6, border: '1px solid #232733' }}>
                <span style={{ fontSize: 10, color: '#717680', display: 'block', fontWeight: 600 }}>TARGET WR</span>
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 800 }}>{playbook.winRateTarget}</span>
              </div>
              <div style={{ background: '#181b26', padding: '8px 10px', borderRadius: 6, border: '1px solid #232733' }}>
                <span style={{ fontSize: 10, color: '#717680', display: 'block', fontWeight: 600 }}>MIN R:R</span>
                <span style={{ fontSize: 11, color: '#DDA743', fontWeight: 800 }}>{playbook.riskReward}</span>
              </div>
            </div>
          )}

          {/* Entry Checklist */}
          {playbook && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <CheckCircle2 size={13} color="#10B981" />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', letterSpacing: '0.05em' }}>
                  ENTRY CONFIRMATION CHECKLIST
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {playbook.entryChecklist.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      background: '#161924',
                      padding: '6px 9px',
                      borderRadius: 6,
                      border: '1px solid #232733',
                      fontSize: 11,
                      color: '#E5E7EB',
                    }}
                  >
                    <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalidation & Targets */}
          {playbook && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#EF4444', fontWeight: 700, fontSize: 11, marginBottom: 3 }}>
                  <AlertTriangle size={13} />
                  <span>INVALIDATION / HARD STOP</span>
                </div>
                <div style={{ fontSize: 11, color: '#E5E7EB' }}>
                  {playbook.invalidation}
                </div>
              </div>

              <div style={{ background: 'rgba(221, 167, 67, 0.08)', border: '1px solid rgba(221, 167, 67, 0.3)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#DDA743', fontWeight: 700, fontSize: 11, marginBottom: 3 }}>
                  <Target size={13} />
                  <span>PROFIT TARGET & EXIT PLAN</span>
                </div>
                <div style={{ fontSize: 11, color: '#E5E7EB' }}>
                  {playbook.targetStrategy}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid #232733',
            background: '#11131b',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: '#1a1d28',
              border: '1px solid #2a2e3d',
              color: '#9aa0a6',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          <button
            onClick={() => {
              onLogTradeWithSetup(setup.id);
              onClose();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'linear-gradient(135deg, #DDA743 0%, #B8860B 100%)',
              border: 'none',
              color: '#0d0e12',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(221, 167, 67, 0.35)',
            }}
          >
            <Zap size={13} /> Log Trade with this Setup
          </button>
        </div>
      </div>
    </div>
  );
}
