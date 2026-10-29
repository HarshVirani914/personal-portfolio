import type { Localized } from "@/lib/content/localized";

/* Raw documents: what a content source returns, with every text still bilingual. */

export type RawSiteSettings = {
  firstName: string;
  lastName: string;
  coordinates: string;
  city: Localized;
  description: Localized;
  email?: string | null;
  availability?: Localized | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  /** URL of the uploaded CV file. */
  cvUrl?: string | null;
};

export type RawHeroAnnotation = {
  id: string;
  text: Localized;
  hidden?: boolean | null;
};

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

export type RawProjectStat = {
  id: string;
  value: Localized;
  label: Localized;
  accent?: boolean | null;
};

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

export type RawResearchBlock = {
  id: string;
  kind: "paragraph" | "code" | "figure" | "quote";
  /** Paragraph or quote text. A paragraph may cite references as [1]. */
  text?: Localized | null;
  /** Side note on a paragraph: in the margin on desktop, tap-to-open on mobile. */
  note?: Localized | null;
  code?: string | null;
  /** Key of an anatomy figure, once one exists. Null shows the placeholder. */
  figure?: string | null;
  caption?: Localized | null;
};

export type RawResearchSection = {
  id: string;
  heading: Localized;
  blocks: RawResearchBlock[];
};

export type RawResearch = {
  id: string;
  slug: string;
  type: "thesis" | "paper";
  /** Shown beside the type: "ongoing", "published". */
  status: Localized;
  /** "2026 — 27" for a thesis, "2025" for a paper. */
  period: string;
  title: Localized;
  /** The italic tail of the title, empty for most papers. */
  titleEmphasis: Localized;
  /** The short line on the home list. */
  summary: Localized;
  /** The line above the title on the research page. */
  kicker: Localized;
  standfirst: Localized;
  supervisor: Localized;
  /** ISO date, e.g. 2026-10-01. */
  updated: string;
  abstract: Localized;
  sections: RawResearchSection[];
  references: Localized[];
  /** URL of the uploaded PDF, if the item has one. */
  pdfUrl?: string | null;
  cite: Localized;
  accentLight: string;
  accentDark: string;
  order?: number | null;
  hidden?: boolean | null;
};

/** The project or research item a skill points at; only its colours are used. */
export type RawSkillRef = { accentLight: string; accentDark: string };

export type RawSkill = {
  id: string;
  name: string;
  /** One line: where the skill was used. */
  note: Localized;
  /** Tints the note. Without one the note stays muted. */
  ref?: RawSkillRef | null;
  hidden?: boolean | null;
};

export type RawSkillGroup = {
  id: string;
  title: Localized;
  skills: RawSkill[];
  order?: number | null;
  hidden?: boolean | null;
};

export type RawExperience = {
  id: string;
  years: Localized;
  company: string;
  role: Localized;
  bullets: Localized[];
  order?: number | null;
  hidden?: boolean | null;
};

export type RawEducationTag = {
  id: string;
  label: Localized;
  /** Optional proof, such as a certificate. The tag becomes a link. */
  url?: string | null;
};

export type RawEducation = {
  id: string;
  years: Localized;
  degree: Localized;
  institution: Localized;
  /** Short badges such as "Dean's List 2025". */
  tags: RawEducationTag[];
  order?: number | null;
  hidden?: boolean | null;
};

export type RawCertification = {
  id: string;
  name: string;
  issuer: string;
  credentialUrl: string;
  order?: number | null;
  hidden?: boolean | null;
};

/* Resolved data: what pages, metadata and the agent receive. */

export type SiteSettings = {
  name: { first: string; last: string; full: string };
  coordinates: string;
  city: string;
  description: string;
  contact: ContactDetails;
};

/** Empty strings and nulls mean "not set": the contact section hides what it does not have. */
export type ContactDetails = {
  email: string | null;
  availability: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  cvUrl: string | null;
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

export type ProjectStat = {
  id: string;
  value: string;
  label: string;
  accent: boolean;
};

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
export type ProjectPage = {
  project: Project;
  index: number;
  total: number;
  next: Project;
};

export type ResearchBlock =
  | {
      id: string;
      kind: "paragraph";
      text: string;
      note: string | null;
      noteNumber: number | null;
    }
  | { id: string; kind: "code"; code: string; caption: string }
  | {
      id: string;
      kind: "figure";
      figure: string | null;
      caption: string;
      number: number;
    }
  | { id: string; kind: "quote"; text: string };

export type ResearchSection = {
  id: string;
  /** Two-digit position: "01". The abstract is "00" and has no section. */
  number: string;
  heading: string;
  blocks: ResearchBlock[];
};

export type Research = {
  slug: string;
  type: "thesis" | "paper";
  /** "P/01" for papers, null for the thesis. */
  number: string | null;
  status: string;
  period: string;
  title: string;
  titleEmphasis: string;
  summary: string;
  kicker: string;
  standfirst: string;
  supervisor: string;
  updated: string;
  readingMinutes: number;
  abstract: string;
  sections: ResearchSection[];
  references: string[];
  pdfUrl: string | null;
  cite: string;
  accent: { light: string; dark: string };
};

/** A research item with the item after it (wrapping) for the "Next in research" link. */
export type ResearchPage = {
  item: Research;
  index: number;
  total: number;
  next: Research;
};

export type Skill = {
  id: string;
  name: string;
  note: string;
  /** Null when the skill points at nothing: the note uses the muted colour. */
  accent: { light: string; dark: string } | null;
};

export type SkillGroup = { id: string; title: string; skills: Skill[] };

export type Experience = {
  id: string;
  years: string;
  company: string;
  role: string;
  bullets: string[];
};

export type EducationTag = { id: string; label: string; url: string | null };

export type Education = {
  id: string;
  years: string;
  degree: string;
  institution: string;
  tags: EducationTag[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  url: string;
};

export type EducationContent = {
  education: Education[];
  certifications: Certification[];
};
