"use client";

import type { Dictionary } from "@/lib/dictionary";

/** The hero's way into the overlay: a text link on desktop, a pill on phones. */
export function AskAgentButton({ dict }: { dict: Dictionary["agent"] }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("agent:open"))}
      className="animate-fade-in border-ink text-ink flex min-h-13 w-full cursor-pointer items-center justify-between rounded-full border px-4.5 [animation-delay:1.6s] lg:min-h-0 lg:w-fit lg:justify-start lg:gap-3.5 lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:pb-1.5"
    >
      <span className="text-ui lg:hidden">{dict.entryShort}</span>
      <span className="text-ui hidden lg:inline">{dict.entry}</span>
      <span
        aria-hidden="true"
        className="text-mono text-agent font-mono lg:hidden"
      >
        ●
      </span>
      <kbd className="text-mono text-muted-ink hidden font-mono lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}
