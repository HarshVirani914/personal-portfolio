import { createClient } from "next-sanity";
import { contentTags, type ContentSource } from "@/lib/content/source";
import type { Localized } from "@/lib/content/localized";
import type {
  RawHero,
  RawHeroAnnotation,
  RawHeroTerminalScript,
  RawProject,
  RawResearch,
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
    "kind": kind${localized},
    year,
    "oneLiner": oneLiner${localized},
    "summary": summary${localized},
    "headline": headline${localized},
    "headlineEmphasis": headlineEmphasis${localized},
    tags,
    "status": status${localized},
    "statusDetail": statusDetail${localized},
    liveUrl,
    accentLight,
    accentDark,
    "role": role${localized},
    "client": client${localized},
    "stack": stack${localized},
    "problem": problem${localized},
    "built": built${localized},
    "stats": stats[]{
      "id": _key, "value": value${localized}, "label": label${localized}, accent
    },
    figure,
    order, hidden
  }`,
  research: `*[_type == "research"]{
    "id": _id, "slug": slug.current,
    type,
    "status": status${localized},
    period,
    "title": title${localized},
    "titleEmphasis": titleEmphasis${localized},
    "summary": summary${localized},
    "kicker": kicker${localized},
    "standfirst": standfirst${localized},
    "supervisor": supervisor${localized},
    updated,
    "abstract": abstract${localized},
    "sections": sections[]{
      "id": _key,
      "heading": heading${localized},
      "blocks": blocks[]{
        "id": _key, kind,
        "text": text${localized},
        "note": note${localized},
        code, figure,
        "caption": caption${localized}
      }
    },
    "references": references[]${localized},
    "pdfUrl": pdf.asset->url,
    "cite": cite${localized},
    accentLight, accentDark,
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

type ProjectDoc = Omit<RawProject, "tags" | "stats" | "accentLight" | "accentDark"> & {
  tags: string[] | null;
  stats: RawProject["stats"] | null;
  accentLight: string | null;
  accentDark: string | null;
};

type ResearchDoc = Omit<RawResearch, "sections" | "references" | "accentLight" | "accentDark" | "updated"> & {
  sections: { id: string; heading: Localized; blocks: RawResearch["sections"][number]["blocks"] | null }[] | null;
  references: Localized[] | null;
  accentLight: string | null;
  accentDark: string | null;
  updated: string | null;
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
      const docs = await client.fetch<ProjectDoc[]>(
        queries.projects,
        {},
        { next: { tags: [contentTags.project] } },
      );
      // Drafts of a half-filled project must not break the page: skip any without a slug.
      return docs
        .filter((doc) => doc.slug)
        .map((doc) => ({
          ...doc,
          tags: doc.tags ?? [],
          stats: doc.stats ?? [],
          accentLight: doc.accentLight ?? "#141414",
          accentDark: doc.accentDark ?? "#eceae4",
        }));
    },

    async getResearch(): Promise<RawResearch[]> {
      const docs = await client.fetch<ResearchDoc[]>(
        queries.research,
        {},
        { next: { tags: [contentTags.research] } },
      );
      // A half-filled draft must not break the page: skip any without a slug.
      return docs
        .filter((doc) => doc.slug)
        .map((doc) => ({
          ...doc,
          updated: doc.updated ?? "",
          sections: (doc.sections ?? []).map((section) => ({ ...section, blocks: section.blocks ?? [] })),
          references: doc.references ?? [],
          accentLight: doc.accentLight ?? "#141414",
          accentDark: doc.accentDark ?? "#eceae4",
        }));
    },
  };
}
