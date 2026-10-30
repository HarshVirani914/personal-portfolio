import { describe, expect, it } from "vitest";
import { createGroqClient, ModelUnavailableError } from "@/lib/agent/groq";

const sse = (lines: string[]) =>
  new Response(lines.map((line) => `data: ${line}\n\n`).join(""), {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });

const delta = (content: string) =>
  JSON.stringify({ choices: [{ delta: { content } }] });

const request = { system: "S", user: "U", maxTokens: 400 };

const collect = async (stream: AsyncIterable<string>) => {
  const parts: string[] = [];
  for await (const part of stream) parts.push(part);
  return parts;
};

describe("createGroqClient", () => {
  it("yields the text of each delta", async () => {
    const client = createGroqClient({
      apiKey: "key",
      fetch: async () => sse([delta("Hel"), delta("lo"), "[DONE]"]),
    });
    expect(await collect(client.stream(request))).toEqual(["Hel", "lo"]);
  });

  it("copes with events split across network chunks", async () => {
    const body = `data: ${delta("Hello")}\n\ndata: [DONE]\n\n`;
    const client = createGroqClient({
      apiKey: "key",
      fetch: async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              const bytes = new TextEncoder().encode(body);
              controller.enqueue(bytes.slice(0, 12));
              controller.enqueue(bytes.slice(12));
              controller.close();
            },
          })
        ),
    });
    expect(await collect(client.stream(request))).toEqual(["Hello"]);
  });

  it("sends the static prefix first, the token cap and the key", async () => {
    let url = "";
    let init: RequestInit | undefined;
    const client = createGroqClient({
      apiKey: "key",
      fetch: async (input, options) => {
        url = String(input);
        init = options;
        return sse(["[DONE]"]);
      },
    });
    await collect(client.stream(request));
    const body = JSON.parse(String(init?.body));
    expect(url).toContain("api.groq.com");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer key");
    expect(body.model).toBe("openai/gpt-oss-20b");
    expect(body.max_completion_tokens).toBe(400);
    expect(body.stream).toBe(true);
    expect(body.messages).toEqual([
      { role: "system", content: "S" },
      { role: "user", content: "U" },
    ]);
  });

  it("reports token usage, including cached tokens", async () => {
    const usage = {
      prompt_tokens: 3000,
      completion_tokens: 100,
      prompt_tokens_details: { cached_tokens: 2800 },
    };
    const reports: unknown[] = [];
    const client = createGroqClient({
      apiKey: "key",
      fetch: async () =>
        sse([delta("Hi"), JSON.stringify({ choices: [], usage }), "[DONE]"]),
    });
    await collect(
      client.stream({ ...request, onUsage: (u) => reports.push(u) })
    );
    expect(reports).toEqual([
      { promptTokens: 3000, completionTokens: 100, cachedTokens: 2800 },
    ]);
  });

  it("reports usage once when Groq sends it twice", async () => {
    const usage = { prompt_tokens: 3000, completion_tokens: 100 };
    const reports: unknown[] = [];
    const client = createGroqClient({
      apiKey: "key",
      fetch: async () =>
        sse([
          JSON.stringify({ choices: [], x_groq: { usage } }),
          JSON.stringify({ choices: [], usage }),
          "[DONE]",
        ]),
    });
    await collect(
      client.stream({ ...request, onUsage: (u) => reports.push(u) })
    );
    expect(reports).toHaveLength(1);
  });

  it("reports a failed response as unavailable with its retry hint", async () => {
    const client = createGroqClient({
      apiKey: "key",
      fetch: async () =>
        new Response("slow down", {
          status: 429,
          headers: { "retry-after": "7" },
        }),
    });
    const error = await collect(client.stream(request)).catch((e) => e);
    expect(error).toBeInstanceOf(ModelUnavailableError);
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBe(7);
  });

  it("passes the abort signal to the request", async () => {
    const controller = new AbortController();
    let received: AbortSignal | null | undefined;
    const client = createGroqClient({
      apiKey: "key",
      fetch: async (_, options) => {
        received = options?.signal;
        return sse(["[DONE]"]);
      },
    });
    await collect(client.stream({ ...request, signal: controller.signal }));
    expect(received).toBe(controller.signal);
  });
});
