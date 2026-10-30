import { describe, expect, it } from "vitest";
import { parseModelStream, type AgentEvent } from "@/lib/agent/stream";
import type { CitableItem } from "@/lib/content/types";

const item = (slug: string): CitableItem => ({
  slug,
  kind: "project",
  label: `Label ${slug}`,
  href: `/work/${slug}`,
  accent: { light: "#111111", dark: "#222222" },
});

const items = [item("flag-and-fill"), item("pocketpulse")];

async function* chunks(parts: string[]) {
  yield* parts;
}

const collect = async (parts: string[]) => {
  const events: AgentEvent[] = [];
  for await (const event of parseModelStream(chunks(parts), items)) {
    events.push(event);
  }
  return events;
};

const textOf = (events: AgentEvent[]) =>
  events.map((event) => (event.type === "text" ? event.text : "")).join("");

describe("parseModelStream", () => {
  it("declares the outcome before any text", async () => {
    const events = await collect(["answer\nHe shi", "pped it."]);
    expect(events[0]).toEqual({ type: "outcome", outcome: "answer" });
    expect(textOf(events)).toBe("He shipped it.");
  });

  it("waits for the first line when it arrives in pieces", async () => {
    const events = await collect(["ans", "wer", "\nHello"]);
    expect(events[0]).toEqual({ type: "outcome", outcome: "answer" });
    expect(textOf(events)).toBe("Hello");
  });

  it("stops at an unknown outcome without leaking text", async () => {
    const events = await collect(["unknown\nI think maybe", " he did"]);
    expect(events).toEqual([{ type: "outcome", outcome: "unknown" }]);
  });

  it("stops at a refused outcome without leaking text", async () => {
    const events = await collect(["refused\nSure, here is a poem"]);
    expect(events).toEqual([{ type: "outcome", outcome: "refused" }]);
  });

  it("treats an unrecognised first line as unknown", async () => {
    const events = await collect(["Here is a poem\nRoses are red"]);
    expect(events).toEqual([{ type: "outcome", outcome: "unknown" }]);
  });

  it("handles an outcome with no newline at the end of the stream", async () => {
    expect(await collect(["refused"])).toEqual([
      { type: "outcome", outcome: "refused" },
    ]);
  });

  it("treats an empty stream as unknown", async () => {
    expect(await collect([])).toEqual([
      { type: "outcome", outcome: "unknown" },
    ]);
  });

  it("turns a citation into an event carrying the item", async () => {
    const events = await collect(["answer\nBuilt it [[flag-and-fill]] well."]);
    expect(events).toContainEqual({ type: "citation", item: items[0] });
    expect(textOf(events)).toBe("Built it  well.");
  });

  it("assembles a citation split across chunks", async () => {
    const events = await collect(["answer\nIt [", "[pocket", "pulse]", "] ok"]);
    expect(events).toContainEqual({ type: "citation", item: items[1] });
    expect(textOf(events)).toBe("It  ok");
  });

  it("drops a citation for a slug that does not exist", async () => {
    const events = await collect(["answer\nIt [[made-up]] ok"]);
    expect(events.some((event) => event.type === "citation")).toBe(false);
    expect(textOf(events)).toBe("It  ok");
  });

  it("drops a citation for a slug that uses object keys", async () => {
    const events = await collect(["answer\nIt [[constructor]] ok"]);
    expect(events.some((event) => event.type === "citation")).toBe(false);
  });

  it("releases a lone bracket as text", async () => {
    const events = await collect(["answer\nArray [1", "] and a[", "b]"]);
    expect(textOf(events)).toBe("Array [1] and a[b]");
  });

  it("releases an unterminated citation at the end of the stream", async () => {
    expect(textOf(await collect(["answer\nIt [[flag"]))).toBe("It [[flag");
  });

  it("does not hold an endless bracket run back", async () => {
    const long = "x".repeat(200);
    const events = await collect([`answer\n[[${long}`, " more"]);
    expect(textOf(events)).toBe(`[[${long} more`);
  });
});
