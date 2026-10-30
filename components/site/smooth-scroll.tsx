"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling; off when the visitor prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, autoRaf: true });

    /**
     * Links to a section of the page we are already on glide there instead of
     * jumping. Runs in the capture phase so the router's own instant scroll
     * never fires; links to other pages are left alone.
     */
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash
      )
        return;
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1))
      );
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      lenis.scrollTo(target); // honours the target's scroll-margin-top itself
      history.pushState(null, "", url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);

    /** Back or forward during a glide: stop where we are so scroll restoration is not fought. */
    const onPop = () =>
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    window.addEventListener("popstate", onPop);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      lenis.destroy();
    };
  }, []);

  return null;
}
