import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { ogHomeImage, ogImageMetadata } from "@/lib/og-image";

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
  const settings = await content.getSiteSettings(locale);
  return ogImageMetadata(`${settings.name.full}: ${settings.description}`);
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, home] = await Promise.all([
    content.getSiteSettings(locale),
    content.getHome(locale),
  ]);
  const [role, focus] = home.hero.annotations;
  return ogHomeImage({
    first: settings.name.first,
    last: settings.name.last,
    role: role?.text ?? "",
    coordinates: settings.coordinates,
    focus: focus?.text ?? "",
  });
}
