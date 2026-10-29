"use client";

import { useId, useState } from "react";
import type { Dictionary } from "@/lib/dictionary";
import type { Experience } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { items: Experience[]; dict: Dictionary["experience"] };

const mono = "font-mono text-mono text-muted-ink";

/**
 * Experience as quiet rows: years, company and role. A row opens to its bullet
 * points. Each row owns its whole line, so a drawn timeline rule can later sit
 * in the years column without reworking the rows.
 */
export function ExperienceList({ items, dict }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();
  if (items.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-24 py-24 lg:py-30">
      <div className="mb-10 border-t border-ink pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>05 — {dict.kicker}</span>
        <h2 id="experience-heading" className="font-serif text-h2 lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>

      <ol className="m-0 list-none border-b border-hairline p-0">
        {items.map((item) => {
          const expanded = open === item.id;
          const panelId = `${base}-${item.id}`;
          const hasDetails = item.bullets.length > 0;
          return (
            <li key={item.id} data-row="experience" className="group border-t border-hairline">
              <button
                type="button"
                aria-expanded={hasDetails ? expanded : undefined}
                aria-controls={hasDetails ? panelId : undefined}
                aria-label={hasDetails ? `${item.company}, ${item.role}. ${expanded ? dict.collapse : dict.expand}` : undefined}
                disabled={!hasDetails}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex min-h-11 w-full cursor-pointer flex-col gap-2 py-6 text-left outline-offset-4 focus-visible:outline focus-visible:outline-agent disabled:cursor-default lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:py-9"
              >
                <span className={cn(mono, "lg:col-span-2")}>{item.years}</span>
                <span
                  className={cn(
                    "font-serif text-[32px] leading-none transition-transform duration-500 ease-out-expo motion-reduce:transition-none lg:col-span-5 lg:text-[44px]",
                    hasDetails && "lg:group-hover:translate-x-2 motion-reduce:lg:group-hover:translate-x-0",
                  )}
                >
                  {item.company}
                </span>
                <span className="flex items-baseline justify-between gap-4 text-[15px] text-ink-2 lg:col-span-5 lg:text-[17px]">
                  {item.role}
                  {hasDetails && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-[18px] leading-none text-muted-ink transition-transform duration-350 ease-out-expo motion-reduce:transition-none",
                        expanded && "rotate-45 text-ink",
                      )}
                    >
                      +
                    </span>
                  )}
                </span>
              </button>

              {hasDetails && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={item.company}
                  inert={!expanded}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity,visibility] duration-500 ease-out-expo motion-reduce:transition-none",
                    expanded ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="m-0 flex list-none flex-col gap-3 p-0 pb-8 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-3 lg:pb-12">
                      {item.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-[15px] leading-[1.55] font-light text-ink-2 lg:col-span-7 lg:col-start-3 lg:text-[17px]"
                        >
                          <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-muted-ink" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
