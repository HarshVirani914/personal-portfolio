import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, ViewTransition } from "react";
import { accentStyle } from "@/components/site/project-accent";
import { ProjectFigure } from "@/components/site/project-figure";
import {
  AskButton,
  CiteButton,
  ContentsBar,
  ContentsRail,
  Paragraph,
  ReadingProgress,
  type ContentsItem,
} from "@/components/site/research-reader";
import { content } from "@/lib/content";
import type { ResearchBlock } from "@/lib/content/types";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { isLocale, localizedPath, locales, type Locale } from "@/lib/i18n";

type Params = { locale: string; slug: string };

const mono = "font-mono text-mono text-muted-ink";
const bleed = "-mx-5 md:-mx-10 lg:mx-0";

export async function generateStaticParams() {
  const items = await content.getResearch("en");
  return locales.flatMap((locale) => items.map((item) => ({ locale, slug: item.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = await content.getResearchItem(locale, slug);
  if (!page) return {};
  const title = `${page.item.title} ${page.item.titleEmphasis}`.trim();
  return { title, description: page.item.standfirst };
}

function formatUpdated(iso: string, locale: Locale): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

/** Lines that start with # or → are quiet commentary, ✓ is a success line. */
function codeLineClass(line: string): string {
  if (line.startsWith("#") || line.startsWith("→")) return "text-[#8e8c86]";
  if (line.startsWith("✓")) return "text-[#7fb8a9]";
  return "";
}

function Block({ block, dict }: { block: ResearchBlock; dict: Dictionary["research"] }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <Paragraph
          text={block.text}
          note={block.note}
          noteNumber={block.noteNumber}
          labels={{ note: dict.note, show: dict.showNote, hide: dict.hideNote, reference: dict.references }}
        />
      );
    case "code":
      return (
        <figure className={`${bleed} lg:col-span-6`}>
          <pre className="m-0 overflow-x-auto bg-card-ink px-5 py-4.5 font-mono text-[12px] leading-[1.7] text-[#eceae4] lg:rounded-card lg:px-6 lg:py-5.5 lg:text-[13px]">
            <code>
              {block.code.split("\n").map((line, i) => (
                <span key={i} className={`block ${codeLineClass(line)}`}>
                  {line || " "}
                </span>
              ))}
            </code>
          </pre>
          {block.caption && <figcaption className={`${mono} px-5 pt-2.5 md:px-10 lg:px-0`}>{block.caption}</figcaption>}
        </figure>
      );
    case "figure":
      return (
        <figure data-testid="research-figure" className={`${bleed} flex flex-col gap-2.5 lg:col-span-6 lg:gap-3`}>
          <div
            role="img"
            aria-label={dict.figureLabel}
            className="flex h-65 items-center justify-center border-y border-(--project-accent)/25 bg-(--project-accent)/6 lg:h-95 lg:rounded-media lg:border"
          >
            <ProjectFigure variant="page" className="max-w-64 lg:max-w-110" />
          </div>
          <figcaption className={`${mono} px-5 md:px-10 lg:px-0`}>
            {dict.figure} {block.number} — {block.caption}
          </figcaption>
        </figure>
      );
    case "quote":
      return (
        <blockquote className="m-0 border-l border-(--project-accent) py-1 pl-5 font-serif text-[28px] leading-[1.15] lg:col-span-6 lg:py-3 lg:pl-6.5 lg:text-[36px]">
          {block.text}
        </blockquote>
      );
  }
}

export default async function ResearchPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [page, settings] = await Promise.all([content.getResearchItem(locale, slug), content.getSiteSettings(locale)]);
  if (!page) notFound();

  const { item, next } = page;
  const dict = getDictionary(locale).research;
  const updated = item.updated ? formatUpdated(item.updated, locale) : "";
  const back = { href: localizedPath("/#research", locale), label: dict.back };
  const nextTitle = `${next.title} ${next.titleEmphasis}`.trim();

  const contents: ContentsItem[] = [
    { id: "abstract", number: "00", label: dict.abstract },
    ...item.sections.map((section) => ({ id: `s-${section.id}`, number: section.number, label: section.heading })),
    ...(item.references.length > 0 ? [{ id: "references", number: "—", label: dict.references }] : []),
  ];

  return (
    <main
      id="main"
      className="project-accent px-5 pt-26 pb-18 md:px-10 lg:px-16 lg:pt-40 lg:pb-24"
      style={accentStyle(item.accent)}
    >
      <ReadingProgress targetId="article" label={dict.progress} />
      <ContentsBar items={contents} back={back} label={dict.contents} jumpLabel={dict.jumpTo} />

      <div className="hidden font-mono text-mono lg:grid lg:grid-cols-12 lg:gap-x-6">
        <Link href={back.href} className="flex min-h-11 items-center text-ink hover:text-(--project-accent) lg:col-span-2">
          ← {back.label}
        </Link>
      </div>

      <header className="mt-10 flex flex-col gap-5 lg:mt-22 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-7">
        <p className="m-0 font-mono text-[11px] text-(--project-accent) lg:col-span-6 lg:col-start-4 lg:text-mono">● {item.kicker}</p>
        <h1 className="font-serif text-[clamp(3.75rem,2.9rem+3.5vw,6.5rem)] leading-[0.95] tracking-[-0.015em] lg:col-span-8 lg:col-start-4">
          <ViewTransition name={`research-${item.slug}`} share="project-morph" default="none">
            <span className="block w-fit">
              {item.title} {item.titleEmphasis && <em>{item.titleEmphasis}</em>}
            </span>
          </ViewTransition>
        </h1>
        <p className="m-0 text-[19px] font-light leading-[1.45] text-ink-2 lg:col-span-6 lg:col-start-4 lg:text-[24px]">
          {item.standfirst}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-y border-hairline py-3 font-mono text-[11px] text-muted-ink lg:col-span-8 lg:col-start-4 lg:gap-x-7 lg:py-3.5 lg:text-mono">
          <span className="flex min-h-6 items-center text-ink">{settings.name.full}</span>
          {item.supervisor && (
            <span className="flex min-h-6 items-center">
              {dict.supervisor} · {item.supervisor}
            </span>
          )}
          {updated && (
            <span className="flex min-h-6 items-center">
              {dict.updated} {updated}
            </span>
          )}
          <span className="flex min-h-6 items-center">
            {item.readingMinutes} {dict.minRead}
          </span>
          {item.pdfUrl && (
            <a href={item.pdfUrl} download className="flex min-h-11 items-center gap-1.5 hover:text-ink lg:min-h-0">
              {dict.pdf} <span aria-hidden="true">↓</span>
            </a>
          )}
          <span className="flex gap-x-5 lg:ml-auto lg:gap-x-7">
            {item.cite && <CiteButton text={item.cite} label={dict.cite} doneLabel={dict.copied} />}
            <AskButton label={dict.ask} topic={item.slug} />
          </span>
        </div>
      </header>

      <div className="mt-10 lg:mt-20 lg:grid lg:grid-cols-12 lg:gap-x-6">
        <ContentsRail items={contents} label={dict.contents} />

        <article
          id="article"
          className="flex flex-col gap-6 text-body font-light lg:col-span-9 lg:col-start-4 lg:grid lg:grid-cols-9 lg:gap-x-6 lg:gap-y-7"
        >
          <section
            id="abstract"
            aria-labelledby="abstract-label"
            className="scroll-mt-32 rounded-media bg-surface p-5 lg:col-span-6 lg:scroll-mt-28 lg:px-7 lg:py-6.5"
          >
            <span id="abstract-label" className={`${mono} mb-2.5 block`}>
              {dict.abstract}
            </span>
            <p className="m-0 text-[15px] leading-[1.65] lg:text-[17px]">{item.abstract}</p>
          </section>

          {item.sections.map((section) => (
            <Fragment key={section.id}>
              <h2
                id={`s-${section.id}`}
                className="mt-6 scroll-mt-32 font-serif text-[32px] leading-[1.1] font-normal lg:col-span-6 lg:mt-8 lg:scroll-mt-28 lg:text-[40px]"
              >
                <span className="mr-2.5 font-mono text-mono text-muted-ink">{section.number}</span>
                {section.heading}
              </h2>
              {section.blocks.map((block) => (
                <Block key={block.id} block={block} dict={dict} />
              ))}
            </Fragment>
          ))}

          {item.references.length > 0 && (
            <section
              id="references"
              aria-labelledby="references-label"
              className="mt-6 scroll-mt-32 border-t border-hairline pt-4.5 lg:col-span-6 lg:scroll-mt-28"
            >
              <h2 id="references-label" className={`${mono} mb-3 font-normal`}>
                {dict.references}
              </h2>
              <ol className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] leading-relaxed">
                {item.references.map((reference, i) => (
                  <li key={i} id={`ref-${i + 1}`} className="scroll-mt-32 lg:scroll-mt-28">
                    {i + 1}. {reference}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </div>

      <Link
        href={localizedPath(`/research/${next.slug}`, locale)}
        className="group mt-18 flex flex-col gap-2 border-t border-ink pt-4 lg:mt-30 lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-6 lg:pt-5.5"
      >
        <span className={`${mono} lg:col-span-2`}>{dict.nextInResearch}</span>
        <span className="font-serif text-[32px] leading-none transition-transform duration-500 ease-out-expo group-hover:translate-x-3 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 lg:col-span-8 lg:col-start-4 lg:text-[56px]">
          {nextTitle} →
        </span>
      </Link>
    </main>
  );
}
