import { content } from "@/lib/content";
import { llmsIndex, llmsResponse } from "@/lib/llms";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/** The guide followed by the Knowledge View, so a reader gets the links and the detail. */
export async function GET() {
  const [settings, projects, research, view] = await Promise.all([
    content.getSiteSettings("en"),
    content.getProjects("en"),
    content.getResearch("en"),
    content.getKnowledgeView("en"),
  ]);
  const index = llmsIndex({ settings, projects, research, site: getSiteUrl() });
  return llmsResponse(`${index}\n\n${view.text}\n`);
}
