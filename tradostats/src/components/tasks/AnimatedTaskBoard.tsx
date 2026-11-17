'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  RotateCcw,
  Play,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export interface BoardTask {
  id: string;
  title: string;
  description: string;
  category: 'Risk Shield' | 'Execution' | 'Psychology' | 'Strategy' | 'Journaling';
  status: 'in_progress' | 'done';
  priority: 'Critical' | 'Strict' | 'High' | 'Medium';
  streak?: number;
  completedAt?: string;
}

const INITIAL_DEMO_TASKS: BoardTask[] = [
  {
    id: 'task-1',
    title: 'Daily Loss Shield: Cap drawdown at $500',
    description: 'If daily loss reaches $500, immediately shut down terminal for the session.',
    category: 'Risk Shield',
    status: 'in_progress',
    priority: 'Critical',
    streak: 8,
  },
  {
    id: 'task-2',
    title: 'Wait for 5-minute candle close before entry',
    description: 'Eliminate false breakout anticipation on ES and NQ open.',
    category: 'Execution',
    status: 'in_progress',
    priority: 'Strict',
    streak: 12,
  },
  {
    id: 'task-3',
    title: 'Zero revenge trades after 2 consecutive stops',
    description: 'Take mandatory 15-minute walk if stopped out twice consecutively.',
    category: 'Psychology',
    status: 'in_progress',
    priority: 'High',
    streak: 5,
  },
  {
    id: 'task-4',
    title: 'Verify VWAP & Key Level Confluence',
    description: 'Ensure institutional liquidity supports the directional bias.',
    category: 'Strategy',
    status: 'in_progress',
    priority: 'High',
    streak: 14,
  },
  {
    id: 'task-5',
    title: 'Pre-market macroeconomic calendar check',
    description: 'Audited 08:30 AM CPI release and Fed speaker schedule.',
    category: 'Execution',
    status: 'done',
    priority: 'High',
    streak: 19,
    completedAt: '08:45 AM',
  },
  {
    id: 'task-6',
    title: 'Log pre-session DRC mental readiness score',
    description: 'Scorecard calibrated at Grade A with disciplined focus.',
    category: 'Psychology',
    status: 'done',
    priority: 'Medium',
    streak: 6,
    completedAt: '09:12 AM',
  },
];

interface AnimatedTaskBoardProps {
  onTaskCompleted?: (taskId: string) => void;
}

