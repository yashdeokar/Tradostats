'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Tag } from '@/lib/types';
import { Sparkles, Brain, PlusCircle, Check } from 'lucide-react';
import { broadcastSync, getSyncChannel } from '@/lib/focusSync';

interface MindsetTagsBarProps {
  date: string;
  storeTags: Tag[];
  onStampTagToNotes: (tagName: string, sentiment: 'positive' | 'negative') => void;
}

export default function MindsetTagsBar({
  date,
  storeTags,
  onStampTagToNotes,
}: MindsetTagsBarProps) {
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

  // Load selected tags for this date
  const loadDateTags = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(`tradostats_session_tags_${date}`);
      if (raw) {
        setSelectedTagNames(JSON.parse(raw));
      } else {
        setSelectedTagNames([]);
      }
    } catch (e) {
      console.warn('Error reading session tags from localStorage', e);
    }
  }, [date]);

  useEffect(() => {
    loadDateTags();
  }, [loadDateTags]);

  // Listen for sync from other tab
  useEffect(() => {
    const ch = getSyncChannel();
    if (!ch) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TAGS_UPDATED' && event.data?.date === date) {
        loadDateTags();
      }
    };

    ch.addEventListener('message', handleMessage);
    return () => ch.removeEventListener('message', handleMessage);
  }, [date, loadDateTags]);

  function handleToggleTag(tagName: string, sentiment: 'positive' | 'negative') {
    const exists = selectedTagNames.includes(tagName);
    const updated = exists
      ? selectedTagNames.filter(t => t !== tagName)
      : [...selectedTagNames, tagName];

    setSelectedTagNames(updated);
    try {
      localStorage.setItem(`tradostats_session_tags_${date}`, JSON.stringify(updated));
      broadcastSync({ type: 'TAGS_UPDATED', date, tags: updated });
    } catch (e) {
      console.warn('Failed to save session tags', e);
    }
  }

  // Split tags into Positive/Execution vs Psychology/Mistakes
  const defaultPositives = ['A+', 'B', 'C', 'Patient Entry', 'Disciplined'];
  const defaultNegatives = ['Anxiety/Emotional', 'Bad Read', 'Confused', 'FOMO', 'Revenge Trade'];

  // Combine with store tags
  const positiveTags = Array.from(new Set([
    ...defaultPositives,
    ...storeTags.filter(t => t.sentiment === 'positive').map(t => t.name),
  ]));

  const negativeTags = Array.from(new Set([
    ...defaultNegatives,
    ...storeTags.filter(t => t.sentiment === 'negative').map(t => t.name),
  ]));

  return (
    <div
      style={{
        background: '#141620',
        border: '1px solid #232733',
        borderRadius: 10,
        margin: '6px 14px',
        padding: '12px 14px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EAB308',
            }}
          >
            <Brain size={13} />
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
            MINDSET & EMOTIONAL TAGS
          </span>
        </div>

        <span style={{ fontSize: 10, color: '#717680' }}>
          Click to log • Double click to stamp note
        </span>
      </div>

      {/* Row 1: Positive / Execution (Green Pills) */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#10B981',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            EXECUTION / POSITIVE
          </span>
          <span style={{ fontSize: 9, color: '#717680' }}>
            ({selectedTagNames.filter(t => positiveTags.includes(t)).length} active)
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {positiveTags.map(tagName => {
            const isSelected = selectedTagNames.includes(tagName);
            return (
              <button
                key={tagName}
                onClick={() => handleToggleTag(tagName, 'positive')}
                onDoubleClick={() => onStampTagToNotes(tagName, 'positive')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isSelected
                    ? '1px solid #10B981'
                    : '1px solid rgba(16, 185, 129, 0.25)',
                  background: isSelected
                    ? 'rgba(16, 185, 129, 0.25)'
                    : 'rgba(16, 185, 129, 0.06)',
                  color: isSelected ? '#34D399' : '#10B981',
                  boxShadow: isSelected ? '0 0 8px rgba(16, 185, 129, 0.35)' : 'none',
                }}
                title="Click to toggle for session, double-click to stamp into scratchpad"
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
                <span>{tagName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Psychology / Mistakes (Red Pills) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#EF4444',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            PSYCHOLOGY / MISTAKES
          </span>
          <span style={{ fontSize: 9, color: '#717680' }}>
            ({selectedTagNames.filter(t => negativeTags.includes(t)).length} active)
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {negativeTags.map(tagName => {
            const isSelected = selectedTagNames.includes(tagName);
            return (
              <button
                key={tagName}
                onClick={() => handleToggleTag(tagName, 'negative')}
                onDoubleClick={() => onStampTagToNotes(tagName, 'negative')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isSelected
                    ? '1px solid #EF4444'
                    : '1px solid rgba(239, 68, 68, 0.25)',
                  background: isSelected
                    ? 'rgba(239, 68, 68, 0.25)'
                    : 'rgba(239, 68, 68, 0.06)',
                  color: isSelected ? '#F87171' : '#EF4444',
                  boxShadow: isSelected ? '0 0 8px rgba(239, 68, 68, 0.35)' : 'none',
                }}
                title="Click to toggle for session, double-click to stamp into scratchpad"
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
                <span>{tagName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
