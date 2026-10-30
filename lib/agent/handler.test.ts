import { describe, expect, it } from "vitest";
import { createFakeStore } from "@/lib/agent/fake-store";
import { handleAgentRequest } from "@/lib/agent/handler";
import type { ModelClient, ModelRequest } from "@/lib/agent/model";
import { ModelUnavailableError } from "@/lib/agent/groq";
import type { AgentWireEvent } from "@/lib/agent/stream";
import { createContent } from "@/lib/content";
import { createFixtureSource } from "@/lib/content/fixture";

const content = createContent(createFixtureSource());

const fakeModel = (parts: string[]) => {
  const requests: ModelRequest[] = [];
  const model: ModelClient = {
    async *stream(request) {
      requests.push(request);
      yield* parts;
    },
  };
  return { model, requests };
};

const post = (body: unknown) =>
  new Request("http://localhost/api/agent", {
    method: "POST",
    headers: {
      host: "localhost",
      origin: "http://localhost",
      "x-real-ip": "203.0.113.7",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const deps = (model: ModelClient | null, store = createFakeStore()) => ({
  content,
  model,
  store,
  isBot: async () => false,
  sleep: async () => undefined,
});

const events = async (response: Response) =>
  (await response.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AgentWireEvent);

const ask = { question: "What did he build?", locale: "en" };

describe("handleAgentRequest", () => {
  it("rejects a body that is not JSON", async () => {
    const { model, requests } = fakeModel([]);
    const response = await handleAgentRequest(post("nope"), deps(model));
    expect(response.status).toBe(400);
    expect(requests).toHaveLength(0);
  });

  it("rejects an empty question", async () => {
    const { model } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "   ", locale: "en" }),
      deps(model)
    );
    expect(response.status).toBe(400);
  });

  it("rejects a question over 300 characters without calling the model", async () => {
    const { model, requests } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "x".repeat(301), locale: "en" }),
      deps(model)
    );
    expect(response.status).toBe(400);
    expect(requests).toHaveLength(0);
  });

  it("rejects an unknown locale", async () => {
    const { model } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "Hi?", locale: "fr" }),
      deps(model)
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when no model is configured", async () => {
    const response = await handleAgentRequest(post(ask), deps(null));
    expect(response.status).toBe(503);
  });

  it("opens with what the Agent is reading", async () => {
    const { model } = fakeModel(["answer\nHi"]);
    const projects = await content.getProjects("en");
    const research = await content.getResearch("en");
    const response = await handleAgentRequest(post(ask), deps(model));
    expect((await events(response))[0]).toEqual({
      type: "start",
      projects: projects.length,
      research: research.length,
    });
  });

  it("sends the Knowledge View and the token cap to the model", async () => {
    const { model, requests } = fakeModel(["answer\nHi"]);
    const view = await content.getKnowledgeView("en");
    await (await handleAgentRequest(post(ask), deps(model))).text();
    expect(requests[0]?.system).toContain(view.text);
    expect(requests[0]?.user).toContain(ask.question);
    expect(requests[0]?.maxTokens).toBe(400);
  });

  it("only ever cites real slugs", async () => {
    const view = await content.getKnowledgeView("en");
    const real = view.items[0]!.slug;
    const { model } = fakeModel([
      "answer\nGood [[",
      real,
      "]] and fake [[not-a-project]].",
    ]);
    const sent = await events(await handleAgentRequest(post(ask), deps(model)));
    const cited = sent.flatMap((event) =>
      event.type === "citation" ? [event.item.slug] : []
    );
    expect(cited).toEqual([real]);
    expect(JSON.stringify(sent)).not.toContain("not-a-project");
  });

  it("cites from the visitor's locale", async () => {
    const view = await content.getKnowledgeView("de");
    const { model } = fakeModel([`answer\nGut [[${view.items[0]!.slug}]]`]);
    const sent = await events(
      await handleAgentRequest(post({ ...ask, locale: "de" }), deps(model))
    );
    const citation = sent.find((event) => event.type === "citation");
    expect(citation).toMatchObject({ item: { href: view.items[0]!.href } });
  });

  it("ends with a done event", async () => {
    const { model } = fakeModel(["answer\nHi"]);
    const sent = await events(await handleAgentRequest(post(ask), deps(model)));
    expect(sent.at(-1)).toEqual({ type: "done" });
  });

  it("turns a model failure mid-stream into an error event", async () => {
    const model: ModelClient = {
      async *stream() {
        yield "answer\nHi";
        throw new ModelUnavailableError(500, null);
      },
    };
    const sent = await events(await handleAgentRequest(post(ask), deps(model)));
    expect(sent.at(-1)).toEqual({ type: "error" });
  });

  it("cancels the model call when the visitor goes away", async () => {
    let signal: AbortSignal | undefined;
    const model: ModelClient = {
      async *stream(request) {
        signal = request.signal;
        yield "answer\nHi ";
        await new Promise((resolve) =>
          signal?.addEventListener("abort", resolve)
        );
      },
    };
    const response = await handleAgentRequest(post(ask), deps(model));
    const reader = response.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(signal?.aborted).toBe(true);
  });

  describe("gates", () => {
    const day = "2026-10-30";

    it("turns a bot away before anything else", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      const response = await handleAgentRequest(post(ask), {
        ...deps(model, store),
        isBot: async () => true,
      });
      expect(response.status).toBe(403);
      expect(requests).toHaveLength(0);
      expect(store.calls).toBe(0);
    });

    it("treats a failed bot check as a bot", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const response = await handleAgentRequest(post(ask), {
        ...deps(model),
        isBot: () => Promise.reject(new Error("down")),
      });
      expect(response.status).toBe(403);
      expect(requests).toHaveLength(0);
    });

    it("rejects another origin and a missing one", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const request = (origin?: string) =>
        new Request("http://localhost/api/agent", {
          method: "POST",
          headers: { host: "localhost", ...(origin ? { origin } : {}) },
          body: JSON.stringify(ask),
        });
      const evil = await handleAgentRequest(
        request("https://evil.example"),
        deps(model)
      );
      const none = await handleAgentRequest(request(), deps(model));
      expect(evil.status).toBe(403);
      expect(none.status).toBe(403);
      expect(requests).toHaveLength(0);
    });

    it("fails closed when the store is missing", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const response = await handleAgentRequest(post(ask), {
        ...deps(model),
        store: null,
      });
      expect(response.status).toBe(503);
      expect(requests).toHaveLength(0);
    });

    it("fails closed when the store is down", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      store.fail = true;
      const response = await handleAgentRequest(post(ask), deps(model, store));
      expect(response.status).toBe(503);
      expect(requests).toHaveLength(0);
    });

    it("stops a visitor after 20 model calls a day", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      for (let i = 0; i < 20; i += 1) {
        const response = await handleAgentRequest(
          post({ ...ask, question: `Question ${i}?` }),
          deps(model, store)
        );
        await response.text();
      }
      const response = await handleAgentRequest(
        post({ ...ask, question: "One more?" }),
        deps(model, store)
      );
      expect(response.status).toBe(429);
      expect(requests).toHaveLength(20);
    });

    it("never stores the raw IP", async () => {
      const { model } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(JSON.stringify(store.dump())).not.toContain("203.0.113.7");
    });

    it("stops at the Quota Budget without calling the model", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      await store.spend(day, 160_000);
      const response = await handleAgentRequest(post(ask), {
        ...deps(model, store),
        now: () => new Date(`${day}T12:00:00Z`),
      });
      expect(response.status).toBe(503);
      expect(requests).toHaveLength(0);
      expect(store.entries.at(-1)).toMatchObject({
        outcome: "unavailable",
        unanswered: true,
      });
    });

    it("settles the Quota Budget on real usage", async () => {
      const model: ModelClient = {
        async *stream({ onUsage }) {
          yield "answer\nHi";
          onUsage?.({
            promptTokens: 2_900,
            completionTokens: 100,
            cachedTokens: 0,
          });
        },
      };
      const store = createFakeStore();
      await (
        await handleAgentRequest(post(ask), {
          ...deps(model, store),
          now: () => new Date(`${day}T12:00:00Z`),
        })
      ).text();
      expect(store.spent(day)).toBe(3_000);
    });

    it("keeps the reservation when a visitor aborts, because the model still ran", async () => {
      const model: ModelClient = {
        async *stream({ signal }) {
          yield "answer\nHi ";
          await new Promise((resolve) =>
            signal?.addEventListener("abort", resolve)
          );
        },
      };
      const store = createFakeStore();
      const response = await handleAgentRequest(post(ask), {
        ...deps(model, store),
        now: () => new Date(`${day}T12:00:00Z`),
      });
      const reader = response.body!.getReader();
      await reader.read();
      await reader.cancel();
      expect(store.spent(day)).toBeGreaterThan(400);
    });

    it("refunds the reservation when Groq refuses the call", async () => {
      const model: ModelClient = {
        async *stream() {
          throw new ModelUnavailableError(429, 60);
        },
      };
      const store = createFakeStore();
      await (
        await handleAgentRequest(post(ask), {
          ...deps(model, store),
          now: () => new Date(`${day}T12:00:00Z`),
        })
      ).text();
      expect(store.spent(day)).toBe(0);
    });
  });

  describe("Groq rate limits", () => {
    const limitedOnce = (retryAfter: number | null) => {
      const delays: number[] = [];
      let calls = 0;
      const model: ModelClient = {
        async *stream() {
          calls += 1;
          if (calls === 1) throw new ModelUnavailableError(429, retryAfter);
          yield "answer\nHi";
        },
      };
      return {
        model,
        delays,
        calls: () => calls,
        sleep: async (ms: number) => {
          delays.push(ms);
        },
      };
    };

    it("retries once when the wait is 5 seconds or less", async () => {
      const groq = limitedOnce(5);
      const sent = await events(
        await handleAgentRequest(post(ask), {
          ...deps(groq.model),
          sleep: groq.sleep,
        })
      );
      expect(groq.delays).toEqual([5_000]);
      expect(sent.at(-1)).toEqual({ type: "done" });
    });

    it("gives up when the wait is longer", async () => {
      const groq = limitedOnce(6);
      const sent = await events(
        await handleAgentRequest(post(ask), deps(groq.model))
      );
      expect(groq.calls()).toBe(1);
      expect(sent.at(-1)).toEqual({ type: "error" });
    });

    it("gives up when Groq gives no wait", async () => {
      const groq = limitedOnce(null);
      const sent = await events(
        await handleAgentRequest(post(ask), deps(groq.model))
      );
      expect(groq.calls()).toBe(1);
      expect(sent.at(-1)).toEqual({ type: "error" });
    });
  });

  describe("Answer Cache", () => {
    const askTwice = async (parts: string[], second = ask.question) => {
      const { model, requests } = fakeModel(parts);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      const sent = await events(
        await handleAgentRequest(
          post({ ...ask, question: second }),
          deps(model, store)
        )
      );
      return { requests, sent, store };
    };

    it("answers a repeated question with no model call", async () => {
      const { requests, sent } = await askTwice(["answer\nHi there"]);
      expect(requests).toHaveLength(1);
      expect(sent).toEqual([
        { type: "cached" },
        { type: "outcome", outcome: "answer" },
        { type: "text", text: "Hi there" },
        { type: "done" },
      ]);
    });

    it("matches a question however it was typed", async () => {
      const { requests } = await askTwice(
        ["answer\nHi"],
        "  WHAT did he   build "
      );
      expect(requests).toHaveLength(1);
    });

    it("does not spend a visitor's limit on a hit", async () => {
      const { store } = await askTwice(["answer\nHi"]);
      expect(store.visits()).toBe(1);
    });

    it("keeps locales apart", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      await (
        await handleAgentRequest(
          post({ ...ask, locale: "de" }),
          deps(model, store)
        )
      ).text();
      expect(requests).toHaveLength(2);
    });

    it("retires answers when the Knowledge View changes", async () => {
      const { model, requests } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      const edited = {
        getKnowledgeView: async (locale: "en" | "de") => ({
          ...(await content.getKnowledgeView(locale)),
          text: "edited",
        }),
      };
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      await (
        await handleAgentRequest(post(ask), {
          ...deps(model, store),
          content: edited,
        })
      ).text();
      expect(requests).toHaveLength(2);
    });

    it("never stores a refusal", async () => {
      const { requests } = await askTwice(["refused\n"]);
      expect(requests).toHaveLength(2);
    });

    it("stores Unknown, so a repeat cannot drain the budget", async () => {
      const { requests, sent } = await askTwice(["unknown\n"]);
      expect(requests).toHaveLength(1);
      expect(sent).toContainEqual({ type: "outcome", outcome: "unknown" });
    });

    it("does not store an answer cut off at the token cap", async () => {
      const model: ModelClient = {
        async *stream({ onUsage, maxTokens }) {
          yield "answer\nCut of";
          onUsage?.({
            promptTokens: 1,
            completionTokens: maxTokens,
            cachedTokens: 0,
          });
        },
      };
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.answers()).toHaveLength(0);
    });

    it("does not store an answer that failed part way", async () => {
      const model: ModelClient = {
        async *stream() {
          yield "answer\nHi";
          throw new ModelUnavailableError(500, null);
        },
      };
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.answers()).toHaveLength(0);
    });
  });

  describe("logging", () => {
    it("records the question, locale, time and cited slugs, and nothing about the visitor", async () => {
      const view = await content.getKnowledgeView("en");
      const slug = view.items[0]!.slug;
      const { model } = fakeModel([`answer\nSee [[${slug}]]`]);
      const store = createFakeStore();
      await (
        await handleAgentRequest(post(ask), {
          ...deps(model, store),
          now: () => new Date("2026-10-30T12:00:00Z"),
        })
      ).text();
      expect(store.entries).toEqual([
        {
          question: ask.question,
          locale: "en",
          at: Date.parse("2026-10-30T12:00:00Z"),
          citations: [slug],
          outcome: "answer",
          unanswered: false,
          cached: false,
        },
      ]);
    });

    it("flags Unknown as unanswered", async () => {
      const { model } = fakeModel(["unknown\n"]);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.entries[0]).toMatchObject({
        outcome: "unknown",
        unanswered: true,
      });
    });

    it("logs a Refused question without flagging it", async () => {
      const { model } = fakeModel(["refused\n"]);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.entries[0]).toMatchObject({
        outcome: "refused",
        unanswered: false,
      });
    });

    it("flags a model failure as unanswered", async () => {
      const model: ModelClient = {
        async *stream() {
          throw new ModelUnavailableError(500, null);
        },
      };
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.entries[0]).toMatchObject({
        outcome: "unavailable",
        unanswered: true,
      });
    });

    it("marks a replayed answer as cached", async () => {
      const { model } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      await (await handleAgentRequest(post(ask), deps(model, store))).text();
      expect(store.entries[1]).toMatchObject({ cached: true });
    });

    it("still answers when writing to the store fails afterwards", async () => {
      const { model } = fakeModel(["answer\nHi"]);
      const store = createFakeStore();
      store.failWrites = true;
      const sent = await events(
        await handleAgentRequest(post(ask), deps(model, store))
      );
      expect(sent.at(-1)).toEqual({ type: "done" });
    });
  });
});