export default function AnimatedTaskBoard({ onTaskCompleted }: AnimatedTaskBoardProps) {
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_DEMO_TASKS);
  const [speedMode, setSpeedMode] = useState<'normal' | 'slow'>('normal');
  const [inTransitId, setInTransitId] = useState<string | null>(null);
  const [transitDirection, setTransitDirection] = useState<'to_done' | 'to_progress'>('to_done');
  const [ghostRect, setGhostRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [trajectoryLine, setTrajectoryLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [recentlySettledId, setRecentlySettledId] = useState<string | null>(null);

  // References to DOM cards to measure FLIP coordinates
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  const durationMs = speedMode === 'slow' ? 950 : 380;

  // Filter tasks into columns
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  /**
   * FLIP ANIMATION CORE:
   * Moves a task from In Progress to Done (or vice-versa) with smooth spatial continuity.
   *
   * 1. FIRST: Record bounding box of active card & all affected siblings
   * 2. STATE UPDATE: Move task to destination list
   * 3. LAST: Measure new bounding boxes in destination
   * 4. INVERT: Transform card back to origin position (deltaX, deltaY) with zero transition
   * 5. PLAY: Animate transform to (0,0) with natural cubic-bezier deceleration
   */
  const moveTask = useCallback(
    (taskId: string, targetStatus: 'in_progress' | 'done') => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const movingEl = cardRefs.current.get(taskId);
      if (!movingEl || !containerRef.current) {
        // Fallback if DOM not measured
        setTasks(prev =>
          prev.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  status: targetStatus,
                  completedAt: targetStatus === 'done' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
                }
              : t
          )
        );
        isAnimatingRef.current = false;
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();

      // 1. FIRST: Measure positions of the moving card and its sibling cards
      const firstMovingRect = movingEl.getBoundingClientRect();
      const firstSiblingRects = new Map<string, DOMRect>();
      cardRefs.current.forEach((el, id) => {
        if (el && id !== taskId) {
          firstSiblingRects.set(id, el.getBoundingClientRect());
        }
      });

      // Capture origin ghost coordinates relative to container
      const originGhost = {
        x: firstMovingRect.left - containerRect.left,
        y: firstMovingRect.top - containerRect.top,
        width: firstMovingRect.width,
        height: firstMovingRect.height,
      };
      setGhostRect(originGhost);
      setInTransitId(taskId);
      setTransitDirection(targetStatus === 'done' ? 'to_done' : 'to_progress');

      // 2. STATE UPDATE: Apply status change
      const completionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
                ...t,
                status: targetStatus,
                completedAt: targetStatus === 'done' ? completionTime : undefined,
              }
            : t
        )
      );

      // Call external handler if provided
      if (targetStatus === 'done' && onTaskCompleted) {
        onTaskCompleted(taskId);
      }

      // 3 & 4. LAST & INVERT (Next layout frame)
      requestAnimationFrame(() => {
        const movedEl = cardRefs.current.get(taskId);
        if (!movedEl || !containerRef.current) {
          isAnimatingRef.current = false;
          setInTransitId(null);
          setGhostRect(null);
          return;
        }

        const lastMovingRect = movedEl.getBoundingClientRect();

        // Calculate travel delta
        const deltaX = firstMovingRect.left - lastMovingRect.left;
        const deltaY = firstMovingRect.top - lastMovingRect.top;

        // Set trajectory line for visual gaze anchoring
        const destCenterX = lastMovingRect.left + lastMovingRect.width / 2 - containerRect.left;
        const destCenterY = lastMovingRect.top + lastMovingRect.height / 2 - containerRect.top;
        const originCenterX = firstMovingRect.left + firstMovingRect.width / 2 - containerRect.left;
        const originCenterY = firstMovingRect.top + firstMovingRect.height / 2 - containerRect.top;

        setTrajectoryLine({
          x1: originCenterX,
          y1: originCenterY,
          x2: destCenterX,
          y2: destCenterY,
        });

        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          // Accessible fallback: quick in-place crossfade without spatial translation
          movedEl.style.opacity = '0';
          requestAnimationFrame(() => {
            movedEl.style.transition = 'opacity 200ms ease';
            movedEl.style.opacity = '1';
            setTimeout(() => {
              isAnimatingRef.current = false;
              setInTransitId(null);
              setGhostRect(null);
              setTrajectoryLine(null);
              setRecentlySettledId(taskId);
            }, 200);
          });
          return;
        }

        // INVERT the moving card to its origin position
        movedEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.025)`;
        movedEl.style.transition = 'none';
        movedEl.style.zIndex = '60';
        movedEl.style.boxShadow =
          targetStatus === 'done'
            ? '0 24px 48px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.45)'
            : '0 24px 48px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 197, 160, 0.45)';

        // INVERT the siblings so they don't jump abruptly
        firstSiblingRects.forEach((firstRect, id) => {
          const siblingEl = cardRefs.current.get(id);
          if (siblingEl) {
            const lastRect = siblingEl.getBoundingClientRect();
            const sDeltaY = firstRect.top - lastRect.top;
            if (Math.abs(sDeltaY) > 0.5) {
              siblingEl.style.transform = `translate3d(0, ${sDeltaY}px, 0)`;
              siblingEl.style.transition = 'none';
            }
          }
        });

        // 5. PLAY: Animate to (0, 0) with natural deceleration
        requestAnimationFrame(() => {
          movedEl.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${durationMs}ms ease, border-color ${durationMs}ms ease`;
          movedEl.style.transform = 'translate3d(0, 0, 0) scale(1)';

          // Animate siblings smoothly into vacated spaces
          firstSiblingRects.forEach((_, id) => {
            const siblingEl = cardRefs.current.get(id);
            if (siblingEl) {
              siblingEl.style.transition = `transform ${Math.round(durationMs * 0.85)}ms cubic-bezier(0.16, 1, 0.3, 1)`;
              siblingEl.style.transform = 'translate3d(0, 0, 0)';
            }
          });

          // Settle after arrival
          setTimeout(() => {
            movedEl.style.zIndex = '';
            movedEl.style.boxShadow = '';
            movedEl.style.transform = '';
            movedEl.style.transition = '';

            firstSiblingRects.forEach((_, id) => {
              const siblingEl = cardRefs.current.get(id);
              if (siblingEl) {
                siblingEl.style.transform = '';
                siblingEl.style.transition = '';
              }
            });

            setInTransitId(null);
            setGhostRect(null);
            setTrajectoryLine(null);
            setRecentlySettledId(taskId);
            isAnimatingRef.current = false;

            // Clear settled glow after 1.4s
            setTimeout(() => {
              setRecentlySettledId(prev => (prev === taskId ? null : prev));
            }, 1400);
          }, durationMs + 20);
        });
      });
    },
    [durationMs, onTaskCompleted]
  );

  // Trigger demo motion: complete first in-progress task
  function handleTriggerDemo() {
    if (inProgressTasks.length > 0) {
      moveTask(inProgressTasks[0].id, 'done');
    } else if (doneTasks.length > 0) {
      // If all done, reopen one to show reverse move
      moveTask(doneTasks[0].id, 'in_progress');
    }
  }

  // Reset to initial demo distribution
  function handleReset() {
    setTasks(INITIAL_DEMO_TASKS);
    setRecentlySettledId(null);
    setInTransitId(null);
    setGhostRect(null);
    setTrajectoryLine(null);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '20px 24px 28px',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP TOOLBAR WITH MOTION CONTROLS                           */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          paddingBottom: 18,
          borderBottom: '1px solid var(--border)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'rgba(212, 197, 160, 0.1)',
              border: '1px solid rgba(212, 197, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--vellum)',
            }}
          >
            <Target size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Execution Accountability Board
              </h2>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                FLIP Physics
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
              Watch tasks smoothly elevate and track across columns with continuous spatial orientation.
            </p>
          </div>
        </div>

        {/* Speed & Demo Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Speed Toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: 2,
            }}
          >
            <button
              onClick={() => setSpeedMode('normal')}
              style={{
                background: speedMode === 'normal' ? 'rgba(212, 197, 160, 0.18)' : 'transparent',
                color: speedMode === 'normal' ? 'var(--vellum)' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 3,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Normal (380ms)
            </button>
            <button
              onClick={() => setSpeedMode('slow')}
              style={{
                background: speedMode === 'slow' ? 'rgba(212, 197, 160, 0.18)' : 'transparent',
                color: speedMode === 'slow' ? 'var(--vellum)' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 3,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Slow-Mo (950ms)
            </button>
          </div>

          {/* Trigger Demo Action */}
          <button
            onClick={handleTriggerDemo}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '5px 12px' }}
            title="Automatically animate the top task to Done"
          >
            <Play size={12} fill="currentColor" /> Move Next Task →
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '5px 10px' }}
            title="Reset demo tasks"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. OVERLAY TRAJECTORY BEAM & ORIGIN GHOST                      */}
      {/* ------------------------------------------------------------- */}
      {/* Origin Ghost Placeholder */}
      {ghostRect && (
        <div
          style={{
            position: 'absolute',
            left: ghostRect.x,
            top: ghostRect.y,
            width: ghostRect.width,
            height: ghostRect.height,
            border: '1.5px dashed rgba(212, 197, 160, 0.35)',
            background: 'rgba(212, 197, 160, 0.03)',
            borderRadius: 6,
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: 'var(--vellum)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            animation: 'ghost-pulse 1s infinite ease-in-out',
          }}
        >
          <Sparkles size={13} color="var(--vellum)" />
          {transitDirection === 'to_done' ? 'Moving to Done...' : 'Reopening to In Progress...'}
        </div>
      )}

      {/* Trajectory Guide SVG Line */}
      {trajectoryLine && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          <defs>
            <linearGradient id="trajectory-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4c5a0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line
            x1={trajectoryLine.x1}
            y1={trajectoryLine.y1}
            x2={trajectoryLine.x2}
            y2={trajectoryLine.y2}
            stroke="url(#trajectory-grad)"
            strokeWidth="2"
            strokeDasharray="6 4"
            style={{ animation: 'trajectory-beam 0.8s linear infinite' }}
          />
        </svg>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TWO-COLUMN KANBAN EXECUTION SURFACE                         */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 22,
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* ========================================================= */}
        {/* COLUMN 1: IN PROGRESS (ACTIVE TASKS)                      */}
        {/* ========================================================= */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '16px 16px 20px',
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Column Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: 'var(--vellum)',
                  boxShadow: '0 0 8px rgba(212, 197, 160, 0.4)',
                }}
              />
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                In Progress
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--vellum)',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(212, 197, 160, 0.1)',
                border: '1px solid rgba(212, 197, 160, 0.25)',
              }}
            >
              {inProgressTasks.length} Active
            </span>
          </div>

          {/* Cards Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {inProgressTasks.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  gap: 8,
                  border: '1px dashed var(--border)',
                  borderRadius: 6,
                  height: '100%',
                }}
              >
                <CheckCircle2 size={24} color="var(--accent)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  All session tasks completed
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Click &apos;Reopen&apos; on any task in Done to test the reverse path.
                </span>
              </div>
            ) : (
              inProgressTasks.map(task => {
                const isMoving = inTransitId === task.id;
                return (
                  <div
                    key={task.id}
                    ref={el => {
                      if (el) cardRefs.current.set(task.id, el);
                      else cardRefs.current.delete(task.id);
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: isMoving
                        ? '1px solid var(--accent)'
                        : '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isMoving
                        ? '0 16px 36px rgba(0, 0, 0, 0.65)'
                        : '0 1px 3px rgba(0, 0, 0, 0.35)',
                      willChange: 'transform, box-shadow, opacity',
                      transition: isMoving
                        ? 'none'
                        : 'border-color 0.15s ease, background 0.15s ease',
                    }}
                    onClick={() => moveTask(task.id, 'done')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        moveTask(task.id, 'done');
                      }
                    }}
                  >
                    {/* Header: Category Badge + Priority Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            task.category === 'Risk Shield'
                              ? 'var(--danger-light)'
                              : task.category === 'Execution'
                              ? 'var(--accent)'
                              : 'var(--vellum)',
                          background:
                            task.category === 'Risk Shield'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : task.category === 'Execution'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(212, 197, 160, 0.1)',
                          border: `1px solid ${
                            task.category === 'Risk Shield'
                              ? 'rgba(239, 68, 68, 0.25)'
                              : task.category === 'Execution'
                              ? 'rgba(16, 185, 129, 0.25)'
                              : 'rgba(212, 197, 160, 0.25)'
                          }`,
                          padding: '2px 7px',
                          borderRadius: 3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {task.category}
                      </span>

                      {task.streak && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Flame size={11} color="var(--warning)" /> {task.streak}d streak
                        </span>
                      )}
                    </div>

                    {/* Task Title & Description */}
                    <div style={{ marginBottom: 10 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#ffffff',
                          margin: '0 0 4px',
                          lineHeight: 1.35,
                        }}
                      >
                        {task.title}
                      </h4>
                      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    </div>

                    {/* Card Footer: Tactile Complete Trigger Button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 8,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Click anywhere or trigger:
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          moveTask(task.id, 'done');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: 'var(--accent)',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.22)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(16, 185, 129, 0.12)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16, 185, 129, 0.35)';
                        }}
                      >
                        Complete Task <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: DONE (COMPLETED TASKS)                          */}
        {/* ========================================================= */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '16px 16px 20px',
            minHeight: 420,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Column Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                }}
              />
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Done
              </h3>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--accent)',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              {doneTasks.length} Completed
            </span>
          </div>

          {/* Cards Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {doneTasks.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  gap: 8,
                  border: '1px dashed var(--border)',
                  borderRadius: 6,
                  height: '100%',
                }}
              >
                <Clock size={24} color="var(--text-disabled)" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No tasks marked done yet
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Click &apos;Complete Task&apos; in In Progress to see the flight path.
                </span>
              </div>
            ) : (
              doneTasks.map(task => {
                const isMoving = inTransitId === task.id;
                const isRecentlySettled = recentlySettledId === task.id;

                return (
                  <div
                    key={task.id}
                    ref={el => {
                      if (el) cardRefs.current.set(task.id, el);
                      else cardRefs.current.delete(task.id);
                    }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.04)',
                      border: isRecentlySettled
                        ? '1px solid var(--accent)'
                        : '1px solid rgba(16, 185, 129, 0.22)',
                      borderRadius: 6,
                      padding: '12px 14px',
                      position: 'relative',
                      boxShadow: isRecentlySettled
                        ? '0 0 16px rgba(16, 185, 129, 0.2)'
                        : '0 1px 3px rgba(0, 0, 0, 0.35)',
                      willChange: 'transform, box-shadow, opacity',
                      transition: isMoving
                        ? 'none'
                        : 'border-color 0.25s ease, background 0.25s ease',
                      animation: isRecentlySettled ? 'task-dock-settle 0.5s ease-out' : undefined,
                    }}
                  >
                    {/* Header: Verified Status Pill + Time Completed */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '2px 7px',
                          borderRadius: 3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                        VERIFIED COMPLIANT
                      </span>

                      {task.completedAt && (
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Clock size={11} /> {task.completedAt}
                        </span>
                      )}
                    </div>

                    {/* Task Title & Description */}
                    <div style={{ marginBottom: 10 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textDecoration: 'line-through',
                          textDecorationColor: 'rgba(16, 185, 129, 0.5)',
                          margin: '0 0 4px',
                          lineHeight: 1.35,
                        }}
                      >
                        {task.title}
                      </h4>
                      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    </div>

                    {/* Card Footer: Reopen Action */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 8,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'rgba(16, 185, 129, 0.8)' }}>
                        ✓ Process rule adhered to
                      </span>
                      <button
                        onClick={() => moveTask(task.id, 'in_progress')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--vellum)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--vellum)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        }}
                        title="Reopen task and move back to In Progress"
                      >
                        <RotateCcw size={10} /> Reopen
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

