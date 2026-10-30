import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { ogAgentAccent, ogContentType, ogImage, ogSize } from "@/lib/og-image";

export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [about, settings] = await Promise.all([
    content.getAbout(locale),
    content.getSiteSettings(locale),
  ]);
  return ogImage({
    kicker: getDictionary(locale).about.kicker,
    title: about.headline.map((part) => part.text).join(""),
    name: settings.name.full,
    accent: ogAgentAccent,
  });
}
