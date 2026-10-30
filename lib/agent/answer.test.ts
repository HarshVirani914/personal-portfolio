import { describe, expect, it } from "vitest";
import {
  answerReducer,
  initialAnswer,
  toTokens,
  traceStage,
} from "@/lib/agent/answer";
import { readAgentStream } from "@/lib/agent/client";
import type { AgentWireEvent } from "@/lib/agent/stream";
import type { CitableItem } from "@/lib/content/types";

const item: CitableItem = {
  slug: "flag-and-fill",
  kind: "project",
  label: "01 Flag & Fill",
  href: "/work/flag-and-fill",
  accent: { light: "#111111", dark: "#222222" },
};

const play = (events: AgentWireEvent[]) =>
  events.reduce(answerReducer, initialAnswer);

const answer: AgentWireEvent[] = [
  { type: "start", projects: 4, research: 3 },
  { type: "outcome", outcome: "answer" },
  { type: "text", text: "He bui" },
  { type: "text", text: "lt it " },
  { type: "citation", item },
  { type: "text", text: " well." },
];

describe("answerReducer", () => {
  it("joins text across events and keeps citations in place", () => {
    expect(toTokens(play(answer).parts)).toEqual([
      { kind: "word", text: "He " },
      { kind: "word", text: "built " },
      { kind: "word", text: "it " },
      { kind: "citation", item },
      { kind: "word", text: " " },
      { kind: "word", text: "well." },
    ]);
  });

  it("counts a repeated citation as one source", () => {
    const state = play([
      ...answer,
      { type: "citation", item },
      { type: "done" },
    ]);
    expect(traceStage(state)).toEqual({ stage: "sources", count: 1 });
  });

  it("reports what is being read before the answer starts", () => {
    expect(traceStage(play(answer.slice(0, 1)))).toEqual({
      stage: "reading",
      projects: 4,
      research: 3,
    });
  });

  it("reports answering once text flows", () => {
    expect(traceStage(play(answer))).toEqual({ stage: "answering" });
  });

  it("settles on an unknown outcome", () => {
    const state = play([
      { type: "start", projects: 4, research: 3 },
      { type: "outcome", outcome: "unknown" },
      { type: "done" },
    ]);
    expect(state.status).toBe("unknown");
    expect(traceStage(state)).toBeNull();
  });

  it("keeps an error terminal even if text came first", () => {
    expect(play([...answer, { type: "error" }]).status).toBe("error");
  });

  it("starts over on reset", () => {
    expect(answerReducer(play(answer), { type: "reset" })).toEqual(
      initialAnswer
    );
  });
});

describe("readAgentStream", () => {
  const respond = (lines: string[]) =>
    new Response(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          for (const line of lines) controller.enqueue(encoder.encode(line));
          controller.close();
        },
      })
    );

  const read = async (response: Response) => {
    const events: AgentWireEvent[] = [];
    await readAgentStream(response, (event) => events.push(event));
    return events;
  };

  it("reassembles events split across chunks", async () => {
    const events = await read(
      respond(['{"type":"te', 'xt","text":"Hi"}\n{"type":"done"}\n'])
    );
    expect(events).toEqual([{ type: "text", text: "Hi" }, { type: "done" }]);
  });

  it("treats a refused response as an error", async () => {
    await expect(read(new Response("{}", { status: 503 }))).rejects.toThrow();
  });
});
