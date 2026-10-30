export type ModelUsage = {
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
};

export type ModelRequest = {
  /** The part shared by every question. Stays first so the provider can cache it. */
  system: string;
  user: string;
  maxTokens: number;
  signal?: AbortSignal;
  onUsage?: (usage: ModelUsage) => void;
};

/** Streams an answer as text. Injected into the route so it can be swapped and faked. */
export type ModelClient = {
  stream(request: ModelRequest): AsyncIterable<string>;
};
