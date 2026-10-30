import { randomUUID } from "node:crypto";
import { ModelUnavailableError } from "@/lib/agent/groq";
import {
  answerKey,
  clientIp,
  sameOrigin,
  utcDay,
  visitorHash,
} from "@/lib/agent/guards";
import type { ModelClient, ModelRequest, ModelUsage } from "@/lib/agent/model";
import { buildMessages } from "@/lib/agent/prompt";
import type { AgentStore, CachedAnswer, LogEntry } from "@/lib/agent/store";
import {
  parseModelStream,
  type AgentEvent,
  type AgentWireEvent,
} from "@/lib/agent/stream";
import type { KnowledgeView } from "@/lib/content/types";
import { isLocale, type Locale } from "@/lib/i18n";

const MAX_QUESTION = 300;
const MAX_TOKENS = 400;
const MAX_VISITS = 20;
/** Of Groq's 200K a day, leaving room for calls already in flight. */
const QUOTA_BUDGET = 160_000;
const MAX_RETRY_SECONDS = 5;
const CHARS_PER_TOKEN = 4;

type Deps = {
  content: { getKnowledgeView(locale: Locale): Promise<KnowledgeView> };
  /** Null when no API key is configured. */
  model: ModelClient | null;
  /** Null when no database is configured, which fails closed. */
  store: AgentStore | null;
  isBot: () => Promise<boolean>;
  sleep?: (ms: number) => Promise<void>;
  now?: () => Date;
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

const refuse = (error: string, status: number) =>
  Response.json({ error }, { status });

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** What a late or missing store write costs is a stale counter, never an answer. */
const quietly = (write: Promise<unknown>) => write.catch(() => undefined);

const estimateTokens = ({ system, user }: ModelRequest) =>
  Math.ceil((system.length + user.length) / CHARS_PER_TOKEN) + MAX_TOKENS;

const totalTokens = (usage: ModelUsage) =>
  usage.promptTokens + usage.completionTokens;

/** A 429 arrives before any text, so one retry cannot repeat part of an answer. */
async function* streamWithRetry(
  model: ModelClient,
  request: ModelRequest,
  sleep: (ms: number) => Promise<unknown>
) {
  try {
    yield* model.stream(request);
  } catch (error) {
    const retryAfter =
      error instanceof ModelUnavailableError && error.status === 429
        ? error.retryAfterSeconds
        : null;
    if (retryAfter === null || retryAfter > MAX_RETRY_SECONDS) throw error;
    await sleep(retryAfter * 1000);
    yield* model.stream(request);
  }
}

const citationsIn = (events: AgentEvent[]) =>
  events.flatMap((event) =>
    event.type === "citation" ? [event.item.slug] : []
  );

const outcomeOf = (events: AgentEvent[]) =>
  events.find((event) => event.type === "outcome")?.outcome ?? "unknown";

/** Refusals are never stored, and neither is an answer cut off at the cap. */
function isCacheable(events: AgentEvent[], usage: ModelUsage | null) {
  if (usage && usage.completionTokens >= MAX_TOKENS) return false;
  const outcome = outcomeOf(events);
  if (outcome === "unknown") return true;
  return outcome === "answer" && events.some((event) => event.type === "text");
}

function ndjson(
  write: (send: (event: AgentWireEvent) => void) => Promise<void>,
  onCancel?: () => void
) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await write((event) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
        );
        controller.close();
      } catch {
        // The visitor left first.
      }
    },
    ...(onCancel ? { cancel: onCancel } : {}),
  });
  return new Response(body, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Answers one question as newline-delimited JSON events, cheapest gates first. */
export async function handleAgentRequest(
  request: Request,
  { content, model, store, isBot, sleep = wait, now = () => new Date() }: Deps
): Promise<Response> {
  if (await isBot().catch(() => true)) return refuse("forbidden", 403);
  if (!sameOrigin(request)) return refuse("forbidden", 403);

  const input = await readQuestion(request);
  if (!input) return refuse("invalid", 400);
  if (!model || !store) return refuse("unavailable", 503);

  const view = await content.getKnowledgeView(input.locale);
  const messages = buildMessages(view.text, input.locale, input.question);
  const modelRequest = { ...messages, maxTokens: MAX_TOKENS };
  const estimate = estimateTokens(modelRequest);
  const key = answerKey(input.question, input.locale, view.text);
  const date = now();
  const day = utcDay(date);

  const log = (
    outcome: LogEntry["outcome"],
    events: AgentEvent[],
    cached: boolean
  ) =>
    quietly(
      store.log({
        question: input.question,
        locale: input.locale,
        at: date.getTime(),
        citations: citationsIn(events),
        outcome,
        unanswered: outcome === "unknown" || outcome === "unavailable",
        cached,
      })
    );

  let cached: CachedAnswer | null;
  try {
    cached = await store.readAnswer(key);
    if (!cached) {
      const salt = await store.daySalt(day, randomUUID());
      const visitor = visitorHash(clientIp(request), salt);
      if ((await store.countVisit(day, visitor)) > MAX_VISITS) {
        return refuse("limited", 429);
      }
      // Reserved up front: a visitor who aborts leaves no usage to count, and
      // concurrent calls must see each other.
      if ((await store.spend(day, estimate)) > QUOTA_BUDGET) {
        await log("unavailable", [], false);
        return refuse("unavailable", 503);
      }
    }
  } catch {
    return refuse("unavailable", 503);
  }

  if (cached) {
    const { events } = cached;
    return ndjson(async (send) => {
      send({ type: "cached" });
      events.forEach(send);
      await log(outcomeOf(events), events, true);
      send({ type: "done" });
    });
  }

  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort());

  return ndjson(
    async (send) => {
      const sent: AgentEvent[] = [];
      let usage: ModelUsage | null = null;
      try {
        send({
          type: "start",
          projects: view.projectCount,
          research: view.researchCount,
        });
        const answer = streamWithRetry(
          model,
          {
            ...modelRequest,
            signal: abort.signal,
            onUsage: (reported) => {
              usage = reported;
            },
          },
          sleep
        );
        for await (const event of parseModelStream(answer, view.items)) {
          sent.push(event);
          send(event);
        }
        if (usage) {
          await quietly(store.spend(day, totalTokens(usage) - estimate));
        }
        if (isCacheable(sent, usage)) {
          await quietly(store.writeAnswer(key, { events: sent }));
        }
        await log(outcomeOf(sent), sent, false);
        send({ type: "done" });
      } catch (error) {
        if (abort.signal.aborted) return;
        if (error instanceof ModelUnavailableError) {
          await quietly(store.spend(day, -estimate));
        }
        await log("unavailable", sent, false);
        send({ type: "error" });
      }
    },
    () => abort.abort()
  );
}
