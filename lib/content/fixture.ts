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
      order: 1,
      title: line("Flag & Fill"),
      kind: line("Agent", "Agent"),
      year: "2026",
      oneLiner: line(
        "Fills every customs field, flags the ones it is unsure of.",
        "Füllt jedes Zollfeld aus und markiert die, bei denen es unsicher ist.",
      ),
      summary: line(
        "A Hong Kong broker typed every declaration by hand. A 12-step LangGraph pipeline now reads the documents, fills the form and flags what a person should check. On a hand-labelled test set, field accuracy rose from 45.8% to about 88%.",
        "Ein Zollmakler in Hongkong tippte jede Deklaration von Hand. Eine LangGraph-Pipeline mit 12 Schritten liest jetzt die Dokumente, füllt das Formular aus und markiert, was eine Person prüfen sollte. Auf einem von Hand gelabelten Testset stieg die Feldgenauigkeit von 45,8 % auf etwa 88 %.",
      ),
      headline: line(
        "Customs declarations, filled by an agent,",
        "Zollanmeldungen, von einem Agenten ausgefüllt,",
      ),
      headlineEmphasis: line("checked by a person", "von einem Menschen geprüft"),
      tags: ["LangGraph", "Extraction", "Evals"],
      status: line("delivered", "übergeben"),
      statusDetail: line("Delivered as source code", "Als Quellcode übergeben"),
      liveUrl: null,
      accentLight: "#a33a6b",
      accentDark: "#e07aa8",
      role: line("Solo build, freelance", "Alleinige Umsetzung, freiberuflich"),
      client: line("Customs broker, Hong Kong", "Zollmakler, Hongkong"),
      stack: line(
        "LangGraph · Gemini extraction · review app",
        "LangGraph · Gemini-Extraktion · Prüf-App",
      ),
      problem: line(
        "Every shipment through Hong Kong needs a government declaration with dozens of exact fields. The broker's team read the shipping papers and typed each one by hand, about 30 to 40 minutes per declaration.",
        "Jede Sendung über Hongkong braucht eine behördliche Anmeldung mit Dutzenden exakter Felder. Das Team des Maklers las die Versanddokumente und tippte jedes Feld von Hand, etwa 30 bis 40 Minuten pro Anmeldung.",
      ),
      built: line(
        "A 12-step LangGraph pipeline that reads the shipping PDFs, checks the courier's tracking page, does every money calculation in code instead of the model, validates each value against the government's reference lists and writes the file the system accepts. Anything it is not sure about gets flagged, so a person only checks those. I also built the review web app and the test set of 17 hand-labelled shipments.",
        "Eine LangGraph-Pipeline mit 12 Schritten, die die Versand-PDFs liest, die Tracking-Seite des Kurierdienstes prüft, jede Geldberechnung im Code statt im Modell erledigt, jeden Wert gegen die Referenzlisten der Behörde validiert und die Datei schreibt, die das System akzeptiert. Was unsicher bleibt, wird markiert, sodass eine Person nur diese Felder prüft. Außerdem habe ich die Prüf-Webapp und das Testset aus 17 von Hand gelabelten Sendungen gebaut.",
      ),
      stats: [
        {
          id: "accuracy",
          accent: true,
          value: line("45.8 → 88%", "45,8 → 88 %"),
          label: line(
            "field accuracy on 17 hand-labelled shipments, first run to best run",
            "Feldgenauigkeit auf 17 von Hand gelabelten Sendungen, vom ersten zum besten Lauf",
          ),
        },
        {
          id: "time",
          value: line("~30 → 1 min", "~30 → 1 Min."),
          label: line(
            "typing replaced by 30 to 60 seconds of processing, then a short check of the flagged fields",
            "Tippen ersetzt durch 30 bis 60 Sekunden Verarbeitung und eine kurze Prüfung der markierten Felder",
          ),
        },
        {
          id: "build",
          value: line("6 weeks", "6 Wochen"),
          label: line("solo, with 329 automated tests", "allein, mit 329 automatisierten Tests"),
        },
      ],
    },
    {
      id: "pocketpulse",
      slug: "pocketpulse",
      order: 2,
      title: line("PocketPulse"),
      kind: line("Product", "Produkt"),
      year: "2026",
      oneLiner: line(
        "A calm expense tracker, live at pocketpulse.me.",
        "Ein ruhiger Ausgaben-Tracker, live auf pocketpulse.me.",
      ),
      summary: line(
        "An installable expense tracker that works offline and stays out of your way. Designed, built and shipped in about three weeks.",
        "Ein installierbarer Ausgaben-Tracker, der offline funktioniert und nicht im Weg steht. In etwa drei Wochen entworfen, gebaut und veröffentlicht.",
      ),
      headline: line("An expense tracker that works offline", "Ein Ausgaben-Tracker, der offline funktioniert"),
      headlineEmphasis: line("and splits the bill", "und die Rechnung teilt"),
      tags: ["PWA", "Next.js", "Offline"],
      status: line("live", "live"),
      statusDetail: line("Live at pocketpulse.me", "Live auf pocketpulse.me"),
      liveUrl: "https://pocketpulse.me",
      accentLight: "#8a6100",
      accentDark: "#d4a63a",
      role: line("Solo build", "Alleinige Umsetzung"),
      client: line("Personal project", "Eigenes Projekt"),
      stack: line(
        "Next.js · PWA · Postgres · Gemini assistant",
        "Next.js · PWA · Postgres · Gemini-Assistent",
      ),
      problem: line(
        "Keeping track of your own spending and splitting shared bills usually means a spreadsheet or several separate apps.",
        "Die eigenen Ausgaben im Blick zu behalten und gemeinsame Rechnungen zu teilen, heißt meist: eine Tabelle oder mehrere getrennte Apps.",
      ),
      built: line(
        "A web app that installs on a phone and works offline. It tracks expenses, splits bills in groups, sets budgets and charts your spending. An AI assistant answers questions like how much you spent on food this month, and it can add or change expenses, but only after you confirm.",
        "Eine Web-App, die sich auf dem Handy installieren lässt und offline funktioniert. Sie erfasst Ausgaben, teilt Rechnungen in Gruppen, setzt Budgets und zeigt Ausgaben als Diagramme. Ein KI-Assistent beantwortet Fragen wie „Wie viel habe ich diesen Monat für Essen ausgegeben?“ und kann Ausgaben anlegen oder ändern, aber erst nach deiner Bestätigung.",
      ),
      stats: [
        {
          id: "time",
          accent: true,
          value: line("3 weeks", "3 Wochen"),
          label: line("from first line to a hosted app, built solo", "von der ersten Zeile bis zur gehosteten App, allein gebaut"),
        },
        {
          id: "offline",
          value: line("Offline", "Offline"),
          label: line("installs on a phone and keeps working without a connection", "installierbar auf dem Handy und nutzbar ohne Verbindung"),
        },
        {
          id: "confirm",
          value: line("Confirm first", "Erst bestätigen"),
          label: line("the assistant never changes an expense without your approval", "der Assistent ändert nie eine Ausgabe ohne deine Zustimmung"),
        },
      ],
    },
    {
      id: "support-agent",
      slug: "support-agent",
      order: 3,
      title: line("Support agent", "Support-Agent"),
      kind: line("Agent", "Agent"),
      year: "2025",
      oneLiner: line(
        "Answers only when it can cite a source. Otherwise, silence.",
        "Antwortet nur, wenn es eine Quelle nennen kann. Sonst schweigt es.",
      ),
      summary: line(
        "A support agent with one rule: grounded or silent. Every answer carries its source, and it says \"I don’t know\" instead of guessing.",
        "Ein Support-Agent mit einer Regel: belegt oder still. Jede Antwort nennt ihre Quelle, und er sagt „Ich weiß es nicht“, statt zu raten.",
      ),
      headline: line("A support agent that is not allowed", "Ein Support-Agent, der nicht"),
      headlineEmphasis: line("to guess", "raten darf"),
      tags: ["RAG", "FastAPI", "Evals"],
      status: line("public demo", "öffentliche Demo"),
      statusDetail: line("Public demo, no real users", "Öffentliche Demo, keine echten Nutzer"),
      liveUrl: "https://agentic-support-system.vercel.app",
      accentLight: "#5b46c9",
      accentDark: "#9a88f0",
      role: line("Solo build", "Alleinige Umsetzung"),
      client: line("Portfolio project, example online shop", "Portfolio-Projekt, Beispiel-Onlineshop"),
      stack: line(
        "LangGraph · Qdrant RAG · FastAPI · Next.js",
        "LangGraph · Qdrant-RAG · FastAPI · Next.js",
      ),
      problem: line(
        "Support chatbots often make up answers. I wanted one that answers only from a company's own policy documents and says so when it cannot find the answer.",
        "Support-Chatbots erfinden oft Antworten. Ich wollte einen, der nur aus den eigenen Richtliniendokumenten eines Unternehmens antwortet und es sagt, wenn er die Antwort nicht findet.",
      ),
      built: line(
        "A chatbot that sorts each question (order, shipping or general), searches the policy documents and writes an answer with its sources. Before replying it checks its own answer against those sources. If the answer is not backed up, it searches again, up to twice, or points the user to human support. I deployed it online and measured its quality on 24 test questions.",
        "Ein Chatbot, der jede Frage einordnet (Bestellung, Versand oder allgemein), die Richtliniendokumente durchsucht und eine Antwort mit Quellen schreibt. Vor der Antwort prüft er sie gegen diese Quellen. Ist sie nicht belegt, sucht er erneut, bis zu zweimal, oder verweist an den menschlichen Support. Ich habe ihn online bereitgestellt und seine Qualität an 24 Testfragen gemessen.",
      ),
      stats: [
        {
          id: "faithfulness",
          accent: true,
          value: line("0.958", "0,958"),
          label: line(
            "faithfulness on 24 test questions: the share of claims the sources back up",
            "Faithfulness auf 24 Testfragen: der Anteil der Aussagen, den die Quellen belegen",
          ),
        },
        {
          id: "selfcheck",
          value: line("5 of 24", "5 von 24"),
          label: line("answers the self-check caught and reworked", "Antworten, die der Selbsttest abgefangen und überarbeitet hat"),
        },
        {
          id: "size",
          value: line("−93%", "−93 %"),
          label: line(
            "deployment size, about 2 GB down to 130 MB, so it runs on a free hosting plan",
            "Größe des Deployments, von etwa 2 GB auf 130 MB, sodass es auf einem kostenlosen Hosting-Plan läuft",
          ),
        },
      ],
    },
    {
      id: "ssri",
      slug: "ssri",
      order: 4,
      title: line("SSRI platform", "SSRI-Plattform"),
      kind: line("Product", "Produkt"),
      year: "2025",
      oneLiner: line(
        "An assessment product with real users and real payments.",
        "Ein Assessment-Produkt mit echten Nutzern und echten Zahlungen.",
      ),
      summary: line(
        "Built end to end as a freelancer, from assessments to payments. Live at assessment.silverspring.in, and I still maintain it.",
        "Als Freiberufler komplett umgesetzt, von den Assessments bis zu den Zahlungen. Live auf assessment.silverspring.in, und ich pflege es weiter.",
      ),
      headline: line("A retirement assessment, taken online", "Ein Ruhestands-Assessment, online ausgefüllt"),
      headlineEmphasis: line("by real couples", "von echten Paaren"),
      tags: ["Next.js", "Postgres", "Payments"],
      status: line("live", "live"),
      statusDetail: line("Live, and I still maintain it", "Live, und ich pflege es weiter"),
      liveUrl: "https://assessment.silverspring.in",
      accentLight: "#a3471f",
      accentDark: "#d9805a",
      role: line("Sole developer, freelance", "Alleiniger Entwickler, freiberuflich"),
      client: line("Silver Spring Retirement Institute, India", "Silver Spring Retirement Institute, Indien"),
      stack: line(
        "Next.js · GraphQL · Postgres · payments · PDF reports",
        "Next.js · GraphQL · Postgres · Zahlungen · PDF-Berichte",
      ),
      problem: line(
        "The institute's retirement-readiness assessment for couples was done on paper. Scores were worked out by hand, reports were prepared manually, and there was no way to compare a couple's results with others or to sell follow-up material online.",
        "Das Ruhestands-Assessment des Instituts für Paare lief auf Papier. Ergebnisse wurden von Hand berechnet, Berichte manuell erstellt, und es gab keine Möglichkeit, Ergebnisse zu vergleichen oder Folgematerial online zu verkaufen.",
      ),
      built: line(
        "The whole web platform, on my own: the online questionnaire, automatic scoring, a personalised PDF report for each respondent, online payments with discount codes, reminder emails for people who stopped halfway, and an admin area where staff edit questions and see results. A partner handled communication with the client and made design and requirements decisions with me.",
        "Die gesamte Web-Plattform, allein: der Online-Fragebogen, automatische Auswertung, ein persönlicher PDF-Bericht für jede teilnehmende Person, Online-Zahlungen mit Rabattcodes, Erinnerungs-E-Mails für Personen, die abgebrochen haben, und ein Admin-Bereich, in dem das Team Fragen bearbeitet und Ergebnisse sieht. Eine Partnerin kümmerte sich um die Kommunikation mit dem Kunden und traf mit mir Design- und Anforderungsentscheidungen.",
      ),
      stats: [
        {
          id: "completion",
          accent: true,
          value: line("33 of 37", "33 von 37"),
          label: line(
            "started assessments were completed, as of 30 June 2026",
            "begonnene Assessments wurden abgeschlossen, Stand 30. Juni 2026",
          ),
        },
        {
          id: "payments",
          value: line("21 payments", "21 Zahlungen"),
          label: line("INR 48,475 in total, none failed", "insgesamt INR 48.475, keine fehlgeschlagen"),
        },
        {
          id: "users",
          value: line("85", "85"),
          label: line("registered users, as of 30 June 2026", "registrierte Nutzer, Stand 30. Juni 2026"),
        },
      ],
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
