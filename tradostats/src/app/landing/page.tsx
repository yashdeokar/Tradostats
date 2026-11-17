'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  DollarSign,
  ExternalLink,
  FileText,
  Flame,
  Layers,
  Monitor,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import CelestialCanvas from '@/components/landing/CelestialCanvas';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealedSections, setRevealedSections] = useState<Record<string, boolean>>({});

  // -------------------------------------------------------------
  // 1. 3D COCKPIT PARALLAX & SPECULAR GLARE
  // -------------------------------------------------------------
  const cockpitRef = useRef<HTMLDivElement>(null);
  const [cockpitTilt, setCockpitTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    mouseX: '50%',
    mouseY: '50%',
    isHovered: false,
  });

  const handleCockpitMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cockpitRef.current) return;
    const rect = cockpitRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Rotate within bounds: -8deg to +8deg
    const rotateX = Number((((y - centerY) / centerY) * -7).toFixed(2));
    const rotateY = Number((((x - centerX) / centerX) * 7).toFixed(2));

    setCockpitTilt({
      rotateX,
      rotateY,
      mouseX: `${x}px`,
      mouseY: `${y}px`,
      isHovered: true,
    });
  }, []);

  const handleCockpitMouseLeave = useCallback(() => {
    setCockpitTilt(prev => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      isHovered: false,
    }));
  }, []);

  // -------------------------------------------------------------
  // 2. STICKY NAVBAR SCROLL SENSING & PROGRESS
  // -------------------------------------------------------------
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollY / docHeight) * 100)));
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -------------------------------------------------------------
  // 2.1 SCROLL REVEAL OBSERVER
  // -------------------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-reveal-id');
            if (id) {
              setRevealedSections(prev => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('[data-reveal-id]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // -------------------------------------------------------------
  // 3. KINETIC COUNTER NUMBERS
  // -------------------------------------------------------------
  const [countersStarted, setCountersStarted] = useState(false);
  const [volumeCount, setVolumeCount] = useState(0);
  const [adherenceCount, setAdherenceCount] = useState(0);
  const [activeTradersCount, setActiveTradersCount] = useState(0);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !countersStarted) {
          setCountersStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }
    return () => observer.disconnect();
  }, [countersStarted]);

  useEffect(() => {
    if (!countersStarted) return;

    let start = 0;
    const duration = 1600;
    const stepTime = 25;
    const steps = duration / stepTime;

    const timer = setInterval(() => {
      start++;
      const progress = start / steps;
      // Exponential ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setVolumeCount(Number((easeProgress * 48.2).toFixed(1)));
      setAdherenceCount(Number((easeProgress * 94.8).toFixed(1)));
      setActiveTradersCount(Math.floor(easeProgress * 1240));

      if (start >= steps) {
        clearInterval(timer);
        setVolumeCount(48.2);
        setAdherenceCount(94.8);
        setActiveTradersCount(1240);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [countersStarted]);

  // -------------------------------------------------------------
  // 4. INTERACTIVE BENTO CARD 1: LIVE TRADE SIMULATOR
  // -------------------------------------------------------------
  const [simDirection, setSimDirection] = useState<'Long' | 'Short'>('Long');
  const [simContracts, setSimContracts] = useState<number>(3);
  const [simPoints, setSimPoints] = useState<number>(14.5);

  // ES Mini: $50 / point
  const simDollarPnl =
    simDirection === 'Long'
      ? simPoints * 50 * simContracts
      : -simPoints * 50 * simContracts;
  const simRiskReward = (Math.abs(simPoints) / 4.5).toFixed(1);

  // -------------------------------------------------------------
  // 5. INTERACTIVE BENTO CARD 2: FOCUS SIDECAR DOCK PREVIEW
  // -------------------------------------------------------------
  const [sidecarMode, setSidecarMode] = useState<'dock-right' | 'floating' | 'dock-left'>('dock-right');

  // -------------------------------------------------------------
  // 6. INTERACTIVE BENTO CARD 3: PSYCHOLOGY HEATMAP
  // -------------------------------------------------------------
  type PsychologyTag = 'Patient' | 'Disciplined' | 'FOMO' | 'Hesitant' | 'Revenge';
  const [selectedTag, setSelectedTag] = useState<PsychologyTag>('Disciplined');

  const tagAttributions: Record<
    PsychologyTag,
    { winRate: string; pnlRatio: string; tint: string; glow: string; quote: string }
  > = {
    Disciplined: {
      winRate: '78.4%',
      pnlRatio: '+3.4 R:R',
      tint: 'rgba(16, 185, 129, 0.12)',
      glow: 'rgba(16, 185, 129, 0.35)',
      quote: 'Followed execution criteria, waited for confirmation at daily pivot.',
    },
    Patient: {
      winRate: '82.1%',
      pnlRatio: '+4.1 R:R',
      tint: 'rgba(56, 189, 248, 0.12)',
      glow: 'rgba(56, 189, 248, 0.35)',
      quote: 'Let market come into value area without chasing premature breakout.',
    },
    FOMO: {
      winRate: '34.2%',
      pnlRatio: '-1.8 R:R',
      tint: 'rgba(245, 158, 11, 0.14)',
      glow: 'rgba(245, 158, 11, 0.35)',
      quote: 'Entered 12 ticks late at top of green momentum candle.',
    },
    Hesitant: {
      winRate: '41.0%',
      pnlRatio: '+0.8 R:R',
      tint: 'rgba(168, 85, 247, 0.12)',
      glow: 'rgba(168, 85, 247, 0.35)',
      quote: 'Hesitated on clean trigger, moved stop prematurely to break-even.',
    },
    Revenge: {
      winRate: '12.5%',
      pnlRatio: '-4.6 R:R',
      tint: 'rgba(239, 68, 68, 0.16)',
      glow: 'rgba(239, 68, 68, 0.4)',
      quote: 'Doubled size right after stop hit. Bypassed risk parameters.',
    },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#07080a',
        color: '#f0ede6',
        position: 'relative',
        overflowX: 'clip',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dynamic Celestial Interactive Canvas (Stars, Nebula Glow & Parallax) */}
      <CelestialCanvas />

      {/* Reading Depth Scroll Progress Line */}
      <div className="scroll-progress-line" style={{ width: `${scrollProgress}%` }} />

      {/* Ambient Top Lighting Beam */}
      <div className="ambient-light-beam" style={{ top: 0, left: '5%', right: '5%' }} />

      {/* Atmospheric Spatial Radial Highlights */}
      <div
        style={{
          position: 'absolute',
          top: -150,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 600,
          background: 'radial-gradient(ellipse 65% 50% at 50% 30%, rgba(212, 197, 160, 0.13), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 350,
          left: -150,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05), transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 450,
          right: -150,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05), transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. STICKY FLOATING GLASS NAVBAR                                */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          position: 'sticky',
          top: 18,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 24px',
          pointerEvents: 'none',
        }}
      >
        <nav
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
            padding: isScrolled ? '8px 20px' : '10px 24px',
            borderRadius: 9999,
            background: isScrolled ? 'rgba(12, 14, 18, 0.88)' : 'rgba(18, 21, 28, 0.65)',
            backdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            WebkitBackdropFilter: isScrolled ? 'blur(24px)' : 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: 960,
            width: '100%',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #d4c5a0 0%, #ab9b74 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#07080a',
                fontWeight: 900,
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(212, 197, 160, 0.35)',
              }}
            >
              T
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Tradostats
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--vellum)',
                padding: '1px 6px',
                borderRadius: 9999,
                background: 'rgba(212, 197, 160, 0.12)',
                border: '1px solid rgba(212, 197, 160, 0.3)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              PRO
            </span>
          </Link>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hidden md:flex">
            <a href="#cockpit" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Cockpit
            </a>
            <a href="#simulator" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Live Simulator
            </a>
            <a href="#sidecar" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Spatial Sidecar
            </a>
            <a href="#psychology" style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
              Heatmap
            </a>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              href="/focus"
              className="glass-pill-control"
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              <Activity size={13} color="var(--vellum)" /> Focus Sidecar
            </Link>
            <Link
              href="/"
              className="glass-pill-control glass-pill-primary"
              style={{ padding: '6px 16px', fontSize: 12 }}
            >
              Launch Terminal <ArrowRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. CINEMA HERO SECTION (TERRAGRIP ARCHITECTURE)               */}
      {/* ------------------------------------------------------------- */}
      <section
        id="cockpit"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '70px 24px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {/* Status Chip */}
        <div style={{ marginBottom: 16, animation: 'typography-fade-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <span
            className="glass-pill"
            style={{
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--vellum)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span className="pulsing-indicator">
              <span className="pulsing-indicator-ping" />
              <span className="pulsing-indicator-dot" />
            </span>
            SPATIAL AUDITING ENGINE • ACTIVE TRADING TERMINAL
          </span>
        </div>

        {/* Mixed Display Headline with Word Unmasking & Editorial Stagger */}
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            color: '#ffffff',
            maxWidth: 980,
            margin: '0 auto 18px',
            textWrap: 'balance',
          }}
        >
          <span className="typography-mask-wrap">
            <span className="typography-animated-word" style={{ animationDelay: '100ms' }}>
              Disciplined
            </span>
          </span>
          <span className="typography-mask-wrap">
            <span className="typography-animated-word" style={{ animationDelay: '220ms' }}>
              Execution
            </span>
          </span>
          <span className="typography-mask-wrap">
            <span
              className="typography-animated-word"
              style={{
                animationDelay: '340ms',
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--vellum)',
                fontSize: '1.18em',
                lineHeight: 0.9,
                textShadow: '0 0 24px rgba(212, 197, 160, 0.4)',
              }}
            >
              for
            </span>
          </span>
          <span className="typography-mask-wrap">
            <span className="typography-animated-word" style={{ animationDelay: '460ms' }}>
              Peak
            </span>
          </span>
          <span className="typography-mask-wrap" style={{ marginRight: 0 }}>
            <span className="typography-animated-word" style={{ animationDelay: '580ms' }}>
              Alpha
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 680,
            margin: '0 auto 32px',
            textWrap: 'pretty',
            animation: 'typography-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
            animationDelay: '700ms',
          }}
        >
          The institutional performance operating system for futures and equity traders.
          Enforce mathematical loss bounds, eliminate emotional tilt, and journal in real time.
        </p>

        {/* Pill-Shaped Action Bar */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 54,
            animation: 'typography-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
            animationDelay: '820ms',
          }}
        >
          <Link
            href="/"
            className="glass-pill-control glass-pill-primary"
            style={{ padding: '12px 28px', fontSize: 14 }}
          >
            Explore Terminal <ArrowRight size={15} />
          </Link>

          <button
            onClick={() => setShowVideoModal(true)}
            className="glass-pill-control"
            style={{ padding: '10px 22px', fontSize: 13, gap: 10 }}
          >
            <div
              className="glass-circle-trigger"
              style={{
                width: 26,
                height: 26,
                background: 'rgba(212, 197, 160, 0.2)',
                borderColor: 'var(--vellum)',
              }}
            >
              <Play size={11} fill="var(--vellum)" color="var(--vellum)" />
            </div>
            <span>Watch 2-Min Live Walkthrough</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* THE FOCAL MOMENT: 3D HOLOGRAPHIC COCKPIT CARD            */}
        {/* ========================================================= */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 980,
            perspective: 1200,
            margin: '0 auto 40px',
          }}
        >
          {/* Floating Pill Callout 1 (Top Left): Zero Revenge Trades */}
          <div
            className="floating-telemetry-pill"
            style={{
              position: 'absolute',
              top: -18,
              left: 40,
              zIndex: 30,
              boxShadow: '0 16px 32px -6px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="pulsing-indicator">
              <span className="pulsing-indicator-ping" />
              <span className="pulsing-indicator-dot" />
            </span>
            <span>⚡ Zero Revenge Trades</span>
          </div>

          {/* Hairline SVG Leader-Line 1 */}
          <svg style={{ position: 'absolute', top: 12, left: 190, width: 60, height: 42, zIndex: 25, pointerEvents: 'none' }}>
            <path d="M 0 0 L 32 30 L 52 30" fill="none" stroke="rgba(212, 197, 160, 0.55)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="52" cy="30" r="2.5" fill="var(--vellum)" />
          </svg>

          {/* Floating Pill Callout 2 (Top Right): Max Daily Risk Shield */}
          <div
            className="floating-telemetry-pill"
            style={{
              position: 'absolute',
              top: -18,
              right: 40,
              zIndex: 30,
              boxShadow: '0 16px 32px -6px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="pulsing-indicator">
              <span className="pulsing-indicator-ping" />
              <span className="pulsing-indicator-dot" />
            </span>
            <span>🛡️ Max Daily Risk Shield</span>
          </div>

          {/* Hairline SVG Leader-Line 2 */}
          <svg style={{ position: 'absolute', top: 12, right: 190, width: 60, height: 42, zIndex: 25, pointerEvents: 'none' }}>
            <path d="M 60 0 L 28 30 L 8 30" fill="none" stroke="rgba(16, 185, 129, 0.55)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="8" cy="30" r="2.5" fill="var(--accent)" />
          </svg>

          {/* Floating Pill Callout 3 (Bottom Center): Daily Report Card A+ */}
          <div
            className="floating-telemetry-pill"
            style={{
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              borderColor: 'rgba(212, 197, 160, 0.45)',
              background: 'rgba(18, 20, 26, 0.92)',
              boxShadow: '0 16px 32px -6px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(212, 197, 160, 0.3)',
            }}
          >
            <Award size={14} color="var(--vellum)" />
            <span>🏆 Daily Report Card: Grade A+</span>
          </div>

          {/* 3D Tilted Cockpit Container with Dynamic Specular Glare */}
          <div
            ref={cockpitRef}
            onMouseMove={handleCockpitMouseMove}
            onMouseLeave={handleCockpitMouseLeave}
            className="cockpit-card glass-panel"
            style={{
              borderRadius: 22,
              padding: '24px 28px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(12, 14, 18, 0.85) 100%)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              transform: `perspective(1200px) rotateX(${cockpitTilt.rotateX}deg) rotateY(${cockpitTilt.rotateY}deg) scale3d(1, 1, 1)`,
              boxShadow: cockpitTilt.isHovered
                ? '0 32px 64px -16px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.2) inset'
                : '0 24px 48px -14px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.12) inset',
              // Set custom CSS variables for specular glare
              ['--mouse-x' as string]: cockpitTilt.mouseX,
              ['--mouse-y' as string]: cockpitTilt.mouseY,
              cursor: 'crosshair',
            }}
          >
            {/* Dynamic Radial Glare following cursor */}
            <div className="cockpit-glare" style={{ opacity: cockpitTilt.isHovered ? 1 : 0.4 }} />

            {/* Cockpit Header Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#ef4444', opacity: 0.8 }} />
                  <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#f59e0b', opacity: 0.8 }} />
                  <div style={{ width: 10, height: 10, borderRadius: 9999, background: '#10b981', opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--vellum)', letterSpacing: '0.04em', fontFamily: "'JetBrains Mono', monospace" }}>
                  ES_FUTURES // LIVE SESSION STREAM
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  LIVE SYNC ACTIVE
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                  NYSE 09:42:18 EST
                </span>
              </div>
            </div>

            {/* Cockpit Telemetry Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 22,
                textAlign: 'left',
              }}
            >
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Net Session Balance
                </div>
                <div className="num-font ledger-double-rule" style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
                  +$4,850.00
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  4 Wins • 0 Losses
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Profit Factor
                </div>
                <div className="num-font" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  3.42
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  Expected: 2.50+
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Max Drawdown
                </div>
                <div className="num-font" style={{ fontSize: 24, fontWeight: 800, color: 'var(--vellum)', marginTop: 4 }}>
                  -$320.00
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  Floor: -$1,000.00
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Execution Win Rate
                </div>
                <div className="num-font" style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
                  78.2%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  Top 2% Prop Tier
                </div>
              </div>
            </div>

            {/* Simulated Live Order-Book Ticker Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                    LONG
                  </span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>ES 5732.50</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>3 contracts</span>
                  <span style={{ color: 'var(--vellum)', fontSize: 12 }}>⚡ Opening Range Breakout</span>
                </div>
                <div className="num-font" style={{ fontWeight: 800, color: 'var(--accent)' }}>
                  +$1,450.00
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontWeight: 800, background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                    LONG
                  </span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>NQ 20,410.00</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>2 contracts</span>
                  <span style={{ color: 'var(--vellum)', fontSize: 12 }}>⚡ VWAP Fade &amp; Retest</span>
                </div>
                <div className="num-font" style={{ fontWeight: 800, color: 'var(--accent)' }}>
                  +$2,100.00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof Strip: 3 Frosted Chips */}
        <div
          data-reveal-id="proof-strip"
          className={`scroll-reveal-card ${revealedSections['proof-strip'] ? 'is-revealed' : ''}`}
          style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', width: '100%', maxWidth: 960 }}
        >
          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 9999 }}>
            <div className="glass-circle-trigger" style={{ width: 32, height: 32 }}>
              <Zap size={14} color="var(--accent)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>Sub-Second Entry</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Built for fast market opens</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 9999 }}>
            <div className="glass-circle-trigger" style={{ width: 32, height: 32 }}>
              <Monitor size={14} color="var(--vellum)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>Pop-Out Companion</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Dock beside TradingView &amp; DOM</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 9999 }}>
            <div className="glass-circle-trigger" style={{ width: 32, height: 32 }}>
              <FileText size={14} color="var(--accent)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>A4 Journal Export</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>High-resolution audit archives</div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. KINETIC NUMBERS COUNTER STRIP                              */}
      {/* ------------------------------------------------------------- */}
      <section
        ref={statsSectionRef}
        data-reveal-id="telemetry-strip"
        className={`scroll-reveal-card ${revealedSections['telemetry-strip'] ? 'is-revealed' : ''}`}
        style={{
          padding: '60px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(12, 14, 18, 0.5)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          <div>
            <div className="num-font" style={{ fontSize: 38, fontWeight: 800, color: 'var(--vellum)', letterSpacing: '-0.02em' }}>
              ${volumeCount}M+
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Volume Audited
            </div>
          </div>

          <div>
            <div className="num-font" style={{ fontSize: 38, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              {adherenceCount}%
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Risk Plan Adherence
            </div>
          </div>

          <div>
            <div className="num-font" style={{ fontSize: 38, fontWeight: 800, color: '#38bdf8', letterSpacing: '-0.02em' }}>
              0.4s
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Mean Execution Log Time
            </div>
          </div>

          <div>
            <div className="num-font" style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {activeTradersCount}+
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Funded Prop Operators
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. INTERACTIVE BENTO GRID (FEATURES SHOWCASE)                 */}
      {/* ------------------------------------------------------------- */}
      <section
        id="simulator"
        style={{
          padding: '80px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span
            className="glass-pill"
            style={{
              padding: '4px 12px',
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--vellum)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            INTERACTIVE SYSTEM ARCHITECTURE
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              marginTop: 12,
              marginBottom: 8,
              textWrap: 'balance',
            }}
          >
            Built for Extreme Execution Discipline
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto' }}>
            Touch and test the engine in real time. Every module communicates without friction.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          {/* Bento Card 1: Live Interactive Trade Simulator */}
          <div
            data-reveal-id="bento-simulator"
            className={`glass-panel scroll-reveal-card ${revealedSections['bento-simulator'] ? 'is-revealed' : ''}`}
            style={{
              padding: '28px 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 440,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vellum)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                  MODULE 01 // INTERACTIVE SIMULATOR
                </span>
                <span className="glass-pill" style={{ fontSize: 11, padding: '2px 8px', color: 'var(--accent)' }}>
                  REACTIVE ENGINE
                </span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                Real-Time Risk &amp; Reward Calculator
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Adjust contract size and price targets to calculate net expectancy and drawdown exposure.
              </p>
            </div>

            {/* Interactive Simulator Controls */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 14,
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                margin: '20px 0',
              }}
            >
              {/* Direction Toggle */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setSimDirection('Long')}
                  className="glass-pill-control"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    border: simDirection === 'Long' ? '1.5px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: simDirection === 'Long' ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                    color: simDirection === 'Long' ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  ▲ Long ES
                </button>
                <button
                  type="button"
                  onClick={() => setSimDirection('Short')}
                  className="glass-pill-control"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    border: simDirection === 'Short' ? '1.5px solid var(--danger)' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: simDirection === 'Short' ? 'rgba(239, 68, 68, 0.16)' : 'transparent',
                    color: simDirection === 'Short' ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                >
                  ▼ Short ES
                </button>
              </div>

              {/* Slider 1: Contracts */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Position Size:</span>
                  <span className="num-font" style={{ fontWeight: 700, color: 'var(--vellum)' }}>
                    {simContracts} Contract{simContracts > 1 ? 's' : ''} (${simContracts * 50}/pt)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simContracts}
                  onChange={e => setSimContracts(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--vellum)', cursor: 'pointer' }}
                />
              </div>

              {/* Slider 2: Target Points */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Movement (Pts):</span>
                  <span className="num-font" style={{ fontWeight: 700, color: simPoints >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                    {simPoints >= 0 ? `+${simPoints}` : simPoints} Points
                  </span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="35"
                  step="0.5"
                  value={simPoints}
                  onChange={e => setSimPoints(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Calculated Outcome Display */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 12,
                background: simDollarPnl >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${simDollarPnl >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Realized Expectancy
                </div>
                <div className="num-font" style={{ fontSize: 24, fontWeight: 800, color: simDollarPnl >= 0 ? 'var(--accent)' : 'var(--danger)', marginTop: 2 }}>
                  {simDollarPnl >= 0 ? `+${formatCurrency(simDollarPnl)}` : formatCurrency(simDollarPnl)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                  Risk-to-Reward
                </div>
                <div className="num-font" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  1 : {simRiskReward}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Bento: Card 2 & Card 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Bento Card 2: Focus Sidecar Dock Preview */}
            <div
              id="sidecar"
              data-reveal-id="bento-sidecar"
              className={`glass-panel scroll-reveal-card ${revealedSections['bento-sidecar'] ? 'is-revealed' : ''}`}
              style={{
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vellum)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                    MODULE 02 // DOCKABLE SIDECAR
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['dock-right', 'floating', 'dock-left'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSidecarMode(mode)}
                        className="glass-pill-control"
                        style={{
                          padding: '2px 8px',
                          fontSize: 10.5,
                          background: sidecarMode === mode ? 'rgba(212, 197, 160, 0.2)' : 'transparent',
                          color: sidecarMode === mode ? 'var(--vellum)' : 'var(--text-muted)',
                        }}
                      >
                        {mode.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                  Floating Picture-in-Picture Companion
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Pins seamlessly on top of Sierra Chart, TradingView, or NinjaTrader. Instant timestamps with zero window alt-tabbing.
                </p>
              </div>

              {/* Miniature Workspace Mockup */}
              <div
                style={{
                  height: 120,
                  borderRadius: 10,
                  background: 'rgba(10, 12, 16, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Chart Mock */}
                <div
                  style={{
                    flex: 1,
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 6,
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-disabled)',
                    fontSize: 11,
                  }}
                >
                  Charting Platform (TradingView / DOM)
                </div>

                {/* Animated Docked Notepad */}
                <div
                  style={{
                    width: 140,
                    height: '100%',
                    borderRadius: 6,
                    background: 'rgba(21, 25, 33, 0.95)',
                    border: '1px solid var(--vellum)',
                    padding: '8px',
                    fontSize: 9.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div style={{ color: 'var(--vellum)', fontWeight: 700 }}>[09:34 AM] Faded double top</div>
                  <div style={{ color: 'var(--text-muted)' }}>Target: 5745.00</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 700 }}>+4 contracts filled</div>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Psychology Heatmap */}
            <div
              id="psychology"
              data-reveal-id="bento-psychology"
              className={`glass-panel scroll-reveal-card ${revealedSections['bento-psychology'] ? 'is-revealed' : ''}`}
              style={{
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: tagAttributions[selectedTag].tint,
                borderColor: 'rgba(255, 255, 255, 0.15)',
                transition: 'background 0.35s ease, box-shadow 0.35s ease, opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: `0 20px 40px -15px ${tagAttributions[selectedTag].glow}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vellum)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                    MODULE 03 // BEHAVIORAL ATTRIBUTION
                  </span>
                  <span className="glass-pill" style={{ fontSize: 11, padding: '2px 8px', color: '#fff' }}>
                    DYNAMIC TINT
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                  Emotional State vs. Expectancy
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Click an emotion tag below to witness how psychological mindset directly dictates statistical win rate.
                </p>
              </div>

              {/* Tag Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '14px 0 10px' }}>
                {(['Patient', 'Disciplined', 'FOMO', 'Hesitant', 'Revenge'] as const).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="glass-pill-control"
                    style={{
                      padding: '4px 12px',
                      fontSize: 11.5,
                      border: selectedTag === tag ? '1.5px solid #fff' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: selectedTag === tag ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedTag === tag ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: selectedTag === tag ? 700 : 500,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Mindset Outcome Attribution */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Historical Win Rate</div>
                  <div className="num-font" style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                    {tagAttributions[selectedTag].winRate}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Realized R:R Ratio</div>
                  <div className="num-font" style={{ fontSize: 20, fontWeight: 800, color: 'var(--vellum)', marginTop: 2 }}>
                    {tagAttributions[selectedTag].pnlRatio}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. CINEMATIC EXIT CTA SECTION                                 */}
      {/* ------------------------------------------------------------- */}
      <section
        data-reveal-id="exit-cta"
        className={`scroll-reveal-card ${revealedSections['exit-cta'] ? 'is-revealed' : ''}`}
        style={{
          padding: '80px 24px 100px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div className="shimmer-card-border">
          <div
            className="shimmer-card-inner"
            style={{
              padding: '60px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              className="glass-circle-trigger"
              style={{ width: 52, height: 52, marginBottom: 20, background: 'rgba(212, 197, 160, 0.15)', borderColor: 'var(--vellum)' }}
            >
              <Sparkles size={22} color="var(--vellum)" />
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                maxWidth: 620,
                margin: '0 0 14px',
                textWrap: 'balance',
              }}
            >
              Ready to eliminate emotional drawdown forever?
            </h2>

            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 0 32px', lineHeight: 1.6 }}>
              Step inside the audited terminal. Zero subscriptions, zero invasive telemetry, 100% private to your browser.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/"
                className="glass-pill-control glass-pill-primary"
                style={{ padding: '14px 34px', fontSize: 14 }}
              >
                Launch Main Dashboard <ArrowRight size={15} />
              </Link>

              <Link
                href="/focus"
                className="glass-pill-control"
                style={{ padding: '14px 28px', fontSize: 14 }}
              >
                <Activity size={15} color="var(--vellum)" /> Open Focus Sidecar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. MINIMALIST FOOTER                                          */}
      {/* ------------------------------------------------------------- */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          © {new Date().getFullYear()} Tradostats Inc. The Double-Entry Actuarial Trading Terminal.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Terminal
          </Link>
          <Link href="/focus" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Focus Sidecar
          </Link>
          <Link href="/playbook/setups" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Playbook
          </Link>
          <Link href="/reports/overview" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Reports
          </Link>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 7. WALKTHROUGH VIDEO MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {showVideoModal && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)} style={{ zIndex: 200 }}>
          <div
            className="glass-panel"
            style={{
              maxWidth: 720,
              width: '90%',
              padding: 24,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={16} color="var(--vellum)" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                  2-Minute Live Terminal Walkthrough
                </h3>
              </div>
              <button
                className="glass-circle-trigger"
                style={{ width: 32, height: 32 }}
                onClick={() => setShowVideoModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                color: 'var(--text-muted)',
              }}
            >
              <div
                className="glass-circle-trigger"
                style={{ width: 56, height: 56, background: 'rgba(212, 197, 160, 0.2)', borderColor: 'var(--vellum)' }}
              >
                <Play size={22} fill="var(--vellum)" color="var(--vellum)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Interactive terminal session walkthrough simulation
              </span>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="glass-pill-control glass-pill-primary" onClick={() => setShowVideoModal(false)}>
                Enter Live Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

