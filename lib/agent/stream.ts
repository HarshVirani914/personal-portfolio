import type { CitableItem } from "@/lib/content/types";

export type AgentOutcome = "answer" | "unknown" | "refused";

export type AgentEvent =
  | { type: "outcome"; outcome: AgentOutcome }
  | { type: "text"; text: string }
  | { type: "citation"; item: CitableItem };

/** One line of the route's response. */
export type AgentWireEvent =
  | AgentEvent
  | { type: "start"; projects: number; research: number }
  | { type: "done" }
  | { type: "error" };

/** Longer than any slug: an opening [[ this far from its ]] is not a citation. */
const MAX_CITATION = 100;

const outcomes: readonly string[] = ["answer", "unknown", "refused"];

function toOutcome(line: string): AgentOutcome {
  const word = line.trim().toLowerCase();
  return outcomes.includes(word) ? (word as AgentOutcome) : "unknown";
}

/**
 * Turns raw model text into events. The outcome line is held until it is whole,
 * text after anything but an answer is discarded, and a citation only gets
 * through if its slug is in `items`.
 */
export async function* parseModelStream(
  source: AsyncIterable<string>,
  items: CitableItem[]
): AsyncGenerator<AgentEvent> {
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  let answering = false;
  let pending = "";

  function* drain(final: boolean): Generator<AgentEvent> {
    const text = (value: string): AgentEvent => ({ type: "text", text: value });
    while (pending !== "") {
      const open = pending.indexOf("[");
      if (open === -1) {
        yield text(pending);
        pending = "";
        return;
      }
      if (open > 0) {
        yield text(pending.slice(0, open));
        pending = pending.slice(open);
      }
      if (pending.length === 1) {
        if (!final) return;
        yield text(pending);
        pending = "";
        return;
      }
      if (pending[1] !== "[") {
        yield text("[");
        pending = pending.slice(1);
        continue;
      }
      const close = pending.indexOf("]]");
      if (close === -1 || close > MAX_CITATION) {
        if (!final && close === -1 && pending.length <= MAX_CITATION) return;
        yield text("[[");
        pending = pending.slice(2);
        continue;
      }
      const item = bySlug.get(pending.slice(2, close).trim());
      if (item) yield { type: "citation", item };
      pending = pending.slice(close + 2);
    }
  }

  for await (const chunk of source) {
    pending += chunk;
    if (!answering) {
      pending = pending.trimStart();
      const end = pending.indexOf("\n");
      if (end === -1) continue;
      const outcome = toOutcome(pending.slice(0, end));
      yield { type: "outcome", outcome };
      if (outcome !== "answer") return;
      answering = true;
      pending = pending.slice(end + 1).trimStart();
    }
    yield* drain(false);
  }

  if (!answering) {
    yield { type: "outcome", outcome: toOutcome(pending) };
    return;
  }
  yield* drain(true);
}
