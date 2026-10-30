import type { ModelClient, ModelUsage } from "@/lib/agent/model";

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

/** Groq refused or failed the request. #12 uses the retry hint on a 429. */
export class ModelUnavailableError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterSeconds: number | null
  ) {
    super(`Model request failed with status ${status}`);
    this.name = "ModelUnavailableError";
  }
}

type StreamEvent = {
  choices?: { delta?: { content?: string | null } }[];
  usage?: RawUsage | null;
  x_groq?: { usage?: RawUsage | null } | null;
};

type RawUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number } | null;
};

const toUsage = (raw: RawUsage): ModelUsage => ({
  promptTokens: raw.prompt_tokens ?? 0,
  completionTokens: raw.completion_tokens ?? 0,
  cachedTokens: raw.prompt_tokens_details?.cached_tokens ?? 0,
});

/** Each `data:` payload in a server-sent event stream, however the bytes were split. */
async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.startsWith("data:")) yield line.slice(5).trim();
      }
    }
  } finally {
    // Reached early when the consumer stops, which also ends the upstream call.
    await reader.cancel().catch(() => undefined);
  }
}

export function createGroqClient({
  apiKey,
  fetch: request = fetch,
}: {
  apiKey: string;
  fetch?: typeof fetch;
}): ModelClient {
  return {
    async *stream({ system, user, maxTokens, signal, onUsage }) {
      const response = await request(ENDPOINT, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_completion_tokens: maxTokens,
          temperature: 0.2,
          reasoning_effort: "low",
          include_reasoning: false,
          stream: true,
          stream_options: { include_usage: true },
        }),
        ...(signal ? { signal } : {}),
      });

      if (!response.ok || !response.body) {
        const retryAfter = Number(response.headers.get("retry-after"));
        throw new ModelUnavailableError(
          response.status,
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null
        );
      }

      // Groq can repeat usage across chunks, and the Quota Budget must count it once.
      let usage: RawUsage | null | undefined;
      for await (const data of readEvents(response.body)) {
        if (data === "[DONE]") break;
        const event = JSON.parse(data) as StreamEvent;
        const text = event.choices?.[0]?.delta?.content;
        if (text) yield text;
        usage = event.usage ?? event.x_groq?.usage ?? usage;
      }
      if (usage) onUsage?.(toUsage(usage));
    },
  };
}
