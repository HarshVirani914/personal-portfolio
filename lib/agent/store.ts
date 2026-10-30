import type { AgentEvent } from "@/lib/agent/stream";
import type { Locale } from "@/lib/i18n";

export type CachedAnswer = { events: AgentEvent[] };

export type LogEntry = {
  question: string;
  locale: Locale;
  at: number;
  citations: string[];
  outcome: "answer" | "unknown" | "refused" | "unavailable";
  /** The questions worth answering in the CMS. */
  unanswered: boolean;
  cached: boolean;
};

/** Holds everything the Agent's gates need across serverless instances. */
export type AgentStore = {
  readAnswer(key: string): Promise<CachedAnswer | null>;
  writeAnswer(key: string, answer: CachedAnswer): Promise<void>;
  /** The day's salt: `fresh` if this is the first request of the day. */
  daySalt(day: string, fresh: string): Promise<string>;
  /** Counts one model call and returns the visitor's total for the day. */
  countVisit(day: string, visitor: string): Promise<number>;
  /** Adds tokens, negative to refund, and returns the day's total. */
  spend(day: string, tokens: number): Promise<number>;
  log(entry: LogEntry): Promise<void>;
};
