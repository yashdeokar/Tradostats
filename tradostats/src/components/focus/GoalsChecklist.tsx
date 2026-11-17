'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Goal } from '@/lib/types';
import { Check, Plus, Trash2, ShieldAlert, Award, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { broadcastSync, getSyncChannel } from '@/lib/focusSync';

interface GoalsChecklistProps {
  date: string;
  storeGoals: Goal[];
  onAddStoreGoal: (title: string) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  isCustom?: boolean;
}

const DEFAULT_RISK_RULES = [
  'Break every 15 min and reflect',
  'Follow risk rules (Max loss: $500 / Max trades: 4)',
  'No revenge trading',
];

export default function GoalsChecklist({
  date,
  storeGoals,
  onAddStoreGoal,
}: GoalsChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settledItemId, setSettledItemId] = useState<string | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load and merge checklist items for this date
  const loadDateGoals = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `tradostats_goals_state_${date}`;
    let savedState: Record<string, boolean> = {};
    let customRules: string[] = [];

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedState = JSON.parse(raw);
      const rawCustom = localStorage.getItem(`tradostats_custom_goals_${date}`);
      if (rawCustom) customRules = JSON.parse(rawCustom);
    } catch (e) {
      console.warn('Error reading goals from localStorage', e);
    }

    // Combine default rules, store goals, and date-custom rules
    const combined: ChecklistItem[] = [];

    // 1. Core Default Risk Rules (as explicitly requested)
    DEFAULT_RISK_RULES.forEach((title, index) => {
      const id = `default_rule_${index}`;
      combined.push({
        id,
        title,
        isCompleted: !!savedState[id],
      });
    });

    // 2. Playbook Store Goals
    storeGoals.forEach(g => {
      // Don't duplicate if matches default
      if (!DEFAULT_RISK_RULES.some(d => d.toLowerCase() === g.title.toLowerCase())) {
        combined.push({
          id: `goal_${g.id}`,
          title: g.title,
          isCompleted: !!savedState[`goal_${g.id}`],
        });
      }
    });

    // 3. Custom inline rules for this date
    customRules.forEach((rule, idx) => {
      const id = `custom_${idx}_${rule.slice(0, 10)}`;
      combined.push({
        id,
        title: rule,
        isCompleted: !!savedState[id],
        isCustom: true,
      });
    });

    setItems(combined);
  }, [date, storeGoals]);

  useEffect(() => {
    loadDateGoals();
  }, [loadDateGoals]);

  // Listen for sync events from other window
  useEffect(() => {
    const ch = getSyncChannel();
    if (!ch) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOALS_UPDATED' && event.data?.date === date) {
        loadDateGoals();
      }
    };

    ch.addEventListener('message', handleMessage);
    return () => {
      ch.removeEventListener('message', handleMessage);
    };
  }, [date, loadDateGoals]);

  function saveState(updatedItems: ChecklistItem[]) {
    const stateMap: Record<string, boolean> = {};
    const customList: string[] = [];

    updatedItems.forEach(item => {
      stateMap[item.id] = item.isCompleted;
      if (item.isCustom) {
        customList.push(item.title);
      }
    });

    try {
      localStorage.setItem(`tradostats_goals_state_${date}`, JSON.stringify(stateMap));
      localStorage.setItem(`tradostats_custom_goals_${date}`, JSON.stringify(customList));
      broadcastSync({ type: 'GOALS_UPDATED', date });
    } catch (e) {
      console.warn('Failed to save goal state', e);
    }
  }

  function handleToggle(id: string) {
    // 1. FLIP FIRST: Record positions before toggle
    const firstRects = new Map<string, DOMRect>();
    itemRefs.current.forEach((el, itemId) => {
      if (el) firstRects.set(itemId, el.getBoundingClientRect());
    });

    const updated = items.map(item =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setItems(updated);
    saveState(updated);

    // 2. FLIP LAST & INVERT & PLAY
    requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setSettledItemId(id);
        setTimeout(() => setSettledItemId(prev => (prev === id ? null : prev)), 800);
        return;
      }

      // Compute delta and invert
      itemRefs.current.forEach((el, itemId) => {
        if (!el) return;
        const first = firstRects.get(itemId);
        if (!first) return;
        const last = el.getBoundingClientRect();
        const deltaY = first.top - last.top;

        if (Math.abs(deltaY) > 0.5) {
          el.style.transform = `translate3d(0, ${deltaY}px, 0)`;
          el.style.transition = 'none';
          if (itemId === id) {
            el.style.zIndex = '20';
            el.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.45)';
          }
        }
      });

      // Play forward
      requestAnimationFrame(() => {
        itemRefs.current.forEach((el) => {
          if (!el) return;
          el.style.transition = 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease';
          el.style.transform = 'translate3d(0, 0, 0)';
        });

        setTimeout(() => {
          itemRefs.current.forEach(el => {
            if (el) {
              el.style.transform = '';
              el.style.transition = '';
              el.style.zIndex = '';
              el.style.boxShadow = '';
            }
          });
          setSettledItemId(id);
          setTimeout(() => setSettledItemId(prev => (prev === id ? null : prev)), 1200);
        }, 340);
      });
    });
  }

  function handleAddInline() {
    if (!newGoalInput.trim()) return;
    const trimmed = newGoalInput.trim();
    const id = `custom_${Date.now()}`;
    const updated = [
      ...items,
      {
        id,
        title: trimmed,
        isCompleted: false,
        isCustom: true,
      },
    ];
    setItems(updated);
    saveState(updated);
    setNewGoalInput('');
    setIsAddingInline(false);
  }

  function handleDeleteCustom(id: string) {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveState(updated);
  }

  const completedCount = items.filter(i => i.isCompleted).length;
  const totalCount = items.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

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
              background: 'rgba(212, 197, 160, 0.1)',
              border: '1px solid rgba(212, 197, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum)',
            }}
          >
            <ShieldAlert size={13} />
          </div>
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--vellum)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              RISK RULES & GOALS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'monospace',
              color: isAllCompleted ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {completedCount}/{totalCount}
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 3,
          background: 'var(--bg-card-alt)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentCompleted}%`,
            background: isAllCompleted ? 'var(--accent)' : 'var(--vellum)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Checklist Items */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* IN PROGRESS SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--vellum)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                In Progress ({items.filter(i => !i.isCompleted).length})
              </span>
            </div>

            {items.filter(i => !i.isCompleted).length === 0 ? (
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                  padding: '6px 8px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 4,
                  border: '1px dashed var(--border)',
                  textAlign: 'center',
                }}
              >
                All rules completed today
              </div>
            ) : (
              items
                .filter(i => !i.isCompleted)
                .map(item => {
                  return (
                    <div
                      key={item.id}
                      ref={el => {
                        if (el) itemRefs.current.set(item.id, el);
                        else itemRefs.current.delete(item.id);
                      }}
                      onClick={() => handleToggle(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 9px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        transition: 'border-color 0.15s ease, background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
                        {/* Custom Checkbox */}
                        <div
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 3,
                            border: '1px solid var(--border-light)',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0c0e12',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        />

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>

                      {item.isCustom && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCustom(item.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 2,
                            marginLeft: 6,
                          }}
                          title="Remove rule"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          {/* DONE SECTION */}
          {items.some(i => i.isCompleted) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4, paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Done ({items.filter(i => i.isCompleted).length})
                </span>
              </div>

              {items
                .filter(i => i.isCompleted)
                .map(item => {
                  const isSettled = settledItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      ref={el => {
                        if (el) itemRefs.current.set(item.id, el);
                        else itemRefs.current.delete(item.id);
                      }}
                      onClick={() => handleToggle(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 9px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: isSettled
                          ? '1px solid var(--accent)'
                          : '1px solid rgba(16, 185, 129, 0.25)',
                        transition: 'border-color 0.15s ease, background 0.15s ease',
                        animation: isSettled ? 'task-dock-settle 0.45s ease-out' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
                        {/* Checked Checkbox */}
                        <div
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 3,
                            border: '1px solid var(--accent)',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0c0e12',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            textDecoration: 'line-through',
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>

                      {item.isCustom && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCustom(item.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 2,
                            marginLeft: 6,
                          }}
                          title="Remove rule"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Inline Add Goal */}
          {isAddingInline ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                padding: '4px 6px',
                background: 'var(--bg-input)',
                borderRadius: 4,
                border: '1px solid var(--vellum)',
              }}
            >
              <input
                type="text"
                value={newGoalInput}
                onChange={e => setNewGoalInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddInline();
                  if (e.key === 'Escape') setIsAddingInline(false);
                }}
                placeholder="e.g. Max loss: $300 or 3 trades max..."
                autoFocus
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddInline}
                style={{
                  padding: '3px 8px',
                  borderRadius: 3,
                  background: 'var(--vellum)',
                  border: 'none',
                  color: '#0c0e12',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingInline(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingInline(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'transparent',
                border: '1px dashed var(--border-light)',
                borderRadius: 4,
                padding: '5px 8px',
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 3,
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--vellum)';
                e.currentTarget.style.color = 'var(--vellum)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Plus size={12} /> Add Rule / Goal
            </button>
          )}
        </div>
      )}
    </div>
  );
}
