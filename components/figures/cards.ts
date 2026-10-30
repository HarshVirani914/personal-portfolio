/** Hover-card stills by figure key. Kept apart from the figures: the home page is client code. */
const CARDS: Record<string, string> = {
  "flag-and-fill": "/figures/flag-and-fill.svg",
};

export const cardFigureFor = (project: {
  slug: string;
  figure?: string | null;
}) => CARDS[project.figure ?? project.slug];
