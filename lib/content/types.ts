import type { Localized } from "@/lib/content/localized";

/* Raw documents: what a content source returns, with every text still bilingual. */

export type RawSiteSettings = {
  firstName: string;
  lastName: string;
  coordinates: string;
  city: Localized;
  description: Localized;
};

export type RawHeroAnnotation = { id: string; text: Localized; hidden?: boolean | null };

export type RawHeroTerminalScript = {
  id: string;
  label: Localized;
  command: Localized;
  output: Localized[];
  hidden?: boolean | null;
};

export type RawHero = {
  annotations: RawHeroAnnotation[];
  terminalScripts: RawHeroTerminalScript[];
};

export type RawStatement = {
  id: string;
  text: Localized;
  order?: number | null;
  hidden?: boolean | null;
};

export type RawProject = {
  id: string;
  slug: string;
  title: Localized;
  oneLiner: Localized;
  order?: number | null;
  hidden?: boolean | null;
};

/* Resolved data: what pages, metadata and the agent receive. */

export type SiteSettings = {
  name: { first: string; last: string; full: string };
  coordinates: string;
  city: string;
  description: string;
};

export type HeroAnnotation = { id: string; marker: string; text: string };

export type HeroTerminalScript = {
  id: string;
  label: string;
  command: string;
  output: string[];
};

export type Hero = {
  annotations: HeroAnnotation[];
  terminal: HeroTerminalScript[];
};

export type Statement = { id: string; text: string };

export type HomeContent = { hero: Hero; statements: Statement[] };

export type Project = { slug: string; title: string; oneLiner: string };
