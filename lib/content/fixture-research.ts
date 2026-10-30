import type { RawResearch } from "@/lib/content/types";

const line = (en: string, de?: string) => ({ en, de });

/** The thesis and the two papers. Used by tests and local development; production reads Sanity. */
export const fixtureResearch: RawResearch[] = [
  {
    id: "agents-in-the-grid",
    slug: "agents-in-the-grid",
    order: 1,
    type: "thesis",
    status: line("in preparation", "in Vorbereitung"),
    period: "2026 — 27",
    title: line("Agents in the", "Agenten im"),
    titleEmphasis: line("Grid", "Raster"),
    summary: line(
      "Deep-research LLM agents for office work: can an agent do real spreadsheet work reliably, and does that depend more on the model or on the harness around it? A planned study on SpreadsheetBench.",
      "Deep-Research-LLM-Agenten für die Büroarbeit: Kann ein Agent echte Tabellenarbeit zuverlässig erledigen, und hängt das mehr vom Modell oder vom Harness drumherum ab? Eine geplante Studie auf SpreadsheetBench."
    ),
    kicker: line(
      "Master's thesis · in preparation · Hof University",
      "Masterarbeit · in Vorbereitung · Hochschule Hof"
    ),
    standfirst: line(
      "Can an AI agent do real spreadsheet work reliably, and does success depend more on the model or on the harness around it?",
      "Kann ein KI-Agent echte Tabellenarbeit zuverlässig erledigen, und hängt der Erfolg mehr vom Modell oder vom Harness drumherum ab?"
    ),
    supervisor: line("Prof. Dr. René Peinl"),
    updated: "2026-10-27",
    abstract: line(
      "Spreadsheets are where office work actually happens, yet most agents treat them as text. This thesis takes the agent harness from coding agents to spreadsheets: a defined set of spreadsheet actions, run against a real spreadsheet program in an isolated container. The plan is to compare about five open-weight models on one harness, then fix the best model and compare my harness against ready-made agent harnesses, on SpreadsheetBench. I am in the literature review; nothing is implemented yet and there are no results.",
      "Tabellen sind der Ort, an dem Büroarbeit tatsächlich stattfindet, doch die meisten Agenten behandeln sie als Text. Diese Arbeit überträgt das Agent-Harness aus Coding-Agenten auf Tabellen: ein festgelegter Satz an Tabellenaktionen, ausgeführt gegen ein echtes Tabellenprogramm in einem isolierten Container. Geplant ist, etwa fünf Open-Weight-Modelle auf einem Harness zu vergleichen, dann das beste Modell festzuhalten und mein Harness mit fertigen Agent-Harnesses zu vergleichen, auf SpreadsheetBench. Ich bin in der Literaturrecherche; es ist noch nichts implementiert und es gibt noch keine Ergebnisse."
    ),
    sections: [
      {
        id: "why-spreadsheets",
        heading: line("Why spreadsheets", "Warum Tabellen"),
        blocks: [
          {
            id: "why-1",
            kind: "paragraph",
            text: line(
              "Ask an agent to “reconcile last quarter's invoices” and it has to find the right sheet, read ranges it can't see all at once, respect formulas someone else wrote and leave the file in a state a human trusts. That's research and execution in the same loop.",
              "Bitten Sie einen Agenten, „die Rechnungen des letzten Quartals abzugleichen“, muss er das richtige Blatt finden, Bereiche lesen, die er nicht auf einmal sieht, fremde Formeln respektieren und die Datei in einem Zustand hinterlassen, dem ein Mensch vertraut. Das ist Recherche und Ausführung in derselben Schleife."
            ),
            note: line(
              "Spreadsheets only, for now. Other kinds of office work are out of scope.",
              "Vorerst nur Tabellen. Andere Büroarbeit ist nicht Teil der Arbeit."
            ),
          },
          {
            id: "why-2",
            kind: "paragraph",
            text: line(
              "A benchmark that only checks the final answer misses how the agent got there. In a spreadsheet the path matters too: a correct number written over a formula is still a broken file.",
              "Ein Benchmark, der nur die Endantwort prüft, übersieht den Weg dorthin. In einer Tabelle zählt auch der Weg: Eine korrekte Zahl, die über eine Formel geschrieben wurde, ist trotzdem eine kaputte Datei."
            ),
          },
          {
            id: "why-fig",
            kind: "figure",
            figure: null,
            caption: line(
              "The agent's loop on a sheet: look, read a range, reason, act, check. Interactive figure in progress.",
              "Die Schleife des Agenten auf einem Blatt: ansehen, Bereich lesen, abwägen, handeln, prüfen. Interaktive Grafik in Arbeit."
            ),
          },
        ],
      },
      {
        id: "the-plan",
        heading: line("The planned harness", "Das geplante Harness"),
        blocks: [
          {
            id: "plan-1",
            kind: "paragraph",
            text: line(
              "The idea is to bring the agent harness from coding agents to spreadsheets. The agent gets a defined set of spreadsheet actions, such as reading cells, writing a formula, filtering, sorting and building a pivot table, and works on a real spreadsheet inside an isolated container. The current plan is LibreOffice with its Python bridge, one Docker container per task, no network.",
              "Die Idee ist, das Agent-Harness aus Coding-Agenten auf Tabellen zu übertragen. Der Agent bekommt einen festgelegten Satz an Tabellenaktionen, etwa Zellen lesen, eine Formel schreiben, filtern, sortieren und eine Pivot-Tabelle bauen, und arbeitet in einem isolierten Container an einer echten Tabelle. Aktuell geplant ist LibreOffice mit seiner Python-Brücke, ein Docker-Container pro Aufgabe, kein Netzwerk."
            ),
            note: line(
              "The spreadsheet and the model run in separate containers, on the university's cluster.",
              "Tabelle und Modell laufen in getrennten Containern auf dem Cluster der Hochschule."
            ),
          },
          {
            id: "plan-code",
            kind: "code",
            code: [
              "# a sketch of the planned action set (not implemented)",
              "read_cells(range)",
              "write_formula(cell, formula)",
              "filter(range, condition)",
              "sort(range, key)",
              "build_pivot(source, rows, values)",
              "validate()",
            ].join("\n"),
            caption: line(
              "Planned actions, a sketch",
              "Geplante Aktionen, eine Skizze"
            ),
          },
          {
            id: "plan-quote",
            kind: "quote",
            text: line(
              "A correct number written over a formula is still a broken file.",
              "Eine korrekte Zahl über einer Formel ist trotzdem eine kaputte Datei."
            ),
          },
        ],
      },
      {
        id: "the-study",
        heading: line("The planned study", "Die geplante Studie"),
        blocks: [
          {
            id: "study-1",
            kind: "paragraph",
            text: line(
              "Two experiments, both on SpreadsheetBench [1]. First, one harness and about five open-weight models. Second, the best model held fixed while the whole harness is swapped: mine against ready-made agent harnesses, SWE-agent [2] among the candidates. From the two together I want to argue whether a strong model or a strong harness matters more.",
              "Zwei Experimente, beide auf SpreadsheetBench [1]. Erstens ein Harness und etwa fünf Open-Weight-Modelle. Zweitens das beste Modell festgehalten, während das ganze Harness getauscht wird: meines gegen fertige Agent-Harnesses, darunter SWE-agent [2] als Kandidat. Aus beiden zusammen will ich ableiten, ob ein starkes Modell oder ein starkes Harness mehr zählt."
            ),
            note: line(
              "Open-weight models only, not open against frontier models.",
              "Nur Open-Weight-Modelle, nicht offen gegen Frontier-Modelle."
            ),
          },
        ],
      },
      {
        id: "where-it-stands",
        heading: line("Where it stands", "Stand der Dinge"),
        blocks: [
          {
            id: "stands-1",
            kind: "paragraph",
            text: line(
              "I am in the literature review and shaping the study design with my supervisor. Nothing is implemented yet and there are no results. This page will update as the work moves.",
              "Ich bin in der Literaturrecherche und gestalte das Studiendesign mit meinem Betreuer. Es ist noch nichts implementiert und es gibt noch keine Ergebnisse. Diese Seite wird aktualisiert, sobald sich die Arbeit bewegt."
            ),
          },
        ],
      },
    ],
    references: [
      line(
        "Z. Ma et al. SpreadsheetBench: towards challenging real-world spreadsheet manipulation. 2024."
      ),
      line(
        "J. Yang et al. SWE-agent: agent-computer interfaces enable automated software engineering. 2024."
      ),
    ],
    pdfUrl: null,
    cite: line(
      "Virani, H. (2026). Deep research LLM agents for office work: an empirical investigation with spreadsheet software. Master's thesis in preparation, Hof University of Applied Sciences."
    ),
    accentLight: "#1f7a6a",
    accentDark: "#4fb39c",
  },
  {
    id: "evolving-ecosystem-of-llms",
    slug: "evolving-ecosystem-of-llms",
    order: 2,
    type: "paper",
    status: line("paper", "Paper"),
    period: "2025",
    title: line(
      "The evolving ecosystem of large language models",
      "Das sich wandelnde Ökosystem großer Sprachmodelle"
    ),
    titleEmphasis: line(""),
    summary: line(
      "Decoder, encoder and encoder-decoder models compared across understanding and generation, with prompting, hallucination and code LLMs.",
      "Decoder-, Encoder- und Encoder-Decoder-Modelle im Vergleich über Verstehen und Generieren, mit Prompting, Halluzination und Code-LLMs."
    ),
    kicker: line(
      "Paper · 2025 · Hof University of Applied Sciences",
      "Paper · 2025 · Hochschule Hof"
    ),
    standfirst: line(
      "A comparative overview of what the three families of language model are good at, where they fall short and why code models became their own field.",
      "Ein vergleichender Überblick darüber, was die drei Familien von Sprachmodellen gut können, wo sie scheitern und warum Code-Modelle zu einem eigenen Feld wurden."
    ),
    supervisor: line(""),
    updated: "",
    abstract: line(
      "Large language models now lead on most language tasks, but the label hides three different designs. This paper compares decoder-only, encoder-only and encoder-decoder architectures through a literature review: what each is built for, how it performs across domains, and which limits (bias, hallucination, compute cost) come with it. Code models get their own section because they show the clearest payoff.",
      "Große Sprachmodelle führen heute bei den meisten Sprachaufgaben, doch der Begriff verdeckt drei unterschiedliche Bauweisen. Dieses Paper vergleicht Decoder-only-, Encoder-only- und Encoder-Decoder-Architekturen anhand einer Literaturübersicht: wofür jede gebaut ist, wie sie in verschiedenen Bereichen abschneidet und welche Grenzen (Verzerrung, Halluzination, Rechenaufwand) damit einhergehen. Code-Modelle bekommen einen eigenen Abschnitt, weil sie den deutlichsten Nutzen zeigen."
    ),
    sections: [
      {
        id: "one-label-three-designs",
        heading: line(
          "One label, three designs",
          "Ein Begriff, drei Bauweisen"
        ),
        blocks: [
          {
            id: "designs-1",
            kind: "paragraph",
            text: line(
              "Almost every modern language model is built on the Transformer and its attention mechanism [1]. What differs is which half of it a model keeps. That choice decides what the model is good at, long before any training data is chosen.",
              "Fast jedes moderne Sprachmodell basiert auf dem Transformer und seinem Attention-Mechanismus [1]. Unterschiedlich ist, welche Hälfte davon ein Modell behält. Diese Wahl entscheidet, worin das Modell gut ist, lange bevor Trainingsdaten gewählt werden."
            ),
          },
          {
            id: "designs-2",
            kind: "paragraph",
            text: line(
              "Decoder-only models predict the next token and so lead on generative work. Encoder-only models read a whole sequence at once and excel at understanding and extracting information. Encoder-decoder models read, then write, which suits translation and summarisation [2].",
              "Decoder-only-Modelle sagen das nächste Token voraus und führen daher bei generativen Aufgaben. Encoder-only-Modelle lesen eine ganze Sequenz auf einmal und sind stark im Verstehen und Extrahieren von Informationen. Encoder-Decoder-Modelle lesen und schreiben dann, was zu Übersetzung und Zusammenfassung passt [2]."
            ),
          },
        ],
      },
      {
        id: "how-they-compare",
        heading: line("How they compare", "Der Vergleich"),
        blocks: [
          {
            id: "compare-1",
            kind: "paragraph",
            text: line(
              "The comparison runs across coding, reasoning and understanding, text generation and question answering, plus domain-specific models [3]. Coding is scored on HumanEval pass@1, among other benchmarks [4].",
              "Der Vergleich läuft über Coding, Schlussfolgern und Verstehen, Textgenerierung und Frage-Antwort-Systeme sowie domänenspezifische Modelle. Coding wird unter anderem mit HumanEval Pass@1 bewertet [4]."
            ),
          },
        ],
      },
      {
        id: "code-models",
        heading: line("Code models", "Code-Modelle"),
        blocks: [
          {
            id: "code-1",
            kind: "paragraph",
            text: line(
              "Code LLMs turn a natural-language description into source code (NL2Code) and go on to completion, translation and repair. Pre-training objectives such as span corruption and fill-in-the-middle are what make that possible [4].",
              "Code-LLMs verwandeln eine Beschreibung in natürlicher Sprache in Quellcode (NL2Code) und reichen weiter bis zu Vervollständigung, Übersetzung und Reparatur. Vortrainingsziele wie Span Corruption und Fill-in-the-Middle machen das möglich [4]."
            ),
          },
        ],
      },
      {
        id: "limits",
        heading: line("Limits and what comes next", "Grenzen und Ausblick"),
        blocks: [
          {
            id: "limits-1",
            kind: "paragraph",
            text: line(
              "Five limits recur: bias inherited from training data, hallucination (confident text that is false), the compute and energy cost of scale, a lack of interpretability, and security and ethical risks [5]. The open directions follow from them: more efficient models, factual grounding such as retrieval-augmented generation, fairness, interpretability, multimodal and multilingual models, and agents that use tools and environments.",
              "Fünf Grenzen kehren wieder: Verzerrung aus den Trainingsdaten, Halluzination (selbstsicherer, aber falscher Text), der Rechen- und Energieaufwand der Skalierung, fehlende Interpretierbarkeit sowie Sicherheits- und Ethikrisiken [5]. Daraus folgen die offenen Richtungen: effizientere Modelle, faktische Absicherung etwa durch Retrieval-Augmented Generation, Fairness, Interpretierbarkeit, multimodale und mehrsprachige Modelle sowie Agenten, die Werkzeuge und Umgebungen nutzen."
            ),
          },
        ],
      },
    ],
    references: [
      line(
        "A. Vaswani et al. Attention is all you need. Advances in Neural Information Processing Systems 30, 2017."
      ),
      line("S. Minaee et al. Large language models: a survey. 2025."),
      line(
        "M. Shao, A. Basit, R. Karri, M. Shafique. Survey of different large language model architectures: trends, benchmarks, and challenges. IEEE Access 12, 2024."
      ),
      line(
        "J. Jiang et al. A survey on large language models for code generation. 2024."
      ),
      line(
        "R. Patil, V. Gudivada. A review of current trends, techniques, and challenges in large language models (LLMs). Applied Sciences 14(5), 2024."
      ),
    ],
    pdfUrl: "/research/evolving_ecosystem_of_llm.pdf",
    cite: line(
      "Virani, H. (2025). The evolving ecosystem of language: a comparative overview of LLM architectures and their expanding applications. Hof University of Applied Sciences."
    ),
    accentLight: "#141414",
    accentDark: "#eceae4",
  },
  {
    id: "ai-augmented-low-code",
    slug: "ai-augmented-low-code",
    order: 3,
    type: "paper",
    status: line("paper", "Paper"),
    period: "2025",
    title: line(
      "AI-augmented low-code and no-code platforms",
      "KI-gestützte Low-Code- und No-Code-Plattformen"
    ),
    titleEmphasis: line(""),
    summary: line(
      "How LLM agents bridge engineers and citizen developers: task-technology fit and real workflow integration.",
      "Wie LLM-Agenten Ingenieure und Citizen Developer verbinden: Task-Technology-Fit und echte Einbindung in Arbeitsabläufe."
    ),
    kicker: line(
      "Paper · 2025 · Hof University of Applied Sciences",
      "Paper · 2025 · Hochschule Hof"
    ),
    standfirst: line(
      "Can AI inside a low-code platform close the gap between people who build software for a living and people who just need it built?",
      "Kann KI in einer Low-Code-Plattform die Lücke zwischen Menschen schließen, die beruflich Software bauen, und Menschen, die sie nur gebaut haben wollen?"
    ),
    supervisor: line(""),
    updated: "",
    abstract: line(
      "Demand for software outruns the supply of engineers, so citizen developers build too, on low-code and no-code platforms. This paper reviews the literature on putting AI, especially LLMs and LLM-based agents, inside those platforms: what it changes, what it costs and where the research is thin. It closes with gaps worth studying: task-technology fit, evaluation metrics and proactive assistance.",
      "Die Nachfrage nach Software übersteigt das Angebot an Ingenieuren, also bauen auch Citizen Developer, auf Low-Code- und No-Code-Plattformen. Dieses Paper wertet die Literatur dazu aus, KI, insbesondere LLMs und LLM-basierte Agenten, in diese Plattformen zu bringen: was sich ändert, was es kostet und wo die Forschung dünn ist. Es endet mit Lücken, die sich zu untersuchen lohnen: Task-Technology-Fit, Bewertungsmetriken und proaktive Unterstützung."
    ),
    sections: [
      {
        id: "the-gap",
        heading: line("The gap", "Die Lücke"),
        blocks: [
          {
            id: "gap-1",
            kind: "paragraph",
            text: line(
              "Low-code and no-code platforms let people with little programming background assemble applications from visual parts [1]. Professional engineers, meanwhile, use AI for code generation and recommendations across the development lifecycle. The two groups have different skills and different tools, and the question is what happens when the same AI sits in front of both.",
              "Low-Code- und No-Code-Plattformen lassen Menschen mit wenig Programmierhintergrund Anwendungen aus visuellen Bausteinen zusammensetzen [1]. Professionelle Ingenieure nutzen dagegen KI für Codegenerierung und Empfehlungen im gesamten Entwicklungszyklus. Beide Gruppen haben unterschiedliche Fähigkeiten und Werkzeuge, und die Frage ist, was passiert, wenn dieselbe KI vor beiden sitzt."
            ),
          },
        ],
      },
      {
        id: "how-ai-gets-in",
        heading: line("How AI gets in", "Wie die KI hineinkommt"),
        blocks: [
          {
            id: "in-1",
            kind: "paragraph",
            text: line(
              "The review lists five AI capabilities arriving in low-code platforms: natural-language interfaces, intelligent search for components and functions, code generation, automation of development tasks such as testing, and friendlier AI-assisted interfaces [6]. New generative-AI features keep being announced [3].",
              "Die Übersicht nennt fünf KI-Fähigkeiten, die in Low-Code-Plattformen ankommen: Schnittstellen in natürlicher Sprache, intelligente Suche nach Komponenten und Funktionen, Codegenerierung, Automatisierung von Entwicklungsaufgaben wie Tests und freundlichere KI-gestützte Oberflächen [6]. Laufend werden neue generative KI-Funktionen angekündigt [3]."
            ),
            note: line(
              "Generative AI inside low-code is new, so there is little literature and practical experience so far.",
              "Generative KI in Low-Code ist neu, daher gibt es bisher wenig Literatur und praktische Erfahrung."
            ),
          },
        ],
      },
      {
        id: "what-it-reports",
        heading: line(
          "What the literature reports",
          "Was die Literatur berichtet"
        ),
        blocks: [
          {
            id: "reports-1",
            kind: "paragraph",
            text: line(
              "Reported benefits are efficiency gains in time, effort and cost, and better collaboration between citizen developers and engineers [2]. One user study found no significant difference in correctness or time between programmers and citizen developers on simple applications [2]. Reported challenges fall into three groups: user skills (novices struggle when their goal is unclear), technical limits of the platforms (fragmentation, security), and organisational factors such as role conflicts and governance [4].",
              "Berichtete Vorteile sind Effizienzgewinne bei Zeit, Aufwand und Kosten sowie eine bessere Zusammenarbeit zwischen Citizen Developern und Ingenieuren [2]. Eine Nutzerstudie fand bei einfachen Anwendungen keinen signifikanten Unterschied in Korrektheit oder Zeit zwischen Programmierern und Citizen Developern [2]. Berichtete Herausforderungen fallen in drei Gruppen: Nutzerkompetenzen (Einsteiger tun sich schwer, wenn ihr Ziel unklar ist), technische Grenzen der Plattformen (Fragmentierung, Sicherheit) und organisatorische Faktoren wie Rollenkonflikte und Governance [4]."
            ),
          },
        ],
      },
      {
        id: "open-questions",
        heading: line("Open questions", "Offene Fragen"),
        blocks: [
          {
            id: "open-1",
            kind: "paragraph",
            text: line(
              "The review names six research directions. Three stand out. Task-technology fit: how AI features match different development tasks. Performance metrics: citizen-developer success has no standard measure. Proactive assistance: AI that offers help in the user's workflow instead of waiting for a prompt, which links to LLM-based agents for software engineering [4]. The others are better support for novices, clearer digital-skill definitions, and AI in platform design.",
              "Die Übersicht nennt sechs Forschungsrichtungen, drei stechen hervor. Task-Technology-Fit: wie KI-Funktionen zu verschiedenen Entwicklungsaufgaben passen. Leistungsmetriken: für den Erfolg von Citizen Developern gibt es kein Standardmaß. Proaktive Unterstützung: KI, die im Arbeitsablauf Hilfe anbietet, statt auf einen Prompt zu warten, was an LLM-basierte Agenten für Software Engineering anknüpft [4]. Dazu kommen bessere Unterstützung für Einsteiger, klarere Definitionen digitaler Kompetenzen und KI im Plattformdesign."
            ),
          },
        ],
      },
    ],
    references: [
      line(
        "M. O. Ajimati, N. Carroll, M. Maher. Adoption of low-code and no-code development: a systematic literature review and future research agenda. Journal of Systems and Software 222, 2025."
      ),
      line(
        "T. Guthardt, J. Kosiol, O. Hohlfeld. Low-code vs. the developer: an empirical study on the developer experience and efficiency of a no-code platform. MODELS Companion '24, 2024."
      ),
      line(
        "O. Bruhin, E. Dickhaut, E. Elshan, M. Li. The rise of generative AI in low code development platforms: an analysis and future directions. 2024."
      ),
      line(
        "H. Jin et al. From LLMs to LLM-based agents for software engineering: a survey of current, challenges and future. 2025."
      ),
      line(
        "B. Yetiştiren, I. Özsoy, M. Ayerdem, E. Tüzün. Evaluating the code quality of AI-assisted code generation tools. 2023."
      ),
      line(
        "G. Kacheru, N. Arthan, R. Bajjuru. Artificial intelligence (AI) for low-code and no-code development: making non-developers developers in 2024. Formosa Journal of Multidisciplinary Research 4(1), 2025."
      ),
    ],
    pdfUrl: "/research/ai_augemented_lcnc.pdf",
    cite: line(
      "Virani, H. (2025). AI-augmented low-code development: bridging the gap between citizen developers and software engineers. Hof University of Applied Sciences."
    ),
    accentLight: "#141414",
    accentDark: "#eceae4",
  },
];
