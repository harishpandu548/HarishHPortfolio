"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineMenu, HiOutlineX, HiArrowNarrowRight } from "react-icons/hi";
import { motion } from "framer-motion";

/**
 * Animated Navbar with:
 * - Robust smooth scroll (header offset + scroll container support)
 * - Active section highlight (based on scroll)
 * - Hover animations
 * - Navbar animation only AFTER intro finishes
 */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [introFinished, setIntroFinished] = useState(
    typeof window !== "undefined" &&
      document.documentElement.classList.contains("intro-done")
  );

  const headerRef = useRef(null);

  const nav = [
    { label: "About", href: "#about", id: "about" },
    { label: "Skills", href: "#skills", id: "skills" },
    { label: "Projects", href: "#projects", id: "projects" },
    { label: "Certificates", href: "#certificates", id: "certificates" },
    { label: "Contact", href: "#contact", id: "contact" },
  ];

  // 🔔 listen for intro end (same idea as Hero)
  useEffect(() => {
    function onFinish() {
      setIntroFinished(true);
    }
    window.addEventListener("intro:finished", onFinish);
    return () => window.removeEventListener("intro:finished", onFinish);
  }, []);

  // --- HEADER HEIGHT / CSS VAR ---

  const getHeaderHeight = () => {
    const el = headerRef.current || document.querySelector("header[data-header]");
    if (!el) return 88;
    return Math.ceil(el.getBoundingClientRect().height);
  };

  useEffect(() => {
    const onResize = () => {
      const h = getHeaderHeight();
      document.documentElement.style.setProperty("--site-header-height", `${h}px`);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- SCROLL CONTAINER HELPERS ---

  function findScrollContainer(el) {
    let node = el;
    while (node && node !== document.body && node !== document.documentElement) {
      const style = getComputedStyle(node);
      const overflowY = style.overflowY;
      if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
        return node;
      }
      node = node.parentElement;
    }
    return window;
  }

  function findTargetElement(id) {
    let el = document.getElementById(id);
    if (el) return { el, foundBy: `#${id}` };

    el = document.querySelector(`[name="${id}"]`);
    if (el) return { el, foundBy: `[name="${id}"]` };

    el = document.querySelector(`[data-section="${id}"]`);
    if (el) return { el, foundBy: `[data-section="${id}"]` };

    el = document.querySelector(`.${id}`);
    if (el) return { el, foundBy: `.${id}` };

    return { el: null, foundBy: null };
  }

  // --- CUSTOM OFFSETS PER SECTION ---

  const customOffsets = {
    hero: 40,
    about: -20,
    skills: 25,
    projects: 60,
    certificates: -3,
    contact: 47,
  };
  const DEFAULT_EXTRA = 100;

  function getOffsetFor(id) {
    const headerHeight = getHeaderHeight();
    const extra = customOffsets[id] ?? DEFAULT_EXTRA;
    return headerHeight - extra;
  }

  // --- SMOOTH SCROLL ---

  function scrollToId(id, tries = 6, delay = 120) {
    const { el, foundBy } = findTargetElement(id);

    if (!el) {
      if (tries <= 0) {
        console.warn(
          `[Navbar] Could not find element for "${id}" after retries. Ensure element exists with id="${id}".`
        );
        history.replaceState(null, "", `#${id}`);
        return;
      }
      return setTimeout(
        () => scrollToId(id, tries - 1, Math.min(delay * 1.4, 800)),
        delay
      );
    }

    const container = findScrollContainer(el);
    const offset = getOffsetFor(id);

    if (container === window) {
      const elTop = el.getBoundingClientRect().top + window.pageYOffset;
      const targetY = Math.max(0, Math.floor(elTop - offset));
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } else {
      let offsetTop = 0;
      let node = el;
      while (node && node !== container && node.offsetParent) {
        offsetTop += node.offsetTop || 0;
        node = node.offsetParent;
      }
      const targetScroll = Math.max(0, Math.floor(offsetTop - offset));
      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }

    try {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    } catch (err) {}

    history.replaceState(null, "", `#${id}`);
  }

  function handleSmoothScroll(e, href) {
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    setOpen(false);
    const id = href.slice(1);
    scrollToId(id);
  }

  // --- ACTIVE SECTION HIGHLIGHT (scroll spy) ---

  useEffect(() => {
    const sectionIds = ["hero", "about", "skills", "projects", "certificates", "contact"];

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const headerHeight = getHeaderHeight();
        const viewportMiddle = headerHeight + window.innerHeight * 0.28;

        let bestId = "hero";
        let bestDistance = Infinity;

        sectionIds.forEach((id) => {
          const { el } = findTargetElement(id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const sectionTop = rect.top;
          const distance = Math.abs(sectionTop - viewportMiddle);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestId = id;
          }
        });

        setActiveSection(bestId);
        ticking = false;
      });
    };

    onScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- FRAMER MOTION VARIANTS ---

  const wrapper = {
    hidden: { opacity: 0, y: -18, scale: 0.995, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 28,
        staggerChildren: 0.06,
        delayChildren: 0.12,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: "easeOut" },
    },
  };

  return (
    <motion.header
      ref={headerRef}
      data-header
      initial="hidden"
      animate={introFinished ? "visible" : "hidden"} 
      variants={wrapper}
      className="fixed inset-x-4 top-4 z-50"
      style={{ willChange: "transform,opacity,filter" }}
    >
      <div
        className="max-w-[1200px] mx-auto rounded-2xl bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-md border border-white/6 shadow-xl"
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-6 px-5 md:px-8 py-3">
          {/* LOGO / HOME */}
          <motion.a
            href="#hero"
            onClick={(e) => handleSmoothScroll(e, "#hero")}
            variants={item}
            className="flex items-center gap-2 min-w-[140px] select-none"
            aria-label="Home"
          >
            <span className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
              H
            </span>
            <span className="hidden md:inline-block text-white font-semibold tracking-tight">
              Harish A
            </span>
          </motion.a>

          {/* DESKTOP NAV */}
          <nav
            className="hidden md:flex flex-1 justify-center items-center"
            aria-label="Primary"
          >
            <ul className="flex gap-6 text-gray-300">
              {nav.map((n) => {
                const id = n.id;
                const isActive = activeSection === id;
                return (
                  <motion.li key={n.href} variants={item}>
                    <motion.a
                      href={n.href}
                      onClick={(e) => handleSmoothScroll(e, n.href)}
                      className={[
                        "relative text-sm font-medium px-3 py-2 rounded-md transition-all duration-200",
                        "flex items-center gap-1.5",
                        isActive
                          ? "text-orange-400 bg-white/5 shadow-[0_0_0_1px_rgba(251,146,60,0.4)]"
                          : "text-gray-300 hover:text-white hover:bg-white/6",
                      ].join(" ")}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{n.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-dot"
                          className="w-1.5 h-1.5 rounded-full bg-orange-400"
                          initial={false}
                        />
                      )}
                    </motion.a>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT SIDE / CTA + MOBILE TOGGLE */}
          <div className="ml-auto flex items-center gap-3">
            {/* Desktop CTA */}
            <motion.a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "#contact")}
              variants={item}
              className="hidden md:inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-700 to-purple-600 text-white font-medium shadow-[inset_0_-2px_6px_rgba(255,255,255,0.02)] hover:scale-[1.02] active:scale-[0.97] transition-transform"
              aria-label="Let's Talk"
            >
              <span className="text-sm">Let&apos;s Talk</span>
              <HiArrowNarrowRight className="w-4 h-4" />
            </motion.a>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setOpen((prev) => !prev)}
              variants={item}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded-md text-gray-200 hover:bg.white/6 hover:bg-white/6 transition"
            >
              {open ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-[420px]" : "max-h-0"
          }`}
        >
          <div className="px-5 pb-4">
            <ul className="flex flex-col gap-2 mt-1">
              {nav.map((n) => {
                const id = n.id;
                const isActive = activeSection === id;
                return (
                  <li key={n.href}>
                    <button
                      type="button"
                      onClick={(e) => handleSmoothScroll(e, n.href)}
                      className={[
                        "w-full text-left rounded-md px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "text-orange-400 bg.white/5 bg-white/5 shadow-[0_0_0_1px_rgba(251,146,60,0.35)]"
                          : "text-gray-200 hover:bg-white/6",
                      ].join(" ")}
                    >
                      {n.label}
                    </button>
                  </li>
                );
              })}
              <li className="pt-2">
                <button
                  type="button"
                  onClick={(e) => handleSmoothScroll(e, "#contact")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white font-medium"
                >
                  Let&apos;s Talk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* SUBTLE BOTTOM GLOW */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: introFinished ? 1 : 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="pointer-events-none"
        >
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-b-xl" />
        </motion.div>
      </div>
    </motion.header>
  );
}
