import type { Metadata } from "next";
import { defaultLocale, localizedPath, locales, type Locale } from "@/lib/i18n";

const openGraphLocales: Record<Locale, string> = { en: "en_US", de: "de_DE" };

/** The same path in every language, for hreflang links and the sitemap. */
export function languageAlternates(path: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, localizedPath(path, locale)])
  ) as Record<Locale, string>;
}

/**
 * Metadata shared by every page. URLs are relative to the metadataBase set in
 * the locale layout. The image comes from the route's opengraph-image file.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  siteName,
  type = "website",
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  siteName: string;
  type?: "website" | "article";
}): Metadata {
  const url = localizedPath(path, locale);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(path),
        "x-default": localizedPath(path, defaultLocale),
      },
    },
    openGraph: {
      type,
      siteName,
      title,
      description,
      url,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => openGraphLocales[other]),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
