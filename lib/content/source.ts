import type { RawHero, RawProject, RawSiteSettings } from "@/lib/content/types";

/**
 * Where raw documents come from. Sanity implements it for production and the
 * fixture implements it for tests and local development, so callers never know
 * which one they are talking to. Singletons resolve to null until published.
 */
export interface ContentSource {
  getSiteSettings(): Promise<RawSiteSettings | null>;
  getHero(): Promise<RawHero | null>;
  getProjects(): Promise<RawProject[]>;
}

/** Cache tags, one per document type. Webhook revalidation targets these. */
export const contentTags = {
  siteSettings: "content:siteSettings",
  hero: "content:hero",
  project: "content:project",
} as const;

const tagByDocumentType: Record<string, string> = {
  siteSettings: contentTags.siteSettings,
  hero: contentTags.hero,
  project: contentTags.project,
};

/** The cache tag a published document of this type invalidates, if the site reads it. */
export function tagForDocumentType(type: string): string | undefined {
  return Object.hasOwn(tagByDocumentType, type) ? tagByDocumentType[type] : undefined;
}
