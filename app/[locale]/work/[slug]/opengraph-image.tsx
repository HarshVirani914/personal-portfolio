import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { ogImage, ogImageMetadata } from "@/lib/og-image";

type Params = { locale: string; slug: string };

export async function generateStaticParams() {
  const projects = await content.getProjects("en");
  return locales.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug }))
  );
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return [];
  const page = await content.getProject(locale, slug);
  if (!page) return [];
  const { headline, headlineEmphasis } = page.project;
  return ogImageMetadata(`${headline} ${headlineEmphasis}.`);
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [page, settings] = await Promise.all([
    content.getProject(locale, slug),
    content.getSiteSettings(locale),
  ]);
  if (!page) notFound();
  const { project } = page;
  return ogImage({
    kicker: `${project.title} · ${project.kind} · ${project.year}`,
    title: [
      { text: project.headline, emphasis: false },
      { text: `${project.headlineEmphasis}.`, emphasis: true },
    ],
    name: settings.name.full,
    detail: project.oneLiner,
    accent: project.accent.dark,
  });
}
