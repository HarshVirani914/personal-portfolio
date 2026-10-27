import {
  Bot,
  Brain,
  LineChart,
  ShoppingBag,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectDetail = {
  tagline: string;
  role: string;
  timeline: string;
  problem: string;
  approach: string;
  outcome: string;
  highlights: string[];
  stack: string[];
};

export type Project = {
  id: string;
  icon: LucideIcon;
  iconLabel: string;
  title: string;
  description: string;
  meta: string;
  imageRatio: number;
  image: string;
  imageAlt: string;
  links?: ProjectLink[];
  detail: ProjectDetail;
};

export const PROJECTS: Project[] = [
  {
    id: "pocketpulse",
    icon: Wallet,
    iconLabel: "PocketPulse",
    title:
      "A progressive web app for tracking expenses, splitting group bills, and seeing where your money actually goes.",
    description:
      "I built it end to end with Next.js, Clerk, and Gemini-powered chat, from dozens of API routes and offline install to AI-assisted entry that follows the same rules as the rest of the app.",
    meta: "Independent Project, 2026",
    imageRatio: 1536 / 1024,
    image: "/projects/pocketpulse.webp",
    imageAlt: "PocketPulse expense tracker PWA",
    links: [{ label: "Live site", href: "https://pocketpulse.me" }],
    detail: {
      tagline: "Personal finance PWA with group splits and AI-assisted entry",
      role: "Solo builder — design through deployment",
      timeline: "May 2026 · ~3 weeks to production",
      problem:
        "People juggle personal spending, shared bills, and group IOUs in different places, which makes it easy to lose track of what is actually owed or spent.",
      approach:
        "I shipped a Next.js PWA with a feature-based architecture: expenses, groups, analytics, and an AI chat that calls the same service layer as the REST API so mutations stay consistent. Clerk handles auth, Prisma on PostgreSQL powers the ledger, and Serwist enables offline install.",
      outcome:
        "PocketPulse is live at pocketpulse.me with installable PWA support, INR-first flows, and AI tooling that respects the same business rules as the core app.",
      highlights: [
        "41 API routes across 13 feature modules",
        "AI chat streams through Gemini with user-approved writes",
        "Serverless-safe DB pooling for Vercel deploys",
      ],
      stack: [
        "Next.js",
        "TypeScript",
        "Prisma",
        "PostgreSQL",
        "Clerk",
        "Gemini",
        "Serwist",
        "TanStack Query",
      ],
    },
  },
  {
    id: "agentic-support",
    icon: Bot,
    iconLabel: "Agentic Support",
    title:
      "A customer support surface that routes questions to specialized agents instead of one generic chatbot.",
    description:
      "I built the LangGraph flow and RAG layer so orders, shipping, and general queries each get a focused agent with grounded answers.",
    meta: "Independent Project, 2026",
    imageRatio: 1536 / 1024,
    image: "/projects/agentic-support-system.webp",
    imageAlt: "Agentic AI customer support system",
    links: [
      { label: "GitHub", href: "https://github.com/HarshVirani914/agentic-support-system" },
      { label: "Live demo", href: "https://agentic-support-system.vercel.app/" },
    ],
    detail: {
      tagline: "Multi-agent support with RAG and full observability",
      role: "Independent full-stack + GenAI build",
      timeline: "April 2026 · 3 weeks",
      problem:
        "Single chatbots struggle when support spans orders, shipping, and general FAQs — answers get generic and hard to trust.",
      approach:
        "I used LangGraph to classify each query and route it to a domain agent with its own RAG context. FastAPI serves the API, Qdrant stores embeddings, and LangSmith traces every run for latency and retrieval quality.",
      outcome:
        "A deployed demo answers with cited context in under three seconds, with a production-minded stack that fits free-tier hosting constraints.",
      highlights: [
        "93% smaller deploy footprint after embedding strategy change",
        "LangSmith tracing on agent routing and retrieval",
        "97 knowledge-base chunks with category-aware search",
      ],
      stack: [
        "LangGraph",
        "LangChain",
        "FastAPI",
        "Qdrant",
        "Groq",
        "LangSmith",
        "React",
        "Next.js",
      ],
    },
  },
  {
    id: "youtube-rag",
    icon: Brain,
    iconLabel: "YouTube RAG",
    title:
      "Ask questions over YouTube transcripts and get answers pulled from the right moments in the video.",
    description:
      "I wired up ingestion, embeddings, and retrieval so long transcripts stay searchable without feeling like a terminal.",
    meta: "Independent Project, 2025",
    imageRatio: 1200 / 896,
    image: "/projects/youtube-rag.webp",
    imageAlt: "YouTube RAG application",
    links: [
      { label: "GitHub", href: "https://github.com/HarshVirani914/youtube-rag-app" },
    ],
    detail: {
      tagline: "Semantic Q&A over long video transcripts",
      role: "Solo developer",
      timeline: "2025",
      problem:
        "Long YouTube transcripts are painful to search manually when you only need one answer from an hour of content.",
      approach:
        "I built a RAG pipeline with chunked transcripts, HuggingFace embeddings, and a FAISS index. LangChain RunnableParallel runs retrieval and formatting concurrently so the app feels responsive in Streamlit.",
      outcome:
        "Users can ask questions in English or Hindi and get answers grounded in the most relevant transcript segments.",
      highlights: [
        "45% faster pipeline via parallel retrieval",
        "10K+ chunks indexed for sub-second search",
        "Streamlit UI for quick iteration on prompts",
      ],
      stack: [
        "LangChain",
        "FAISS",
        "HuggingFace",
        "Streamlit",
        "Python",
      ],
    },
  },
  {
    id: "smartdiet",
    icon: Utensils,
    iconLabel: "SmartDiet AI",
    title:
      "Personalized diet guidance that pairs ML predictions with LLM meal plans.",
    description:
      "I helped shape the pipeline from health inputs to diet type to weekly meals, built for a data-mining capstone at Hof.",
    meta: "Team Project, 2025",
    imageRatio: 1448 / 1086,
    image: "/projects/smartdiet.webp",
    imageAlt: "SmartDiet AI health platform",
    detail: {
      tagline: "ML diet classification plus LLM meal planning",
      role: "Team capstone — Hof University",
      timeline: "Jan – Apr 2025",
      problem:
        "Generic diet advice rarely fits chronic conditions, lifestyle factors, and personal preferences at the same time.",
      approach:
        "We trained classifiers on health records to predict diet type, then chained Groq LLM meal plans with constraint checks. A Streamlit app ties onboarding, predictions, and conversational planning together.",
      outcome:
        "The system reaches strong cross-validated accuracy on diet type and high adherence to dietary rules in generated meal plans.",
      highlights: [
        "100% CV accuracy on capstone dataset (XGBoost)",
        "95% dietary constraint adherence across test profiles",
        "Automated metrics for 3 models in under 5 seconds",
      ],
      stack: [
        "Python",
        "XGBoost",
        "Scikit-learn",
        "LangChain",
        "Groq",
        "Streamlit",
      ],
    },
  },
  {
    id: "thoracic-imaging",
    icon: LineChart,
    iconLabel: "Chest X-Ray AI",
    title:
      "A screening helper that flags multiple chest conditions from a single X-ray.",
    description:
      "I trained and compared architectures on the NIH dataset, tuning for recall on rare diseases without blowing up model size.",
    meta: "Research Project, 2025",
    imageRatio: 1448 / 1086,
    image: "/projects/chest-x-ray.webp",
    imageAlt: "Chest X-Ray AI medical imaging",
    links: [
      { label: "GitHub", href: "https://github.com/HarshVirani914/AI-Project" },
    ],
    detail: {
      tagline: "Multi-label screening on 112K chest X-rays",
      role: "Solo MSc research project",
      timeline: "Oct – Dec 2025",
      problem:
        "Thoracic diseases are easy to miss when models favor common labels, yet screening needs high sensitivity on rare conditions too.",
      approach:
        "I benchmarked CNN architectures on NIH ChestX-ray14, then tuned class-weighted loss and per-disease thresholds. EfficientNet-B0 gave the best balance of AUC and model size for deployment thinking.",
      outcome:
        "Recall improved dramatically across 14 labels while keeping inference fast enough for triage-style use cases.",
      highlights: [
        "83.6% AUC with EfficientNet-B0 (4M parameters)",
        "Recall rose from 13.7% to 83.2% after imbalance tuning",
        "~15ms inference per image on GPU",
      ],
      stack: [
        "PyTorch",
        "OpenCV",
        "EfficientNet",
        "Scikit-learn",
        "NumPy",
      ],
    },
  },
  {
    id: "goshimmy",
    icon: ShoppingBag,
    iconLabel: "GoShimmy",
    title:
      "E-commerce platform work for a live product serving thousands of daily users.",
    description:
      "I shipped full-stack features, tightened deploys with AWS CI/CD, and improved load times on the production storefront.",
    meta: "Software Engineer, 2024",
    imageRatio: 1448 / 1086,
    image: "/projects/goshimmy.webp",
    imageAlt: "GoShimmy e-commerce platform",
    links: [{ label: "Live site", href: "https://goshimmy.com" }],
    detail: {
      tagline: "Production e-commerce at scale",
      role: "Software Engineer · TechStaunch",
      timeline: "Jul 2024 – Mar 2025",
      problem:
        "A growing storefront needed reliable releases, faster pages, and real-time features without breaking the daily shopping flow.",
      approach:
        "I delivered full-stack features on React and integrated ASP.NET APIs with SignalR for live updates. AWS CI/CD (S3, CloudFront, CodePipeline) replaced manual deploys.",
      outcome:
        "The platform serves 10K+ daily users with much shorter release cycles and measurably faster load times.",
      highlights: [
        "87% faster deployments (8h → 50min)",
        "40% faster page loads after profiling",
        "50K+ daily transactions through integrated APIs",
      ],
      stack: [
        "React",
        "TypeScript",
        "AWS",
        "SignalR",
        "ASP.NET",
        "CI/CD",
      ],
    },
  },
];
