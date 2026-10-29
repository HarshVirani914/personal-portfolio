"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Statement } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { statements: Statement[]; label: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned statements. The section is tall and its content sticks, so scroll
 * progress steps through the statements one at a time. Reduced motion skips
 * the pin and shows every statement as plain text.
 */
export function Statements({ statements, label }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = statements.length;

  // Progress runs from the track's top meeting the viewport top (0) to its bottom meeting the viewport bottom (1).
  useEffect(() => {
    const el = track.current;
    if (!el || total === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const span = box.height - window.innerHeight;
      const progress = span > 0 ? -box.top / span : 0;
      setActive(Math.min(total - 1, Math.max(0, Math.floor(progress * total))));
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
  }, [total]);

  if (total === 0) return null;
  const fill = `${((active + 1) / total) * 100}%`;

  return (
    <section aria-label={label}>
      {/* Reduced motion: everything readable at once, nothing pinned. */}
      <div className="hidden px-5 py-18 motion-reduce:block md:px-10 lg:px-16">
        <ol className="flex list-none flex-col gap-10">
          {statements.map((item, i) => (
            <li
              key={item.id}
              className="text-statement font-serif tracking-[-0.01em]"
            >
              <span className="text-mono text-muted-ink mb-2 block font-mono">
                {pad(i + 1)} / {pad(total)}
              </span>
              {item.text}
            </li>
          ))}
        </ol>
      </div>

      <div
        ref={track}
        className="motion-reduce:hidden"
        style={{ height: `${total * 100}svh` }}
      >
        <div className="sticky top-0 flex h-svh items-center px-5 md:px-10 lg:px-16">
          <div
            aria-hidden="true"
            className="bg-hairline absolute inset-x-0 top-24 h-px lg:inset-x-auto lg:top-40 lg:bottom-40 lg:left-0 lg:h-auto lg:w-px"
          >
            <div
              data-testid="statements-progress"
              className="bg-ink ease-in-out-quart h-px transition-[width,height] duration-800 lg:h-(--fill) lg:w-px"
              style={{ width: fill, ["--fill" as string]: fill }}
            />
          </div>

          <div className="relative w-full lg:grid lg:grid-cols-12 lg:gap-x-6">
            <div className="text-muted-ink lg:text-mono font-mono text-[11px] lg:col-span-2 lg:pt-5 lg:pl-7">
              <span
                key={active}
                className="animate-num-rise inline-block"
                data-testid="statements-counter"
              >
                {pad(active + 1)}
              </span>{" "}
              / {pad(total)}
            </div>
            <div className="relative mt-3 lg:col-span-8 lg:col-start-3 lg:mt-0">
              {/* All statements stay in the DOM for assistive tech; only the active one is shown. */}
              {statements.map((item, i) => (
                <p
                  key={item.id}
                  data-active={i === active}
                  className={cn(
                    "text-statement font-serif tracking-[-0.01em] transition-opacity duration-200",
                    i === active
                      ? "relative opacity-100"
                      : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
                  )}
                >
                  {item.text.split(" ").map((word, w) => (
                    <Fragment key={`${i === active ? "on" : "off"}-${w}`}>
                      {w > 0 ? " " : null}
                      <span
                        className={cn(
                          "inline-block",
                          i === active && "animate-ink"
                        )}
                        style={{ animationDelay: `${w * 90}ms` }}
                      >
                        {word}
                      </span>
                    </Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
