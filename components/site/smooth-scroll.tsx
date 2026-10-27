"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling; off when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, autoRaf: true });
    return () => lenis.destroy();
  }, []);

  return null;
}
