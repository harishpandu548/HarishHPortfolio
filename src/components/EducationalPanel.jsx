// components/EducationPanel.jsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaGraduationCap, FaSchool, FaMedal } from "react-icons/fa";

/**
 * EducationPanel
 * - Adds icons/images inside the left square
 * - Entrance animation when scrolled into view
 * - Floating micro animation applied to icon for life
 *
 * NOTE: install framer-motion + react-icons:
 *   npm i framer-motion react-icons
 */

/* ---------- UPDATED EDUCATION DATA (as requested) ---------- */
/* Full forms used, Hyderabad added to each entry, spelling corrected */
const EDUCATION = [
  {
    years: "2022 — 2025",
    title: "Bachelor of Technology in Computer Science and Data Science",
    school: "Malla Reddy College of Engineering and Technology, Hyderabad",
    note: "GPA: 8.2",
    theme: "azure",
    icon: "grad",
  },
  {
    years: "2019 — 2022",
    title: "Diploma in Electrical and Electronics Engineering",
    school: "Government Polytechnic, Medchal, Hyderabad",
    note: "GPA: 9.2",
    theme: "sky",
    icon: "school",
  },
  {
    years: "2018 — 2019",
    title: "Secondary School Certificate",
    school: "Martinet High School, Hyderabad",
    note: "GPA: 9.3",
    theme: "rose",
    icon: "medal",
  },
];

/* variants for card container (staggered children) */
const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, when: "beforeChildren" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.995 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, ease: [0.16, 0.98, 0.32, 1] } },
};

const iconFloat = {
  animate: {
    y: [0, -6, 0],
    rotate: [0, 2, 0],
    transition: { duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
  },
};

function IconFor(key, size = 20) {
  switch (key) {
    case "grad":
      return <FaGraduationCap size={size} />;
    case "school":
      return <FaSchool size={size} />;
    case "medal":
      return <FaMedal size={size} />;
    default:
      return <FaGraduationCap size={size} />;
  }
}

export default function EducationPanel() {
  return (
    <aside className="w-full">
      <motion.div
        className="rounded-2xl bg-gradient-to-b from-white/3 to-black/80 border border-white/6 p-6 shadow-xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-cyan-300 flex items-center gap-3">
            <span className="text-2xl">🎓</span> Education
          </h3>
          <div className="flex items-center gap-4 text-sm"></div>
        </div>

        <motion.div className="space-y-5" role="list">
          {EDUCATION.map((row, idx) => (
            <motion.article
              key={idx}
              className="rounded-lg bg-black/40 border border-white/6 p-4 relative overflow-visible"
              variants={cardVariants}
              whileHover={{ translateY: -6, boxShadow: "0 28px 80px rgba(2,8,23,0.55)" }}
              role="listitem"
              aria-label={`${row.title} — ${row.school}`}
            >
              <div className="flex items-start gap-4">
                {/* icon / image square */}
                <div
                  className={
                    "w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/6 shadow-sm relative overflow-visible"
                  }
                  aria-hidden
                >
                  <motion.div
                    className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-[14px] font-bold ${
                      row.theme === "azure"
                        ? "bg-gradient-to-br from-cyan-400 to-indigo-500"
                        : row.theme === "sky"
                        ? "bg-gradient-to-br from-sky-400 to-indigo-400"
                        : "bg-gradient-to-br from-rose-400 to-pink-400"
                    }`}
                    {...iconFloat}
                    animate="animate"
                    style={{ boxShadow: "0 8px 30px rgba(2,8,23,0.35)" }}
                  >
                    {/* icon centered — replace with <img> if you have a thumbnail */}
                    <span className="opacity-95">{IconFor(row.icon, 18)}</span>
                  </motion.div>

                  {/* optional micro glow behind icon */}
                  <span
                    className="pointer-events-none absolute -right-1 -top-1 w-2 h-2 rounded-full"
                    style={{
                      background:
                        row.theme === "azure"
                          ? "radial-gradient(circle at 30% 30%, #bff7ff, #2fe1c2)"
                          : row.theme === "sky"
                          ? "radial-gradient(circle at 30% 30%, #dbeeff, #7dd3fc)"
                          : "radial-gradient(circle at 30% 30%, #ffd6e8, #fb7185)",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    }}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/70">{row.years}</div>
                    <div className="text-sm text-white/70">{row.note}</div>
                  </div>

                  <h4 className="mt-2 font-semibold text-lg text-white">{row.title}</h4>
                  <p className="mt-1 text-sm text-white/60">{row.school}</p>

                  <div
                    className="mt-3 h-[6px] w-full rounded-full"
                    style={{
                      background:
                        row.theme === "azure"
                          ? "linear-gradient(90deg,#06b6d4,#7c3aed)"
                          : row.theme === "sky"
                          ? "linear-gradient(90deg,#38bdf8,#6366f1)"
                          : "linear-gradient(90deg,#fb7185,#f97316)",
                      boxShadow: "0 6px 22px rgba(2,8,23,0.36) inset",
                    }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.div>
    </aside>
  );
}
