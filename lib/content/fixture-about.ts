import type { RawAbout } from "@/lib/content/types";

const line = (en: string, de?: string) => ({ en, de });

export const fixtureAbout: RawAbout = {
  headline: line(
    "Curious about how machines think. *Precise* about making them work.",
    "Neugierig darauf, wie Maschinen denken. *Präzise* darin, sie zum Laufen zu bringen."
  ),
  portrait: {
    url: "/harsh-portrait.jpg",
    alt: line("Portrait of Harsh Virani", "Porträt von Harsh Virani"),
    caption: line("Hof, Germany · 2026", "Hof, Deutschland · 2026"),
  },
  story: [
    line(
      "I grew up in Gujarat, India, taking things apart to see how they worked. Computer science gave that habit a direction, and I finished my bachelor's at the top of my class.",
      "Ich bin in Gujarat, Indien, aufgewachsen und habe Dinge auseinandergenommen, um zu sehen, wie sie funktionieren. Die Informatik hat dieser Gewohnheit eine Richtung gegeben, und ich habe meinen Bachelor als Jahrgangsbester abgeschlossen."
    ),
    line(
      "My first job was at TechStaunch, building LLM systems for companies that couldn't send a single document to the cloud. That's where I learned the hard part of AI isn't the demo. It's the hundredth question, the odd input, the answer that has to be right.",
      "Mein erster Job war bei TechStaunch, wo ich LLM-Systeme für Unternehmen gebaut habe, die kein einziges Dokument in die Cloud schicken durften. Dort habe ich gelernt, dass das Schwierige an KI nicht die Demo ist. Es ist die hundertste Frage, die ungewöhnliche Eingabe, die Antwort, die stimmen muss."
    ),
    line(
      "So I moved to Germany for a master's in AI & Robotics, and made reliability the thing I study. My thesis asks what it takes for a research agent to finish real office work, end to end, and measures it honestly.",
      "Also bin ich für einen Master in KI & Robotik nach Deutschland gezogen und habe Zuverlässigkeit zu meinem Thema gemacht. Meine Abschlussarbeit fragt, was ein Forschungsagent braucht, um echte Büroarbeit von Anfang bis Ende zu erledigen, und misst das ehrlich."
    ),
    line(
      "In between, I keep shipping: products with real users, real payments and real support tickets. Research tells me what's possible. Shipping tells me what's true.",
      "Dazwischen liefere ich weiter aus: Produkte mit echten Nutzern, echten Zahlungen und echten Support-Tickets. Die Forschung zeigt mir, was möglich ist. Das Ausliefern zeigt mir, was stimmt."
    ),
  ],
  languages: [
    {
      id: "english",
      name: line("English", "Englisch"),
      detail: line("working", "Arbeitssprache"),
    },
    {
      id: "german",
      name: line("German", "Deutsch"),
      detail: line("learning, daily", "lerne täglich"),
    },
    {
      id: "hindi-gujarati",
      name: line("Hindi · Gujarati", "Hindi · Gujarati"),
      detail: line("native", "Muttersprachen"),
    },
  ],
  interests: [
    {
      id: "gaming",
      name: line("Gaming", "Gaming"),
      detail: line("long campaigns", "lange Kampagnen"),
    },
    {
      id: "movies",
      name: line("Movies", "Filme"),
      detail: line("always one more", "immer noch einer"),
    },
    {
      id: "cooking",
      name: line("Cooking", "Kochen"),
      detail: line("Gujarati, mostly", "meist gujaratisch"),
    },
  ],
  now: [
    {
      id: "researching",
      label: line("Researching", "Forsche an"),
      text: line(
        "Deep-research agents for spreadsheets, literature review first.",
        "Deep-Research-Agenten für Tabellenkalkulationen, zuerst für die Literaturrecherche."
      ),
    },
    {
      id: "building",
      label: line("Building", "Baue"),
      text: line(
        "A platform that tests AI agents step by step.",
        "Eine Plattform, die KI-Agenten Schritt für Schritt testet."
      ),
    },
    {
      id: "learning",
      label: line("Learning", "Lerne"),
      text: line(
        "German, one conversation at a time.",
        "Deutsch, ein Gespräch nach dem anderen."
      ),
    },
    {
      id: "looking-for",
      label: line("Looking for", "Suche"),
      text: line(
        "Working-student and full-time AI roles in Germany.",
        "Werkstudenten- und Vollzeitstellen im Bereich KI in Deutschland."
      ),
      highlight: true,
    },
  ],
  nowUpdated: "2026-10-01",
};
