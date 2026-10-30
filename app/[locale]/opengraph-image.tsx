import { notFound } from "next/navigation";
import { content } from "@/lib/content";
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
  const settings = await content.getSiteSettings(locale);
  return ogImage({
    kicker: settings.city,
    title: settings.name.full,
    subtitle: settings.description,
    name: settings.contact.availability,
    accent: ogAgentAccent,
  });
}
