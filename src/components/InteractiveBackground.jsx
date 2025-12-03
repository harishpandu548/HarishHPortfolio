"use client";

import { useEffect, useRef } from "react";

/**
 * InteractiveBackground (improved)
 * - Continuous animation (infinite)
 * - Localized disturbance on pointer move (pulses)
 * - Lightweight particle system, DPR-aware
 *
 * Props:
 *  - color (string) highlight color for particles/lines
 *  - bgColor (string) background fill color
 *  - maxParticles (number) upper cap
 *  - particleSize (number)
 *  - lineDistance (number)
 *  - pulseRadius (number) radius of pointer disturbance
 *  - pulseStrength (number) how strong each pulse pushes particles
 */
export default function InteractiveBackground({
  className = "absolute inset-0 -z-10",
  color = "#60a5fa",
  bgColor = "#061025",
  maxParticles = 120,
  particleSize = 2.2,
  lineDistance = 110,
  pulseRadius = 120,
  pulseStrength = 1.2,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const pulsesRef = useRef([]); // store active pulses {x,y,created,life}
  const dpiRef = useRef(1);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // respect reduced motion: do nothing
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Utilities
    const now = () => performance.now();
    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function hexToRgba(hex, alpha = 1) {
      const h = hex.replace("#", "");
      let r, g, b;
      if (h.length === 3) {
        r = parseInt(h[0] + h[0], 16);
        g = parseInt(h[1] + h[1], 16);
        b = parseInt(h[2] + h[2], 16);
      } else {
        r = parseInt(h.substring(0, 2), 16);
        g = parseInt(h.substring(2, 4), 16);
        b = parseInt(h.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function lightenHex(hex, amt = 20) {
      const h = hex.replace("#", "");
      const num = parseInt(h, 16);
      let r = (num >> 16) + amt;
      let g = ((num >> 8) & 0x00ff) + amt;
      let b = (num & 0x0000ff) + amt;
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // sizing & particles
    function resize() {
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      dpiRef.current = dpr;
      const rect = canvas.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function makeParticle(w, h) {
      const speed = rand(0.1, 0.7);
      return {
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-speed, speed),
        vy: rand(-speed, speed),
        size: rand(particleSize * 0.6, particleSize * 1.6),
        phase: rand(0, Math.PI * 2),
        drift: rand(0.0004, 0.0012), // small phase drift for breathing
        hueShift: rand(-20, 20),
      };
    }

    function initParticles() {
      const rect = canvas.getBoundingClientRect();
      const area = rect.width * rect.height;
      const densityBase = 0.00007; // tuned for density
      const computed = Math.round(Math.min(maxParticles, Math.max(18, area * densityBase)));
      const w = rect.width;
      const h = rect.height;
      const arr = [];
      for (let i = 0; i < computed; i++) arr.push(makeParticle(w, h));
      particlesRef.current = arr;
    }

    // pointer => create pulse
    function createPulse(x, y) {
      pulsesRef.current.push({
        x,
        y,
        created: now(),
        life: 600, // ms
      });
      // limit pulses
      if (pulsesRef.current.length > 8) pulsesRef.current.shift();
    }

    // event handlers
    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createPulse(x, y);
    }
    function onPointerDown(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // a stronger pulse
      pulsesRef.current.push({ x, y, created: now(), life: 900, strong: true });
    }

    // main draw loop (time-based)
    function tick(t) {
      const dt = Math.min(40, t - (lastTimeRef.current || t)); // ms clamp
      lastTimeRef.current = t;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // background
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      const pulses = pulsesRef.current;

      // update pulses (remove expired)
      const current = now();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (current - p.created > p.life) pulses.splice(i, 1);
      }

      // update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // breathing: small oscillation to velocity using phase
        p.phase += p.drift * dt;
        p.vx += Math.cos(p.phase) * 0.0005 * dt;
        p.vy += Math.sin(p.phase) * 0.0005 * dt;

        // apply pulses: for each active pulse, compute force
        for (let k = 0; k < pulses.length; k++) {
          const pu = pulses[k];
          const dx = p.x - pu.x;
          const dy = p.y - pu.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = pulseRadius * (pu.strong ? 1.25 : 1);
          if (dist < radius) {
            // falloff: 1 at center -> 0 at radius
            const fall = 1 - dist / radius;
            const angle = Math.atan2(dy, dx);
            const strength = pulseStrength * (pu.strong ? 1.6 : 1) * fall;
            // push away from pointer (disturb)
            p.vx += Math.cos(angle) * strength * (dt / 16);
            p.vy += Math.sin(angle) * strength * (dt / 16);
          }
        }

        // gentle central attraction to avoid runaway
        const cx = w / 2;
        const cy = h / 2;
        p.vx += (cx - p.x) * 0.000008 * dt;
        p.vy += (cy - p.y) * 0.000008 * dt;

        // update position
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        // wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // damping
        p.vx *= 0.985;
        p.vy *= 0.985;
        const vmax = 2.6;
        if (p.vx > vmax) p.vx = vmax;
        if (p.vx < -vmax) p.vx = -vmax;
        if (p.vy > vmax) p.vy = vmax;
        if (p.vy < -vmax) p.vy = -vmax;
      }

      // draw lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < lineDistance) {
            const alpha = 0.45 * (1 - dist / lineDistance);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = hexToRgba(color, alpha);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, hexToRgba(lightenHex(color, 20 + p.hueShift * 0.2), 1));
        grad.addColorStop(0.6, hexToRgba(color, 0.65));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // start
    function start() {
      resize();
      lastTimeRef.current = now();
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }

    // listeners
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", resize);

    start();

    // cleanup
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", resize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    color,
    bgColor,
    maxParticles,
    particleSize,
    lineDistance,
    pulseRadius,
    pulseStrength,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
