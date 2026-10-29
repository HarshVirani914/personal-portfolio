"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ContentsItem = { id: string; number: string; label: string };

/** Id of the heading nearest above the reading line (30% down the viewport). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = list[0] ?? "";
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}

/** A line along the top of the screen, in the research's colour, that fills as the article is read. */
export function ReadingProgress({
  targetId,
  label,
}: {
  targetId: string;
  label: string;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.getElementById(targetId);
      if (!el || !bar.current) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const done = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.5 - rect.top) / total)
      );
      bar.current.style.transform = `scaleX(${done})`;
      bar.current.setAttribute("aria-valuenow", String(Math.round(done * 100)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetId]);

  return (
    <div
      ref={bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      data-testid="reading-progress"
      className="fixed top-0 left-0 z-50 h-0.5 w-full origin-left scale-x-0 bg-(--project-accent)"
    />
  );
}

/** The sticky contents rail from lg up. The current section is marked in the research's colour. */
export function ContentsRail({
  items,
  label,
}: {
  items: ContentsItem[];
  label: string;
}) {
  const active = useActiveSection(items.map((item) => item.id));
  return (
    <nav
      aria-label={label}
      className="text-mono lg:border-hairline hidden font-mono lg:sticky lg:top-28 lg:col-span-2 lg:flex lg:flex-col lg:self-start lg:border-l lg:pl-3.5"
    >
      <span className="text-muted-ink mb-2.5">{label}</span>
      {items.map((item) => {
        const current = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={current ? "location" : undefined}
            className={cn(
              "-ml-[15px] flex gap-2.5 border-l py-1.5 pl-3.5 transition-colors duration-200",
              current
                ? "border-(--project-accent) text-(--project-accent)"
                : "text-muted-ink hover:text-ink border-transparent"
            )}
          >
            <span>{item.number}</span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

/** Below lg: a sticky bar with the way back and a dropdown of sections. */
export function ContentsBar({
  items,
  back,
  label,
  jumpLabel,
}: {
  items: ContentsItem[];
  back: { href: string; label: string };
  label: string;
  jumpLabel: string;
}) {
  const active = useActiveSection(items.map((item) => item.id));
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div className="border-hairline bg-background sticky top-19 z-30 -mx-5 border-b px-5 md:top-22 md:-mx-10 md:px-10 lg:hidden">
      <div className="text-mono flex items-center justify-between font-mono">
        <Link href={back.href} className="text-ink flex min-h-12 items-center">
          ← {back.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="contents-menu"
          aria-label={jumpLabel}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-12 cursor-pointer items-center gap-2 text-(--project-accent)"
        >
          {current && (
            <span>
              {current.number} {current.label}
            </span>
          )}
          <span
            aria-hidden="true"
            className={cn(
              "transition-transform duration-300",
              open && "rotate-180"
            )}
          >
            ▾
          </span>
        </button>
      </div>
      {open && (
        <nav
          id="contents-menu"
          aria-label={label}
          className="animate-out-in text-mono flex flex-col pb-4 font-mono"
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              aria-current={item.id === active ? "location" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-2.5",
                item.id === active
                  ? "text-(--project-accent)"
                  : "text-muted-ink"
              )}
            >
              <span>{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

/** Text with [n] markers turned into links to the numbered references. */
function Inline({ text, refLabel }: { text: string; refLabel: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/).map((part, i) => {
        const match = /^\[(\d+)\]$/.exec(part);
        if (!match) return <Fragment key={i}>{part}</Fragment>;
        return (
          <sup
            key={i}
            className="font-mono text-[11px] text-(--project-accent)"
          >
            <a
              href={`#ref-${match[1]}`}
              aria-label={`${refLabel} ${match[1]}`}
              className="px-0.5 hover:underline"
            >
              {match[1]}
            </a>
          </sup>
        );
      })}
    </>
  );
}

type ParagraphProps = {
  text: string;
  note: string | null;
  noteNumber: number | null;
  labels: { note: string; show: string; hide: string; reference: string };
};

/**
 * A paragraph and its optional side note. From lg the note sits in the margin
 * beside the paragraph; below lg a numbered marker opens it under the text.
 */
export function Paragraph({ text, note, noteNumber, labels }: ParagraphProps) {
  const [open, setOpen] = useState(false);
  const noteId = `note-${noteNumber}`;
  return (
    <>
      <div className="lg:col-span-6">
        <p>
          <Inline text={text} refLabel={labels.reference} />
          {note && (
            <>
              {" "}
              <button
                type="button"
                aria-expanded={open}
                aria-controls={noteId}
                aria-label={`${open ? labels.hide : labels.show} ${noteNumber}`}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-full border border-(--project-accent)/40 px-1.5 align-[3px] font-mono text-[11px] leading-none text-(--project-accent) lg:hidden"
              >
                {noteNumber}
              </button>
              <sup
                aria-hidden="true"
                className="hidden font-mono text-[11px] text-(--project-accent) lg:inline"
              >
                {noteNumber}
              </sup>
            </>
          )}
        </p>
        {note && open && (
          <p
            id={noteId}
            className="animate-out-in text-muted-ink mt-4 border-l border-(--project-accent) pl-3 font-mono text-[12px] leading-relaxed lg:hidden"
          >
            {note}
          </p>
        )}
      </div>
      {note && (
        <aside
          aria-label={`${labels.note} ${noteNumber}`}
          className="text-mono text-muted-ink hidden border-t border-(--project-accent) pt-2.5 font-mono lg:col-span-3 lg:col-start-7 lg:block lg:self-start"
        >
          <span className="text-(--project-accent)">{noteNumber}</span> {note}
        </aside>
      )}
    </>
  );
}

/** Copies the citation text and says so for a moment. */
export function CiteButton({
  text,
  label,
  doneLabel,
}: {
  text: string;
  label: string;
  doneLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="hover:text-ink flex min-h-11 cursor-pointer items-center gap-1.5 lg:min-h-0"
    >
      <span aria-live="polite">{copied ? doneLabel : label}</span>
      <span aria-hidden="true">↗</span>
    </button>
  );
}

/** Asks the ⌘K agent about this page. The agent listens for the event once it exists. */
export function AskButton({ label, topic }: { label: string; topic: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("agent:ask", { detail: { topic } })
        )
      }
      className="text-agent flex min-h-11 cursor-pointer items-center gap-1.5 lg:min-h-0"
    >
      {label} <kbd className="font-mono">⌘K</kbd>
    </button>
  );
}
