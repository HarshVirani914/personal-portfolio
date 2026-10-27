"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/dictionary";

const subscribe = () => () => {};

/** Light/dark switch. Follows the system until the visitor picks one. */
export function ThemeToggle({ labels }: { labels: Dictionary["theme"] }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? labels.toLight : labels.toDark}
      className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-mono text-mono text-muted-ink transition-colors duration-200 hover:text-ink"
    >
      <span aria-hidden="true">◐</span>
      <span suppressHydrationWarning>{mounted ? (isDark ? labels.dark : labels.light) : labels.light}</span>
    </button>
  );
}
