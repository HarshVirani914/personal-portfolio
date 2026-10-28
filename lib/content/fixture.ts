import type { ContentSource } from "@/lib/content/source";
import type { RawHero, RawProject, RawSiteSettings, RawStatement } from "@/lib/content/types";

export type FixtureData = {
  siteSettings: RawSiteSettings | null;
  hero: RawHero | null;
  statements: RawStatement[];
  projects: RawProject[];
};

const line = (en: string, de?: string) => ({ en, de });

export const fixtureData: FixtureData = {
  siteSettings: {
    firstName: "Harsh",
    lastName: "Virani",
    coordinates: "50.32° N, 11.92° E",
    city: { en: "Hof, Germany", de: "Hof, Deutschland" },
    description: {
      en: "AI engineer who builds agents that actually work, and ships them as products.",
      de: "KI-Ingenieur, der Agenten baut, die wirklich funktionieren, und sie als Produkte ausliefert.",
    },
  },
  hero: {
    annotations: [
      { id: "role", text: line("AI engineer", "KI-Ingenieur") },
      { id: "focus", text: line("Agents, RAG, evaluation", "Agenten, RAG, Evaluation") },
      { id: "degree", text: line("M.Sc. AI & Robotics", "M.Sc. KI & Robotik") },
    ],
    terminalScripts: [
      {
        id: "mission",
        label: line("mission", "mission"),
        command: line("echo $MISSION", "echo $MISSION"),
        output: [
          line(
            "building agents that actually work, end to end",
            "Agenten bauen, die wirklich funktionieren, von Anfang bis Ende",
          ),
        ],
      },
      {
        id: "whoami",
        label: line("whoami", "whoami"),
        command: line("whoami", "whoami"),
        output: [
          line(
            "harsh virani — ai engineer, hof, germany",
            "harsh virani — ki-ingenieur, hof, deutschland",
          ),
        ],
      },
      {
        id: "stack",
        label: line("stack", "stack"),
        command: line("cat stack.txt", "cat stack.txt"),
        output: [
          line("agents · rag · llm evals", "agenten · rag · llm-evaluation"),
          line("python · langgraph · fastapi · next.js"),
        ],
      },
      {
        id: "projects",
        label: line("projects", "projekte"),
        command: line("ls ~/shipped", "ls ~/ausgeliefert"),
        output: [line("flag-and-fill/   pocketpulse/   support-agent/   ssri/")],
      },
      {
        id: "eval",
        label: line("eval", "eval"),
        command: line("python eval.py --agent support"),
        output: [
          line("running 50 cases ··········· done", "50 Fälle laufen ··········· fertig"),
          line(
            "✓ grounded or silent — every answer cites a source",
            "✓ belegt oder still — jede Antwort nennt eine Quelle",
          ),
        ],
      },
    ],
  },
  statements: [
    {
      id: "agents",
      order: 1,
      text: line(
        "I build agents that hold up outside the demo.",
        "Ich baue Agenten, die auch außerhalb der Demo bestehen.",
      ),
    },
    {
      id: "thesis",
      order: 2,
      text: line(
        "My thesis puts research agents to work inside spreadsheets.",
        "Meine Abschlussarbeit setzt Forschungsagenten in Tabellenkalkulationen ein.",
      ),
    },
    {
      id: "ship",
      order: 3,
      text: line(
        "And I ship. Products with real users and real payments.",
        "Und ich liefere aus. Produkte mit echten Nutzern und echten Zahlungen.",
      ),
    },
    {
      id: "now",
      order: 4,
      text: line(
        "Now: open to AI engineering roles in Germany.",
        "Jetzt: offen für KI-Engineering-Stellen in Deutschland.",
      ),
    },
  ],
  projects: [
    {
      id: "flag-and-fill",
      slug: "flag-and-fill",
      title: line("Flag & Fill"),
      oneLiner: line("Customs paperwork with flagged fields a person reviews."),
      order: 1,
    },
  ],
};

/** A content source backed by plain data. Pass your own data in tests. */
export function createFixtureSource(data: FixtureData = fixtureData): ContentSource {
  return {
    getSiteSettings: async () => data.siteSettings,
    getHero: async () => data.hero,
    getStatements: async () => data.statements,
    getProjects: async () => data.projects,
  };
}
