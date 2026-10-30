"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import type { Suggestion, SiteSettings } from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

// Nothing of the overlay loads until a visitor asks for it.
const AgentOverlay = dynamic(
  () =>
    import("@/components/site/agent-overlay").then((mod) => mod.AgentOverlay),
  { ssr: false }
);

type Props = {
  locale: Locale;
  dict: Dictionary["agent"];
  suggestions: Suggestion[];
  name: SiteSettings["name"];
};

/** Opens the overlay on ⌘K, Ctrl+K, and the `agent:open` and `agent:ask` events. */
export function AgentLauncher({ locale, dict, suggestions, name }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState<{ id: number; question: string } | null>(
    null
  );
  const asks = useRef(0);

  useEffect(() => {
    const show = () => {
      setLoaded(true);
      setOpen(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setLoaded(true);
      setOpen((current) => !current);
    };
    const onAsk = (event: Event) => {
      const { topic } = (event as CustomEvent<{ topic: string }>).detail;
      asks.current += 1;
      setAsked({ id: asks.current, question: `${dict.tellMeAbout} ${topic}` });
      show();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("agent:open", show);
    window.addEventListener("agent:ask", onAsk);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("agent:open", show);
      window.removeEventListener("agent:ask", onAsk);
    };
  }, [dict.tellMeAbout]);

  if (!loaded) return null;
  return (
    <AgentOverlay
      open={open}
      onOpenChange={setOpen}
      locale={locale}
      dict={dict}
      suggestions={suggestions}
      name={name}
      asked={asked}
    />
  );
}
