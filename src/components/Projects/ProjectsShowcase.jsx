"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* Icons */
const IconLeft = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const IconRight = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const IconEye = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 12-8 12 8 12 8-4 8-12 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconGithub = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="white"
    aria-hidden
  >
    <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.3 1.8 1.3 1 .1 1.6.8 1.6.8.9 1.6 2.4 1.1 3 .8.1-.6.4-1.1.8-1.4-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.7.1-3.5 0 0 1-.3 3.3 1.3a11 11 0 0 1 6 0C19 4.2 20 4.5 20 4.5c.6 1.8.2 3.2.1 3.5.8.9 1.2 2 1.2 3.3 0 4.5-2.7 5.5-5.3 5.8.4.3.8.9.8 1.9v2.9c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z" />
  </svg>
);

/* Down arrow for "More projects" toggle */
const IconChevronDown = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function ProjectsShowcase() {
  /* =======================
     FEATURED PROJECTS (carousel)
     ======================= */
  const slides = [
    {
      id: 1,
      title: "AuthProfile",
      subtitle:
        "Robust authentication & user-profile system with security-first design.",
      img: "/projects/authprofile-1.jpg",
      bg: "bg-gradient-to-br from-rose-200/8 via-indigo-200/6 to-slate-900/10",
      tech: [
        "Next.js",
        "NextAuth",
        "TypeScript",
        "MongoDB",
        "Mongoose",
        "bcrypt",
      ],
      features: [
        "OAuth2 & social login integration (Google)",
        "Email verification + password reset with token expiry",
        "Password strength enforcement & bcrypt hashing",
        "Secure JWT-based access & refresh token architecture",
        "Role-based access control (RBAC) and permission scopes",
        "Rotateable refresh tokens with server-side invalidation",
        "Access token expiry & silent refresh via secure cookies",
      ],
      live: "https://project2-tau-olive.vercel.app/",
      github: "https://github.com/harishpandu548/AuthProfile",
      backendLive: "",
      backendGithub: "",
    },
    {
      id: 2,
      title: "Clonetube",
      subtitle:
        "YouTube-like clone — full stack with video upload, auth, and realtime features.",
      img: "/projects/clonetube-1.jpg",
      bg: "bg-gradient-to-br from-cyan-200/10 via-sky-200/10 to-indigo-900/10",
      tech: [
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "Cloudinary",
        "Framer Motion",
        "Tailwind",
      ],
      features: [
        "User authentication & profiles",
        "Video upload, storage, and streaming (Cloudinary / S3)",
        "Subscriptions and channel pages",
        "Comments with moderation and delete/edit",
        "Likes/dislikes and watch history",
        "Search drop box",
        "Responsive UI with dark mode",
      ],
      live: "https://clonetube-frontend.vercel.app/",
      github: "https://github.com/harishpandu548/Clonetube",
      backendLive: "https://clonetube-clone-of-yt-backend.onrender.com/",
      backendGithub: "https://github.com/harishpandu548/Clonetube",
    },
    {
      id: 3,
      title: "Mega Blog App",
      subtitle: "Full-featured blogging platform built with React and Appwrite.",
      img: "/projects/megablog-1.jpg",
      bg: "bg-gradient-to-br from-orange-200/10 via-rose-200/10 to-purple-800/10",
      tech: [
        "React",
        "Appwrite",
        "React Hook Form",
        "Tailwind",
        "Rich Text Editor",
      ],
      features: [
        "Create, read, update and delete blog posts",
        "Secure user authentication with Appwrite",
        "Image upload + storage handling",
        "Public & private posts with role-based access",
        "Responsive dashboard with clean UI",
        "Real-time updates and smooth UX animations",
      ],
      live: "https://appwrite-megablog-weld.vercel.app/login",
      github: "https://github.com/harishpandu548/AppwriteMegablog",
      backendLive: "",
      backendGithub: "",
    },
  ];

  const total = slides.length;

  /* =======================
     OTHER PROJECTS GRID
     ======================= */
  const otherProjects = [
    {
      id: "jagadeesh-site",
      label: "Client Website",
      title: "Jagadeesh Personal Website",
      role: "Portfolio UI & Frontend Implementation",
      description:
        "A clean, responsive personal site designed to highlight client profile, services, and contact, with smooth scroll and subtle motion.",
      tech: ["React", "Tailwind CSS", "Framer Motion"],
      live: "https://jagadeeshwebsite.vercel.app/", // TODO: paste Jagadeesh live link here
      github: "",
    },
    {
      id: "logistics-site",
      label: "Client Website",
      title: "Logistics Company Website",
      role: "Landing Page & Branding",
      description:
        "Modern landing page for a logistics brand with focus on trust, services, and clear CTAs, optimized for mobile-first experience.",
      tech: ["React", "Tailwind CSS","Framer Motion"],
      live: "https://logistics-website-pied-kappa.vercel.app/", // TODO: paste Logistics live link here
      github: "",
    },
    {
      id: "heart-disease",
      label: "AI / ML Project",
      title: "Heart Disease Prediction",
      role: "ML Engineer",
      description:
        "Machine learning project using Genetic Algorithm, BAT, and ABC optimization techniques to improve heart disease prediction accuracy.",
      tech: ["Python", "Genetic Algorithm", "BAT", "ABC"],
      live: "",
      github: "",
    },
    {
      id: "dr-detection",
      label: "AI / Deep Learning",
      title: "Diabetic Retinopathy Detection",
      role: "DL Engineer",
      description:
        "Deep CNN-based model for early diagnosis of Diabetic Retinopathy using retinal images with visual analytics output.",
      tech: ["Python", "DCNN", "CNN", "Medical Imaging"],
      live: "",
      github: "",
    },
    {
      id: "image-forgery",
      label: "Computer Vision",
      title: "Image Forgery Detection",
      role: "CV Engineer",
      description:
        "Forgery detection pipeline combining CNN and LBP features to distinguish between real and tampered images.",
      tech: ["Python", "CNN", "LBP"],
      live: "",
      github: "",
    },
    {
      id: "voice-assistant",
      label: "Python",
      title: "Python Voice Assistant",
      role: "Automation",
      description:
        "Voice-controlled assistant to fetch web data, open apps, and answer queries, improving response accuracy with NLP tweaks.",
      tech: ["Python", "Speech Recognition", "NLP",],
      live: "",
      github: "",
    },
  ];

  // ---------- carousel state + refs ----------
  const [index, _setIndex] = useState(0);
  const indexRef = useRef(0);
  const setIndex = (next) => {
    indexRef.current = next;
    _setIndex(next);
  };

  // extra projects toggle
  const [showMore, setShowMore] = useState(false);

  // autoplay & timing
  const AUTOPLAY_MS = 12000; // 12s
  const ANIM_EXIT_MS = 550;
  const autoplayTimeout = useRef(null);
  const isAnimatingRef = useRef(false);
  const mountedRef = useRef(true);

  // preload images
  useEffect(() => {
    if (typeof window === "undefined") return;
    slides.forEach((s) => {
      if (s.img) {
        const im = new window.Image();
        im.src = s.img;
      }
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current);
    };
  }, []);

  // schedule autoplay safely
  const scheduleAutoplay = useCallback(() => {
    if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current);
    autoplayTimeout.current = setTimeout(() => {
      if (!isAnimatingRef.current && mountedRef.current) {
        const next = (indexRef.current + 1) % total;
        goto(next, false);
      }
    }, AUTOPLAY_MS);
  }, [AUTOPLAY_MS, total]);

  useEffect(() => {
    scheduleAutoplay();
    return () => {
      if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current);
    };
  }, [index, scheduleAutoplay]);

  // reset timer on user interaction
  useEffect(() => {
    const onUserInteract = () => {
      if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current);
      autoplayTimeout.current = setTimeout(() => scheduleAutoplay(), 900);
    };
    window.addEventListener("scroll", onUserInteract, { passive: true });
    window.addEventListener("pointerdown", onUserInteract);
    return () => {
      window.removeEventListener("scroll", onUserInteract);
      window.removeEventListener("pointerdown", onUserInteract);
    };
  }, [scheduleAutoplay]);

  const goto = (newIndex, restartAutoplay = true) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    const normalized = ((newIndex % total) + total) % total;
    setIndex(normalized);
    setTimeout(() => {
      isAnimatingRef.current = false;
      if (restartAutoplay) scheduleAutoplay();
    }, ANIM_EXIT_MS + 80);
  };

  const gotoNext = () => goto(indexRef.current + 1);
  const gotoPrev = () => goto(indexRef.current - 1);

  /* tilt for image */
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    scale: 1,
  });
  const tiltRef = useRef({});
  function bindRef(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    tiltRef.current = { w: r.width, h: r.height, left: r.left, top: r.top };
  }
  function handleMouseMove(e) {
    const r = tiltRef.current;
    if (!r || !r.w) return;
    const x = (e.clientX - r.left) / r.w;
    const y = (e.clientY - r.top) / r.h;
    setTilt({
      rotateX: (0.5 - y) * 10,
      rotateY: (x - 0.5) * 20,
      translateY: (0.5 - y) * 8,
      scale: 1.03,
    });
  }
  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0, translateY: 0, scale: 1 });
  }

  const imageVariants = {
    enter: { opacity: 0, x: 80, scale: 0.96 },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: ANIM_EXIT_MS / 1000 },
    },
    exit: {
      opacity: 0,
      x: -80,
      scale: 0.96,
      transition: { duration: ANIM_EXIT_MS / 1000 },
    },
  };

  if (!slides || total === 0) return null;
  const safeIndex = ((indexRef.current % total) + total) % total;
  const active = slides[safeIndex];

  return (
    <motion.section
      id="projects"
      className="w-full bg-[#070708] text-slate-100 pt-[88px] py-20 px-6 md:px-12 lg:px-20 min-h-screen"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onPointerEnter={() => {
        if (autoplayTimeout.current) clearTimeout(autoplayTimeout.current);
      }}
      onPointerLeave={() => {
        scheduleAutoplay();
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <h3 className="text-center text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 tracking-tight">
            <span className="text-white">Featured</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500">
              Projects
            </span>
          </h3>
          <p className="text-center text-slate-400 max-w-3xl mx-auto">
            Deep, full-stack builds with real-world features and premium UX.
          </p>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: IMAGE CAROUSEL */}
          <div className="relative -mt-6">
            <motion.div
              ref={bindRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full h-[420px] md:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/90 bg-slate-900/60"
              style={{ transform: "translateZ(0)" }}
              whileHover={{ boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <div className={`absolute inset-0 ${active?.bg || ""}`} />

              {/* ARROWS */}
              <button
                onClick={gotoPrev}
                aria-label="Previous"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 md:w-14 md:h-14 bg-black/65 border border-slate-700/90 rounded-full flex items-center justify-center hover:scale-105 hover:border-cyan-400/70 hover:bg-black/80 transition"
                style={{ pointerEvents: "auto" }}
              >
                <IconLeft />
              </button>

              <button
                onClick={gotoNext}
                aria-label="Next"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 md:w-14 md:h-14 bg-black/65 border border-slate-700/90 rounded-full flex items-center justify-center hover:scale-105 hover:border-cyan-400/70 hover:bg-black/80 transition"
                style={{ pointerEvents: "auto" }}
              >
                <IconRight />
              </button>

              <AnimatePresence initial={false} mode="wait">
                {slides.map((s, i) =>
                  i === safeIndex ? (
                    <motion.div
                      key={s.id}
                      className="absolute inset-0"
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x < -100) gotoNext();
                        if (info.offset.x > 100) gotoPrev();
                      }}
                    >
                      <motion.div
                        animate={{
                          rotateX: tilt.rotateX,
                          rotateY: tilt.rotateY,
                          y: tilt.translateY,
                          scale: tilt.scale,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 18,
                        }}
                        className="absolute inset-0"
                      >
                        {s.img ? (
                          <Image
                            src={s.img}
                            alt={s.title}
                            fill
                            className="object-cover object-center"
                            priority
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
                        )}
                      </motion.div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </motion.div>

            {/* ACTION BUTTONS + DOTS */}
            <div className="mt-5 flex flex-col gap-3">
              {/* Row 1: Live + Backend Live */}
              <div className="flex flex-wrap items-center gap-3">
                {active?.live ? (
                  <a
                    href={active.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 flex items-center gap-2 text-sm shadow hover:shadow-lg hover:translate-y-[-1px] transition"
                  >
                    <IconEye /> Live
                  </a>
                ) : null}

                {active?.backendLive ? (
                  <a
                    href={active.backendLive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 flex items-center gap-2 text-sm hover:border-cyan-400/60 hover:bg-slate-900 transition"
                  >
                    <IconEye /> Backend Live
                  </a>
                ) : null}
              </div>

              {/* Row 2: GitHub buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {active?.title === "Clonetube" ? (
                  <>
                    <a
                      href="https://github.com/harishpandu548/Clonetube"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2 text-sm hover:bg-slate-700"
                    >
                      <IconGithub /> Frontend Code
                    </a>
                    <a
                      href="https://github.com/harishpandu548/Clonetube"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2 text-sm hover:bg-slate-700"
                    >
                      <IconGithub /> Backend Code
                    </a>
                  </>
                ) : active?.github ? (
                  <a
                    href={active.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2 text-sm hover:bg-slate-700"
                  >
                    <IconGithub /> Code
                  </a>
                ) : null}
              </div>

              {/* Row 3: dots aligned to right */}
              <div className="flex items-center justify-end">
                <div className="flex gap-3 items-center">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => goto(i)}
                      aria-label={`Go to ${s.title}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === safeIndex
                          ? "bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.35)] scale-110"
                          : "bg-white/10 hover:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TEXT & INFO */}
          <motion.div
            key={active?.id ?? "text-side"}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <span className="px-4 py-2 w-max rounded-full bg-slate-900/40 border border-slate-700 text-xs tracking-wide uppercase text-slate-300">
              Web Application
            </span>

            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {active?.title}
              </h2>
              <p className="text-slate-300 text-sm md:text-base">
                {active?.subtitle}
              </p>
            </div>

            <div>
              <h4 className="uppercase text-xs md:text-sm mb-3 text-slate-300 tracking-[0.14em]">
                Key Features
              </h4>
              <ul className="space-y-3 list-inside">
                {active?.features?.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 items-start text-slate-200 text-sm md:text-[15px]"
                  >
                    <span className="w-6 h-6 mt-1 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs">
                      ✓
                    </span>
                    <div className="leading-snug">{f}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="uppercase text-xs md:text-sm mb-3 text-slate-300 tracking-[0.14em]">
                Tech Stack
              </h5>
              <div className="flex flex-wrap gap-3">
                {active?.tech?.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/90 rounded-md text-xs md:text-sm text-slate-100/90 hover:border-cyan-400/70 transition"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* =======================
            MORE PROJECTS TOGGLE + GRID
            ======================= */}
        <div className="mt-16 md:mt-20">
          {/* Toggle row: arrow + "More projects" text */}
          <motion.button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-2 text-sm md:text-base text-slate-200 mx-auto mb-4 px-4 py-2 rounded-full bg-slate-900/70 border border-slate-700 hover:border-cyan-400/70 hover:bg-slate-900 shadow-sm hover:shadow-lg cursor-pointer select-none"
          >
            <motion.span
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center"
            >
              <IconChevronDown />
            </motion.span>
            <span className="font-medium tracking-tight">
              {showMore ? "Hide more projects" : "More projects"}
            </span>
          </motion.button>

          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                key="more-projects-grid"
                initial={{ opacity: 0, y: 16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 16, height: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {/* Optional small header line inside */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6"
                >
                  <div>
                    <h3 className="text-2xl md:text-3xl font-semibold">
                      More <span className="text-cyan-400">Projects</span>
                    </h3>
                  </div>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {otherProjects.map((p, idx) => (
                    <motion.article
                      key={p.id}
                      className="group relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-black p-4 md:p-5 flex flex-col gap-3 overflow-hidden"
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.45,
                        ease: "easeOut",
                        delay: idx * 0.05,
                      }}
                      whileHover={{
                        y: -6,
                        scale: 1.02,
                      }}
                    >
                      {/* glow layer */}
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),transparent_55%)]" />

                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          {/* 🔹 Hide the 'Client Website' label text but keep labels for others */}
                          {p.label && p.label !== "Client Website" && (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                              {p.label}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {p.role}
                          </span>
                        </div>

                        <h4 className="text-lg md:text-xl font-semibold text-white">
                          {p.title}
                        </h4>

                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                          {p.description}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.tech.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* LIVE PREVIEW – clicking goes to website */}
                          {p.live && (
                            <a
                              href={p.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/90 text-[12px] font-medium text-black shadow hover:bg-cyan-400 transition"
                            >
                              <IconEye /> Live Preview
                            </a>
                          )}
                          {p.github && (
                            <a
                              href={p.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-[12px] text-slate-100 hover:border-cyan-400/70 transition"
                            >
                              <IconGithub /> Code
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
