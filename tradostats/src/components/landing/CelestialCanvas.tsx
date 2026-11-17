'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  z: number; // Depth layer: 0.2 (distant) to 1.0 (near)
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function CelestialCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const mouseTargetRef = useRef({ x: -1000, y: -1000 });
  const mouseCurrentRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<StardustParticle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const isPointerActiveRef = useRef(false);

  // Initialize stars once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const starCount = 85;
    const colors = ['#ffffff', '#d4c5a0', '#e6dcbe', '#38bdf8', '#10b981'];
    const newStars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const z = 0.2 + Math.random() * 0.8;
      newStars.push({
        x: Math.random(),
        y: Math.random(),
        z,
        radius: 0.6 + z * 1.4,
        baseAlpha: 0.25 + Math.random() * 0.55,
        twinkleSpeed: 0.8 + Math.random() * 2.2,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    starsRef.current = newStars;
  }, []);

  // Listen to mouse movement with smooth dampening
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mouseTargetRef.current = { x: e.clientX, y: e.clientY };
      isPointerActiveRef.current = true;

      // Spawn subtle stardust particles on motion
      if (Math.random() < 0.35 && particlesRef.current.length < 35) {
        const colors = ['rgba(212, 197, 160, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(56, 189, 248, 0.6)'];
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.3,
          alpha: 0.7,
          life: 0,
          maxLife: 30 + Math.random() * 25,
          size: 1 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function handleMouseLeave() {
      isPointerActiveRef.current = false;
      mouseTargetRef.current = { x: -1000, y: -1000 };
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Animation render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    function handleResize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial mouse center if not moved
    mouseTargetRef.current = { x: width / 2, y: height * 0.35 };
    mouseCurrentRef.current = { x: width / 2, y: height * 0.35 };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let time = 0;

    function render() {
      if (!ctx) return;
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Lerp mouse coordinates for fluid dampening
      if (isPointerActiveRef.current) {
        mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.08;
        mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.08;
      }

      const mx = mouseCurrentRef.current.x;
      const my = mouseCurrentRef.current.y;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Soft Celestial Nebula Glow around Cursor
      if (mx > -100 && mx < width + 100 && my > -100 && my < height + 100) {
        const nebulaGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 260);
        nebulaGrad.addColorStop(0, 'rgba(212, 197, 160, 0.075)');
        nebulaGrad.addColorStop(0.35, 'rgba(16, 185, 129, 0.04)');
        nebulaGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.02)');
        nebulaGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = nebulaGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      // Compute star screen positions with 3D gravitational parallax
      const activeStarPoints: { x: number; y: number; star: Star }[] = [];

      starsRef.current.forEach(star => {
        // Absolute base position
        const baseX = star.x * width;
        const baseY = star.y * height;

        // Gravitational parallax offset based on distance from mouse
        const parallaxOffsetX = (mx - centerX) * star.z * 0.035;
        const parallaxOffsetY = (my - centerY) * star.z * 0.035;

        const screenX = baseX + parallaxOffsetX;
        const screenY = baseY + parallaxOffsetY;

        activeStarPoints.push({ x: screenX, y: screenY, star });

        // Twinkle luminance
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.25;
        const alpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle));

        // Draw Star Body
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Star Aura Halo for larger stars
        if (star.z > 0.7) {
          ctx.globalAlpha = alpha * 0.28;
          ctx.beginPath();
          ctx.arc(screenX, screenY, star.radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 2. Interactive Constellation Lines connecting mouse to nearby stars
      if (isPointerActiveRef.current && mx > 0 && my > 0) {
        const proximityThreshold = 145;

        activeStarPoints.forEach(pt => {
          const dx = pt.x - mx;
          const dy = pt.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proximityThreshold) {
            const lineAlpha = (1 - dist / proximityThreshold) * 0.38;

            ctx.save();
            ctx.strokeStyle = 'rgba(212, 197, 160, ' + lineAlpha.toFixed(3) + ')';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();

            // Accent node dot at connected star
            ctx.fillStyle = 'rgba(212, 197, 160, ' + (lineAlpha * 1.5).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        // Inter-star constellation links for stars close to each other near cursor
        for (let i = 0; i < activeStarPoints.length; i++) {
          const p1 = activeStarPoints[i];
          const distToMouse = Math.hypot(p1.x - mx, p1.y - my);
          if (distToMouse > 220) continue;

          for (let j = i + 1; j < activeStarPoints.length; j++) {
            const p2 = activeStarPoints[j];
            const distBetween = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (distBetween < 80) {
              const linkAlpha = (1 - distBetween / 80) * 0.22;
              ctx.save();
              ctx.strokeStyle = 'rgba(212, 197, 160, ' + linkAlpha.toFixed(3) + ')';
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // 3. Stardust Particles Update & Render
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  );
}

