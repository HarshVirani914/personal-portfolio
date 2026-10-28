import { fixtureData, createFixtureSource } from "@/lib/content/fixture";
import { resolveText, visibleInOrder } from "@/lib/content/localized";
import { createSanitySource, isSanityConfigured } from "@/lib/content/sanity-source";
import type { ContentSource } from "@/lib/content/source";
import type {
  HomeContent,
  Project,
  ProjectPage,
  RawHero,
  RawProject,
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

  const resolveProject = (raw: RawProject, index: number, locale: Locale): Project => ({
    slug: raw.slug,
    number: String(index + 1).padStart(2, "0"),
    title: resolveText(raw.title, locale),
    kind: resolveText(raw.kind, locale),
    year: raw.year,
    oneLiner: resolveText(raw.oneLiner, locale),
    summary: resolveText(raw.summary, locale),
    headline: resolveText(raw.headline, locale),
    headlineEmphasis: resolveText(raw.headlineEmphasis, locale),
    tags: raw.tags,
    status: resolveText(raw.status, locale),
    statusDetail: resolveText(raw.statusDetail, locale),
    liveUrl: raw.liveUrl || null,
    accent: { light: raw.accentLight, dark: raw.accentDark },
    meta: {
      role: resolveText(raw.role, locale),
      client: resolveText(raw.client, locale),
      stack: resolveText(raw.stack, locale),
    },
    problem: resolveText(raw.problem, locale),
    built: resolveText(raw.built, locale),
    stats: raw.stats.map((stat) => ({
      id: stat.id,
      value: resolveText(stat.value, locale),
      label: resolveText(stat.label, locale),
      accent: Boolean(stat.accent),
    })),
    figure: raw.figure || null,
  });

  const getProjects = async (locale: Locale): Promise<Project[]> =>
    visibleInOrder(await source.getProjects()).map((raw, index) => resolveProject(raw, index, locale));

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
      const [raw, statements] = await Promise.all([hero(), source.getStatements()]);
      return {
        statements: visibleInOrder(statements).map((item) => ({
          id: item.id,
          text: resolveText(item.text, locale),
        })),
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
    async getProject(locale: Locale, slug: string): Promise<ProjectPage | null> {
      const projects = await getProjects(locale);
      const index = projects.findIndex((project) => project.slug === slug);
      const project = projects[index];
      if (!project) return null;
      return { project, index, total: projects.length, next: projects[(index + 1) % projects.length] ?? project };
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
