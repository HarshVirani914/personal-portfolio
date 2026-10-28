"use client";

import Link from "next/link";
import { useState, ViewTransition } from "react";
import { accentStyle } from "@/components/site/project-accent";
import { ProjectFigure } from "@/components/site/project-figure";
import type { Dictionary } from "@/lib/dictionary";
import type { Project } from "@/lib/content/types";
import { localizedPath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = { projects: Project[]; locale: Locale; dict: Dictionary["work"] };

const mono = "font-mono text-mono text-muted-ink";

/**
 * Selected work. From lg up a row is one link: hovering draws a hairline in the
 * project accent, slides the name and shows the dark card. Below lg a row is a
 * button that expands the card inline, with an "Open case" link inside it.
 */
export function SelectedWork({ projects, locale, dict }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  if (projects.length === 0) return null;

  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-24 py-24 lg:py-30">
      <div className="mb-10 border-t border-ink pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>02 — {dict.kicker}</span>
        <h2 id="work-heading" className="font-serif text-h2 lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>

      <ul className="m-0 flex list-none flex-col border-b border-hairline p-0">
        {projects.map((project) => {
          const href = localizedPath(`/work/${project.slug}`, locale);
          const expanded = open === project.slug;
          return (
            <li key={project.slug} className="project-accent border-t border-hairline" style={accentStyle(project.accent)}>
              {/* Desktop: the whole row is the link. */}
              <Link
                href={href}
                aria-label={`${project.title}, ${dict.openCaseFor}`}
                className="group relative hidden grid-cols-12 items-baseline gap-x-6 py-7.5 outline-offset-4 focus-visible:outline focus-visible:outline-agent lg:grid"
              >
                <span className={cn(mono, "col-span-2")}>{project.number}</span>
                <ViewTransition name={`project-${project.slug}`} share="project-morph" default="none">
                  <span className="col-span-4 font-serif text-[52px] leading-none transition-transform duration-500 ease-out-expo group-hover:translate-x-3 group-focus-visible:translate-x-3 motion-reduce:transition-none">
                    {project.title}
                  </span>
                </ViewTransition>
                <span className="col-span-3 pr-4 text-ui font-light text-ink-2">{project.oneLiner}</span>
                <span className={cn(mono, "col-span-2 whitespace-nowrap")}>
                  {project.kind} · {project.year}
                </span>
                <span className="col-span-1 flex items-center justify-self-end gap-2.5 font-mono text-mono text-ink">
                  <span className="translate-x-2 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-400 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    {dict.openCase}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center text-[22px] transition-[color,transform] duration-400 ease-out-expo group-hover:-rotate-45 group-hover:text-agent group-focus-visible:-rotate-45 group-focus-visible:text-agent motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-(--project-accent) transition-transform duration-600 ease-in-out-quart group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                />
                <span
                  data-testid="hover-card"
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-37.5 right-[min(220px,15vw)] z-10 flex w-95 translate-y-3 scale-[.96] flex-col rounded-card border border-[#262626] bg-card-ink px-4.5 py-4 text-[#eceae4] opacity-0 blur-[6px] shadow-[0_30px_60px_-20px_rgba(20,20,20,.45),0_2px_6px_rgba(20,20,20,.12)] transition-[opacity,transform,filter] duration-450 ease-out-expo group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-none group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:blur-none motion-reduce:transition-none"
                >
                  <CardBody project={project} dict={dict} />
                </span>
              </Link>

              {/* Mobile and tablet: tap to expand. */}
              <div className="lg:hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`card-${project.slug}`}
                  onClick={() => setOpen(expanded ? null : project.slug)}
                  className="flex min-h-11 w-full cursor-pointer flex-col gap-2 py-5.5 text-left outline-offset-4 focus-visible:outline focus-visible:outline-agent"
                >
                  <span className="flex justify-between font-mono text-[11px] text-muted-ink">
                    <span>{project.number}</span>
                    <span>
                      {project.kind} · {project.year}
                    </span>
                  </span>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-serif text-[38px] leading-none">{project.title}</span>
                    <span
                      aria-hidden="true"
                      className={cn("text-xl transition-[transform,color] duration-400 ease-out-expo", expanded && "rotate-90 text-agent")}
                    >
                      →
                    </span>
                  </span>
                  <span className="text-[15px] font-light leading-snug text-ink-2">{project.oneLiner}</span>
                </button>
                {expanded && (
                  <div
                    id={`card-${project.slug}`}
                    className="animate-fade-in mb-5.5 flex flex-col gap-3 rounded-card bg-card-ink p-4 text-[#eceae4]"
                  >
                    <CardBody project={project} dict={dict} />
                    <Link
                      href={href}
                      className="flex min-h-12 items-center justify-between rounded-full bg-agent px-4 text-ui text-primary-foreground"
                    >
                      {dict.openCase} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Figure, summary, stack tags and status: the same card on desktop hover and mobile expand. */
function CardBody({ project, dict }: { project: Project; dict: Dictionary["work"] }) {
  return (
    <>
      <span className="flex justify-between font-mono text-[11px] text-[#8e8c86]">
        <span>
          {dict.fig} {project.number}
        </span>
        <span>{project.kind}</span>
      </span>
      <ProjectFigure variant="card" />
      <span className="mt-3.5 block border-t border-[#2a2a2a] pt-3.5 text-small font-light leading-relaxed text-[#d9d7d1]">
        {project.summary}
      </span>
      <span className="mt-3.5 flex items-center justify-between gap-3">
        <span className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[#333] px-2.25 py-1 font-mono text-[11px] text-[#eceae4]">
              {tag}
            </span>
          ))}
        </span>
        <span className="font-mono text-[11px] text-[#8e8c86]">{project.status}</span>
      </span>
    </>
  );
}
