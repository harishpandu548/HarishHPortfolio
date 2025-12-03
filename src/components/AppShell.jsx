"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import IntroGreen from "@/components/IntroGreen/IntroGreen";
import CursorTrailCursor from "@/components/CursorTrailCursor";
import ScrollSmoother from "@/components/ScrollSmoother";

export default function AppShell({ children }) {
  const router = useRouter();

useEffect(() => {
  if (typeof window === "undefined") return;

  const nav = performance.getEntriesByType("navigation");
  const isReload = nav.some((n) => n.type === "reload");

  if (isReload) {
    // Remove hash but keep URL clean
    history.replaceState(null, "", "/");

    // Phase 1: disable browser scroll restore
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Phase 2: Wait for ScrollSmoother to initialize
    setTimeout(() => {
      // Force window scroll
      window.scrollTo({ top: 0, behavior: "instant" });

      // Force scroll smoother (GSAP)
      if (window.smoother && window.smoother.scrollTop) {
        window.smoother.scrollTop(0, true);
      }

      // Phase 3: Run again after a frame (final override)
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);

        if (window.smoother && window.smoother.scrollTop) {
          window.smoother.scrollTop(0, true);
        }
      });
    }, 120); // Slight delay so smoother fully mounts
  }
}, []);

  return (
    <>
      <CursorTrailCursor size={10} trailCount={14} trailSpacing={0.22} />
      <div id="site-bg" className="site-bg" aria-hidden="true" />

      <IntroGreen />
      <ScrollSmoother />
      <Navbar />

      {children}

      <Footer />
    </>
  );
}
