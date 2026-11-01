import type { Metadata } from "next";
import { defaultLocale, localizedPath, locales, type Locale } from "@/lib/i18n";

const openGraphLocales: Record<Locale, string> = { en: "en_US", de: "de_DE" };

/** Search results and link cards cut descriptions off at about this length. */
const maxDescription = 155;

/** Shortens text at a word boundary so it never ends mid-word. */
export function clipDescription(text: string): string {
  if (text.length <= maxDescription) return text;
  const cut = text.slice(0, maxDescription - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

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
  const summary = clipDescription(description);
  return {
    title,
    description: summary,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(path),
        "x-default": localizedPath(path, defaultLocale),
      },
      types: { "text/markdown": "/llms.txt" },
    },
    openGraph: {
      type,
      siteName,
      title,
      description: summary,
      url,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => openGraphLocales[other]),
    },
    twitter: { card: "summary_large_image", title, description: summary },
  };
}
