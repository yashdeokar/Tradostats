'use client';

import React from 'react';
import type { DRCGrade, DRCRuleAdherence, DRCMindset, DailyReportCardData } from '@/lib/drcTypes';
import { DRC_GRADES, getGradeBadgeStyle } from '@/lib/drcTypes';
import { Award } from 'lucide-react';

interface DRCScorecardProps {
  drcData: DailyReportCardData;
  onChangeDrc: (data: Partial<DailyReportCardData>) => void;
}

export default function DRCScorecard({
  drcData,
  onChangeDrc,
}: DRCScorecardProps) {
  const gradeStyle = getGradeBadgeStyle(drcData.grade);

  const ruleOptions: { value: DRCRuleAdherence; label: string; color: string; bg: string }[] = [
    { value: 'Followed 100%', label: '100% Followed', color: 'var(--accent)', bg: 'var(--accent-subtle)' },
    { value: 'Minor Slip', label: 'Minor Slip', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.12)' },
    { value: 'Broken Rule', label: 'Rule Broken', color: 'var(--danger)', bg: 'var(--danger-subtle)' },
  ];

  const mindsetOptions: { value: DRCMindset; label: string; color: string; bg: string }[] = [
    { value: 'Patient & Calm', label: 'Patient & Calm', color: 'var(--accent)', bg: 'var(--accent-subtle)' },
    { value: 'Hesitant', label: 'Hesitant', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.12)' },
    { value: 'FOMO / Impatient', label: 'FOMO / Rush', color: 'var(--danger)', bg: 'var(--danger-subtle)' },
    { value: 'Revenge', label: 'Revenge', color: 'var(--danger-dark)', bg: 'var(--danger-subtle)' },
  ];

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '10px 14px 12px',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* DRC Header Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 'var(--radius-badge)',
              background: 'var(--vellum-subtle)',
              border: '1px solid var(--vellum-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum-light)',
            }}
          >
            <Award size={11} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--vellum-light)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            DAILY REPORT CARD (DRC) AUDIT
          </span>
        </div>

        {/* Current Grade Badge */}
        {drcData.grade !== 'Unrated' && (
          <span
            style={{
              padding: '1px 6px',
              borderRadius: 'var(--radius-badge)',
              fontSize: 10.5,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              background: gradeStyle.bg,
              color: gradeStyle.color,
              border: `1px solid ${gradeStyle.border}`,
            }}
          >
            Grade {drcData.grade}
          </span>
        )}
      </div>

      {/* 3 Dropdown / Pill Selectors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: 8 }}>
        {/* 1. Overall Session Grade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Overall Grade
          </label>
          <select
            value={drcData.grade}
            onChange={e => onChangeDrc({ grade: e.target.value as DRCGrade })}
            aria-label="Overall Grade"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-badge)',
              background: gradeStyle.bg,
              color: gradeStyle.color,
              border: `1px solid ${gradeStyle.border}`,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Unrated" style={{ background: '#12141c', color: 'var(--text-muted)' }}>Unrated</option>
            {DRC_GRADES.map(g => (
              <option key={g} value={g} style={{ background: '#12141c', color: getGradeBadgeStyle(g).color }}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Rule & Risk Adherence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Risk / Rules
          </label>
          <select
            value={drcData.ruleAdherence}
            onChange={e => onChangeDrc({ ruleAdherence: e.target.value as DRCRuleAdherence })}
            aria-label="Risk and rule adherence"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-badge)',
              background: 'var(--bg-input)',
              color: drcData.ruleAdherence === 'Followed 100%'
                ? 'var(--accent)'
                : drcData.ruleAdherence === 'Minor Slip'
                ? 'var(--warning)'
                : drcData.ruleAdherence === 'Broken Rule'
                ? 'var(--danger)'
                : 'var(--text-muted)',
              border: '1px solid var(--border)',
              fontSize: 10.5,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Unrated" style={{ background: '#12141c', color: 'var(--text-muted)' }}>Unrated</option>
            {ruleOptions.map(r => (
              <option key={r.value} value={r.value} style={{ background: '#12141c', color: r.color }}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Psychology & Mindset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Mindset State
          </label>
          <select
            value={drcData.mindset}
            onChange={e => onChangeDrc({ mindset: e.target.value as DRCMindset })}
            aria-label="Mindset state"
            style={{
              padding: '5px 7px',
              borderRadius: 'var(--radius-badge)',
              background: 'var(--bg-input)',
              color: drcData.mindset === 'Patient & Calm'
                ? 'var(--accent)'
                : drcData.mindset === 'Hesitant'
                ? 'var(--warning)'
                : drcData.mindset === 'FOMO / Impatient'
                ? 'var(--danger)'
                : drcData.mindset === 'Revenge'
                ? 'var(--danger)'
                : 'var(--text-muted)',
              border: '1px solid var(--border)',
              fontSize: 10.5,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Unrated" style={{ background: '#12141c', color: 'var(--text-muted)' }}>Unrated</option>
            {mindsetOptions.map(m => (
              <option key={m.value} value={m.value} style={{ background: '#12141c', color: m.color }}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
