import { content } from "@/lib/content";
import { llmsIndex, llmsResponse } from "@/lib/llms";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export async function GET() {
  const [settings, projects, research] = await Promise.all([
    content.getSiteSettings("en"),
    content.getProjects("en"),
    content.getResearch("en"),
  ]);
  return llmsResponse(
    llmsIndex({ settings, projects, research, site: getSiteUrl() })
  );
}
