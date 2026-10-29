import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { accentStyle } from "@/components/site/project-accent";
import { ProjectFigure } from "@/components/site/project-figure";
import { content } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, localizedPath, locales } from "@/lib/i18n";

type Params = { locale: string; slug: string };

const mono = "font-mono text-mono text-muted-ink";

export async function generateStaticParams() {
  const projects = await content.getProjects("en");
  return locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = await content.getProject(locale, slug);
  return page
    ? { title: page.project.title, description: page.project.summary }
    : {};
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = await content.getProject(locale, slug);
  if (!page) notFound();

  const { project, index, total, next } = page;
  const dict = getDictionary(locale).work;
  const pad = (n: number) => String(n).padStart(2, "0");
  const meta = [
    { label: dict.role, value: project.meta.role },
    { label: dict.client, value: project.meta.client },
    { label: dict.stack, value: project.meta.stack },
    { label: dict.status, value: project.statusDetail },
  ];

  return (
    <main
      id="main"
      className="project-accent px-5 pt-32 pb-18 md:px-10 lg:px-16 lg:pt-44 lg:pb-24"
      style={accentStyle(project.accent)}
    >
      <div className="text-mono text-muted-ink flex items-center justify-between font-mono lg:grid lg:grid-cols-12 lg:gap-x-6">
        <Link
          href={localizedPath("/#work", locale)}
          className="text-ink flex min-h-11 items-center hover:text-(--project-accent) lg:col-span-2"
        >
          ← {dict.back}
        </Link>
        <span className="lg:col-span-2 lg:col-start-6">
          {dict.project} {pad(index + 1)} / {pad(total)}
        </span>
      </div>

      <section className="mt-16 flex flex-col gap-5 lg:mt-30 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-10">
        <span className="text-mono flex flex-col gap-1.5 font-mono text-(--project-accent) lg:col-span-2 lg:self-end">
          <ViewTransition
            name={`project-${project.slug}`}
            share="project-morph"
            default="none"
          >
            <span className="text-ink w-fit">{project.title}</span>
          </ViewTransition>
          <span>
            ● {project.kind} · {project.year}
          </span>
        </span>
        <h1 className="font-serif text-[clamp(3.25rem,1.39rem+7.62vw,8.25rem)] leading-[0.94] tracking-[-0.015em] lg:col-span-10">
          {project.headline} <em>{project.headlineEmphasis}</em>.
        </h1>
        <dl className="border-hairline mt-6 grid grid-cols-2 gap-x-4 gap-y-4.5 border-t pt-4 lg:col-span-10 lg:col-start-3 lg:mt-0 lg:grid-cols-4 lg:gap-x-6 lg:pt-4.5">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className={mono}>{item.label}</dt>
              <dd className="mt-1.5 text-[14px] lg:text-[15px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="-mx-5 mt-10 md:-mx-10 lg:mx-0 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-x-6">
        <figure className="lg:rounded-media relative flex h-90 items-center justify-center border-y border-(--project-accent)/25 bg-(--project-accent)/6 lg:col-span-9 lg:h-155 lg:border">
          <ProjectFigure variant="page" className="max-w-80 lg:max-w-130" />
          <figcaption className="lg:text-mono absolute right-5 bottom-3.5 left-5 font-mono text-[11px] text-(--project-accent) lg:right-auto lg:bottom-4 lg:left-4.5">
            {dict.fig} {project.number} — {dict.figureCaption}
          </figcaption>
        </figure>
        <aside className="text-muted-ink lg:text-mono mt-3.5 flex justify-between gap-3 px-5 font-mono text-[11px] md:px-10 lg:col-span-3 lg:mt-0 lg:flex-col lg:justify-start lg:gap-4.5 lg:px-0 lg:pt-2">
          <span className="hidden lg:block">{dict.readout.toUpperCase()}</span>
          {[
            [dict.kind, project.kind],
            [dict.year, project.year],
            [dict.status, project.status],
          ].map(([label, value]) => (
            <div
              key={label}
              className="lg:border-hairline flex gap-2 lg:justify-between lg:border-t lg:pt-2.5"
            >
              <span>{label}</span>
              <span className="text-ink">{value}</span>
            </div>
          ))}
        </aside>
      </section>

      <section className="mt-18 flex flex-col gap-10 lg:mt-30 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-14">
        <span className={`${mono} lg:col-span-2`}>{dict.problem}</span>
        <p className="text-lg leading-relaxed font-light lg:col-span-6 lg:col-start-3 lg:text-[22px] lg:leading-[1.55]">
          {project.problem}
        </p>
        <span className={`${mono} lg:col-span-2 lg:col-start-1`}>
          {dict.built}
        </span>
        <div className="flex flex-col items-start gap-8 lg:col-span-6 lg:col-start-3">
          <p className="text-lg leading-relaxed font-light lg:text-[22px] lg:leading-[1.55]">
            {project.built}
          </p>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-mono hover:text-background inline-flex min-h-11 items-center gap-2 rounded-full border border-(--project-accent) px-5 font-mono text-(--project-accent) transition-colors hover:bg-(--project-accent)"
            >
              {dict.visitLive} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </section>

      {project.stats.length > 0 && (
        <section className="border-ink mt-18 border-t pt-3.5 lg:mt-30 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-4.5">
          <span className={`${mono} mb-7 block lg:col-span-2 lg:mb-0`}>
            {dict.outcome}
          </span>
          <ul className="m-0 flex list-none flex-col gap-7 p-0 lg:col-span-10 lg:grid lg:grid-cols-3 lg:gap-x-6">
            {project.stats.map((stat) => (
              <li key={stat.id} className="flex flex-col gap-1.5 lg:gap-2.5">
                <span
                  className={`font-serif text-[56px] leading-none lg:text-[72px] ${stat.accent ? "text-(--project-accent)" : ""}`}
                >
                  {stat.value}
                </span>
                <span className="text-ink-2 text-[14px] lg:text-[15px]">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={localizedPath(`/work/${next.slug}`, locale)}
        className="group border-ink mt-18 flex flex-col gap-2 border-t pt-4 lg:mt-35 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:pt-5.5"
      >
        <span className={`${mono} lg:col-span-2`}>{dict.nextProject}</span>
        <span className="ease-out-expo font-serif text-[44px] leading-none transition-transform duration-500 group-hover:translate-x-3 motion-reduce:transition-none lg:col-span-10 lg:text-[72px]">
          {next.title} →
        </span>
      </Link>
    </main>
  );
}
