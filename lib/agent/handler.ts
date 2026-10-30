import type { ModelClient } from "@/lib/agent/model";
import { buildMessages } from "@/lib/agent/prompt";
import { parseModelStream, type AgentWireEvent } from "@/lib/agent/stream";
import type { KnowledgeView } from "@/lib/content/types";
import { isLocale, type Locale } from "@/lib/i18n";

const MAX_QUESTION = 300;
const MAX_TOKENS = 400;

type Deps = {
  content: { getKnowledgeView(locale: Locale): Promise<KnowledgeView> };
  /** Null when no API key is configured. */
  model: ModelClient | null;
};

async function readQuestion(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) return null;
  const { question, locale } = body as { question?: unknown; locale?: unknown };
  if (typeof question !== "string" || typeof locale !== "string") return null;
  const trimmed = question.trim();
  if (trimmed === "" || trimmed.length > MAX_QUESTION) return null;
  return isLocale(locale) ? { question: trimmed, locale } : null;
}

/** Answers one question as newline-delimited JSON events. */
export async function handleAgentRequest(
  request: Request,
  { content, model }: Deps
): Promise<Response> {
  const input = await readQuestion(request);
  if (!input) return Response.json({ error: "invalid" }, { status: 400 });
  if (!model) return Response.json({ error: "unavailable" }, { status: 503 });

  const view = await content.getKnowledgeView(input.locale);
  const messages = buildMessages(view.text, input.locale, input.question);
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentWireEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        send({
          type: "start",
          projects: view.projectCount,
          research: view.researchCount,
        });
        const answer = model.stream({
          ...messages,
          maxTokens: MAX_TOKENS,
          signal: abort.signal,
        });
        for await (const event of parseModelStream(answer, view.items)) {
          send(event);
        }
        send({ type: "done" });
        controller.close();
      } catch {
        if (abort.signal.aborted) return;
        send({ type: "error" });
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(body, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
