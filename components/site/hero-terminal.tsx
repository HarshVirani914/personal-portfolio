"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { HeroTerminalScript } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const TYPE_MS = 45;
const LINE_MS = 360;
const HOLD_MS = 4000;
/** Typing waits for the name to land. */
const START_MS = 1400;

type Props = { scripts: HeroTerminalScript[]; label: string; runLabel: string };

const wait = (ms: number, signal: { cancelled: boolean }) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms)).then(() => !signal.cancelled);

/** Types commands, prints their output and cycles on its own; a click runs a command. */
export function HeroTerminal({ scripts, label, runLabel }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  // Bumped on every click so the same command can be replayed.
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(0);
  const [printed, setPrinted] = useState(0);

  const script = scripts[active];

  useEffect(() => {
    if (!script) return;
    if (reduce) return;
    const signal = { cancelled: false };
    (async () => {
      setTyped(0);
      setPrinted(0);
      if (run === 0 && !(await wait(START_MS, signal))) return;
      for (let i = 1; i <= script.command.length; i++) {
        if (!(await wait(TYPE_MS, signal))) return;
        setTyped(i);
      }
      for (let i = 1; i <= script.output.length; i++) {
        if (!(await wait(LINE_MS, signal))) return;
        setPrinted(i);
      }
      if (!(await wait(HOLD_MS, signal))) return;
      setActive((current) => (current + 1) % scripts.length);
    })();
    return () => {
      signal.cancelled = true;
    };
  }, [script, active, run, reduce, scripts.length]);

  if (!script) return null;
  const typedCount = reduce ? script.command.length : typed;
  const printedCount = reduce ? script.output.length : printed;
  const typing = typedCount < script.command.length || printedCount >= script.output.length;

  return (
    <section aria-label={label} className="flex flex-col gap-3 font-mono">
      <div className="flex min-h-21 flex-col gap-1 lg:min-h-23">
        <div className="text-[15px] text-agent lg:text-lg">
          <span aria-hidden="true">&gt;&nbsp;</span>
          <span data-testid="terminal-command">{script.command.slice(0, typedCount)}</span>
          {typing && !reduce ? <span aria-hidden="true" className="animate-caret">▍</span> : null}
        </div>
        {script.output.slice(0, printedCount).map((text, i) => (
          <div
            key={`${script.id}-${i}`}
            className="animate-out-in whitespace-pre-wrap pl-[2ch] text-[13px] leading-normal text-muted-ink lg:text-[15px]"
          >
            {text}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:gap-x-4.5">
        <span className="hidden text-mono text-muted-ink lg:inline">{runLabel}</span>
        {scripts.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActive(i);
              setRun((n) => n + 1);
            }}
            aria-current={i === active ? "true" : undefined}
            className={cn(
              "flex min-h-9 cursor-pointer items-center rounded-full border border-hairline px-3 text-mono transition-colors duration-200 lg:min-h-0 lg:rounded-none lg:border-0 lg:px-0",
              i === active
                ? "border-agent text-agent lg:underline lg:underline-offset-4"
                : "text-muted-ink hover:text-ink focus-visible:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
