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

export type RawProjectStat = { id: string; value: Localized; label: Localized; accent?: boolean | null };

export type RawProject = {
  id: string;
  slug: string;
  title: Localized;
  kind: Localized;
  year: string;
  oneLiner: Localized;
  summary: Localized;
  headline: Localized;
  headlineEmphasis: Localized;
  tags: string[];
  /** Short label for cards: "live", "delivered". */
  status: Localized;
  /** Longer status for the project page meta row. */
  statusDetail: Localized;
  liveUrl?: string | null;
  accentLight: string;
  accentDark: string;
  role: Localized;
  client: Localized;
  stack: Localized;
  problem: Localized;
  built: Localized;
  stats: RawProjectStat[];
  /** Key of an anatomy figure, once one exists. Null shows the placeholder. */
  figure?: string | null;
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

export type ProjectStat = { id: string; value: string; label: string; accent: boolean };

export type Project = {
  slug: string;
  /** Two-digit position in the list, newest first: "01". */
  number: string;
  title: string;
  kind: string;
  year: string;
  oneLiner: string;
  summary: string;
  headline: string;
  headlineEmphasis: string;
  tags: string[];
  status: string;
  statusDetail: string;
  liveUrl: string | null;
  accent: { light: string; dark: string };
  meta: { role: string; client: string; stack: string };
  problem: string;
  built: string;
  stats: ProjectStat[];
  figure: string | null;
};

/** A project with its position in the list and the project after it (wrapping). */
export type ProjectPage = { project: Project; index: number; total: number; next: Project };
