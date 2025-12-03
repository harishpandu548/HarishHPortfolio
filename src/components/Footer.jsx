"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const [visible, setVisible] = useState(false);

  // ---- FORM STATE ----
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({
    loading: false,
    ok: null, // true | false | null
    error: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus({
        loading: false,
        ok: false,
        error: "Please fill all fields.",
      });
      return;
    }

    try {
      setStatus({ loading: true, ok: null, error: "" });

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus({ loading: false, ok: true, error: "" });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("[CONTACT_FORM_ERROR]", err);
      setStatus({
        loading: false,
        ok: false,
        error: err.message || "Something went wrong. Try again.",
      });
    }
  }

  // ---- VISIBILITY (footer in view) ----
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ---- CANVAS BACKGROUND ANIMATION ----
  useEffect(() => {
    if (!visible) return; // only start when footer actually in view

    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = (c.width = c.clientWidth);
    let h = (c.height = c.clientHeight);
    let rafId = null;

    function onResize() {
      w = c.width = c.clientWidth;
      h = c.height = c.clientHeight;
      initParticles();
    }

    function initParticles() {
      const count = Math.max(10, Math.round(w / 100)); // responsive density
      particlesRef.current = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        hueShift: Math.random(),
        life: Math.random() * Math.PI * 2,
      }));
    }

    initParticles();
    window.addEventListener("resize", onResize);

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      // background gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(6,8,12,0.96)");
      g.addColorStop(0.5, "rgba(8,10,14,0.98)");
      g.addColorStop(1, "rgba(2,4,7,1)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // left glow
      const leftX = w * 0.18,
        leftY = h * 0.36;
      const leftRg = ctx.createRadialGradient(
        leftX,
        leftY,
        1,
        leftX,
        leftY,
        Math.max(w, h) * 0.6
      );
      leftRg.addColorStop(0, "rgba(40,140,255,0.12)");
      leftRg.addColorStop(0.12, "rgba(139,86,240,0.06)");
      leftRg.addColorStop(0.36, "rgba(0,0,0,0.0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = leftRg;
      ctx.fillRect(0, 0, w * 0.6, h);

      // right glow
      const rightX = w * 0.78,
        rightY = h * 0.26;
      const rightRg = ctx.createRadialGradient(
        rightX,
        rightY,
        1,
        rightX,
        rightY,
        Math.max(w, h) * 0.5
      );
      rightRg.addColorStop(0, "rgba(120,100,255,0.08)");
      rightRg.addColorStop(0.15, "rgba(80,200,255,0.06)");
      rightRg.addColorStop(0.5, "rgba(0,0,0,0.0)");
      ctx.fillStyle = rightRg;
      ctx.fillRect(w * 0.35, 0, w * 0.65, h);
      ctx.globalCompositeOperation = "source-over";

      // particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx + Math.sin(t * 0.0015 + p.hueShift * 2) * 0.14;
        p.y += p.vy + Math.cos(t * 0.0009 + p.hueShift) * 0.09;
        p.life += 0.02;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;

        const alpha = 0.16 + Math.sin(p.life + p.hueShift * 6) * 0.06;
        const rad = p.r * (0.85 + Math.sin(p.life) * 0.22);
        const hue = 200 + p.hueShift * 140;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue},75%,60%,${Math.max(0.06, alpha)})`;
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.max(
          0.01,
          alpha * 0.06
        )})`;
        ctx.arc(
          p.x - rad * 0.26,
          p.y - rad * 0.26,
          rad * 0.6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // focal dot
      const sx = w * 0.5 + Math.cos(t * 0.012) * 42;
      const sy = h * 0.36 + Math.sin(t * 0.017) * 24;
      const dotGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, 28);
      dotGrad.addColorStop(0, "rgba(180,220,255,0.98)");
      dotGrad.addColorStop(0.28, "rgba(90,200,255,0.35)");
      dotGrad.addColorStop(1, "rgba(80,120,160,0.02)");
      ctx.fillStyle = dotGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();

      t += 1;
      rafId = requestAnimationFrame(draw);
    }

    draw();

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0] && !entries[0].isIntersecting && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        } else if (entries[0] && entries[0].isIntersecting && !rafId) {
          draw();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(c);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [visible]);

  // ---- SOCIALS ----
  const socials = [
    {
      icon: <FaGithub />,
      href: "https://github.com/harishpandu548",
      label: "GitHub",
    },
    {
      icon: <FaLinkedin />,
      href: "https://www.linkedin.com/in/harish-pandu1703?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      label: "LinkedIn",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer
      id="contact"
      ref={sectionRef}
      className="rich-footer"
      aria-labelledby="footer-cta"
    >
      {/* full-width canvas */}
      <canvas ref={canvasRef} className="rich-footer__canvas" aria-hidden />

      <div className="rich-footer__inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.06,
              },
            },
            hidden: {},
          }}
        >
          <motion.h2
            id="footer-cta"
            className="rich-footer__title"
            style={{ color: "#fff" }}
            variants={fadeUp}
          >
            Contact Me ?
          </motion.h2>

          <motion.p className="rich-footer__sub" variants={fadeUp}>
            I&apos;m always open to discussing new projects, ideas, or
            opportunities.
          </motion.p>

          <motion.p className="rich-footer__email" variants={fadeUp}>
            <motion.a
              href="mailto:harishpandu548@gmail.com"
              initial={{ opacity: 0.98 }}
              whileHover={{
                scale: 1.04,
                textShadow: "0 0 24px rgba(110,210,255,0.18)",
              }}
              className="rich-footer__email-link"
            >
              harishpandu548@gmail.com
            </motion.a>
          </motion.p>

          <motion.div
            className="rich-footer__socials"
            variants={fadeUp}
          >
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                initial={{ opacity: 0.98 }}
                whileHover={{ scale: 1.12, rotate: 6 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 16,
                  delay: i * 0.03,
                }}
              >
                {s.icon}
                <span className="sr-only">{s.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* FORM CARD */}
        <motion.div
          className="rich-footer__card-wrap"
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          variants={{
            visible: { transition: { delayChildren: 0.2 } },
          }}
        >
          <motion.form
            className="rich-footer__card"
            variants={fadeUp}
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 tracking-wide">
                  Name
                </label>
                <input
                  aria-label="Name"
                  placeholder="Your name"
                  className="input"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 tracking-wide">
                  Email
                </label>
                <input
                  aria-label="Email"
                  placeholder="you@example.com"
                  className="input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-300 tracking-wide">
                  Message
                </label>
                <textarea
                  aria-label="Message"
                  placeholder="Tell me about your project or idea..."
                  rows={4}
                  className="input col-span-1 md:col-span-2 resize-none"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="mt-3 min-h-[22px] text-sm">
              <AnimatePresence mode="popLayout">
                {status.ok && (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-emerald-400"
                  >
                    ✅ Message sent! I&apos;ll get back to you soon.
                  </motion.p>
                )}
                {status.ok === false && status.error && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-400"
                  >
                    ⚠️ {status.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2">
              <motion.button
                whileHover={status.loading ? {} : { scale: 1.03 }}
                whileTap={status.loading ? {} : { scale: 0.97 }}
                className={`btn-send inline-flex items-center gap-2 ${
                  status.loading ? "opacity-80 cursor-wait" : ""
                }`}
                type="submit"
                disabled={status.loading}
              >
                {status.loading ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <span className="text-xs opacity-80">↗</span>
                  </>
                )}
              </motion.button>

              <p className="text-[11px] md:text-xs text-slate-500 max-w-xs">
                I respect your inbox. Your details are safe and used only to
                reply to your message.
              </p>
            </div>
          </motion.form>
        </motion.div>

        <div
          className={`rich-footer__underline ${visible ? "active" : ""}`}
          aria-hidden
        />

        <p className="rich-footer__copyright text-center">
          © 2025 Harish A
        </p>
      </div>
    </footer>
  );
}
