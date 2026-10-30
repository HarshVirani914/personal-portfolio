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
    content.getResearchItem(locale, slug),
    content.getSiteSettings(locale),
  ]);
  if (!page) notFound();
  const { item } = page;
  return ogImage({
    kicker: item.kicker,
    title: `${item.title} ${item.titleEmphasis}`.trim(),
    name: settings.name.full,
    accent: item.accent.dark,
  });
}
