import { Redis } from "@upstash/redis";
import { checkBotId } from "botid/server";
import { unstable_cache } from "next/cache";
import { createGroqClient } from "@/lib/agent/groq";
import { handleAgentRequest } from "@/lib/agent/handler";
import { createRedisStore } from "@/lib/agent/redis-store";
import { content } from "@/lib/content";
import { contentTags } from "@/lib/content/source";

/** Revalidated by the same CMS webhook as the pages, so questions never refetch Sanity. */
const getKnowledgeView = unstable_cache(
  (locale: Parameters<typeof content.getKnowledgeView>[0]) =>
    content.getKnowledgeView(locale),
  ["knowledge-view"],
  { tags: Object.values(contentTags) }
);

function createStore() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? createRedisStore(new Redis({ url, token })) : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  return handleAgentRequest(request, {
    content: { getKnowledgeView },
    model: apiKey ? createGroqClient({ apiKey }) : null,
    store: createStore(),
    isBot: async () => (await checkBotId()).isBot,
  });
}
