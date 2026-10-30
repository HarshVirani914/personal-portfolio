import type { ComponentType } from "react";
import { FlagAndFillFigure } from "./flag-and-fill/figure";
import { AgentsInTheGridFigure } from "./agents-in-the-grid/figure";
import { AGENTS_IN_THE_GRID } from "./agents-in-the-grid/meta";
import { FLAG_AND_FILL } from "./flag-and-fill/meta";
import { PocketPulseFigure } from "./pocketpulse/figure";
import { POCKETPULSE } from "./pocketpulse/meta";
import { SupportAgentFigure } from "./support-agent/figure";
import { SUPPORT_AGENT } from "./support-agent/meta";
import type { Locale } from "@/lib/i18n";

export interface ProjectFigureEntry {
  Figure: ComponentType<{ locale: Locale; testId?: string | undefined }>;
  caption: Record<Locale, string>;
  hint: Record<Locale, string>;
  readout: Record<Locale, string>;
}

const FIGURES: Record<string, ProjectFigureEntry> = {
  "flag-and-fill": { Figure: FlagAndFillFigure, ...FLAG_AND_FILL },
  pocketpulse: { Figure: PocketPulseFigure, ...POCKETPULSE },
  "support-agent": { Figure: SupportAgentFigure, ...SUPPORT_AGENT },
  "agents-in-the-grid": {
    Figure: AgentsInTheGridFigure,
    ...AGENTS_IN_THE_GRID,
  },
};

/** A project's figure by its `figure` key, or by slug until the key is set in the CMS. */
export const figureFor = (project: { slug: string; figure?: string | null }) =>
  FIGURES[project.figure ?? project.slug] ?? null;
