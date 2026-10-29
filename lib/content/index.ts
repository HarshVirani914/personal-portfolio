import { fixtureData, createFixtureSource } from "@/lib/content/fixture";
import { resolveText, visibleInOrder } from "@/lib/content/localized";
import { createSanitySource, isSanityConfigured } from "@/lib/content/sanity-source";
import type { ContentSource } from "@/lib/content/source";
import type {
  Education,
  EducationContent,
  Experience,
  HomeContent,
  Project,
  ProjectPage,
  RawHero,
  RawProject,
  RawResearch,
  RawSiteSettings,
  Research,
  ResearchBlock,
  ResearchPage,
  SiteSettings,
  SkillGroup,
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

  const resolveResearch = (raw: RawResearch, paperNumber: number | null, locale: Locale): Research => {
    let noteCount = 0;
    let figureCount = 0;
    const sections = raw.sections.map((section, index) => ({
      id: section.id,
      number: String(index + 1).padStart(2, "0"),
      heading: resolveText(section.heading, locale),
      blocks: section.blocks.map((block): ResearchBlock => {
        switch (block.kind) {
          case "code":
            return { id: block.id, kind: "code", code: block.code ?? "", caption: resolveText(block.caption, locale) };
          case "figure":
            figureCount += 1;
            return {
              id: block.id,
              kind: "figure",
              figure: block.figure || null,
              caption: resolveText(block.caption, locale),
              number: figureCount,
            };
          case "quote":
            return { id: block.id, kind: "quote", text: resolveText(block.text, locale) };
          default: {
            const note = resolveText(block.note, locale);
            if (note) noteCount += 1;
            return {
              id: block.id,
              kind: "paragraph",
              text: resolveText(block.text, locale),
              note: note || null,
              noteNumber: note ? noteCount : null,
            };
          }
        }
      }),
    }));
    const abstract = resolveText(raw.abstract, locale);
    const words = [abstract, ...sections.flatMap((s) => s.blocks.map((b) => ("text" in b ? b.text : "")))]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    return {
      slug: raw.slug,
      type: raw.type,
      number: paperNumber === null ? null : `P/${String(paperNumber).padStart(2, "0")}`,
      status: resolveText(raw.status, locale),
      period: raw.period,
      title: resolveText(raw.title, locale),
      titleEmphasis: resolveText(raw.titleEmphasis, locale),
      summary: resolveText(raw.summary, locale),
      kicker: resolveText(raw.kicker, locale),
      standfirst: resolveText(raw.standfirst, locale),
      supervisor: resolveText(raw.supervisor, locale),
      updated: raw.updated,
      readingMinutes: Math.max(1, Math.round(words / 200)),
      abstract,
      sections,
      references: raw.references.map((ref) => resolveText(ref, locale)).filter(Boolean),
      pdfUrl: raw.pdfUrl || null,
      cite: resolveText(raw.cite, locale),
      accent: { light: raw.accentLight, dark: raw.accentDark },
    };
  };

  const getResearch = async (locale: Locale): Promise<Research[]> => {
    let papers = 0;
    return visibleInOrder(await source.getResearch()).map((raw) =>
      resolveResearch(raw, raw.type === "paper" ? ++papers : null, locale),
    );
  };

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

    getResearch,

    /** Groups and skills in CMS order. Empty groups and nameless skills are dropped. */
    async getSkills(locale: Locale): Promise<SkillGroup[]> {
      return visibleInOrder(await source.getSkillGroups())
        .map((group) => ({
          id: group.id,
          title: resolveText(group.title, locale),
          skills: visibleInOrder(group.skills)
            .filter((skill) => skill.name.trim() !== "")
            .map((skill) => ({
              id: skill.id,
              name: skill.name,
              note: resolveText(skill.note, locale),
              accent: skill.ref ? { light: skill.ref.accentLight, dark: skill.ref.accentDark } : null,
            })),
        }))
        .filter((group) => group.skills.length > 0);
    },

    /** Roles in CMS order. Rows without a company or role are dropped; blank bullets are skipped. */
    async getExperience(locale: Locale): Promise<Experience[]> {
      return visibleInOrder(await source.getExperience())
        .map((row) => ({
          id: row.id,
          years: resolveText(row.years, locale),
          company: row.company,
          role: resolveText(row.role, locale),
          bullets: row.bullets.map((bullet) => resolveText(bullet, locale)).filter(Boolean),
        }))
        .filter((row) => row.company.trim() !== "" && row.role !== "");
    },

    /** Degrees and certifications in CMS order. Certifications without a link are dropped: they could not be verified. */
    async getEducation(locale: Locale): Promise<EducationContent> {
      const [education, certifications] = await Promise.all([source.getEducation(), source.getCertifications()]);
      return {
        education: visibleInOrder(education)
          .map(
            (row): Education => ({
              id: row.id,
              years: resolveText(row.years, locale),
              degree: resolveText(row.degree, locale),
              institution: resolveText(row.institution, locale),
              tags: row.tags.map((tag) => resolveText(tag, locale)).filter(Boolean),
            }),
          )
          .filter((row) => row.degree !== ""),
        certifications: visibleInOrder(certifications)
          .filter((cert) => cert.name.trim() !== "" && cert.credentialUrl.trim() !== "")
          .map((cert) => ({ id: cert.id, name: cert.name, issuer: cert.issuer, url: cert.credentialUrl })),
      };
    },

    /** Returns null for an unknown or hidden slug; callers turn that into a 404. */
    async getResearchItem(locale: Locale, slug: string): Promise<ResearchPage | null> {
      const items = await getResearch(locale);
      const index = items.findIndex((item) => item.slug === slug);
      const item = items[index];
      if (!item) return null;
      return { item, index, total: items.length, next: items[(index + 1) % items.length] ?? item };
    },

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
