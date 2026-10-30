import { describe, expect, it } from "vitest";
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
    body: typeof body === "string" ? body : JSON.stringify(body),
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
    const response = await handleAgentRequest(post("nope"), { content, model });
    expect(response.status).toBe(400);
    expect(requests).toHaveLength(0);
  });

  it("rejects an empty question", async () => {
    const { model } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "   ", locale: "en" }),
      { content, model }
    );
    expect(response.status).toBe(400);
  });

  it("rejects a question over 300 characters without calling the model", async () => {
    const { model, requests } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "x".repeat(301), locale: "en" }),
      { content, model }
    );
    expect(response.status).toBe(400);
    expect(requests).toHaveLength(0);
  });

  it("rejects an unknown locale", async () => {
    const { model } = fakeModel([]);
    const response = await handleAgentRequest(
      post({ question: "Hi?", locale: "fr" }),
      { content, model }
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when no model is configured", async () => {
    const response = await handleAgentRequest(post(ask), {
      content,
      model: null,
    });
    expect(response.status).toBe(503);
  });

  it("opens with what the Agent is reading", async () => {
    const { model } = fakeModel(["answer\nHi"]);
    const projects = await content.getProjects("en");
    const research = await content.getResearch("en");
    const response = await handleAgentRequest(post(ask), { content, model });
    expect((await events(response))[0]).toEqual({
      type: "start",
      projects: projects.length,
      research: research.length,
    });
  });

  it("sends the Knowledge View and the token cap to the model", async () => {
    const { model, requests } = fakeModel(["answer\nHi"]);
    const view = await content.getKnowledgeView("en");
    await (await handleAgentRequest(post(ask), { content, model })).text();
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
    const sent = await events(
      await handleAgentRequest(post(ask), { content, model })
    );
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
      await handleAgentRequest(post({ ...ask, locale: "de" }), {
        content,
        model,
      })
    );
    const citation = sent.find((event) => event.type === "citation");
    expect(citation).toMatchObject({ item: { href: view.items[0]!.href } });
  });

  it("ends with a done event", async () => {
    const { model } = fakeModel(["answer\nHi"]);
    const sent = await events(
      await handleAgentRequest(post(ask), { content, model })
    );
    expect(sent.at(-1)).toEqual({ type: "done" });
  });

  it("turns a model failure mid-stream into an error event", async () => {
    const model: ModelClient = {
      async *stream() {
        yield "answer\nHi";
        throw new ModelUnavailableError(500, null);
      },
    };
    const sent = await events(
      await handleAgentRequest(post(ask), { content, model })
    );
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
    const response = await handleAgentRequest(post(ask), { content, model });
    const reader = response.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(signal?.aborted).toBe(true);
  });
});
