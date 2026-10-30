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

type Follow = { x: number; y: number; tx: number; ty: number; raf: number };
const follows = new WeakMap<HTMLElement, Follow>();

const cardOf = (row: HTMLElement) =>
  row.querySelector<HTMLElement>("[data-follow]");

function paint(card: HTMLElement, f: Follow) {
  card.style.translate = `${f.x}px ${f.y}px`;
}

/** Moves the card's target; `snap` jumps there, otherwise it eases after the cursor. */
function moveCard(row: HTMLElement, tx: number, ty: number, snap: boolean) {
  const card = cardOf(row);
  if (!card) return;
  const f = follows.get(card) ?? { x: tx, y: ty, tx, ty, raf: 0 };
  follows.set(card, f);
  f.tx = tx;
  f.ty = ty;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (snap || still) {
    cancelAnimationFrame(f.raf);
    f.raf = 0;
    f.x = tx;
    f.y = ty;
    paint(card, f);
    return;
  }
  if (f.raf) return;
  const step = () => {
    f.x += (f.tx - f.x) * 0.2;
    f.y += (f.ty - f.y) * 0.2;
    paint(card, f);
    f.raf =
      Math.abs(f.tx - f.x) + Math.abs(f.ty - f.y) > 0.5
        ? requestAnimationFrame(step)
        : 0;
  };
  f.raf = requestAnimationFrame(step);
}

/** Card sits above-right of the cursor, kept inside the row's width and below the viewport top. */
function followCursor(e: React.PointerEvent<HTMLElement>, snap: boolean) {
  if (e.pointerType === "touch") return;
  const row = e.currentTarget;
  const card = cardOf(row);
  if (!card) return;
  const rect = row.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const x = Math.min(Math.max(mx + 20, 0), rect.width - card.offsetWidth);
  const above = my - card.offsetHeight - 16;
  const y = rect.top + above >= 8 ? above : my + 24;
  moveCard(row, x, y, snap);
}

/** Keyboard focus has no cursor: park the card at the right of the row. */
function parkCard(e: React.FocusEvent<HTMLElement>) {
  const row = e.currentTarget;
  const card = cardOf(row);
  if (!card || row.matches(":hover")) return;
  moveCard(
    row,
    row.clientWidth - card.offsetWidth - 120,
    -card.offsetHeight - 12,
    true
  );
}

/**
 * Selected work. From lg up a row is one link: hovering draws a hairline in the
 * project accent, slides the name and shows the dark card. Below lg a row is a
 * button that expands the card inline, with an "Open case" link inside it.
 */
