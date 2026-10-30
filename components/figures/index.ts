import type { ComponentType } from "react";
import { FlagAndFillFigure } from "./flag-and-fill/figure";
import { FLAG_AND_FILL } from "./flag-and-fill/meta";
import type { Locale } from "@/lib/i18n";

export interface ProjectFigureEntry {
  Figure: ComponentType<{ locale: Locale; testId?: string | undefined }>;
  caption: Record<Locale, string>;
  hint: Record<Locale, string>;
  readout: Record<Locale, string>;
}

const FIGURES: Record<string, ProjectFigureEntry> = {
  "flag-and-fill": { Figure: FlagAndFillFigure, ...FLAG_AND_FILL },
};

/** A project's figure by its `figure` key, or by slug until the key is set in the CMS. */
export const figureFor = (project: { slug: string; figure?: string | null }) =>
  FIGURES[project.figure ?? project.slug] ?? null;
