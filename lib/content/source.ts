import type {
  RawCertification,
  RawEducation,
  RawExperience,
  RawHero,
  RawProject,
  RawResearch,
  RawSiteSettings,
  RawSkillGroup,
  RawStatement,
} from "@/lib/content/types";

/**
 * Where raw documents come from. Sanity implements it for production and the
 * fixture implements it for tests and local development, so callers never know
 * which one they are talking to. Singletons resolve to null until published.
 */
export interface ContentSource {
  getSiteSettings(): Promise<RawSiteSettings | null>;
  getHero(): Promise<RawHero | null>;
  getStatements(): Promise<RawStatement[]>;
  getProjects(): Promise<RawProject[]>;
  getResearch(): Promise<RawResearch[]>;
  getSkillGroups(): Promise<RawSkillGroup[]>;
  getExperience(): Promise<RawExperience[]>;
  getEducation(): Promise<RawEducation[]>;
  getCertifications(): Promise<RawCertification[]>;
}

/** Cache tags, one per document type. Webhook revalidation targets these. */
export const contentTags = {
  siteSettings: "content:siteSettings",
  hero: "content:hero",
  statement: "content:statement",
  project: "content:project",
  research: "content:research",
  skillGroup: "content:skillGroup",
  experience: "content:experience",
  education: "content:education",
  certification: "content:certification",
} as const;

const tagByDocumentType: Record<string, string> = {
  siteSettings: contentTags.siteSettings,
  hero: contentTags.hero,
  statement: contentTags.statement,
  project: contentTags.project,
  research: contentTags.research,
  skillGroup: contentTags.skillGroup,
  experience: contentTags.experience,
  education: contentTags.education,
  certification: contentTags.certification,
};

/** The cache tag a published document of this type invalidates, if the site reads it. */
export function tagForDocumentType(type: string): string | undefined {
  return Object.hasOwn(tagByDocumentType, type) ? tagByDocumentType[type] : undefined;
}
