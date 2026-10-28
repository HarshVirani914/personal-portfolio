import { createClient } from "next-sanity";
import { contentTags, type ContentSource } from "@/lib/content/source";
import type { Localized } from "@/lib/content/localized";
import type {
  RawHero,
  RawHeroAnnotation,
  RawHeroTerminalScript,
  RawProject,
  RawSiteSettings,
  RawStatement,
} from "@/lib/content/types";

export const sanityApiVersion = "2025-01-01";

export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

const localized = `{ en, de }`;

const queries = {
  siteSettings: `*[_type == "siteSettings"][0]{
    firstName, lastName, coordinates,
    "city": city${localized},
    "description": description${localized}
  }`,
  hero: `*[_type == "hero"][0]{
    "annotations": annotations[]{ "id": _key, "text": text${localized}, hidden },
    "terminalScripts": terminalScripts[]{
      "id": _key,
      "label": label${localized},
      "command": command${localized},
      "output": output[]${localized},
      hidden
    }
  }`,
  statements: `*[_type == "statement"]{
    "id": _id, "text": text${localized}, order, hidden
  }`,
  projects: `*[_type == "project"]{
    "id": _id, "slug": slug.current,
    "title": title${localized},
    "oneLiner": oneLiner${localized},
    order, hidden
  }`,
};

type SettingsDoc = Omit<RawSiteSettings, "city" | "description"> & {
  city: Localized | null;
  description: Localized | null;
};
type HeroDoc = {
  annotations: RawHeroAnnotation[] | null;
  terminalScripts: (Omit<RawHeroTerminalScript, "output"> & { output: Localized[] | null })[] | null;
};

/** Reads published documents from Sanity, cached per document type and revalidated by webhook. */
export function createSanitySource(): ContentSource {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: sanityApiVersion,
    useCdn: false,
    ...(process.env.SANITY_API_READ_TOKEN ? { token: process.env.SANITY_API_READ_TOKEN } : {}),
  });

  return {
    async getSiteSettings() {
      const doc = await client.fetch<SettingsDoc | null>(
        queries.siteSettings,
        {},
        { next: { tags: [contentTags.siteSettings] } },
      );
      if (!doc) return null;
      return { ...doc, city: doc.city ?? {}, description: doc.description ?? {} };
    },

    async getHero(): Promise<RawHero | null> {
      const doc = await client.fetch<HeroDoc | null>(
        queries.hero,
        {},
        { next: { tags: [contentTags.hero] } },
      );
      if (!doc) return null;
      return {
        annotations: doc.annotations ?? [],
        terminalScripts: (doc.terminalScripts ?? []).map((script) => ({
          ...script,
          output: script.output ?? [],
        })),
      };
    },

    async getStatements(): Promise<RawStatement[]> {
      return client.fetch<RawStatement[]>(
        queries.statements,
        {},
        { next: { tags: [contentTags.statement] } },
      );
    },

    async getProjects(): Promise<RawProject[]> {
      return client.fetch<RawProject[]>(
        queries.projects,
        {},
        { next: { tags: [contentTags.project] } },
      );
    },
  };
}
