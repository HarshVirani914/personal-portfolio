import type {
  About,
  Education,
  Project,
  Research,
  SiteSettings,
  SkillGroup,
} from "@/lib/content/types";
import { localizedPath, type Locale } from "@/lib/i18n";

type Schema = Record<string, unknown>;

const absolute = (url: string, site: string) => new URL(url, site).href;

const personId = (site: string) => `${site}/#person`;

/** Keeps pages referring to one Person instead of repeating it. */
const author = (site: string) => ({ "@id": personId(site) });

/** The Person and WebSite that every page belongs to. */
export function siteSchemas({
  settings,
  about,
  education,
  skills,
  site,
  locale,
}: {
  settings: SiteSettings;
  about: About;
  education: Education[];
  skills: SkillGroup[];
  site: string;
  locale: Locale;
}): Schema[] {
  const { email, linkedinUrl, githubUrl } = settings.contact;
  const sameAs = [linkedinUrl, githubUrl].filter(Boolean);
  const url = absolute(localizedPath("/", locale), site);
  return [
    {
      "@type": "Person",
      "@id": personId(site),
      name: settings.name.full,
      url,
      description: settings.description,
      ...(about.portrait
        ? { image: absolute(about.portrait.url, site) }
        : null),
      ...(email ? { email: `mailto:${email}` } : null),
      ...(sameAs.length > 0 ? { sameAs } : null),
      address: { "@type": "PostalAddress", addressLocality: settings.city },
      // Not alumniOf: schema.org has no property for a degree still in progress.
      affiliation: education.map((row) => ({
        "@type": "EducationalOrganization",
        name: row.institution,
      })),
      knowsAbout: skills.flatMap((group) =>
        group.skills.map((skill) => skill.name)
      ),
    },
    {
      "@type": "WebSite",
      "@id": `${site}/#website`,
      name: settings.name.full,
      url,
      inLanguage: locale,
      publisher: author(site),
    },
  ];
}

export function profileSchema(site: string, locale: Locale): Schema {
  return {
    "@type": "ProfilePage",
    url: absolute(localizedPath("/about", locale), site),
    inLanguage: locale,
    mainEntity: author(site),
  };
}

export function projectSchema(
  project: Project,
  site: string,
  locale: Locale
): Schema {
  return {
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary || project.oneLiner,
    url: absolute(localizedPath(`/work/${project.slug}`, locale), site),
    inLanguage: locale,
    dateCreated: project.year,
    keywords: project.tags,
    author: author(site),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : null),
  };
}

export function researchSchema(
  item: Research,
  site: string,
  locale: Locale
): Schema {
  return {
    "@type": item.type === "thesis" ? "Thesis" : "ScholarlyArticle",
    headline: `${item.title} ${item.titleEmphasis}`.trim(),
    description: item.summary,
    abstract: item.abstract,
    url: absolute(localizedPath(`/research/${item.slug}`, locale), site),
    inLanguage: locale,
    creativeWorkStatus: item.status,
    author: author(site),
    ...(item.updated ? { dateModified: item.updated } : null),
    ...(item.pdfUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: absolute(item.pdfUrl, site),
            encodingFormat: "application/pdf",
          },
        }
      : null),
  };
}

/** One JSON-LD document. `<` is escaped so content cannot close the script tag. */
export function serializeSchemas(schemas: Schema[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas,
  }).replace(/</g, "\\u003c");
}
