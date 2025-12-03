// components/ScrollSmoother.jsx
"use client";
import { useEffect } from "react";

export default function ScrollSmoother() {
  useEffect(() => {
    let timer = null;
    const onScroll = () => {
      // add flag that we are actively scrolling
      document.body.classList.add("is-scrolling");
      // clear previous timer
      if (timer) clearTimeout(timer);
      // when scrolling stops for 120ms remove the class
      timer = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
        timer = null;
      }, 120);
    };

    // passive for smoothness
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);
  return null;
}