export function SelectedWork({ projects, locale, dict }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  if (projects.length === 0) return null;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="scroll-mt-24 py-24 lg:py-30"
    >
      <div className="border-ink mb-10 border-t pt-3.5 lg:mb-18 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
        <span className={cn(mono, "mb-3.5 block lg:col-span-2 lg:mb-0")}>
          02 — {dict.kicker}
        </span>
        <h2 id="work-heading" className="text-h2 font-serif lg:col-span-8">
          {dict.headingBefore} <em>{dict.headingEmphasis}</em>
          {dict.headingAfter}
        </h2>
      </div>

      <ul className="border-hairline m-0 flex list-none flex-col border-b p-0">
        {projects.map((project) => {
          const href = localizedPath(`/work/${project.slug}`, locale);
          const expanded = open === project.slug;
          return (
            <li
              key={project.slug}
              className="project-accent border-hairline border-t"
              style={accentStyle(project.accent)}
            >
              {/* Desktop: the whole row is the link. */}
              <Link
                href={href}
                onPointerEnter={(e) => followCursor(e, true)}
                onPointerMove={(e) => followCursor(e, false)}
                onFocus={parkCard}
                className="group focus-visible:outline-agent relative hidden grid-cols-12 items-baseline gap-x-6 py-7.5 outline-offset-4 focus-visible:outline lg:grid"
              >
                <span className={cn(mono, "col-span-2")}>{project.number}</span>
                <ViewTransition
                  name={`project-${project.slug}`}
                  share="project-morph"
                  default="none"
                >
                  <span className="ease-out-expo col-span-4 font-serif text-[52px] leading-none transition-transform duration-500 group-hover:translate-x-3 group-focus-visible:translate-x-3 motion-reduce:transition-none">
                    {project.title}
                  </span>
                </ViewTransition>
                <span className="text-ui text-ink-2 col-span-3 pr-4 font-light">
                  {project.oneLiner}
                </span>
                <span className={cn(mono, "col-span-2 whitespace-nowrap")}>
                  {project.kind} · {project.year}
                </span>
                <span className="text-mono text-ink col-span-1 flex items-center gap-2.5 justify-self-end font-mono">
                  <span className="ease-out-expo translate-x-2 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-400 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
                    {dict.openCase}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ease-out-expo group-hover:text-agent group-focus-visible:text-agent inline-flex size-11 items-center justify-center text-[22px] transition-[color,transform] duration-400 group-hover:-rotate-45 group-focus-visible:-rotate-45 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="ease-in-out-quart absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-(--project-accent) transition-transform duration-600 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                />
                <span
                  data-testid="hover-card"
                  data-follow=""
                  aria-hidden="true"
                  className="rounded-card bg-card-ink ease-out-expo pointer-events-none absolute top-0 left-0 z-10 flex w-95 translate-y-3 scale-[.96] flex-col border border-[#262626] px-4.5 py-4 text-[#eceae4] opacity-0 shadow-[0_30px_60px_-20px_rgba(20,20,20,.45),0_2px_6px_rgba(20,20,20,.12)] blur-[6px] transition-[opacity,transform,filter] duration-450 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:blur-none group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:blur-none motion-reduce:transition-none"
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
                  className="focus-visible:outline-agent flex min-h-11 w-full cursor-pointer flex-col gap-2 py-5.5 text-left outline-offset-4 focus-visible:outline"
                >
                  <span className="text-muted-ink flex justify-between font-mono text-[11px]">
                    <span>{project.number}</span>
                    <span>
                      {project.kind} · {project.year}
                    </span>
                  </span>
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-serif text-[38px] leading-none">
                      {project.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "ease-out-expo text-xl transition-[transform,color] duration-400",
                        expanded && "text-agent rotate-90"
                      )}
                    >
                      →
                    </span>
                  </span>
                  <span className="text-ink-2 text-[15px] leading-snug font-light">
                    {project.oneLiner}
                  </span>
                </button>
                {expanded && (
                  <div
                    id={`card-${project.slug}`}
                    className="animate-fade-in rounded-card bg-card-ink mb-5.5 flex flex-col gap-3 p-4 text-[#eceae4]"
                  >
                    <CardBody project={project} dict={dict} />
                    <Link
                      href={href}
                      className="bg-agent text-ui text-primary-foreground flex min-h-12 items-center justify-between rounded-full px-4"
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
function CardBody({
  project,
  dict,
}: {
  project: Project;
  dict: Dictionary["work"];
}) {
  return (
    <>
      <span className="flex justify-between font-mono text-[11px] text-[#8e8c86]">
        <span>
          {dict.fig} {project.number}
        </span>
        <span>{project.kind}</span>
      </span>
      <ProjectFigure variant="card" />
      <span className="text-small mt-3.5 block border-t border-[#2a2a2a] pt-3.5 leading-relaxed font-light text-[#d9d7d1]">
        {project.summary}
      </span>
      <span className="mt-3.5 flex items-center justify-between gap-3">
        <span className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#333] px-2.25 py-1 font-mono text-[11px] text-[#eceae4]"
            >
              {tag}
            </span>
          ))}
        </span>
        <span className="font-mono text-[11px] text-[#8e8c86]">
          {project.status}
        </span>
      </span>
    </>
  );
}
