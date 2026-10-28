import Link from "next/link";
import { ViewTransition } from "react";
import { accentStyle } from "@/components/site/project-accent";
import type { Dictionary } from "@/lib/dictionary";
import type { Research } from "@/lib/content/types";
import { localizedPath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = { items: Research[]; locale: Locale; dict: Dictionary["research"] };

const mono = "font-mono text-mono text-muted-ink";

const rowLink =
  "after:absolute after:inset-0 outline-offset-4 focus-visible:outline focus-visible:outline-agent after:content-['']";

const underline =
  "pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-(--project-accent) transition-transform duration-600 ease-in-out-quart group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none";

const slide =
  "transition-transform duration-500 ease-out-expo group-hover:translate-x-3 group-focus-within:translate-x-3 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-focus-within:translate-x-0";

/*
 * A transformed element becomes the containing block of an absolutely
 * positioned child, so the slide sits on a span inside the link and the link's
 * ::after still covers the whole row.
 */

/**
 * Research on the home page: the thesis leads, the papers follow. Every row is
 * one link to its reading page; a paper's PDF is a separate link above it.
 */
export function ResearchList({ items, locale, dict }: Props) {
  const thesis = items.filter((item) => item.type === "thesis");
  const papers = items.filter((item) => item.type === "paper");
  if (items.length === 0) return null;

  return (
    <section id="research" aria-labelledby="research-heading" className="scroll-mt-24 py-24 lg:py-30">
      <div className="mb-10 border-t border-ink pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>03 — {dict.kicker}</span>
        <h2 id="research-heading" className="font-serif text-h2 lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>

      {thesis.length > 0 && (
        <ul className="m-0 list-none border-b border-hairline p-0">
          {thesis.map((item) => (
            <li
              key={item.slug}
              className="project-accent group relative flex flex-col gap-3 border-t border-hairline py-6 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:py-10"
              style={accentStyle(item.accent)}
            >
              <span className="flex justify-between font-mono text-[11px] text-(--project-accent) lg:col-span-2 lg:flex-col lg:justify-start lg:gap-1.5 lg:text-mono">
                <span>{dict.thesis}</span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-(--project-accent)" />
                  {item.status}
                </span>
              </span>
              <h3 className={cn("font-serif text-[52px] leading-[0.95] lg:col-span-5 lg:text-[64px]")}>
                <Link
                  href={localizedPath(`/research/${item.slug}`, locale)}
                  aria-label={`${item.title} ${item.titleEmphasis}, ${dict.openCaseFor}`}
                  className={rowLink}
                >
                  <ViewTransition name={`research-${item.slug}`} share="project-morph" default="none">
                    <span className={cn("block w-fit", slide)}>
                      {item.title} <em>{item.titleEmphasis}</em>
                    </span>
                  </ViewTransition>
                </Link>
              </h3>
              <p className="text-[15px] font-light leading-normal text-ink-2 lg:col-span-3 lg:text-[16px]">{item.summary}</p>
              <span className={cn(mono, "hidden whitespace-nowrap lg:col-span-1 lg:block")}>{item.period}</span>
              <span
                aria-hidden="true"
                className="flex min-h-11 items-center justify-between font-mono text-mono text-agent lg:col-span-1 lg:justify-end lg:gap-2.5 lg:text-ink"
              >
                <span className="lg:hidden">{dict.readTheResearch}</span>
                <span className="hidden whitespace-nowrap opacity-0 transition-[opacity,transform] duration-400 ease-out-expo group-hover:opacity-100 group-focus-within:opacity-100 lg:inline">
                  {dict.openCase}
                </span>
                <span className="text-lg transition-[color,transform] duration-400 ease-out-expo group-hover:-rotate-45 group-hover:text-agent lg:text-[22px]">
                  →
                </span>
              </span>
              <span aria-hidden="true" className={underline} />
            </li>
          ))}
        </ul>
      )}

      {papers.length > 0 && (
        <>
          <h3 className={cn(mono, "mt-10 mb-1.5 font-normal lg:mt-14 lg:mb-2")}>{dict.papers}</h3>
          <ul className="m-0 list-none border-b border-hairline p-0">
            {papers.map((item) => (
              <li
                key={item.slug}
                className="project-accent group relative flex flex-col gap-2.5 border-t border-hairline py-5 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:py-7.5"
                style={accentStyle(item.accent)}
              >
                <span className="flex justify-between font-mono text-[11px] text-muted-ink lg:col-span-2 lg:text-mono">
                  <span>{item.number}</span>
                  <span className="lg:hidden">
                    {dict.paper} · {item.period}
                  </span>
                </span>
                <h4 className={cn("font-serif text-[30px] leading-[1.05] lg:col-span-5 lg:text-[36px]")}>
                  <Link
                    href={localizedPath(`/research/${item.slug}`, locale)}
                    aria-label={`${item.title}, ${dict.readFor}`}
                    className={rowLink}
                  >
                    <ViewTransition name={`research-${item.slug}`} share="project-morph" default="none">
                      <span className={cn("block w-fit", slide)}>{item.title}</span>
                    </ViewTransition>
                  </Link>
                </h4>
                <p className="text-[14px] font-light leading-normal text-ink-2 lg:col-span-3 lg:pr-4 lg:text-[15px]">{item.summary}</p>
                <span className={cn(mono, "hidden whitespace-nowrap lg:col-span-1 lg:block")}>
                  {dict.paper} · {item.period}
                </span>
                <span className="relative z-10 flex gap-5 font-mono text-mono lg:col-span-1 lg:flex-col lg:items-end lg:gap-0">
                  <span aria-hidden="true" className="flex min-h-11 items-center gap-2 lg:min-h-8">
                    {dict.read} <span className="transition-colors duration-300 group-hover:text-agent">→</span>
                  </span>
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      download
                      aria-label={`${item.title}, ${dict.downloadPdfFor}`}
                      className="flex min-h-11 items-center gap-2 text-muted-ink outline-offset-2 transition-colors hover:text-agent focus-visible:outline focus-visible:outline-agent lg:min-h-8"
                    >
                      {dict.pdf} <span aria-hidden="true">↓</span>
                    </a>
                  )}
                </span>
                <span aria-hidden="true" className={underline} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
