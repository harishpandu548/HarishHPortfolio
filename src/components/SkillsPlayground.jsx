"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import styles from "./SkillsPlayground.module.css";

/* base labels (we will cycle through these to create more cubes) */
const BASE_LABELS = [
  // Core Web
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",

  // Frontend
  "React",
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",

  // Backend
  "Node.js",
  "Express.js",
  "REST APIs",
  // "API Security",

  // Auth & Security
  // "Authentication Systems",
  // "Authorization (RBAC)",
  "NextAuth.js",
  "JWT",

  // Databases
  "MongoDB",
  "Mongoose",
  "PostgreSQL",
  "Prisma",
  // "Database Modeling",

  // AI / SaaS
  // "AI Integration",
  // "LLM APIs",
  // "PDF Processing",
  // "Credit System",
  "SaaS Architecture",

  // Payments
  "Razorpay",
  "Webhooks",

  // Tools
  "Git",
  "GitHub",
  "Postman",
  "Axios",

  // Languages
  "Python",
  "Java",
];


/* color map (distinct-ish colors) */
const LABEL_COLOR_MAP = {
  "HTML": "#e44d26",
  "CSS": "#2965f1",
  "JavaScript": "#facc15",
  "TypeScript": "#3178c6",
  "React": "#61dafb",
  "Next.js": "#7c3aed",
  "Bootstrap": "#7952b3",
  "Tailwind CSS": "#38bdf8",
  "Node.js": "#22c55e",
  "Express.js": "#6b7280",
  "MongoDB": "#10b981",
  "Mongoose": "#059669",
  "REST APIs": "#0ea5e9",
  "JWT": "#ef9a9a",
  "Cloudinary": "#ff7aa2",
  "Axios": "#4aa3ff",
  "CORS": "#60a5fa",
  "React Hook Form": "#f472b6",
  "File Upload": "#fb923c",
  "Environment Variables": "#60a5fa",
  "Responsive Design": "#60f0b6",
  "MERN Stack": "#9ca3ff",
  "NextAuth.js": "#fbbf24",
  "React Router": "#7dd3fc",
  "Context API": "#a78bfa",
  "Multer": "#fb7185",
  "Dotenv": "#94a3b8",
  "React Hot Toast": "#f97316",
  "Lottie": "#34d399",
  "Framer Motion": "#8b5cf6",
  "Python": "#3776ab",
  "Java": "#b07219",
  "MVC Architecture": "#60a5fa",
  "RESTful Routing": "#60a5fa",
  "Middleware": "#fca5a5",
  "Token-based Auth": "#fb7185",
  "Error Handling": "#f59e0b",
  "Database Modeling": "#06b6d4",
  "Protected Routes": "#f97316",
  "Session Management": "#fb7185",
  "Git": "#ef4444",
  "GitHub": "#181717",
  "Postman": "#ff6c37",
  "Thunder Client": "#06b6d4",
  "Railway": "#6b7280",
  "Render": "#0ea5e9",
  "Vercel": "#111827",
  "Chrome DevTools": "#fb7185",
  "Nodemon": "#16a34a",
  "CI/CD Basics": "#7c3aed",
  "Proxy Setup": "#60a5fa",
  "MS Office": "#2b6cb0",
  "Adobe Photoshop": "#31a8ff",
  "Canva": "#ff6b6b",
  "Video Editing": "#fb7185",
  "Deep Learning": "#c084fc",
  "Neural Networks": "#7c3aed",
  "PostgreSQL": "#336791",
"Prisma": "#0c344b",

"Authentication Systems": "#22c55e",
"Authorization (RBAC)": "#16a34a",

"AI Integration": "#c084fc",
"LLM APIs": "#a855f7",
"PDF Processing": "#fb923c",
"Credit System": "#f59e0b",
"SaaS Architecture": "#38bdf8",

"Razorpay": "#0ea5e9",
"Webhooks": "#14b8a6",

"API Security": "#ef4444",
"JWT": "#f97316",
"Framer Motion": "#8b5cf6",

};

