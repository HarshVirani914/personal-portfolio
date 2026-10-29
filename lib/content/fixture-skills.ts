import type { RawSkillGroup, RawSkillRef } from "@/lib/content/types";

type Lookup = (slug: string) => RawSkillRef | null;

const t = (en: string, de: string) => ({ en, de });

/**
 * The skills section as seeded content. Each note says where the skill was
 * used, taken from the CV stories; `ref` names the project or research slug
 * whose colour tints the note. Sanity holds the editable copy.
 */
export function buildSkillGroups(refOf: Lookup): RawSkillGroup[] {
  const skill = (
    id: string,
    name: string,
    note: { en: string; de: string },
    slug?: string
  ) => ({
    id,
    name,
    note,
    ref: slug ? refOf(slug) : null,
  });

  return [
    {
      id: "agents-llms",
      order: 1,
      title: t("Agents & LLMs", "Agenten & LLMs"),
      skills: [
        skill(
          "langgraph",
          "LangGraph",
          t(
            "A 12-step pipeline that fills customs declarations, then flags what to check.",
            "Eine Pipeline mit 12 Schritten, die Zollanmeldungen ausfüllt und markiert, was zu prüfen ist."
          ),
          "flag-and-fill"
        ),
        skill(
          "langchain",
          "LangChain",
          t(
            "RAG chatbots that ran on client servers, with no external API calls.",
            "RAG-Chatbots, die auf den Servern der Kunden liefen, ohne externe API-Aufrufe."
          )
        ),
        skill(
          "llamaindex",
          "LlamaIndex",
          t(
            "Indexing internal documents for those same private chatbots.",
            "Indexierung interner Dokumente für dieselben privaten Chatbots."
          )
        ),
        skill(
          "mcp",
          "MCP",
          t(
            "Connecting agents to tools; I hold Anthropic's MCP course certificate.",
            "Agenten mit Werkzeugen verbinden; ich habe das MCP-Kurszertifikat von Anthropic."
          )
        ),
        skill(
          "prompt-design",
          "Prompt design",
          t(
            "Getting the support agent to answer from its sources or say it cannot.",
            "Den Support-Agenten dazu bringen, aus seinen Quellen zu antworten oder zu sagen, dass er es nicht kann."
          ),
          "support-agent"
        ),
      ],
    },
    {
      id: "retrieval-evaluation",
      order: 2,
      title: t("Retrieval & evaluation", "Retrieval & Evaluation"),
      skills: [
        skill(
          "rag",
          "RAG pipelines",
          t(
            "Search over policy documents, with every answer checked against its sources.",
            "Suche in Richtliniendokumenten, jede Antwort wird gegen ihre Quellen geprüft."
          ),
          "support-agent"
        ),
        skill(
          "vector-search",
          "Vector search",
          t(
            "Qdrant holds the documents the support agent cites.",
            "Qdrant hält die Dokumente, die der Support-Agent zitiert."
          ),
          "support-agent"
        ),
        skill(
          "test-sets",
          "Test sets",
          t(
            "17 hand-labelled shipments took field accuracy from 45.8% to about 88%.",
            "17 von Hand gelabelte Sendungen hoben die Feldgenauigkeit von 45,8 % auf etwa 88 %."
          ),
          "flag-and-fill"
        ),
        skill(
          "agent-evals",
          "Agent evals",
          t(
            "Planned for my thesis: scoring spreadsheet agents on SpreadsheetBench.",
            "Geplant für meine Thesis: Tabellenagenten auf SpreadsheetBench bewerten."
          ),
          "agents-in-the-grid"
        ),
      ],
    },
    {
      id: "machine-learning",
      order: 3,
      title: t("Machine learning", "Maschinelles Lernen"),
      skills: [
        skill(
          "pytorch",
          "PyTorch",
          t(
            "Trained and compared four image models on 112,120 chest X-rays.",
            "Vier Bildmodelle auf 112.120 Röntgenbildern der Brust trainiert und verglichen."
          )
        ),
        skill(
          "deep-learning",
          "Deep learning",
          t(
            "Tuning thresholds per disease raised the share of cases found from 13.7% to 83.2%.",
            "Schwellenwerte je Krankheit hoben den Anteil gefundener Fälle von 13,7 % auf 83,2 %."
          )
        ),
        skill(
          "computer-vision",
          "Computer vision",
          t(
            "Taught a Niryo Ned arm to find objects by camera and sort them by colour.",
            "Einem Niryo-Ned-Roboterarm beigebracht, Objekte per Kamera zu finden und nach Farbe zu sortieren."
          )
        ),
        skill(
          "robotics",
          "Robotics",
          t(
            "M.Sc. in AI & Robotics at Hof University.",
            "M.Sc. KI & Robotik an der Hochschule Hof."
          )
        ),
      ],
    },
    {
      id: "product-engineering",
      order: 4,
      title: t("Product engineering", "Produktentwicklung"),
      skills: [
        skill(
          "fastapi",
          "Python · FastAPI",
          t(
            "The API behind the support agent.",
            "Die API hinter dem Support-Agenten."
          ),
          "support-agent"
        ),
        skill(
          "nextjs",
          "TypeScript · Next.js",
          t(
            "The whole SSRI assessment platform, built on my own.",
            "Die gesamte SSRI-Assessment-Plattform, allein gebaut."
          ),
          "ssri"
        ),
        skill(
          "postgres",
          "Postgres",
          t(
            "Respondents, scores and payments for SSRI.",
            "Teilnehmende, Ergebnisse und Zahlungen für SSRI."
          ),
          "ssri"
        ),
        skill(
          "pwa",
          "PWA",
          t(
            "PocketPulse installs on a phone and works offline.",
            "PocketPulse lässt sich auf dem Handy installieren und funktioniert offline."
          ),
          "pocketpulse"
        ),
        skill(
          "docker",
          "Docker",
          t(
            "Local stacks that start with one command.",
            "Lokale Stacks, die mit einem Befehl starten."
          )
        ),
      ],
    },
  ];
}
