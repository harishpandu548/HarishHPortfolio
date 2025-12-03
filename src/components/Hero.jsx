"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AdvancedHeroBG from "./AdvancedHeroBG";

export default function Hero() {
  async function downloadResume() {
    const url = "/Harishh_CV.pdf";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "Harishh_CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const [introFinished, setIntroFinished] = useState(
    typeof window !== "undefined" &&
      document.documentElement.classList.contains("intro-done")
  );

  useEffect(() => {
    function onFinish() {
      setIntroFinished(true);
    }
    window.addEventListener("intro:finished", onFinish);
    return () => window.removeEventListener("intro:finished", onFinish);
  }, []);

  // 🔥 Variants tuned to be super smooth (no big y-moves on parent)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.08,
      },
    },
  };

  const nameVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const fadeUpSmall = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" },
    },
  };

  const fadeUpButtons = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <AdvancedHeroBG
        theme={{
          accent: "#7efcff",
          accent2: "#ff77ff",
          accent3: "#ffd166",
          grid: "rgba(255,255,255,0.02)",
          bg: "#000606",
          bloom: 1.2,
        }}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* HERO CONTENT */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:py-20"
        variants={containerVariants}
        initial="hidden"
        animate={introFinished ? "visible" : "hidden"}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center gap-6">
          {/* NAME */}
          <motion.h1
            variants={nameVariants}
            className="font-extrabold text-[3.6rem] md:text-[5.2rem] lg:text-[6.8rem] leading-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)] mt-12 md:mt-16 uppercase"
          >
            HARISH
          </motion.h1>

          {/* SUB TEXT */}
          <motion.p
            variants={fadeUpSmall}
            className="text-base md:text-xl text-gray-300 max-w-3xl -mt-1"
          >
            Full-Stack Developer (React, Next.js, Node.js, Appwrite & Modern Web
            Technologies)
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            variants={fadeUpButtons}
            className="mt-1 flex items-center gap-4 z-10"
          >
            <Link
              href="#contact"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-medium shadow-lg hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(255,255,255,0.7)] transition-transform text-sm"
            >
              Contact Me
            </Link>

            <button
              onClick={downloadResume}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-white/12 text-white text-opacity-90 hover:bg-white/10 hover:scale-[1.05] transition text-sm"
              aria-label="Download resume"
              type="button"
            >
              My Resume
            </button>
          </motion.div>

          {/* SOCIAL ICONS */}
          <motion.div
            variants={fadeUpSmall}
            className="mt-0 flex items-center gap-6 z-10"
          >
            <motion.a
              aria-label="Github"
              href="https://github.com/harishpandu548"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition hover:scale-[1.14]"
              whileHover={{ rotate: 4, scale: 1.14 }}
              transition={{ type: "spring", stiffness: 180, damping: 10 }}
            >
              <GitIcon />
            </motion.a>

            <motion.a
              aria-label="LinkedIn"
              href="https://www.linkedin.com/in/harish-pandu1703?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition hover:scale-[1.14]}"
              whileHover={{ rotate: 4, scale: 1.14 }}
              transition={{ type: "spring", stiffness: 180, damping: 10 }}
            >
              <LinkedInIcon />
            </motion.a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 z-30 pointer-events-auto scroll-indicator">
        <div className="flex flex-col items-center gap-2">
          <div className="w-[46px] h-[70px] rounded-2xl border border-white/20 flex items-start justify-center py-2 backdrop-blur-sm bg-black/20">
            <div className="w-2 h-2 bg-cyan-300 rounded-full animate-hero-scroll" />
          </div>
          <span className="text-xs text-gray-400">Scroll</span>
        </div>
      </div>

      <style>{`
        @keyframes hero-scroll {
          0% { transform: translateY(0); opacity: 0.95; }
          50% { transform: translateY(10px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 0.95; }
        }
        .animate-hero-scroll { animation: hero-scroll 1.4s infinite ease-in-out; }
      `}</style>
    </section>
  );
}

/* Social Icons */
function GitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.3 1.8 1.3 1 .1 1.6.8 1.6.8.9 1.6 2.4 1.1 3 .8.1-.6.4-1.1.8-1.4-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.7.1-3.5 0 0 1-.3 3.3 1.3a11 11 0 0 1 6 0C19 4.2 20 4.5 20 4.5c.6 1.8.2 3.2.1 3.5.8.9 1.2 2 1.2 3.3 0 4.5-2.7 5.5-5.3 5.8.4.3.8.9.8 1.9v2.9c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 11.02 0zM3 8.98h4v12H3zM9 8.98h3.85v1.65h.05c.54-1 1.86-2 3.83-2 4.1 0 4.86 2.7 4.86 6.22v7.14h-4v-6.33c0-1.51-.03-3.46-2.1-3.46-2.1 0-2.42 1.63-2.42 3.36v6.43H9V8.98z" />
    </svg>
  );
}
