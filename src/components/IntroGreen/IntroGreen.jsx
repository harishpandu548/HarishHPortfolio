// components/IntroGreen.jsx
"use client";

import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import styles from "./IntroGreen.module.css";

export default function IntroGreen({
  words = ["Hello","Hola","Bonjour","Ciao","Olá","नमस्ते","こんにちは","안녕하세요","مرحبا","您好"],
  cycleMs = 110,
  totalMs = 800,   // ~0.8s text cycle
  coverMs = 300,   // curtain up
  revealMs = 500,  // curtain away
}) {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("words"); // "words" | "covering" | "revealing"

  const scrollYRef = useRef(0);
  const prevBodyStyleRef = useRef({});

  const getScrollbarWidth = () =>
    window.innerWidth - document.documentElement.clientWidth;

  // lock page BEFORE paint
  useLayoutEffect(() => {
    const body = document.body;
    scrollYRef.current =
      window.scrollY || window.pageYOffset || 0;

    prevBodyStyleRef.current = {
      position: body.style.position || "",
      top: body.style.top || "",
      left: body.style.left || "",
      right: body.style.right || "",
      width: body.style.width || "",
      overflow: body.style.overflow || "",
      paddingRight: body.style.paddingRight || "",
    };

    const sbw = getScrollbarWidth();
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;

    body.style.position = "fixed";
    body.style.top = `-${Math.round(scrollYRef.current)}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    document.documentElement.classList.add("intro-running");
    document.body.classList.add("intro-running");

    return () => {
      document.documentElement.classList.remove("intro-running");
      document.body.classList.remove("intro-running");

      const prev = prevBodyStyleRef.current;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
    };
  }, []);

  // words cycle
// words cycle – show at least 6 words before curtain
useEffect(() => {
  if (phase !== "words") return;

  let i = 0;
  let shown = 1;          // we start with words[0] already visible
  const minWords = 6;     // 👈 change this to 5 or 6 as you like

  setIdx(0);              // start at first word

  const interval = setInterval(() => {
    // move to next word
    i = (i + 1) % words.length;
    setIdx(i);
    shown++;

    // once we've shown enough words, trigger curtain
    if (shown >= minWords) {
      clearInterval(interval);
      setPhase("covering");
    }
  }, cycleMs);

  return () => clearInterval(interval);
}, [phase, words.length, cycleMs]);


  // cover -> reveal
  useEffect(() => {
    if (phase !== "covering") return;
    const t = setTimeout(() => setPhase("revealing"), coverMs + 20);
    return () => clearTimeout(t);
  }, [phase, coverMs]);

  // finish
  useEffect(() => {
    if (phase !== "revealing") return;
    const t = setTimeout(() => {
      const body = document.body;

      document.documentElement.classList.remove("intro-running");
      document.body.classList.remove("intro-running");

      requestAnimationFrame(() => {
        const prev = prevBodyStyleRef.current;
        body.style.position = prev.position;
        body.style.top = prev.top;
        body.style.left = prev.left;
        body.style.right = prev.right;
        body.style.width = prev.width;
        body.style.overflow = prev.overflow;
        body.style.paddingRight = prev.paddingRight;

        const scrollY = scrollYRef.current || 0;
        window.scrollTo(0, scrollY);

        document.documentElement.classList.add("intro-done");

        setVisible(false);
        try {
          window.dispatchEvent(new Event("intro:finished"));
        } catch {
          const ev = document.createEvent("Event");
          ev.initEvent("intro:finished", true, true);
          window.dispatchEvent(ev);
        }
      });
    }, revealMs + 20);

    return () => clearTimeout(t);
  }, [phase, revealMs]);

  if (!visible) return null;

  return (
    <div id="intro-splash" className={styles.container} aria-hidden="true">
      <div className={`${styles.bg} ${phase !== "words" ? styles.bgHidden : ""}`}>
        <div className={styles.center}>
          <div className={styles.text}>{words[idx]}</div>
        </div>
      </div>

      <div
        className={`${styles.cover} ${
          phase === "covering"
            ? styles.coverIn
            : phase === "revealing"
            ? styles.coverOut
            : ""
        }`}
        style={{
          transitionDuration: `${
            phase === "covering" ? coverMs : revealMs
          }ms`,
        }}
      />
    </div>
  );
}
