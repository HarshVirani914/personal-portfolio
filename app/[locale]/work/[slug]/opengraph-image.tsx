import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
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
    title: `${project.headline} ${project.headlineEmphasis}.`,
    name: settings.name.full,
    accent: project.accent.dark,
  });
}