export default function SkillsPlayground({ total = BASE_LABELS.length }) {
  // total: number of cubes to spawn (default to show all unique skills)
  // clamp so we never duplicate labels
  const TOTAL_CUBES = Math.min(Math.max(6, total), BASE_LABELS.length);
  const containerRef = useRef(null);
  const nodesRef = useRef(new Map());
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const bodiesRef = useRef([]);
  const rafRef = useRef(null);
  const observerRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Matter aliases
    const Engine = Matter.Engine;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    const Runner = Matter.Runner;

    // Engine
    const engine = Engine.create({ gravity: { y: 1.12 } });
    engineRef.current = engine;
    const world = engine.world;
    engine.enableSleeping = false;

    // sizing
    const blockSize = 120; // bigger but OK for many cubes
    const half = blockSize / 2;
    const minSpacing = blockSize + 8; // minimum center distance to avoid spawn overlap

    let width = el.clientWidth;
    let height = el.clientHeight;

    // walls
    const walls = {
      floor: Bodies.rectangle(width / 2, height + 140, width + 600, 260, { isStatic: true }),
      left: Bodies.rectangle(-160, height / 2, 320, height + 600, { isStatic: true }),
      right: Bodies.rectangle(width + 160, height / 2, 320, height + 600, { isStatic: true }),
      ceiling: Bodies.rectangle(width / 2, -1600, width + 600, 260, { isStatic: true }), // very high ceiling
    };
    World.add(world, [walls.floor, walls.left, walls.right, walls.ceiling]);

    // Helper: generate non-overlapping spawn positions across the full width
    function generateSpawnPositions(count) {
      const positions = [];
      const maxAttempts = 2500;
      const spawnYRange = { min: -220, max: -900 }; // fall-from-everywhere vertical spread
      let attempts = 0;
      while (positions.length < count && attempts < maxAttempts) {
        attempts++;
        const x = half + Math.random() * (width - half * 2); // anywhere across width
        const y = spawnYRange.min - Math.random() * (spawnYRange.max - spawnYRange.min); // negative
        let ok = true;
        for (let p of positions) {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minSpacing) {
            ok = false;
            break;
          }
        }
        if (ok) positions.push({ x, y });
      }
      // fallback: if we failed to fill enough positions (rare on narrow widths),
      // arrange in a simple grid starting from left to right.
      if (positions.length < count) {
        positions.length = 0;
        const cols = Math.max(3, Math.ceil(Math.sqrt(count)));
        const colGap = Math.max(12, (width - 120) / cols - blockSize);
        const startX = 60 + half;
        let i = 0;
        for (let r = 0; positions.length < count; r++) {
          for (let c = 0; c < cols && positions.length < count; c++) {
            const jitterX = (Math.random() - 0.5) * 8;
            const x = Math.min(width - half, Math.max(half, startX + c * (blockSize + colGap) + jitterX));
            const y = -260 - r * (blockSize + 18) - Math.random() * 20;
            positions.push({ x, y });
            i++;
          }
        }
      }
      return positions;
    }

    // build bodies (take first TOTAL_CUBES labels from BASE_LABELS — no cycling)
    const labels = BASE_LABELS.slice(0, TOTAL_CUBES);
    const spawns = generateSpawnPositions(TOTAL_CUBES);
    const bodies = [];
    for (let i = 0; i < TOTAL_CUBES; i++) {
      const label = labels[i];
      const color = LABEL_COLOR_MAP[label] || "#cccccc";
      const spawn = spawns[i] || { x: half + (i * (blockSize + 12)) % Math.max(1, width - half * 2), y: -200 - i * 24 };

      const body = Bodies.rectangle(spawn.x, spawn.y, blockSize, blockSize, {
        restitution: 0.16,
        friction: 0.62,
        frictionAir: 0.025,
        density: 0.0036,
        angle: (Math.random() - 0.5) * 0.06,
        chamfer: { radius: 8 },
        collisionFilter: { group: 0, category: 0x0001, mask: 0xFFFFFFFF },
      });

      // avoid flipping by setting huge inertia initially
      Body.setInertia(body, Infinity);
      body.plugin = { index: i };
      bodies.push({ body, data: { label, color } });
    }
    World.add(world, bodies.map((b) => b.body));
    bodiesRef.current = bodies;

    // pointer drag/throw (static while dragging)
    let active = null;
    function onPointerDown(e) {
      const tg = e.target;
      const card = tg.closest && tg.closest(`.${styles.block}`);
      if (!card) return;
      const idx = Number(card.dataset.cardIndex);
      if (Number.isNaN(idx)) return;
      const entry = bodiesRef.current.find((b) => b.body.plugin && b.body.plugin.index === idx);
      if (!entry) return;
      const rect = el.getBoundingClientRect();
      active = {
        id: e.pointerId,
        body: entry.body,
        lastX: e.clientX,
        lastY: e.clientY,
        lastTime: performance.now(),
      };

      Body.setStatic(active.body, true);
      Body.setAngle(active.body, 0); // keep upright while dragging
      if (e.pointerType === "touch") {
        try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch {}
      }
      e.stopPropagation && e.stopPropagation();
    }
    function onPointerMove(e) {
      if (!active || active.id !== e.pointerId) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const clampX = Math.max(half, Math.min(el.clientWidth - half, px));
      const clampY = Math.max(half, Math.min(el.clientHeight - half, py));
      Body.setPosition(active.body, { x: clampX, y: clampY });
      active.lastX = e.clientX;
      active.lastY = e.clientY;
      active.lastTime = performance.now();
      e.preventDefault && e.preventDefault();
    }
    function onPointerUp(e) {
      if (!active || active.id !== e.pointerId) return;
      const now = performance.now();
      const dt = Math.max(8, now - active.lastTime);
      const vx = (e.clientX - active.lastX) / dt;
      const vy = (e.clientY - active.lastY) / dt;
      const velocityMultiplier = 38;

      Body.setStatic(active.body, false);
      Body.setAngularVelocity(active.body, (Math.random() - 0.5) * 0.05);

      const setVx = Math.max(-9, Math.min(9, vx * velocityMultiplier));
      const setVy = Math.max(-9, Math.min(18, vy * velocityMultiplier));
      Body.setVelocity(active.body, { x: setVx, y: setVy });

      try { e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId); } catch {}
      active = null;
      e.stopPropagation && e.stopPropagation();
    }

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    // sync loop - map body -> DOM node
    function sync() {
      const list = bodiesRef.current;
      width = el.clientWidth;
      const heightNow = el.clientHeight;
      for (let i = 0; i < list.length; i++) {
        const { body, data } = list[i];
        const node = nodesRef.current.get(i);
        if (!node || !body) continue;
        // clamp so center never leaves container
        const cx = Math.max(half, Math.min(width - half, body.position.x));
        const cy = Math.max(half, Math.min(heightNow - half, body.position.y));
        // clamp tiny angle for stability
        let angle = body.angle;
        if (Math.abs(angle) > 0.7) angle = angle > 0 ? 0.12 : -0.12;
        node.style.transform = `translate3d(${cx - half}px, ${cy - half}px, 0) rotate(${angle}rad)`;
        node.style.background = data.color;
      }
      rafRef.current = requestAnimationFrame(sync);
    }
    sync();

    // IntersectionObserver: start physics when visible
    const intersectionCb = (entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !started && !runnerRef.current) {
        const Runner = Matter.Runner;
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // apply cohesive downward velocity with tiny horizontal spread
        const baseVy = 2.0;
        const staggerMs = 22;
        bodiesRef.current.forEach((item, idx) => {
          setTimeout(() => {
            try {
              Body.setVelocity(item.body, { x: (Math.random() - 0.5) * 0.14, y: baseVy + Math.random() * 0.2 });
            } catch {}
          }, idx * staggerMs);
        });

        // reveal DOM nodes
        setStarted(true);

        // after a short delay, allow slight rotation by setting a large finite inertia
        setTimeout(() => {
          bodiesRef.current.forEach(({ body }) => {
            try {
              Body.setInertia(body, 1e13);
            } catch {}
          });
        }, 700);

        if (observerRef.current) observerRef.current.disconnect();
      }
    };
    const observer = new IntersectionObserver(intersectionCb, { threshold: 0.12 });
    observer.observe(el);
    observerRef.current = observer;

    // resize
    function onResize() {
      width = el.clientWidth;
      const heightNow = el.clientHeight;
      Body.setPosition(walls.floor, { x: width / 2, y: heightNow + 140 });
      Body.setPosition(walls.left, { x: -160, y: heightNow / 2 });
      Body.setPosition(walls.right, { x: width + 160, y: heightNow / 2 });
      Body.setPosition(walls.ceiling, { x: width / 2, y: -1600 });

      bodiesRef.current.forEach(({ body }) => {
        if (body.position.x < half) Body.setPosition(body, { x: half + 12, y: body.position.y });
        if (body.position.x > width - half) Body.setPosition(body, { x: width - half - 12, y: body.position.y });
        if (body.position.y > heightNow + 400) Body.setPosition(body, { x: Math.random() * width, y: -80 - Math.random() * 160 });
      });
    }
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (runnerRef.current) {
        try { Matter.Runner.stop(runnerRef.current); } catch {}
        runnerRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        World.clear(world, false);
        Engine.clear(engine);
      } catch {}
      nodesRef.current.clear();
      bodiesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOTAL_CUBES]);

  // IconSVG: custom icons for some labels + initials fallback
  function IconSVG({ name }) {
    const common = { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
    const stroke = "#07101a";

    // helper to create initials
    const initials = (s) => {
      const parts = s.replace(/\.js$/i, "").split(/[\s\/\-\.]+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
    };

    switch (name) {
      case "React":
        return (
          <svg {...common}>
            <circle cx="12" cy="12" r="1.4" fill={stroke} opacity="0.95" />
            <g stroke={stroke} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="12" rx="6.5" ry="2.8" fill="none" transform="rotate(0 12 12)" />
              <ellipse cx="12" cy="12" rx="6.5" ry="2.8" fill="none" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="6.5" ry="2.8" fill="none" transform="rotate(120 12 12)" />
            </g>
          </svg>
        );
      case "Next.js":
        return (
          <svg {...common}>
            <rect x="3" y="4" width="18" height="16" rx="2" fill="#fff" opacity="0.96" />
            <path d="M7 16V8l4 8 4-8v8" stroke={stroke} strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "JavaScript":
        return (
          <svg {...common}>
            <rect x="2" y="2" width="20" height="20" rx="3" fill="#fff" opacity="0.96" />
            <text x="7" y="16" fontSize="9" fontWeight="700" fill="#07101a">JS</text>
          </svg>
        );
      case "Node.js":
      case "Node":
        return (
          <svg {...common}>
            <path d="M12 3l7 4v6l-7 4-7-4V7z" fill="#fff" opacity="0.96" />
            <path d="M12 6v12" stroke={stroke} strokeWidth="0.9" />
          </svg>
        );
      case "MongoDB":
      case "Mongoose":
        return (
          <svg {...common}>
            <path d="M12 3s-4 3-4 7c0 5 4 9 4 9s4-4 4-9c0-4-4-7-4-7z" fill="#fff" opacity="0.96" />
            <path d="M12 3s2 1 2 4-2 6-2 6" stroke={stroke} strokeWidth="0.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "Git":
      case "GitHub":
        return (
          <svg {...common}>
            <circle cx="12" cy="12" r="9" fill="#fff" opacity="0.96" />
            <path d="M8 12l8-6M8 12l8 6M8 12h8" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );
      default:
        // fallback: initials badge
        return (
          <svg {...common}>
            <rect x="0" y="0" width="24" height="24" rx="4" fill="#fff" opacity="0.96" />
            <text x="12" y="15" fontSize="8" fontWeight="700" fill="#07101a" textAnchor="middle">{initials(name)}</text>
          </svg>
        );
    }
  }

  return (
    <section
      id="skills"
      className="w-full pt-10 pb-4"
      style={{
        background: "linear-gradient(180deg,#000000 0%, #050506 40%, #0b0b0f 100%)",
        color: "white",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center text-6xl md:text-7xl font-extrabold mb-6">
          <span className="text-white">Skills</span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            Playground
          </span>
        </h3>

        <p className="text-center text-gray-300 max-w-3xl mx-auto mb-0">
          Playful, physics-driven skill cubes — drag, throw, watch them bounce. Nothing Escapes.
        </p>
      </div>

      <div className={styles.wrapper}>
        <div ref={containerRef} className={styles.playground}>
          {Array.from({ length: TOTAL_CUBES }).map((_, i) => {
            const label = BASE_LABELS[i]; // no modulo — direct mapping
            return (
              <div
                key={i}
                data-card-index={i}
                ref={(el) => {
                  if (el) nodesRef.current.set(i, el);
                  else nodesRef.current.delete(i);
                }}
                className={`${styles.block} ${started ? styles.visible : styles.hidden}`}
                role="button"
                tabIndex={0}
                aria-label={label}
              >
                <div className={styles.blockInner}>
                  <div className={styles.icon}>
                    <IconSVG name={label} />
                  </div>
                  <div className={styles.label} style={{ fontWeight: 800 }}>
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
