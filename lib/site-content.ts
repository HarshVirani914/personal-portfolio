export const siteLinks = {
  email: "harshvirani.91@gmail.com",
  linkedin: "https://www.linkedin.com/in/harshvirani914/",
  github: "https://github.com/HarshVirani914",
  /** Source: Resumes/applications/Portfolio_AI_ML/cv.tex — compile in Overleaf, copy PDF here */
  cvPath: "/harsh-virani-ai-ml-cv.pdf",
  cvDownloadName: "Harsh-Virani-CV.pdf",
} as const;

export type ResearchPaper = {
  id: string;
  title: string;
  period: string;
  summary: string;
  paperPath: string;
};

/** Written research / literature reviews with downloadable PDFs */
export const researchPapers: ResearchPaper[] = [
  {
    id: "llm-ecosystem",
    title: "The evolving ecosystem of large language models",
    period: "2025",
    summary:
      "Comparative analysis of decoder-only, encoder-only, and encoder-decoder architectures across NLU and NLG; prompt strategies, hallucination mitigation, and Code LLMs.",
    paperPath: "/research/evolving_ecosystem_of_llm.pdf",
  },
  {
    id: "lcnc-ai",
    title: "AI-augmented Low-Code / No-Code platforms",
    period: "2025",
    summary:
      "LLM-based agents bridging engineers and citizen developers; task-technology fit and workflow integration.",
    paperPath: "/research/ai_augemented_lcnc.pdf",
  },
];

export type AcademicWorkEntry = {
  id: string;
  title: string;
  period: string;
  summary: string;
};

/** University coursework — practical implementations */
export const academicWorkEntries: AcademicWorkEntry[] = [
  {
    id: "aevb",
    title: "Auto-Encoding Variational Bayes (AEVB)",
    period: "2025",
    summary:
      "Coursework prototype implementing the AEVB algorithm from a research paper, bridging theoretical concepts with hands-on execution.",
  },
  {
    id: "cloth-warping",
    title: "Heuristical 2D cloth warping",
    period: "2025",
    summary:
      "Assisted on a university simulation project under faculty guidance, contributing to cloth deformation modeling and algorithm development.",
  },
];
