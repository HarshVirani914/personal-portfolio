import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { localizedPath, locales, type Locale } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, research] = await Promise.all([
    content.getProjects("en"),
    content.getResearch("en"),
  ]);
  const site = getSiteUrl();
  const paths = [
    "/",
    "/about",
    ...projects.map((project) => `/work/${project.slug}`),
    ...research.map((item) => `/research/${item.slug}`),
  ];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([locale, href]) => [
        locale,
        `${site}${href}`,
      ])
    );
    return locales.map((locale: Locale) => ({
      url: `${site}${localizedPath(path, locale)}`,
      alternates: { languages },
    }));
  });
}
