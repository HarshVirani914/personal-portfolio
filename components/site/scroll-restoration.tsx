"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const STORAGE_KEY = "scroll-positions";
const GIVE_UP_MS = 1500;

/** Path plus hash: "/" and "/#work" are separate history entries with their own position. */
const entryKey = () => location.pathname + location.hash;

const read = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const write = (positions: Record<string, number>) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {}
};

/**
 * Restores scroll on browser back and forward ourselves. With the browser's own
 * restoration the jump can happen while the previous page is still on screen,
 * so it clamps to that page's height and lands on the wrong section. Positions
 * are remembered per history entry and re-applied once the new page is tall enough.
 */
export function ScrollRestoration() {
  const pathname = usePathname();
  const currentPath = useRef<string | null>(null);
  const popped = useRef(false);
  const cancel = useRef<() => void>(() => {});

  /** Re-applies `target` each frame until the page is tall enough and it sticks. */
  const restore = useRef((target: number) => {
    cancel.current();
    let frame = 0;
    let settled = 0;
    const started = performance.now();
    const events = ["wheel", "touchstart", "keydown"] as const;
    const stop = () => {
      cancelAnimationFrame(frame);
      events.forEach((name) => window.removeEventListener(name, stop));
    };
    const step = () => {
      const tall = document.documentElement.scrollHeight - window.innerHeight >= target - 1;
      if (tall) {
        window.scrollTo({ top: target, behavior: "instant" });
        settled = Math.abs(window.scrollY - target) < 2 ? settled + 1 : 0;
      }
      if (settled < 3 && performance.now() - started < GIVE_UP_MS) frame = requestAnimationFrame(step);
    };
    events.forEach((name) => window.addEventListener(name, stop, { passive: true, once: true }));
    cancel.current = stop;
    step();
  });

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const run = restore.current;

    // Last position seen from a scroll event. A hash link scrolls and pushes the
    // new URL in one task, so reading scrollY at push time would already be the
    // destination; this still holds where the visitor was.
    let lastY = window.scrollY;
    const save = () => {
      lastY = window.scrollY;
      if (!popped.current) write({ ...read(), [entryKey()]: lastY });
    };
    const originalPush = history.pushState;
    history.pushState = function (...args) {
      write({ ...read(), [entryKey()]: lastY });
      return originalPush.apply(this, args);
    };
    const onPop = () => {
      popped.current = true;
      // Same path (a hash entry): no route change will follow, so restore here.
      requestAnimationFrame(() => {
        if (!popped.current || currentPath.current !== location.pathname) return;
        popped.current = false;
        const saved = read()[entryKey()];
        if (saved !== undefined) run(saved);
        else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
      });
    };

    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    window.addEventListener("popstate", onPop);
    return () => {
      history.pushState = originalPush;
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      window.removeEventListener("popstate", onPop);
      history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const target = popped.current ? read()[entryKey()] : undefined;
    popped.current = false;
    currentPath.current = location.pathname;
    if (target !== undefined) restore.current(target);
    return () => cancel.current();
  }, [pathname]);

  return null;
}
