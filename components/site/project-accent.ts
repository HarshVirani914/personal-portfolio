import type { CSSProperties } from "react";
import type { Project } from "@/lib/content/types";

/** Puts a project's two accents in scope; `.project-accent` picks one per theme. */
export function accentStyle(accent: Project["accent"]): CSSProperties {
  return {
    ["--pa-l" as string]: accent.light,
    ["--pa-d" as string]: accent.dark,
  };
}
