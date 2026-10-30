import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales } from "@/lib/i18n";
import { ogAgentAccent, ogImage, ogImageMetadata } from "@/lib/og-image";

type Params = { locale: string };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return [];
  const about = await content.getAbout(locale);
  return ogImageMetadata(about.headline.map((part) => part.text).join(""));
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [about, settings] = await Promise.all([
    content.getAbout(locale),
    content.getSiteSettings(locale),
  ]);
  return ogImage({
    kicker: getDictionary(locale).about.kicker,
    title: about.headline,
    name: settings.name.full,
    accent: ogAgentAccent,
  });
}
