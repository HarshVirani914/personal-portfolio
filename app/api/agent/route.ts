import { unstable_cache } from "next/cache";
import { createGroqClient } from "@/lib/agent/groq";
import { handleAgentRequest } from "@/lib/agent/handler";
import { content } from "@/lib/content";
import { contentTags } from "@/lib/content/source";

/** Revalidated by the same CMS webhook as the pages, so questions never refetch Sanity. */
const getKnowledgeView = unstable_cache(
  (locale: Parameters<typeof content.getKnowledgeView>[0]) =>
    content.getKnowledgeView(locale),
  ["knowledge-view"],
  { tags: Object.values(contentTags) }
);

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  return handleAgentRequest(request, {
    content: { getKnowledgeView },
    model: apiKey ? createGroqClient({ apiKey }) : null,
  });
}
