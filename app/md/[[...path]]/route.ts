import { content } from "@/lib/content";
import { locales, localizedPath } from "@/lib/i18n";
import { markdownResponse, pageMarkdown } from "@/lib/markdown";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Markdown versions of the public pages, following the Next.js content
 * negotiation guide: the proxy rewrites here when a request prefers
 * `Accept: text/markdown`, and the path is the public one (/de for German).
 */
export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const [projects, research] = await Promise.all([
        content.getProjects(locale),
        content.getResearch(locale),
      ]);
      return [
        "/",
        "/about",
        ...projects.map((project) => `/work/${project.slug}`),
        ...research.map((item) => `/research/${item.slug}`),
      ].map((path) => ({
        path: localizedPath(path, locale).split("/").filter(Boolean),
      }));
    })
  );
  return params.flat();
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/md/[[...path]]">
) {
  const { path = [] } = await ctx.params;
  const body = await pageMarkdown(content, `/${path.join("/")}`, getSiteUrl());
  return body === null
    ? markdownResponse("# Not found\n\nNo page lives at this address.", 404)
    : markdownResponse(body);
}
