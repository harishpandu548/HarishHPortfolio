"use client";

import { useEffect, useRef } from "react";

/**
 * CursorTrailCursor (improved)
 * - uses pointermove + getCoalescedEvents when available
 * - adaptive lerp + snap threshold to avoid stuck/teleport on very fast moves
 * - same lightweight rendering strategy otherwise
 */
export default function CursorTrailCursor({
  size = 1, // main dot size (px)
  layerCounts = { big: 4, small: 6, tiny: 8 },
  layerSpacing = { big: 0.14, small: 0.18, tiny: 0.22 },
}) {
  const rootRef = useRef(null);
  const ballRef = useRef(null);

  const bigNodesRef = useRef([]);
  const smallNodesRef = useRef([]);
  const tinyNodesRef = useRef([]);

  const bigPointsRef = useRef([]);
  const smallPointsRef = useRef([]);
  const tinyPointsRef = useRef([]);

  const posRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 });
  const lastMoveRef = useRef(0);
  const insideRef = useRef(true);

  const rafRef = useRef(null);
  const glowRef = useRef({ target: 0, value: 0 });

  const scrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    lastMoveRef.current = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

    const ball = ballRef.current;

    // init positions to center
    posRef.current.mouseX = window.innerWidth / 2;
    posRef.current.mouseY = window.innerHeight / 2;
    posRef.current.x = posRef.current.mouseX;
    posRef.current.y = posRef.current.mouseY;

    function initPoints(count, ref) {
      ref.current = new Array(count).fill(0).map(() => ({
        x: posRef.current.x,
        y: posRef.current.y,
        opacity: 0,
      }));
    }
    initPoints(layerCounts.big, bigPointsRef);
    initPoints(layerCounts.small, smallPointsRef);
    initPoints(layerCounts.tiny, tinyPointsRef);

    bigNodesRef.current = bigNodesRef.current.slice(0, layerCounts.big);
    smallNodesRef.current = smallNodesRef.current.slice(0, layerCounts.small);
    tinyNodesRef.current = tinyNodesRef.current.slice(0, layerCounts.tiny);

    // initial styles (one-time)
    function applyInitialStyles() {
      const baseline = (node, blurPx, gradient) => {
        if (!node) return;
        node.style.position = "fixed";
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.borderRadius = "50%";
        node.style.transform = "translate3d(-9999px,-9999px,0)";
        node.style.opacity = "0";
        node.style.willChange = "transform, opacity";
        node.style.pointerEvents = "none";
        node.style.mixBlendMode = "screen";
        node.style.filter = `blur(${blurPx}px)`;
        if (gradient) node.style.background = gradient;
      };

      const bigGradient = "radial-gradient(circle, rgba(110,200,255,0.9), rgba(12,40,120,0.08))";
      for (let i = 0; i < layerCounts.big; i++) baseline(bigNodesRef.current[i], 3.5, bigGradient);

      const smallGradient = "radial-gradient(circle, rgba(150,220,255,0.95), rgba(10,40,100,0.1))";
      for (let i = 0; i < layerCounts.small; i++) baseline(smallNodesRef.current[i], 2.5, smallGradient);

      const tinyGradient = "radial-gradient(circle, rgba(200,240,255,1), rgba(50,110,255,0.16))";
      for (let i = 0; i < layerCounts.tiny; i++) baseline(tinyNodesRef.current[i], 1.2, tinyGradient);

      if (ball) {
        ball.style.position = "fixed";
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.borderRadius = "50%";
        ball.style.transform = "translate3d(-9999px,-9999px,0)";
        ball.style.willChange = "transform, opacity, box-shadow, filter";
        ball.style.pointerEvents = "none";
        ball.style.zIndex = "1000000";
        ball.style.background =
          "radial-gradient(circle at 28% 28%, #fff 0%, #dff5ff 14%, #3ea2ff 40%, rgba(6,18,60,0.12) 100%)";
        ball.style.boxShadow = "0 1px 2px rgba(0,0,0,0.22), 0 0 5px rgba(90,220,255,0.12)";
      }
    }
    applyInitialStyles();

    // color parse (kept from original)
    function parseColor(col) {
      if (!col) return null;
      if (col.startsWith("rgb")) {
        const n = col.match(/[\d.]+/g);
        return n ? [Number(n[0]), Number(n[1]), Number(n[2])] : null;
      }
      if (col.startsWith("#")) {
        let h = col.slice(1);
        if (h.length === 3) h = h.split("").map((c) => c + c).join("");
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      return null;
    }
    function luminance(rgb) {
      if (!rgb) return 1;
      const a = rgb.map((v) => {
        v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }
    function computeGlowAt(x, y) {
      const elUnder = document.elementFromPoint(x, y);
      if (!elUnder) return 0;
      const cs = getComputedStyle(elUnder);
      const bg = cs.backgroundColor || cs.background;
      const parsed = parseColor(bg);
      if (!parsed) return 0;
      const l = luminance(parsed);
      return Math.max(0, Math.min(1, (0.6 - l) / 0.6));
    }

    // pointer handlers using pointer events + coalesced samples
    function onMove(e) {
      // prefer pointer coalesced events when available
      const samples = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [e];
      // process each sample to keep mouseX/Y up-to-date with intermediate points
      const rect = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      // we are using page-level coordinates (clientX/Y) so no need to subtract container rect
      for (let ev of samples) {
        posRef.current.mouseX = ev.clientX;
        posRef.current.mouseY = ev.clientY;
        lastMoveRef.current = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        insideRef.current = true;
        // update glow target (cheap-ish)
        glowRef.current.target = computeGlowAt(ev.clientX, ev.clientY);
      }
      if (ball) ball.style.opacity = "1";
    }

    function onLeave() {
      insideRef.current = false;
      glowRef.current.target = 0;
    }

    function onScroll() {
      scrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        scrollingRef.current = false;
      }, 120);
    }

    // Attach pointer listeners (pointermove supports getCoalescedEvents)
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerenter", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // cheap helpers
    const setTransform = (el, left, top, scale) => {
      el.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${scale})`;
    };
    const setOpacity = (el, o) => (el.style.opacity = String(o));

    // animation loop with adaptive lerp + snap
    function animate() {
      const pos = posRef.current;
      const g = glowRef.current;

      // distance between target and current
      const dx = pos.mouseX - pos.x;
      const dy = pos.mouseY - pos.y;
      const dist = Math.hypot(dx, dy);

      // SNAP threshold: if pointer moved extremely fast / far, snap to avoid perceived hitch
      const SNAP_DIST = 220; // px - tune if needed
      if (dist > SNAP_DIST) {
        pos.x = pos.mouseX;
        pos.y = pos.mouseY;
      } else {
        // adaptive lerp factor: base + fraction of distance (smooth but speeds up when far)
        const base = 0.28;
        const extra = Math.min(0.7, dist / 400); // more distance → bigger extra
        const lerp = base + extra;
        pos.x += dx * lerp;
        pos.y += dy * lerp;
      }

      // ease glow
      g.value += (g.target - g.value) * 0.14;

      const vel = dist; // using pixel distance as velocity proxy

      const isScrolling = scrollingRef.current;

      function updateLayer(nodesRef, ptsRef, spacing, baseScale, falloff) {
        const pts = ptsRef.current;
        if (!pts || !nodesRef.current) return;

        // head follows main pos with spacing factor
        pts[0].x += (pos.x - pts[0].x) * spacing;
        pts[0].y += (pos.y - pts[0].y) * spacing;
        pts[0].opacity = Math.min(1, Math.max(0.05, vel / 60));

        for (let i = 1; i < pts.length; i++) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * spacing;
          pts[i].y += (pts[i - 1].y - pts[i].y) * spacing;
          pts[i].opacity = Math.max(0, pts[i - 1].opacity - 0.06);
        }

        const limit = isScrolling ? Math.min(3, pts.length) : pts.length;

        for (let i = 0; i < limit; i++) {
          const node = nodesRef.current[i];
          const p = pts[i];
          if (!node) continue;
          const t = i / (pts.length - 1 || 1);
          const scale = baseScale * (1 - t * 0.9);
          const opacity = Math.pow(1 - t, falloff) * p.opacity;

          const left = p.x - (size * scale) / 2;
          const top = p.y - (size * scale) / 2;
          setTransform(node, left, top, scale);
          setOpacity(node, opacity * 0.95);
        }

        if (!isScrolling) {
          for (let i = Math.min(3, pts.length); i < pts.length; i++) {
            const node = nodesRef.current[i];
            const p = pts[i];
            if (!node) continue;
            const t = i / (pts.length - 1 || 1);
            const scale = baseScale * (1 - t * 0.9);
            const opacity = Math.pow(1 - t, falloff) * p.opacity;
            const left = p.x - (size * scale) / 2;
            const top = p.y - (size * scale) / 2;
            setTransform(node, left, top, scale);
            setOpacity(node, opacity * 0.95);
          }
        }
      }

      // update layers
      updateLayer(bigNodesRef, bigPointsRef, layerSpacing.big, 1.2, 2.2);
      updateLayer(smallNodesRef, smallPointsRef, layerSpacing.small, 1.0, 2.6);
      updateLayer(tinyNodesRef, tinyPointsRef, layerSpacing.tiny, 0.6, 3.0);

      // update main ball always
      if (ball) {
        const left = pos.x - size / 2;
        const top = pos.y - size / 2;
        setTransform(ball, left, top, 1);
        const coreGlow = 4 + g.value * 18;
        const haloGlow = 10 + g.value * 36;
        ball.style.boxShadow = `0 1px 2px rgba(0,0,0,0.22), 0 0 ${coreGlow}px rgba(90,220,255,${0.16 + g.value * 0.3}), 0 0 ${haloGlow}px rgba(90,220,255,${0.04 + g.value * 0.14})`;
        ball.style.opacity = insideRef.current ? "1" : "0";
      }

      // fade out when cursor leaves
      if (!insideRef.current) {
        const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
        const fade = Math.max(0, 1 - (now - lastMoveRef.current) / 500);
        if (ball) setOpacity(ball, fade);
        [bigNodesRef, smallNodesRef, tinyNodesRef].forEach((nr) =>
          nr.current.forEach((node) => {
            if (!node) return;
            node.style.opacity = String(parseFloat(node.style.opacity || "0") * fade);
          })
        );
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    // cleanup
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerenter", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, layerCounts, layerSpacing]);

  // render layers and main ball
  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999999,
        overflow: "visible",
      }}
    >
      {/* big */}
      {Array.from({ length: layerCounts.big }).map((_, i) => (
        <div
          key={`big-${i}`}
          ref={(el) => (bigNodesRef.current[i] = el)}
          style={{
            position: "fixed",
            width: size,
            height: size,
            borderRadius: "50%",
            opacity: 0,
            transform: "translate3d(-9999px,-9999px,0)",
            willChange: "transform, opacity",
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* small */}
      {Array.from({ length: layerCounts.small }).map((_, i) => (
        <div
          key={`small-${i}`}
          ref={(el) => (smallNodesRef.current[i] = el)}
          style={{
            position: "fixed",
            width: size,
            height: size,
            borderRadius: "50%",
            opacity: 0,
            transform: "translate3d(-9999px,-9999px,0)",
            willChange: "transform, opacity",
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* tiny */}
      {Array.from({ length: layerCounts.tiny }).map((_, i) => (
        <div
          key={`tiny-${i}`}
          ref={(el) => (tinyNodesRef.current[i] = el)}
          style={{
            position: "fixed",
            width: size,
            height: size,
            borderRadius: "50%",
            opacity: 0,
            transform: "translate3d(-9999px,-9999px,0)",
            willChange: "transform, opacity",
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* main tiny ball */}
      <div
        ref={ballRef}
        style={{
          position: "fixed",
          width: size,
          height: size,
          borderRadius: "50%",
          transform: "translate3d(-9999px,-9999px,0)",
          willChange: "transform, opacity, box-shadow, filter",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
