import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { ogImage, ogImageMetadata } from "@/lib/og-image";

type Params = { locale: string; slug: string };

export async function generateStaticParams() {
  const research = await content.getResearch("en");
  return locales.flatMap((locale) =>
    research.map((item) => ({ locale, slug: item.slug }))
  );
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return [];
  const page = await content.getResearchItem(locale, slug);
  if (!page) return [];
  return ogImageMetadata(
    `${page.item.title} ${page.item.titleEmphasis}`.trim()
  );
}

export default async function Image({ params }: { params: Promise<Params> }) {
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
    title: [
      { text: item.title, emphasis: false },
      { text: item.titleEmphasis, emphasis: true },
    ],
    subtitle: item.standfirst,
    name: settings.name.full,
    accent: item.accent.dark,
  });
}
