import { fixtureData, createFixtureSource } from "@/lib/content/fixture";
import { resolveText, visibleInOrder } from "@/lib/content/localized";
import { createSanitySource, isSanityConfigured } from "@/lib/content/sanity-source";
import type { ContentSource } from "@/lib/content/source";
import type {
  HomeContent,
  Project,
  RawHero,
  RawSiteSettings,
  SiteSettings,
} from "@/lib/content/types";
import type { Locale } from "@/lib/i18n";

/**
 * The only way pages, metadata and the agent read content. Every getter takes
 * a locale and returns resolved, typed data: English fallback applied, hidden
 * items dropped, CMS order respected.
 */
export function createContent(source: ContentSource) {
  const settings = async (): Promise<RawSiteSettings> =>
    (await source.getSiteSettings()) ?? (fixtureData.siteSettings as RawSiteSettings);
  const hero = async (): Promise<RawHero> =>
    (await source.getHero()) ?? (fixtureData.hero as RawHero);

  const getProjects = async (locale: Locale): Promise<Project[]> =>
    visibleInOrder(await source.getProjects()).map((raw) => ({
      slug: raw.slug,
      title: resolveText(raw.title, locale),
      oneLiner: resolveText(raw.oneLiner, locale),
    }));

  return {
    async getSiteSettings(locale: Locale): Promise<SiteSettings> {
      const raw = await settings();
      return {
        name: {
          first: raw.firstName,
          last: raw.lastName,
          full: `${raw.firstName} ${raw.lastName}`,
        },
        coordinates: raw.coordinates,
        city: resolveText(raw.city, locale),
        description: resolveText(raw.description, locale),
      };
    },

    async getHome(locale: Locale): Promise<HomeContent> {
      const raw = await hero();
      return {
        hero: {
          annotations: visibleInOrder(raw.annotations).map((item, index) => ({
            id: item.id,
            marker: `[${String(index + 1).padStart(2, "0")}]`,
            text: resolveText(item.text, locale),
          })),
          terminal: visibleInOrder(raw.terminalScripts).map((script) => ({
            id: script.id,
            label: resolveText(script.label, locale),
            command: resolveText(script.command, locale),
            output: script.output.map((line) => resolveText(line, locale)),
          })),
        },
      };
    },

    getProjects,

    /** Returns null for an unknown or hidden slug; callers turn that into a 404. */
    async getProject(locale: Locale, slug: string): Promise<Project | null> {
      const projects = await getProjects(locale);
      return projects.find((project) => project.slug === slug) ?? null;
    },
  };
}

export type Content = ReturnType<typeof createContent>;

/** Sanity when it is configured, the fixture otherwise (tests, CI, local development). */
export function selectSource(): ContentSource {
  if (process.env.CONTENT_SOURCE !== "fixture" && isSanityConfigured()) {
    return createSanitySource();
  }
  return createFixtureSource();
}

export const content = createContent(selectSource());
