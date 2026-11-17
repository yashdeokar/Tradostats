'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import NotepadHeader from './NotepadHeader';
import DRCScorecard from './DRCScorecard';
import ObsidianNotepadEditor from './ObsidianNotepadEditor';
import ExportA4Modal from './ExportA4Modal';
import { getDailyMarkdownTemplate } from '@/lib/dailyTemplate';
import type { DRCGrade, DailyReportCardData } from '@/lib/drcTypes';
import { getSyncChannel, broadcastSync } from '@/lib/focusSync';

interface FocusCompanionProps {
  initialDate?: string;
  isPopoutWindow?: boolean;
}

export default function FocusCompanion({
  initialDate,
  isPopoutWindow = false,
}: FocusCompanionProps) {
  const { dailyNotes, trades, addDailyNote, updateDailyNote } = useStore();
  const [isExportA4Open, setIsExportA4Open] = useState(false);

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      return initialDate;
    }
    return '2026-09-25'; // Default to active trading date
  });

  // Save status & timestamp
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [timestampTrigger, setTimestampTrigger] = useState(0);

  // DRC State
  const [drcData, setDrcData] = useState<DailyReportCardData>(() => {
    return {
      grade: 'A',
      ruleAdherence: 'Followed 100%',
      mindset: 'Patient & Calm',
    };
  });

  // Load DRC for the active date
  const loadDateDRC = useCallback((date: string) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(`tradostats_drc_${date}`);
      if (raw) {
        setDrcData(JSON.parse(raw));
      } else {
        // Sensible initial defaults
        setDrcData({
          grade: 'A',
          ruleAdherence: 'Followed 100%',
          mindset: 'Patient & Calm',
        });
      }
    } catch (e) {
      console.warn('Error reading DRC data', e);
    }
  }, []);

  useEffect(() => {
    loadDateDRC(selectedDate);
  }, [selectedDate, loadDateDRC]);

  // Persist DRC update
  function handleUpdateDrc(updates: Partial<DailyReportCardData>) {
    setDrcData(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(`tradostats_drc_${selectedDate}`, JSON.stringify(updated));
        broadcastSync({ type: 'NOTE_UPDATED', date: selectedDate, content: '' });
      } catch (e) {
        console.warn('Failed to save DRC state', e);
      }
      return updated;
    });
  }

  // Find note for selected date or initialize with structured template
  const currentNote = useMemo(() => {
    return dailyNotes.find(n => n.date === selectedDate);
  }, [dailyNotes, selectedDate]);

  const activeContent = useMemo(() => {
    // If journal note doesn't exist or is blank, automatically populate with the structured template
    const rawText = currentNote?.content ? currentNote.content.replace(/<[^>]*>/g, '').trim() : '';
    const hasImages = currentNote?.content ? currentNote.content.includes('<img') : false;
    if (currentNote && (rawText.length > 0 || hasImages)) {
      return currentNote.content;
    }
    return getDailyMarkdownTemplate(selectedDate);
  }, [currentNote, selectedDate]);

  // Save content handler
  const handleSaveContent = useCallback(
    (htmlContent: string) => {
      if (currentNote) {
        updateDailyNote(currentNote.id, htmlContent);
      } else {
        addDailyNote({
          date: selectedDate,
          content: htmlContent,
        });
      }
      broadcastSync({ type: 'NOTE_UPDATED', date: selectedDate, content: htmlContent });
    },
    [currentNote, selectedDate, updateDailyNote, addDailyNote]
  );

  // Reapply default template
  function handleReapplyTemplate() {
    if (confirm('Reset journal to clean structured Pre-Market + Execution + DRC Template for this date?')) {
      const template = getDailyMarkdownTemplate(selectedDate);
      handleSaveContent(template);
    }
  }

  // Cross-tab sync listener
  useEffect(() => {
    const ch = getSyncChannel();
    if (!ch) return;

    const handleSync = (event: MessageEvent) => {
      if (event.data?.type === 'NOTE_UPDATED' && event.data.date === selectedDate) {
        useStore.persist.rehydrate();
        loadDateDRC(selectedDate);
      }
    };

    ch.addEventListener('message', handleSync);
    return () => ch.removeEventListener('message', handleSync);
  }, [selectedDate, loadDateDRC]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        maxWidth: isPopoutWindow ? '100%' : '520px',
        margin: '0 auto',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        borderLeft: isPopoutWindow ? 'none' : '1px solid var(--border)',
        borderRight: isPopoutWindow ? 'none' : '1px solid var(--border)',
        boxShadow: isPopoutWindow ? 'none' : '0 4px 30px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Outfit', -apple-system, sans-serif",
      }}
    >
      {/* 1. Top Minimal Header */}
      <NotepadHeader
        date={selectedDate}
        onSelectDate={setSelectedDate}
        grade={drcData.grade}
        onChangeGrade={grade => handleUpdateDrc({ grade })}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        isPopoutWindow={isPopoutWindow}
        onInsertTimestamp={() => setTimestampTrigger(t => t + 1)}
        onOpenExportA4={() => setIsExportA4Open(true)}
      />

      {/* 2. Interactive DRC Scorecard Grid (Session Grade, Risk Rule Adherence, Mindset) */}
      <DRCScorecard
        drcData={drcData}
        onChangeDrc={handleUpdateDrc}
      />

      {/* 3. Obsidian Markdown Writing Area */}
      <ObsidianNotepadEditor
        content={activeContent}
        onChange={handleSaveContent}
        onSetSaveStatus={(status, time) => {
          setSaveStatus(status);
          if (time) setLastSavedTime(time);
        }}
        externalTimestampTrigger={timestampTrigger}
        onReapplyTemplate={handleReapplyTemplate}
      />

      {/* 4. Export as A4 Image Modal */}
      {isExportA4Open && (
        <ExportA4Modal
          date={selectedDate}
          drcData={drcData}
          htmlContent={activeContent}
          trades={trades}
          onClose={() => setIsExportA4Open(false)}
        />
      )}
    </div>
  );
}
