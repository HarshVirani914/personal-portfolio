import type { RawCertification, RawEducation, RawExperience } from "@/lib/content/types";

const line = (en: string, de?: string) => ({ en, de });

export const fixtureExperience: RawExperience[] = [
  {
    id: "ssri-freelance",
    years: line("2025 — now", "2025 — heute"),
    company: "Silver Spring",
    role: line("Freelance full-stack developer", "Freiberuflicher Full-Stack-Entwickler"),
    bullets: [
      line(
        "Built a retirement-readiness assessment platform on my own: questionnaire, automatic scoring, a personalised PDF report for each respondent, payments with discount codes and an admin area.",
        "Eine Plattform zur Bewertung der Ruhestandsreife allein gebaut: Fragebogen, automatische Auswertung, persönlicher PDF-Bericht für jede teilnehmende Person, Zahlungen mit Rabattcodes und ein Admin-Bereich.",
      ),
      line(
        "Live with real users and payments. I still fix issues and make changes on request.",
        "Live mit echten Nutzern und Zahlungen. Ich behebe weiterhin Fehler und setze Änderungen auf Anfrage um.",
      ),
      line("Stack: Next.js, TypeScript, GraphQL (PostGraphile), PostgreSQL, Razorpay.", "Stack: Next.js, TypeScript, GraphQL (PostGraphile), PostgreSQL, Razorpay."),
    ],
  },
  {
    id: "techstaunch",
    years: line("2024 — 2025", "2024 — 2025"),
    company: "TechStaunch Solutions",
    role: line("Software engineer, AI & full-stack", "Softwareentwickler, KI & Full-Stack"),
    bullets: [
      line(
        "Worked directly with an e-commerce client as the active developer: React and Node.js features, ASP.NET API integration and real-time updates with SignalR.",
        "Als aktiver Entwickler direkt mit einem E-Commerce-Kunden gearbeitet: Features mit React und Node.js, Anbindung von ASP.NET-APIs und Echtzeit-Updates mit SignalR.",
      ),
      line(
        "Pages loaded about 40% faster after profiling and refactoring. Set up an AWS pipeline that cut a deployment from about 15 minutes to about 2.",
        "Seiten luden nach Profiling und Refactoring etwa 40 % schneller. Eine AWS-Pipeline eingerichtet, die ein Deployment von etwa 15 auf etwa 2 Minuten verkürzte.",
      ),
      line(
        "Built RAG pipelines and chatbots (LangChain, LlamaIndex, FastAPI) that ran on the client's own servers with no external API calls, for clients with strict data-privacy needs.",
        "RAG-Pipelines und Chatbots (LangChain, LlamaIndex, FastAPI) gebaut, die auf den eigenen Servern der Kunden ohne externe API-Aufrufe liefen, für Kunden mit strengen Datenschutzanforderungen.",
      ),
      line(
        "Co-built the first version of an n8n workflow that found and ranked sales leads for the business development team.",
        "Die erste Version eines n8n-Workflows mitentwickelt, der Vertriebskontakte für das Business-Development-Team fand und bewertete.",
      ),
    ],
  },
];

export const fixtureEducation: RawEducation[] = [
  {
    id: "msc",
    years: line("2025 — now", "2025 — heute"),
    degree: line("M.Sc. AI & Robotics", "M.Sc. AI and Robotics"),
    institution: line("Hof University of Applied Sciences", "Hochschule Hof"),
    tags: [line("Dean's List 2025", "Dean's List 2025")],
  },
  {
    id: "bsc",
    years: line("2021 — 2024", "2021 — 2024"),
    degree: line("B.Sc. Computer Science", "B.Sc. Informatik"),
    institution: line("Veer Narmad South Gujarat University", "Veer Narmad South Gujarat University"),
    tags: [line("MYSY Scholarship", "MYSY-Stipendium")],
  },
];

export const fixtureCertifications: RawCertification[] = [
  {
    id: "oracle-agentic-ai",
    name: "Agentic AI Certified Foundations Associate",
    issuer: "Oracle",
    credentialUrl:
      "https://catalog-education.oracle.com/pls/certview/sharebadge?id=F3ED79A69E50A0FE3532C59EC74F472A805367C9B347B42162873630B3B95D48",
  },
  {
    id: "anthropic-mcp",
    name: "Introduction to Model Context Protocol",
    issuer: "Anthropic",
    credentialUrl: "https://verify.skilljar.com/c/xmuvxheatmv9",
  },
];
