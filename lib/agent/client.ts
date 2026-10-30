import type { AgentWireEvent } from "@/lib/agent/stream";
import type { Locale } from "@/lib/i18n";

/** Reads the route's newline-delimited events until the stream ends. */
export async function readAgentStream(
  response: Response,
  onEvent: (event: AgentWireEvent) => void
): Promise<void> {
  if (!response.ok || !response.body) {
    throw new Error(`Agent request failed with status ${response.status}`);
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line) onEvent(JSON.parse(line) as AgentWireEvent);
    }
  }
}

export async function askAgent(
  question: string,
  locale: Locale,
  signal: AbortSignal,
  onEvent: (event: AgentWireEvent) => void
): Promise<void> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, locale }),
    signal,
  });
  await readAgentStream(response, onEvent);
}
