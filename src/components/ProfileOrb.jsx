"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./ProfileOrb.module.css";

/**
 * ABOUT SECTION + PROFILE ORB (FULL COMPONENT)
 */
export default function ProfileOrb({
  avatarSrc = "/images/avatar.jpg",
  orbitSpeed = 18,
  avatarSize = 340,
  pauseOnHover = true,
}) {
  const wrapperRef = useRef(null);

  const [radius, setRadius] = useState(220);
  const [isPaused, setIsPaused] = useState(false);
  const [ready, setReady] = useState(false);

  const icons = [
    { id: "react", title: "React", jsx: IconReact() },
    { id: "js", title: "JavaScript", jsx: IconJS() },
    { id: "node", title: "Node", jsx: IconNode() },
    { id: "tailwind", title: "Tailwind", jsx: IconTailwind() },
    { id: "docker", title: "Docker", jsx: IconDocker() },
    { id: "git", title: "Git", jsx: IconGit() },
    { id: "db", title: "DB", jsx: IconDB() },
    { id: "py", title: "Python", jsx: IconPy() },
  ];

  useLayoutEffect(() => {
    function computeRadius() {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const wrapperSize = Math.min(rect.width, rect.height);
      const halfWrapper = Math.floor(wrapperSize / 2);
      const halfAvatar = Math.floor(avatarSize / 2);
      const margin = 48;

      const safe = Math.max(
        halfAvatar + margin,
        Math.min(halfWrapper - margin, halfAvatar + margin)
      );

      setRadius(Math.max(120, Math.min(300, safe)));
      setReady(true);
    }

    computeRadius();
    window.addEventListener("resize", computeRadius);
    return () => window.removeEventListener("resize", computeRadius);
  }, [avatarSize]);

  const onEnter = () => {}
  const onLeave = () => {}

  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='#0f1724'/><circle cx='200' cy='200' r='120' fill='#0b1220'/><text x='50%' y='52%' fill='#9ca3af' font-size='40' text-anchor='middle' font-family='Arial' dy='.3em'>Avatar</text></svg>`
  )}`;

  return (
    <section
      id="about"
      className="w-full pt-2 pb-20 flex justify-center items-center"
      style={{
        background:
          "linear-gradient(180deg,#0b0b0f 0%, #050506 40%, #000000 100%)",
      }}
    >
      <div
        ref={wrapperRef}
        className={styles.wrapper}
        style={{ width: 520, height: 520 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Avatar */}
        <div
          className={styles.avatarWrap}
          style={{ width: avatarSize, height: avatarSize }}
        >
          <img
            src={avatarSrc}
            alt="avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholder;
            }}
            className={styles.avatarImg}
          />
          <div className={styles.ripple} />
        </div>

        {/* Outer Ring */}
        <div
          className={styles.orbitRing}
          style={{ width: avatarSize + 60, height: avatarSize + 60 }}
        />

        {/* Orbit Icons */}
        <div
          className={styles.orbitGroup}
          style={{
            animationDuration: `${orbitSpeed}s`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {ready &&
            icons.map((ic, i) => {
              const angle = (360 / icons.length) * i;
              const delay = `${i * 0.12}s`;
              const transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;

              return (
                <div
                  key={ic.id}
                  className={styles.orbItem}
                  style={{ transform }}
                  title={ic.title}
                >
                  <div className={styles.orbInner} style={{ animationDelay: delay }}>
                    {ic.jsx}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------
   ICONS BELOW (NO CHANGES)
--------------------------*/
function IconReact() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <g stroke="#7efcff" strokeWidth="1.4">
        <ellipse cx="12" cy="12" rx="7" ry="3" />
        <ellipse cx="12" cy="12" rx="7" ry="3" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="7" ry="3" transform="rotate(120 12 12)" />
      </g>
    </svg>
  );
}
function IconJS() {
  return (
    <svg width="24" height="24">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#ffd166" />
      <text x="6.6" y="16" fontSize="10" fontWeight="700" fill="#07101a">
        JS
      </text>
    </svg>
  );
}
function IconNode() {
  return (
    <svg width="20" height="20">
      <path d="M12 3l7 4v6l-7 4-7-4V7z" fill="#22c55e" />
    </svg>
  );
}
function IconTailwind() {
  return (
    <svg width="22" height="22">
      <path d="M2 12c6-6 10 0 20 0" stroke="#38bdf8" strokeWidth="2" />
    </svg>
  );
}
function IconDocker() {
  return (
    <svg width="22" height="22">
      <rect x="3" y="10" width="18" height="8" rx="2" fill="#0ea5e9" />
    </svg>
  );
}
function IconGit() {
  return (
    <svg width="22" height="22">
      <path
        d="M8 12l8-6M8 12l8 6M8 12h8"
        stroke="#ff5555"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconDB() {
  return (
    <svg width="22" height="22">
      <ellipse cx="12" cy="8" rx="8" ry="3" fill="#2563eb" />
    </svg>
  );
}
function IconPy() {
  return (
    <svg width="22" height="22">
      <path d="M12 2c-4 0-6 2-6 2v6h6c1 0 2-1 2-2V4z" fill="#306998" />
      <path d="M12 22c4 0 6-2 6-2v-6h-6c-1 0-2 1-2 2v4z" fill="#ffe873" />
    </svg>
  );
}
