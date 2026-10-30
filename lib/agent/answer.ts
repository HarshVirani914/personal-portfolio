import type { AgentWireEvent } from "@/lib/agent/stream";
import type { CitableItem } from "@/lib/content/types";

type Part =
  { kind: "text"; text: string } | { kind: "citation"; item: CitableItem };

/** What the overlay reveals one at a time. */
export type AnswerToken =
  { kind: "word"; text: string } | { kind: "citation"; item: CitableItem };

export type AnswerState = {
  status:
    | "idle"
    | "reading"
    | "answering"
    | "done"
    | "unknown"
    | "refused"
    | "limited"
    | "error";
  cached: boolean;
  reading: { projects: number; research: number } | null;
  parts: Part[];
  sources: string[];
};

export const initialAnswer: AnswerState = {
  status: "idle",
  cached: false,
  reading: null,
  parts: [],
  sources: [],
};

export function answerReducer(
  state: AnswerState,
  event: AgentWireEvent | { type: "reset" }
): AnswerState {
  switch (event.type) {
    case "reset":
      return initialAnswer;
    case "start":
      return {
        ...state,
        status: "reading",
        reading: { projects: event.projects, research: event.research },
      };
    case "cached":
      return { ...state, cached: true };
    case "limited":
      return { ...state, status: "limited" };
    case "outcome":
      return {
        ...state,
        status: event.outcome === "answer" ? "answering" : event.outcome,
      };
    case "text": {
      const last = state.parts.at(-1);
      return {
        ...state,
        parts:
          last?.kind === "text"
            ? [
                ...state.parts.slice(0, -1),
                { kind: "text", text: last.text + event.text },
              ]
            : [...state.parts, { kind: "text", text: event.text }],
      };
    }
    case "citation":
      return {
        ...state,
        parts: [...state.parts, { kind: "citation", item: event.item }],
        sources: state.sources.includes(event.item.slug)
          ? state.sources
          : [...state.sources, event.item.slug],
      };
    case "done":
      return state.status === "answering"
        ? { ...state, status: "done" }
        : state;
    case "error":
      return { ...state, status: "error" };
  }
}

export function toTokens(parts: Part[]): AnswerToken[] {
  return parts.flatMap((part): AnswerToken[] =>
    part.kind === "citation"
      ? [part]
      : (part.text.match(/\S+\s*|\s+/g) ?? []).map((text) => ({
          kind: "word",
          text,
        }))
  );
}

export type TraceStage =
  | { stage: "reading"; projects: number; research: number }
  | { stage: "answering" }
  | { stage: "sources"; count: number }
  | { stage: "answered" }
  | { stage: "cached"; count: number };

/** Only stages that really happen: the Agent reads, answers, and counts what it cited. */
export function traceStage(state: AnswerState): TraceStage | null {
  if (state.cached && ["answering", "done"].includes(state.status)) {
    return { stage: "cached", count: state.sources.length };
  }
  switch (state.status) {
    case "reading":
      return state.reading && { stage: "reading", ...state.reading };
    case "answering":
      return { stage: "answering" };
    case "done":
      return state.sources.length > 0
        ? { stage: "sources", count: state.sources.length }
        : { stage: "answered" };
    default:
      return null;
  }
}
